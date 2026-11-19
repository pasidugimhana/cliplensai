/**
 * ClipLens AI - Supabase Client & Authentication SDK
 * Reusable client configuration for Authentication, User Profiles, and Credits.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ClipLensAuth = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Configurable credentials (Safe publishable key for browser clients)
  var SUPABASE_CONFIG = {
    url: 'https://zkqayqzyjjgztcucfysw.supabase.co',
    publishableKey: 'sb_publishable_imHwbUaHkQUxTaAxjqRmDA_xbcsqI7A',
    defaultCredits: 20
  };

  var clientInstance = null;
  var initPromise = null;

  /**
   * Dynamically loads Supabase JS SDK v2 if not already present
   */
  function ensureSdkLoaded() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return Promise.resolve(window.supabase);
    }
    if (initPromise) return initPromise;

    initPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = function () {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
          resolve(window.supabase);
        } else {
          reject(new Error('Supabase SDK failed to initialize'));
        }
      };
      script.onerror = function () {
        reject(new Error('Failed to load Supabase SDK from CDN'));
      };
      document.head.appendChild(script);
    });

    return initPromise;
  }

  /**
   * Initializes or returns the Supabase client instance
   */
  async function getClient() {
    if (clientInstance) return clientInstance;
    var sdk = await ensureSdkLoaded();
    clientInstance = sdk.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    return clientInstance;
  }

  /**
   * Determines the base URL of the website dynamically for redirects
   * Works on both localhost and GitHub Pages (e.g. /repo/ or root domain)
   */
  function getAppBaseUrl() {
    var loc = window.location;
    var origin = loc.origin;
    var path = loc.pathname;

    // Detect if hosted in a subfolder like GitHub Pages (/repo-name/...)
    var segments = path.split('/').filter(Boolean);
    // If running on github.io and has repo path
    if (loc.hostname.endsWith('github.io') && segments.length > 0) {
      return origin + '/' + segments[0] + '/';
    }
    return origin + '/';
  }

  /**
   * User Registration
   */
  async function signUp(email, password, fullName) {
    var client = await getClient();
    var redirectUrl = getAppBaseUrl() + 'dashboard/';

    var result = await client.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim()
        }
      }
    });

    if (result.error) throw result.error;

    // Attempt to upsert the profile with default 20 free credits if user is returned
    if (result.data && result.data.user) {
      try {
        await client.from('profiles').upsert({
          id: result.data.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          credits: SUPABASE_CONFIG.defaultCredits,
          subscription_plan: 'free',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (e) {
        // Safe to ignore if trigger already handled it
      }
    }

    return result.data;
  }

  /**
   * User Login
   */
  async function signIn(email, password) {
    var client = await getClient();
    var result = await client.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (result.error) throw result.error;
    return result.data;
  }

  /**
   * User Logout
   */
  async function signOut() {
    var client = await getClient();
    var result = await client.auth.signOut();
    if (result.error) throw result.error;
    return true;
  }

  /**
   * Send Password Reset Email
   */
  async function resetPasswordForEmail(email) {
    var client = await getClient();
    var redirectUrl = getAppBaseUrl() + 'reset-password/';

    var result = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    });

    if (result.error) throw result.error;
    return result.data;
  }

  /**
   * Update Password (when authenticated or in recovery session)
   */
  async function updateUserPassword(newPassword) {
    var client = await getClient();
    var result = await client.auth.updateUser({
      password: newPassword
    });

    if (result.error) throw result.error;
    return result.data;
  }

  /**
   * Resend Email Verification
   */
  async function resendVerificationEmail(email) {
    var client = await getClient();
    var redirectUrl = getAppBaseUrl() + 'dashboard/';
    var result = await client.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (result.error) throw result.error;
    return result.data;
  }

  /**
   * Get Active Session
   */
  async function getSession() {
    var client = await getClient();
    var res = await client.auth.getSession();
    if (res.error) throw res.error;
    return res.data.session;
  }

  /**
   * Get Current Authenticated User
   */
  async function getCurrentUser() {
    var client = await getClient();
    var res = await client.auth.getUser();
    if (res.error) return null;
    return res.data.user;
  }

  /**
   * Get User Profile from `profiles` table (with fallback to user_metadata)
   */
  async function getUserProfile(userId) {
    var client = await getClient();
    try {
      var res = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (res.data) {
        return res.data;
      }
    } catch (e) {}

    // Fallback if table is not yet migrated or trigger is pending
    var user = await getCurrentUser();
    var meta = (user && user.user_metadata) || {};
    return {
      id: userId,
      full_name: meta.full_name || (user && user.email ? user.email.split('@')[0] : 'User'),
      email: (user && user.email) || '',
      credits: SUPABASE_CONFIG.defaultCredits,
      subscription_plan: 'free',
      created_at: (user && user.created_at) || new Date().toISOString()
    };
  }

  /**
   * Update Profile Information (Full Name, Avatar)
   */
  async function updateProfile(userId, updates) {
    var client = await getClient();
    updates.updated_at = new Date().toISOString();

    // 1. Update in profiles table
    try {
      await client.from('profiles').update(updates).eq('id', userId);
    } catch (e) {}

    // 2. Also keep user_metadata synced
    if (updates.full_name) {
      await client.auth.updateUser({
        data: { full_name: updates.full_name }
      });
    }

    return true;
  }

  /**
   * Get User's Conversion History
   */
  async function getConversions(userId, limit) {
    var client = await getClient();
    limit = limit || 15;
    try {
      var res = await client
        .from('conversions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {}

    // Return stored local conversions if table empty
    var localHistory = [];
    try {
      localHistory = JSON.parse(localStorage.getItem('cliplens_recent_conversions') || '[]');
    } catch (e) {}
    return localHistory;
  }

  /**
   * Log a new Conversion Activity
   */
  async function logConversion(toolName, fileName, fileSize) {
    var user = await getCurrentUser();
    var entry = {
      tool_name: toolName,
      file_name: fileName || 'File',
      file_size: fileSize || 'N/A',
      created_at: new Date().toISOString()
    };

    // Save locally
    try {
      var localHistory = JSON.parse(localStorage.getItem('cliplens_recent_conversions') || '[]');
      localHistory.unshift(entry);
      if (localHistory.length > 30) localHistory.pop();
      localStorage.setItem('cliplens_recent_conversions', JSON.stringify(localHistory));
    } catch (e) {}

    // If user is authenticated, save to database
    if (user) {
      try {
        var client = await getClient();
        await client.from('conversions').insert({
          user_id: user.id,
          tool_name: toolName,
          file_name: fileName,
          file_size: fileSize,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      } catch (e) {}
    }
  }

  /**
   * Subscribe to Auth State Changes
   */
  function onAuthStateChange(callback) {
    getClient().then(function (client) {
      client.auth.onAuthStateChange(function (event, session) {
        callback(event, session);
      });
    });
  }

  // Preload SDK in the background for instant responsiveness
  if (typeof window !== 'undefined') {
    setTimeout(ensureSdkLoaded, 500);
  }

  return {
    config: SUPABASE_CONFIG,
    getClient: getClient,
    getAppBaseUrl: getAppBaseUrl,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    resetPasswordForEmail: resetPasswordForEmail,
    updateUserPassword: updateUserPassword,
    resendVerificationEmail: resendVerificationEmail,
    getSession: getSession,
    getCurrentUser: getCurrentUser,
    getUserProfile: getUserProfile,
    updateProfile: updateProfile,
    getConversions: getConversions,
    logConversion: logConversion,
    onAuthStateChange: onAuthStateChange
  };
});
