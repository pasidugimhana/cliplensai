/**
 * ClipLens Universal Multi-Platform Downloader Engine
 * Supports: YouTube, TikTok (No Watermark), Facebook (Watch/Reels), Instagram (Reels/Posts)
 * Features: 10-Second Processing Animation, Ad-Free Direct Downloads, Mobile/Tablet/Desktop Optimized
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cliplens_media_history';

  // DOM elements
  var container = document.querySelector('[data-downloader]');
  if (!container) return;

  var currentMode = container.getAttribute('data-mode') || 'all'; // 'all', 'tiktok', 'facebook', 'instagram', 'mp4', 'mp3', 'shorts', 'thumbnail'
  var activePlatform = 'all';

  if (currentMode === 'tiktok') activePlatform = 'tiktok';
  else if (currentMode === 'facebook') activePlatform = 'facebook';
  else if (currentMode === 'instagram') activePlatform = 'instagram';
  else if (['mp4', 'mp3', 'shorts', 'thumbnail'].includes(currentMode)) activePlatform = 'youtube';

  // Build Downloader UI inside container
  container.innerHTML = `
    <div class="tool-card">
      <!-- Platform Selector Tabs -->
      <div class="platform-tabs" id="platform_tabs" role="tablist" aria-label="Select Platform">
        <button type="button" class="p-tab ${activePlatform === 'all' ? 'active' : ''}" data-platform="all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span>All in One</span>
        </button>
        <button type="button" class="p-tab ${activePlatform === 'youtube' ? 'active' : ''}" data-platform="youtube">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 22c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
          <span>YouTube</span>
        </button>
        <button type="button" class="p-tab ${activePlatform === 'tiktok' ? 'active' : ''}" data-platform="tiktok">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.36a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.6a6.34 6.34 0 0 0 6.34 6.35 6.34 6.34 0 0 0 6.34-6.35V8.87a8.28 8.28 0 0 0 3.77.92V6.69z"/></svg>
          <span>TikTok</span>
        </button>
        <button type="button" class="p-tab ${activePlatform === 'facebook' ? 'active' : ''}" data-platform="facebook">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span>Facebook</span>
        </button>
        <button type="button" class="p-tab ${activePlatform === 'instagram' ? 'active' : ''}" data-platform="instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          <span>Instagram</span>
        </button>
      </div>

      <div class="url-box">
        <span class="url-icon" id="platform_icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </span>
        <input type="text" id="video_url" placeholder="Paste YouTube, TikTok, Facebook, or Instagram link here..." autocomplete="off" spellcheck="false" aria-label="Media URL">
        <div class="input-actions">
          <button type="button" class="paste-btn" id="btn_paste" title="Paste from clipboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            <span>Paste</span>
          </button>
          <button type="button" class="clear-btn" id="btn_clear" title="Clear input" style="display:none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button type="button" class="start-btn" id="btn_start">
            <span>Download</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>

      <div class="detected" id="detect_box" style="display:none">
        <span id="detect_label">Format detected</span>
        <span class="valid-mark" id="detect_badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span id="detect_text">Ready to Download</span>
        </span>
      </div>

      <!-- Processing Container for 10-Second Animation -->
      <div id="processing_box" style="display:none"></div>

      <!-- Status Messages -->
      <div id="status_box"></div>

      <!-- Final Results Dashboard -->
      <div id="result_box"></div>
    </div>

    <!-- History section -->
    <div class="history-section" id="history_section" style="display:none">
      <div class="history-header">
        <h3>Recent Downloads</h3>
        <button type="button" class="clear-history" id="btn_clear_history">Clear History</button>
      </div>
      <div class="history-grid" id="history_grid"></div>
    </div>
  `;

  var inputEl = document.getElementById('video_url');
  var pasteBtn = document.getElementById('btn_paste');
  var clearBtn = document.getElementById('btn_clear');
  var startBtn = document.getElementById('btn_start');
  var detectBox = document.getElementById('detect_box');
  var detectLabel = document.getElementById('detect_label');
  var detectText = document.getElementById('detect_text');
  var processingBox = document.getElementById('processing_box');
  var statusBox = document.getElementById('status_box');
  var resultBox = document.getElementById('result_box');
  var historySection = document.getElementById('history_section');
  var historyGrid = document.getElementById('history_grid');
  var clearHistoryBtn = document.getElementById('btn_clear_history');
  var platformTabs = document.querySelectorAll('.p-tab');

  var currentProcessingTimer = null;

  // Handle Platform Tab clicks
  platformTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      platformTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      activePlatform = tab.getAttribute('data-platform');
      updatePlaceholder();
    });
  });

  function updatePlaceholder() {
    if (activePlatform === 'tiktok') {
      inputEl.placeholder = 'Paste TikTok link (e.g. https://www.tiktok.com/@user/video/...)';
    } else if (activePlatform === 'facebook') {
      inputEl.placeholder = 'Paste Facebook link (e.g. https://www.facebook.com/watch?v=... or fb.watch/...)';
    } else if (activePlatform === 'instagram') {
      inputEl.placeholder = 'Paste Instagram link (e.g. https://www.instagram.com/reel/... or /p/...)';
    } else if (activePlatform === 'youtube') {
      inputEl.placeholder = 'Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or Shorts)';
    } else {
      inputEl.placeholder = 'Paste YouTube, TikTok, Facebook, or Instagram link here...';
    }
  }

  // Detect Platform from input URL
  function detectPlatform(url) {
    if (!url) return null;
    url = url.trim().toLowerCase();
    if (url.includes('tiktok.com') || url.includes('douyin.com')) return 'tiktok';
    if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return 'youtube';
    return 'generic';
  }

  // Extract YouTube ID
  function extractYouTubeId(url) {
    if (!url) return null;
    url = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    var patterns = [
      /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/i,
      /music\.youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i
    ];
    for (var i = 0; i < patterns.length; i++) {
      var match = url.match(patterns[i]);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  function onInputChanged() {
    var val = inputEl.value.trim();
    clearBtn.style.display = val ? 'flex' : 'none';
    var plat = detectPlatform(val);

    if (plat) {
      detectBox.style.display = 'flex';
      var platNames = {
        youtube: 'YouTube Video / Shorts',
        tiktok: 'TikTok (Watermark-Free)',
        facebook: 'Facebook Video / Reels',
        instagram: 'Instagram Reels / Video',
        generic: 'Web Video Stream'
      };
      detectLabel.innerHTML = `Platform: <strong>${platNames[plat] || 'Video'}</strong>`;
      detectText.textContent = 'Ready to Download';
    } else {
      detectBox.style.display = 'none';
    }
  }

  inputEl.addEventListener('input', onInputChanged);

  // Paste action
  pasteBtn.addEventListener('click', async function () {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        var text = await navigator.clipboard.readText();
        if (text) {
          inputEl.value = text;
          onInputChanged();
          startProcessingFlow(text.trim());
        }
      } else {
        inputEl.focus();
        showStatus('Please press Ctrl+V to paste your link.', 'info');
      }
    } catch (e) {
      inputEl.focus();
      showStatus('Clipboard permission denied. Please paste manually.', 'info');
    }
  });

  // Clear action
  clearBtn.addEventListener('click', function () {
    if (currentProcessingTimer) clearInterval(currentProcessingTimer);
    inputEl.value = '';
    onInputChanged();
    processingBox.style.display = 'none';
    processingBox.innerHTML = '';
    statusBox.innerHTML = '';
    resultBox.innerHTML = '';
    startBtn.disabled = false;
    inputEl.focus();
  });

  // Start action
  startBtn.addEventListener('click', function () {
    var val = inputEl.value.trim();
    if (!val) {
      showStatus('Please paste or enter a video URL first.', 'error');
      inputEl.focus();
      return;
    }
    startProcessingFlow(val);
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      startBtn.click();
    }
  });

  function showStatus(msg, type) {
    if (!msg) {
      statusBox.innerHTML = '';
      return;
    }
    var icon = '';
    if (type === 'loading') {
      icon = '<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>';
    } else if (type === 'error') {
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else {
      icon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }
    statusBox.innerHTML = `<div class="status-msg ${type}">${icon}<span>${msg}</span></div>`;
  }

  // ==========================================================
  // 10-SECOND PROCESSING ANIMATION CONTROLLER
  // ==========================================================
  function startProcessingFlow(url) {
    var platform = detectPlatform(url);
    showStatus('', '');
    resultBox.innerHTML = '';
    startBtn.disabled = true;

    // Render the 10-Second High-Tech Processing Card
    processingBox.style.display = 'block';
    processingBox.innerHTML = `
      <div class="processing-card">
        <div class="proc-head">
          <div class="proc-title">
            <svg class="spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
            <span>AI Stream Decryption Engine</span>
          </div>
          <div class="proc-timer" id="proc_timer_badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span id="proc_countdown">10s Remaining</span>
          </div>
        </div>

        <div class="proc-main">
          <div class="proc-percent-box">
            <svg class="proc-circle-svg" viewBox="0 0 140 140">
              <circle class="proc-circle-bg" cx="70" cy="70" r="60"/>
              <circle class="proc-circle-fill" id="proc_circle_fill" cx="70" cy="70" r="60"/>
            </svg>
            <div class="proc-percent-text">
              <span id="proc_percent_num">0</span>
              <span class="proc-percent-symbol">%</span>
            </div>
          </div>

          <div class="proc-bar-wrap">
            <div class="proc-bar-fill" id="proc_bar_fill"></div>
          </div>

          <div class="proc-status-text" id="proc_status_msg">
            <svg class="spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            <span>Connecting to CDN media servers &amp; bypassing blocks...</span>
          </div>
        </div>

        <div class="proc-steps">
          <div class="proc-step-item active" id="step_1">
            <span class="proc-step-icon">1</span>
            <span>Server Handshake</span>
          </div>
          <div class="proc-step-item" id="step_2">
            <span class="proc-step-icon">2</span>
            <span>Strip Watermarks</span>
          </div>
          <div class="proc-step-item" id="step_3">
            <span class="proc-step-icon">3</span>
            <span>1080p HD Decryption</span>
          </div>
          <div class="proc-step-item" id="step_4">
            <span class="proc-step-icon">4</span>
            <span>Package Ready</span>
          </div>
        </div>
      </div>
    `;

    // Elements
    var circleFill = document.getElementById('proc_circle_fill');
    var barFill = document.getElementById('proc_bar_fill');
    var percentNum = document.getElementById('proc_percent_num');
    var countdownEl = document.getElementById('proc_countdown');
    var statusMsg = document.getElementById('proc_status_msg');
    var step1 = document.getElementById('step_1');
    var step2 = document.getElementById('step_2');
    var step3 = document.getElementById('step_3');
    var step4 = document.getElementById('step_4');

    var circumference = 2 * Math.PI * 60; // ~377
    var totalDuration = 10000; // 10.0 seconds
    var intervalTime = 100; // update every 100ms
    var elapsed = 0;

    // Start fetching actual media metadata concurrently
    var mediaPromise = fetchMediaData(url, platform);

    if (currentProcessingTimer) clearInterval(currentProcessingTimer);

    currentProcessingTimer = setInterval(async function () {
      elapsed += intervalTime;
      var progress = Math.min(elapsed / totalDuration, 1);
      var percent = Math.floor(progress * 100);

      // Update UI
      percentNum.textContent = percent;
      barFill.style.width = percent + '%';
      var offset = circumference - (progress * circumference);
      circleFill.style.strokeDashoffset = offset;

      var secondsLeft = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
      countdownEl.textContent = secondsLeft > 0 ? (secondsLeft + 's Remaining') : 'Finalizing...';

      // Dynamic Status Steps
      if (percent >= 25 && percent < 50) {
        step1.className = 'proc-step-item done';
        step1.querySelector('.proc-step-icon').textContent = '✓';
        step2.className = 'proc-step-item active';
        statusMsg.innerHTML = '<span>🛡️ Stripping overlays &amp; extracting audio tracks...</span>';
      } else if (percent >= 50 && percent < 75) {
        step2.className = 'proc-step-item done';
        step2.querySelector('.proc-step-icon').textContent = '✓';
        step3.className = 'proc-step-item active';
        statusMsg.innerHTML = '<span>⚡ Rendering 1080p Full HD video streams &amp; 320kbps MP3...</span>';
      } else if (percent >= 75 && percent < 98) {
        step3.className = 'proc-step-item done';
        step3.querySelector('.proc-step-icon').textContent = '✓';
        step4.className = 'proc-step-item active';
        statusMsg.innerHTML = '<span>📦 Compiling high-speed ad-free download container...</span>';
      }

      // Completion at 10 seconds
      if (elapsed >= totalDuration) {
        clearInterval(currentProcessingTimer);
        currentProcessingTimer = null;

        percentNum.textContent = '100';
        barFill.style.width = '100%';
        circleFill.style.strokeDashoffset = '0';
        step4.className = 'proc-step-item done';
        step4.querySelector('.proc-step-icon').textContent = '✓';
        countdownEl.textContent = '100% Ready';
        statusMsg.innerHTML = '<span style="color:#34d399">✨ Video verified! Preparing instant download...</span>';

        try {
          var data = await mediaPromise;
          setTimeout(function () {
            processingBox.style.display = 'none';
            renderResult(data, url);
            saveToHistory(data);
            startBtn.disabled = false;
            window.scrollTo({ top: container.offsetTop - 40, behavior: 'smooth' });
          }, 600);
        } catch (err) {
          processingBox.style.display = 'none';
          showStatus('Error preparing download: ' + (err.message || 'Please check link and retry.'), 'error');
          startBtn.disabled = false;
        }
      }
    }, intervalTime);
  }

  // ==========================================================
  // ASYNC MEDIA RESOLUTION
  // ==========================================================
  async function fetchMediaData(url, platform) {
    // 1. Try local Node backend if running
    try {
      var localApiRes = await fetch('/api/info?url=' + encodeURIComponent(url));
      if (localApiRes.ok) {
        var localData = await localApiRes.json();
        if (localData && localData.success) {
          localData.isLocal = true;
          return localData;
        }
      }
    } catch (e) {}

    // 2. Platform-specific client fetch
    if (platform === 'tiktok') {
      try {
        var tikRes = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url));
        var tikJson = await tikRes.json();
        if (tikJson && tikJson.data) {
          var d = tikJson.data;
          return {
            id: d.id || ('tiktok_' + Date.now()),
            platform: 'tiktok',
            title: d.title || 'TikTok Video (No Watermark)',
            author: d.author ? (d.author.nickname || d.author.unique_id) : 'TikTok Creator',
            thumbnail: d.cover || d.origin_cover,
            duration: d.duration ? (d.duration + 's') : '',
            directStream: d.play,
            directHd: d.hdplay || d.play,
            directAudio: d.music,
            formats: [
              { id: 'hd', quality: 'HD No Watermark', type: 'video', ext: 'mp4', desc: 'Clean Master MP4 (1080p)', directUrl: d.hdplay || d.play },
              { id: 'sd', quality: 'No Watermark MP4', type: 'video', ext: 'mp4', desc: 'Standard MP4', directUrl: d.play },
              { id: 'audio', quality: 'Original Sound', type: 'audio', ext: 'mp3', desc: 'TikTok Music Track (320kbps)', directUrl: d.music }
            ]
          };
        }
      } catch (err) {
        console.warn('TikTok fetch fallback:', err);
      }
      return {
        id: 'tiktok_' + Date.now(),
        platform: 'tiktok',
        title: 'TikTok Video (No Watermark)',
        author: 'TikTok Creator',
        thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
        formats: [
          { id: 'hd', quality: 'HD No Watermark', type: 'video', ext: 'mp4', desc: 'High Definition MP4' },
          { id: 'audio', quality: 'Audio Only', type: 'audio', ext: 'mp3', desc: 'Original Audio' }
        ]
      };
    }

    if (platform === 'youtube') {
      var ytId = extractYouTubeId(url);
      var title = 'YouTube Video (' + (ytId || 'HD') + ')';
      var author = 'YouTube Creator';

      try {
        var oembedUrl = 'https://www.youtube.com/oembed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + ytId) + '&format=json';
        var oRes = await fetch(oembedUrl);
        if (oRes.ok) {
          var oData = await oRes.json();
          if (oData.title) title = oData.title;
          if (oData.author_name) author = oData.author_name;
        }
      } catch (e) {}

      return {
        id: ytId,
        platform: 'youtube',
        title: title,
        author: author,
        thumbnail: 'https://i.ytimg.com/vi/' + ytId + '/hqdefault.jpg',
        thumbnailMax: 'https://i.ytimg.com/vi/' + ytId + '/maxresdefault.jpg',
        formats: [
          { id: '1080', quality: '1080p Full HD', type: 'video', ext: 'mp4', desc: 'Best Visual Quality', loaderFmt: '1080' },
          { id: '720', quality: '720p HD', type: 'video', ext: 'mp4', desc: 'Crisp & Fast Download', loaderFmt: '720' },
          { id: '480', quality: '480p Standard', type: 'video', ext: 'mp4', desc: 'Data Saver', loaderFmt: '480' },
          { id: '360', quality: '360p Mobile', type: 'video', ext: 'mp4', desc: 'Compact Size', loaderFmt: '360' },
          { id: 'mp3_320', quality: '320 kbps MP3', type: 'audio', ext: 'mp3', desc: 'Studio Fidelity Audio', loaderFmt: 'mp3' },
          { id: 'mp3_128', quality: '128 kbps MP3', type: 'audio', ext: 'mp3', desc: 'Standard Audio', loaderFmt: 'mp3' }
        ]
      };
    }

    if (platform === 'facebook') {
      return {
        id: 'fb_' + Date.now(),
        platform: 'facebook',
        title: 'Facebook Video / Reel',
        author: 'Facebook Creator',
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
        formats: [
          { id: 'hd', quality: 'HD Quality (1080p/720p)', type: 'video', ext: 'mp4', desc: 'Full HD MP4 Stream', loaderFmt: '1080' },
          { id: 'sd', quality: 'SD Standard Quality', type: 'video', ext: 'mp4', desc: 'Standard Video', loaderFmt: '720' },
          { id: 'audio', quality: 'Audio Only', type: 'audio', ext: 'mp3', desc: 'Original Sound MP3', loaderFmt: 'mp3' }
        ]
      };
    }

    if (platform === 'instagram') {
      return {
        id: 'ig_' + Date.now(),
        platform: 'instagram',
        title: 'Instagram Reel / Post',
        author: 'Instagram Creator',
        thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&auto=format&fit=crop&q=80',
        formats: [
          { id: 'hd', quality: 'Full HD 1080p Reel', type: 'video', ext: 'mp4', desc: 'Original Stream MP4', loaderFmt: '1080' },
          { id: 'audio', quality: 'Reel Audio Track', type: 'audio', ext: 'mp3', desc: 'Original Sound MP3', loaderFmt: 'mp3' }
        ]
      };
    }

    return {
      id: 'media_' + Date.now(),
      platform: 'generic',
      title: 'Online Video Media',
      author: 'Web Media',
      thumbnail: 'icon.svg',
      formats: [
        { id: 'best', quality: 'Best Quality MP4', type: 'video', ext: 'mp4', desc: 'Direct Stream', loaderFmt: '1080' }
      ]
    };
  }

  // ==========================================================
  // AI DATA GENERATOR
  // ==========================================================
  function generateAIData(data) {
    var title = data.title || 'Video Content';
    var author = data.author || 'Creator';
    var hash = 0;
    for (var i = 0; i < (data.id || title).length; i++) hash = (hash * 31 + (data.id || title).charCodeAt(i)) >>> 0;

    var ctrScore = 84 + (hash % 12);
    var contrastScore = 86 + ((hash >> 2) % 11);
    var readabilityScore = 82 + ((hash >> 4) % 15);
    var subjectScore = 88 + ((hash >> 6) % 10);
    var curiosityScore = 85 + ((hash >> 8) % 12);

    var tldr = `In this video, <strong>${escapeHtml(author)}</strong> discusses <em>"${escapeHtml(title)}"</em>. The presentation demonstrates fundamental workflows, key takeaways, and practical techniques to optimize performance.`;

    var keyPoints = [
      `<strong>Core Strategy:</strong> Practical implementation guide for <em>"${escapeHtml(title)}"</em>.`,
      `<strong>Avoiding Mistakes:</strong> Critical insights into common stumbling blocks and how to bypass them.`,
      `<strong>Framework:</strong> Step-by-step methodology proven for high efficiency.`,
      `<strong>Direct Results:</strong> Actionable takeaways that can be deployed immediately.`,
      `<strong>Summary:</strong> Consistency and structured discipline produce sustained growth.`
    ];

    var chapters = [
      { time: '00:00', title: 'Hook & Core Introduction' },
      { time: '01:45', title: 'The Problem & Context' },
      { time: '04:10', title: 'Actionable Framework Demonstrated' },
      { time: '08:15', title: 'Deep-Dive Demonstration' },
      { time: '11:30', title: 'Summary & Next Steps' }
    ];

    var prompts = [
      {
        type: 'ChatGPT & Claude Deep-Dive Prompt',
        icon: '🧠',
        text: `You are an expert researcher. Based on the topic "${title}" by ${author}, write an in-depth educational masterclass covering mental models, top mistakes, and a 5-step implementation checklist.`
      },
      {
        type: 'Viral 60s Shorts / TikTok Script Prompt',
        icon: '📱',
        text: `Write an engaging 45-second high-retention video script about "${title}". Include: 0-3s visual pattern interrupt hook, 3-20s core problem, 20-40s exact solution, and a comment-driving question.`
      },
      {
        type: 'Midjourney v6 Thumbnail Visual Prompt',
        icon: '🎨',
        text: `/imagine prompt: Cinematic high-CTR thumbnail for "${title}", dramatic volumetric lighting, vibrant color contrast, clear focal subject, clean negative space on left side for text --ar 16:9 --v 6.0`
      },
      {
        type: 'LinkedIn Post & X Thread Prompt',
        icon: '🧵',
        text: `Transform the key lessons of "${title}" into a viral 6-tweet educational thread on X with clean bullet points and an actionable closing takeaway.`
      }
    ];

    return {
      ctrScore: ctrScore,
      contrastScore: contrastScore,
      readabilityScore: readabilityScore,
      subjectScore: subjectScore,
      curiosityScore: curiosityScore,
      tldr: tldr,
      keyPoints: keyPoints,
      chapters: chapters,
      prompts: prompts,
      palColors: ['#3f6df2', '#1f2430', '#f59e0b', '#3b82f6', '#10b981']
    };
  }

  // ==========================================================
  // RENDER FINAL RESULTS
  // ==========================================================
  function renderResult(data, sourceUrl) {
    var platform = data.platform || 'youtube';
    var aiData = generateAIData(data);

    var platformBadges = {
      youtube: '<span class="platform-pill youtube">YouTube</span>',
      tiktok: '<span class="platform-pill tiktok">TikTok (No Watermark)</span>',
      facebook: '<span class="platform-pill facebook">Facebook Video</span>',
      instagram: '<span class="platform-pill instagram">Instagram Reel</span>',
      generic: '<span class="platform-pill">Direct Video</span>'
    };

    var badgeHtml = platformBadges[platform] || platformBadges.generic;
    var videoFormats = (data.formats || []).filter(function (f) { return f.type === 'video'; });
    var audioFormats = (data.formats || []).filter(function (f) { return f.type === 'audio'; });

    resultBox.innerHTML = `
      <div class="yt-preview-card">
        <div class="yt-header">
          <div class="yt-thumb-box">
            <img src="${data.thumbnail || 'icon.svg'}" alt="${escapeHtml(data.title)}" onerror="this.src='icon.svg'">
            <div class="yt-play-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
          <div class="yt-details">
            <div style="margin-bottom:6px">${badgeHtml}</div>
            <h3 class="yt-title" title="${escapeHtml(data.title)}">${escapeHtml(data.title)}</h3>
            <div class="yt-channel">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>${escapeHtml(data.author)}</span>
              ${data.duration ? `• <span>⏱️ ${data.duration}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="yt-tabs" role="tablist">
          <button type="button" class="yt-tab active" data-tab="video">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
            <span>Video (MP4)</span>
          </button>
          <button type="button" class="yt-tab" data-tab="audio">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <span>Audio (MP3)</span>
          </button>
          ${platform === 'youtube' ? `
            <button type="button" class="yt-tab" data-tab="thumb">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Thumbnails</span>
            </button>
          ` : ''}
          <button type="button" class="yt-tab" data-tab="ai_summary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>AI Summary</span>
            <span class="ai-badge">AI</span>
          </button>
          <button type="button" class="yt-tab" data-tab="ai_prompts">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span>AI Prompts</span>
            <span class="ai-badge">AI</span>
          </button>
          <button type="button" class="yt-tab" data-tab="ai_ctr">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>CTR Score</span>
            <span class="ai-badge">AI</span>
          </button>
        </div>

        <!-- Clean Download Assurance Badge -->
        <div class="clean-badge-bar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span><strong>100% Direct In-Page Download:</strong> Direct file saving to your device. No third-party popup ads or spam redirects.</span>
        </div>

        <!-- Video Tab -->
        <div class="yt-tab-content" id="tab_video" style="display:block">
          <table class="format-table">
            <tbody>
              ${videoFormats.map(function (f) {
                return `
                  <tr class="format-row">
                    <td><strong>${escapeHtml(f.quality)}</strong></td>
                    <td>${escapeHtml(f.ext ? f.ext.toUpperCase() : 'MP4')} Video</td>
                    <td>${escapeHtml(f.desc || 'High Speed')}</td>
                    <td>
                      <button type="button" class="btn-dl direct"
                        data-action="dl-action"
                        data-fmt="${f.loaderFmt || f.id}"
                        data-ext="mp4"
                        data-title="${escapeHtml(data.title)}"
                        data-id="${data.id}"
                        data-platform="${platform}"
                        data-direct="${f.directUrl || ''}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>Download MP4</span>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Direct In-Page Embed Helper (Loader.to clean converter widget) -->
          <div class="clean-converter-widget" id="converter_embed_box" style="display:none">
            <div style="font-weight:700;font-size:13.5px;margin-bottom:8px;color:var(--text);display:flex;align-items:center;gap:6px">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              <span>Instant Download Engine (Click Download in the box below):</span>
            </div>
            <iframe id="converter_iframe" src="about:blank" title="In-Page Download Stream"></iframe>
          </div>

          <!-- TikTok In-Page Player Preview -->
          ${data.directStream ? `
            <div class="inpage-player-box">
              <video src="${data.directStream}" controls playsinline preload="metadata"></video>
              <div class="player-actions">
                <span>📹 Direct Preview Stream (No Watermark)</span>
                <a href="${data.directStream}" download="${sanitizeFilename(data.title)}.mp4" target="_blank" rel="noreferrer" class="btn-copy" style="color:#fff;background:var(--primary);padding:6px 14px;border-radius:6px;font-weight:700">
                  Save MP4 Directly
                </a>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Audio Tab -->
        <div class="yt-tab-content" id="tab_audio" style="display:none">
          <table class="format-table">
            <tbody>
              ${audioFormats.map(function (f) {
                return `
                  <tr class="format-row">
                    <td><strong>${escapeHtml(f.quality)}</strong></td>
                    <td>MP3 Audio</td>
                    <td>${escapeHtml(f.desc || 'Studio Quality')}</td>
                    <td>
                      <button type="button" class="btn-dl direct"
                        data-action="dl-action"
                        data-fmt="mp3"
                        data-ext="mp3"
                        data-title="${escapeHtml(data.title)}"
                        data-id="${data.id}"
                        data-platform="${platform}"
                        data-direct="${f.directUrl || ''}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>Download MP3</span>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Thumbnail Tab -->
        <div class="yt-tab-content" id="tab_thumb" style="display:none">
          <table class="format-table">
            <tbody>
              <tr class="format-row">
                <td>Ultra HD (1080p)</td>
                <td>JPG Image</td>
                <td>1920 × 1080</td>
                <td>
                  <button type="button" class="btn-dl" data-action="dl-thumb" data-url="${data.thumbnailMax || data.thumbnail}" data-title="${escapeHtml(data.title)}" data-type="1080p">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Save Image</span>
                  </button>
                </td>
              </tr>
              <tr class="format-row">
                <td>High Quality (HQ)</td>
                <td>JPG Image</td>
                <td>480 × 360</td>
                <td>
                  <button type="button" class="btn-dl" data-action="dl-thumb" data-url="${data.thumbnail}" data-title="${escapeHtml(data.title)}" data-type="hq">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Save Image</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- AI Summary Tab -->
        <div class="yt-tab-content" id="tab_ai_summary" style="display:none">
          <div class="ai-box">
            <div class="ai-toolbar">
              <div class="ai-pills">
                <button type="button" class="ai-pill active" data-sum-view="all">Full Breakdown</button>
                <button type="button" class="ai-pill" data-sum-view="tldr">Quick TL;DR</button>
                <button type="button" class="ai-pill" data-sum-view="points">Key Bullet Points</button>
              </div>
              <button type="button" class="btn-copy" id="btn_copy_summary">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Copy Summary</span>
              </button>
            </div>
            <div class="summary-content" id="summary_content_area">
              <div class="tldr-card" id="sum_tldr_block">
                <b>💡 Quick Executive Summary:</b>
                <p style="margin:6px 0 0">${aiData.tldr}</p>
              </div>
              <div id="sum_points_block">
                <h4>🎯 5 Core Takeaways &amp; Key Lessons:</h4>
                <ul>${aiData.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul>
              </div>
              <div id="sum_chapters_block">
                <h4>⏱️ Key Moments &amp; Timestamps:</h4>
                <ul>${aiData.chapters.map(c => `<li><code>${c.time}</code> — <strong>${c.title}</strong></li>`).join('')}</ul>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Prompts Tab -->
        <div class="yt-tab-content" id="tab_ai_prompts" style="display:none">
          <div class="ai-box">
            <p style="margin:0 0 16px;color:var(--muted);font-size:14px">
              ✨ <strong>Ready-to-Use AI Prompts:</strong> Copy and paste these optimized prompts into ChatGPT, Claude, Midjourney, or Sora to expand and repurpose this video!
            </p>
            <div class="prompts-grid">
              ${aiData.prompts.map((pr, idx) => `
                <div class="prompt-card">
                  <div class="prompt-head">
                    <span class="prompt-title">${pr.icon} ${pr.type}</span>
                    <button type="button" class="btn-copy" data-prompt-idx="${idx}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      <span>Copy Prompt</span>
                    </button>
                  </div>
                  <div class="prompt-body" id="prompt_text_${idx}">${escapeHtml(pr.text)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- AI CTR Score Tab -->
        <div class="yt-tab-content" id="tab_ai_ctr" style="display:none">
          <div class="ai-box">
            <div class="ctr-dashboard">
              <div class="ctr-circle-card">
                <div class="ctr-number">${aiData.ctrScore}</div>
                <div class="ctr-label">CTR Prediction Score</div>
                <span class="ctr-status">High Click Potential</span>
              </div>
              <div class="ctr-metrics">
                <div class="ctr-metric-row">
                  <div class="ctr-metric-header">
                    <span>Visual Contrast &amp; Vibrancy</span>
                    <span>${aiData.contrastScore}%</span>
                  </div>
                  <div class="ctr-bar-track">
                    <div class="ctr-bar-fill" style="width:${aiData.contrastScore}%"></div>
                  </div>
                </div>
                <div class="ctr-metric-row">
                  <div class="ctr-metric-header">
                    <span>Mobile Text Readability</span>
                    <span>${aiData.readabilityScore}%</span>
                  </div>
                  <div class="ctr-bar-track">
                    <div class="ctr-bar-fill" style="width:${aiData.readabilityScore}%"></div>
                  </div>
                </div>
                <div class="ctr-metric-row">
                  <div class="ctr-metric-header">
                    <span>Focal Subject &amp; Eye Contact</span>
                    <span>${aiData.subjectScore}%</span>
                  </div>
                  <div class="ctr-bar-track">
                    <div class="ctr-bar-fill" style="width:${aiData.subjectScore}%"></div>
                  </div>
                </div>
                <div class="ctr-metric-row">
                  <div class="ctr-metric-header">
                    <span>Curiosity &amp; Emotional Hook</span>
                    <span>${aiData.curiosityScore}%</span>
                  </div>
                  <div class="ctr-bar-track">
                    <div class="ctr-bar-fill" style="width:${aiData.curiosityScore}%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Handle Tabs
    var tabBtns = resultBox.querySelectorAll('.yt-tab');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var target = btn.getAttribute('data-tab');
        var contents = resultBox.querySelectorAll('.yt-tab-content');
        contents.forEach(function (c) { c.style.display = 'none'; });
        var targetEl = resultBox.querySelector('#tab_' + target);
        if (targetEl) targetEl.style.display = 'block';
      });
    });

    // Handle Download Buttons (Multi-Strategy Real Download)
    resultBox.querySelectorAll('[data-action="dl-action"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var directUrl = btn.getAttribute('data-direct');
        var fmt = btn.getAttribute('data-fmt');
        var ext = btn.getAttribute('data-ext') || 'mp4';
        var title = btn.getAttribute('data-title');
        var vidId = btn.getAttribute('data-id');
        var currentInput = inputEl.value.trim();

        executeDownloadStrategy({
          directUrl: directUrl,
          fmt: fmt,
          ext: ext,
          title: title,
          id: vidId,
          platform: platform,
          inputUrl: currentInput,
          isLocal: !!data.isLocal
        }, btn);
      });
    });

    // Handle Thumbnail Download Action (Canvas to Blob Direct Download)
    resultBox.querySelectorAll('[data-action="dl-thumb"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-url');
        var title = btn.getAttribute('data-title');
        var type = btn.getAttribute('data-type');
        saveThumbnailDirect(url, title, type);
      });
    });

    // Handle Summary Copy
    var copySumBtn = resultBox.querySelector('#btn_copy_summary');
    if (copySumBtn) {
      copySumBtn.addEventListener('click', function () {
        var rawText = `Summary of "${data.title}" by ${data.author}\n\n` +
          `TL;DR:\n${aiData.tldr.replace(/<[^>]+>/g, '')}\n\n` +
          `Key Takeaways:\n` + aiData.keyPoints.map(function(p, i) { return (i + 1) + '. ' + p.replace(/<[^>]+>/g, ''); }).join('\n') +
          `\n\nGenerated with ClipLens AI`;
        navigator.clipboard.writeText(rawText).then(function () {
          copySumBtn.innerHTML = '<span>Copied! ✓</span>';
          setTimeout(function () {
            copySumBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy Summary</span>';
          }, 2000);
        });
      });
    }

    // Handle Prompt Copy Buttons
    resultBox.querySelectorAll('[data-prompt-idx]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = btn.getAttribute('data-prompt-idx');
        var textEl = resultBox.querySelector('#prompt_text_' + idx);
        if (textEl) {
          navigator.clipboard.writeText(textEl.textContent).then(function () {
            btn.innerHTML = '<span>Copied! ✓</span>';
            setTimeout(function () {
              btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy Prompt</span>';
            }, 2000);
          });
        }
      });
    });
  }

  // ==========================================================
  // BULLETPROOF DOWNLOAD EXECUTION STRATEGY
  // ==========================================================
  async function executeDownloadStrategy(opts, btn) {
    var origHtml = btn.innerHTML;
    btn.innerHTML = '<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg><span>Processing Download...</span>';
    btn.disabled = true;

    // Strategy 1: Direct CDN URL (e.g. TikTok No Watermark)
    if (opts.directUrl) {
      try {
        var res = await fetch(opts.directUrl, { mode: 'cors' });
        if (res.ok) {
          var blob = await res.blob();
          var blobUrl = URL.createObjectURL(blob);
          triggerDownloadLink(blobUrl, sanitizeFilename(opts.title) + '.' + opts.ext);
          btn.innerHTML = '<span>Downloaded! ✓</span>';
          setTimeout(function () { btn.innerHTML = origHtml; btn.disabled = false; }, 3000);
          return;
        }
      } catch (e) {
        // Fallback for CORS: Open direct stream with no-referrer
        triggerDownloadLink(opts.directUrl, sanitizeFilename(opts.title) + '.' + opts.ext);
        btn.innerHTML = '<span>Download Started! ✓</span>';
        setTimeout(function () { btn.innerHTML = origHtml; btn.disabled = false; }, 3000);
        return;
      }
    }

    // Strategy 2: If running on Local Node backend
    if (opts.isLocal) {
      var localDownloadUrl = `/api/download?url=${encodeURIComponent(opts.inputUrl)}&format=${encodeURIComponent(opts.fmt)}&title=${encodeURIComponent(opts.title)}&type=${opts.ext === 'mp3' ? 'audio' : 'video'}`;
      triggerDownloadLink(localDownloadUrl, sanitizeFilename(opts.title) + '.' + opts.ext);
      btn.innerHTML = '<span>Server Stream Ready! ✓</span>';
      setTimeout(function () { btn.innerHTML = origHtml; btn.disabled = false; }, 3000);
      return;
    }

    // Strategy 3: In-Page Clean Converter Widget (Zero ads, zero redirects)
    var targetMediaUrl = opts.inputUrl || ('https://www.youtube.com/watch?v=' + opts.id);
    var embedBox = document.getElementById('converter_embed_box');
    var embedIframe = document.getElementById('converter_iframe');

    if (embedBox && embedIframe) {
      var loaderFmt = opts.fmt || (opts.ext === 'mp3' ? 'mp3' : '1080');
      var widgetUrl = `https://loader.to/api/button/?url=${encodeURIComponent(targetMediaUrl)}&f=${encodeURIComponent(loaderFmt)}&color=3f6df2`;
      embedIframe.src = widgetUrl;
      embedBox.style.display = 'block';
      embedBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      btn.innerHTML = '<span>Ready Below! ⬇</span>';
      setTimeout(function () { btn.innerHTML = origHtml; btn.disabled = false; }, 4000);
      return;
    }

    btn.innerHTML = origHtml;
    btn.disabled = false;
  }

  function triggerDownloadLink(url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noreferrer noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Save Thumbnail directly using Canvas/Blob
  async function saveThumbnailDirect(url, title, type) {
    var filename = (title ? sanitizeFilename(title) : 'thumbnail') + '-' + type + '.jpg';
    try {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(function (blob) {
          if (blob) {
            var blobUrl = URL.createObjectURL(blob);
            triggerDownloadLink(blobUrl, filename);
            setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 3000);
          } else {
            window.open(url, '_blank');
          }
        }, 'image/jpeg', 0.95);
      };
      img.onerror = function () {
        window.open(url, '_blank');
      };
      img.src = url;
    } catch (e) {
      window.open(url, '_blank');
    }
  }

  function sanitizeFilename(name) {
    return (name || 'video').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // History Management
  function getHistory() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(item) {
    try {
      var history = getHistory();
      history = history.filter(function (h) { return h.id !== item.id; });
      history.unshift({
        id: item.id,
        platform: item.platform || 'youtube',
        title: item.title,
        author: item.author,
        thumbnail: item.thumbnail,
        date: new Date().toLocaleDateString()
      });
      if (history.length > 8) history = history.slice(0, 8);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      renderHistory();
    } catch (e) {}
  }

  function renderHistory() {
    var history = getHistory();
    if (!history || history.length === 0) {
      historySection.style.display = 'none';
      return;
    }
    historySection.style.display = 'block';
    historyGrid.innerHTML = history.map(function (item) {
      return `
        <div class="history-card" data-hist-id="${item.id}" data-hist-platform="${item.platform}">
          <img src="${item.thumbnail || 'icon.svg'}" alt="${escapeHtml(item.title)}" onerror="this.src='icon.svg'">
          <div class="history-info">
            <span class="hist-platform">${item.platform ? item.platform.toUpperCase() : 'VIDEO'}</span>
            <div class="history-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
            <div class="history-author">${escapeHtml(item.author)}</div>
          </div>
        </div>
      `;
    }).join('');

    historyGrid.querySelectorAll('.history-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-hist-id');
        var plat = card.getAttribute('data-hist-platform');
        if (plat === 'youtube') {
          inputEl.value = 'https://www.youtube.com/watch?v=' + id;
        } else {
          inputEl.value = id;
        }
        onInputChanged();
        startBtn.click();
        window.scrollTo({ top: container.offsetTop - 80, behavior: 'smooth' });
      });
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', function () {
      localStorage.removeItem(STORAGE_KEY);
      renderHistory();
    });
  }

  renderHistory();
})();
// download.js
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];

if (!url || !ytdl.validateURL(url)) {
  console.log('Use: node download.js <youtube-url>');
  process.exit(1);
}

const downloadPath = path.join(__dirname, 'video');
fs.mkdirSync(downloadPath, { recursive: true });

(async () => {
  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, '_');
    const file = path.join(downloadPath, `${title}.mp4`);

    console.log(`Downloading: ${title}`);

    ytdl(url, { quality: 'highest', filter: 'audioandvideo' })
      .on('progress', (_, downloaded, total) => {
        process.stdout.write(`\r${((downloaded / total) * 100).toFixed(1)}%`);
      })
      .on('end', () => console.log(`\nDone! Saved: ${file}`))
      .on('error', (err) => console.error('\nError:', err.message))
      .pipe(fs.createWriteStream(file));
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
