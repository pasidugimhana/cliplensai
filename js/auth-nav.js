/**
 * ClipLens AI - Navigation Bar Authentication State Controller
 * Dynamically displays Login / Register buttons or User Profile Dropdown & Credits badge.
 */
(function() {
  'use strict';

  function getRootPath() {
    var loc = window.location.pathname;
    if (loc.indexOf('/tools/') !== -1) {
      return '../../';
    } else if (loc.indexOf('/login/') !== -1 || loc.indexOf('/register/') !== -1 || loc.indexOf('/dashboard/') !== -1 || loc.indexOf('/forgot-password/') !== -1 || loc.indexOf('/reset-password/') !== -1) {
      return '../';
    }
    return './';
  }

  // Where the login buttons / user widget get mounted.
  // Pages with a dedicated `.nav-actions` container (dashboard) use it,
  // every other page keeps using `.nav-links`.
  function getMount() {
    return document.querySelector('.nav-actions') || document.querySelector('.nav-links');
  }

  var renderSeq = 0;          // guards against duplicate async renders
  var outsideClickBound = false;

  function initNavAuth() {
    if (!window.ClipLensAuth) {
      setTimeout(initNavAuth, 100);
      return;
    }

    if (!getMount()) return;

    var rootPath = getRootPath();

    window.ClipLensAuth.getSession().then(function(session) {
      if (session && session.user) {
        renderLoggedInNav(session.user, rootPath);
      } else {
        renderLoggedOutNav(rootPath);
      }
    }).catch(function() {
      renderLoggedOutNav(rootPath);
    });

    // Listen to live auth changes (e.g. login in another tab or logout)
    window.ClipLensAuth.onAuthStateChange(function(event, session) {
      if (event === 'SIGNED_IN' && session && session.user) {
        renderLoggedInNav(session.user, rootPath);
      } else if (event === 'SIGNED_OUT') {
        renderLoggedOutNav(rootPath);
      }
    });
  }

  function renderLoggedOutNav(rootPath) {
    var navLinks = getMount();
    if (!navLinks) return;
    renderSeq++; // cancel any in-flight logged-in render

    // Remove existing user badge if any
    var existingUserPill = document.querySelector('.nav-user-widget');
    if (existingUserPill) existingUserPill.remove();

    var existingAuthBtns = document.querySelector('.nav-auth-group');
    if (existingAuthBtns) return; // already rendered

    var authGroup = document.createElement('div');
    authGroup.className = 'nav-auth-group';
    authGroup.innerHTML = `
      <a href="${rootPath}login/" class="btn-nav-login">Log In</a>
      <a href="${rootPath}register/" class="btn-nav-signup">Sign Up Free</a>
    `;
    navLinks.appendChild(authGroup);
  }

  function renderLoggedInNav(user, rootPath) {
    var navLinks = getMount();
    if (!navLinks) return;
    var seq = ++renderSeq;

    // Remove logged out buttons if any
    var existingAuthBtns = document.querySelector('.nav-auth-group');
    if (existingAuthBtns) existingAuthBtns.remove();

    var existingUserPill = document.querySelector('.nav-user-widget');
    if (existingUserPill) existingUserPill.remove();

    window.ClipLensAuth.getUserProfile(user.id).catch(function() { return null; }).then(function(profile) {
      // A newer render started while we were waiting -> drop this one (fixes duplicated user chips)
      if (seq !== renderSeq) return;
      profile = profile || {};
      var stale = document.querySelectorAll('.nav-user-widget');
      for (var i = 0; i < stale.length; i++) stale[i].remove();

      var name = profile.full_name || (user.email ? user.email.split('@')[0] : 'User');
      var initials = name.substring(0, 2).toUpperCase();
      var credits = (typeof profile.credits !== 'undefined') ? profile.credits : 20;

      var widget = document.createElement('div');
      widget.className = 'nav-user-widget';
      widget.innerHTML = `
        <div class="user-pill-btn" id="nav_user_menu_btn">
          <div class="user-pill-avatar">${initials}</div>
          <span class="user-pill-name">${escapeHtml(name)}</span>
          <span class="user-credits-badge">⚡ ${credits}</span>
          <svg class="chevron-down" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <div class="user-dropdown-menu" id="nav_user_dropdown" style="display:none">
          <div class="dropdown-header">
            <strong>${escapeHtml(name)}</strong>
            <small>${escapeHtml(user.email || '')}</small>
          </div>
          <div class="dropdown-divider"></div>
          <a href="${rootPath}dashboard/" class="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>User Dashboard</span>
          </a>
          <a href="${rootPath}dashboard/#billing" class="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>Credits (${credits} available)</span>
          </a>
          <a href="${rootPath}dashboard/#profile" class="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Profile Settings</span>
          </a>
          <div class="dropdown-divider"></div>
          <button type="button" class="dropdown-item logout-btn" id="btn_nav_logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      `;

      navLinks.appendChild(widget);

      var btn = widget.querySelector('#nav_user_menu_btn');
      var drop = widget.querySelector('#nav_user_dropdown');
      var logoutBtn = widget.querySelector('#btn_nav_logout');

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var open = drop.style.display === 'block';
        drop.style.display = open ? 'none' : 'block';
      });

      if (!outsideClickBound) {
        outsideClickBound = true;
        document.addEventListener('click', function(e) {
          var w = document.querySelector('.nav-user-widget');
          var d = document.getElementById('nav_user_dropdown');
          if (w && d && !w.contains(e.target)) d.style.display = 'none';
        });
      }

      logoutBtn.addEventListener('click', async function() {
        try {
          await window.ClipLensAuth.signOut();
          window.location.href = rootPath;
        } catch (e) {
          window.location.reload();
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavAuth);
  } else {
    initNavAuth();
  }
})();
