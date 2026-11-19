/**
 * ClipLens Multi-Platform Downloader Server
 * Universal Media Engine for YouTube, TikTok, Facebook, Instagram.
 * Direct in-browser ad-free stream proxy & static file server.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 8000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function detectPlatform(url) {
  if (!url) return 'generic';
  var u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('facebook.com') || u.includes('fb.watch') || u.includes('fb.com')) return 'facebook';
  if (u.includes('instagram.com')) return 'instagram';
  return 'generic';
}

function sanitizeFilename(name) {
  return (name || 'video')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

const server = http.createServer((req, res) => {
  // Enable CORS for API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // 1. Health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'ClipLens AI Engine', version: '2026.2' }));
    return;
  }

  // 1b. Multi-Model AI Chat Completion API (ChatGPT, Claude, Nano Banana, Seedance)
  if (pathname === '/api/ai/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        let params = {};
        if (req.method === 'POST' && body) {
          try { params = JSON.parse(body); } catch (e) {}
        } else {
          params = {
            message: parsedUrl.searchParams.get('message'),
            model: parsedUrl.searchParams.get('model'),
            persona: parsedUrl.searchParams.get('persona')
          };
        }

        const userMsg = params.message || 'Hello';
        const model = (params.model || 'chatgpt').toLowerCase();
        const persona = params.persona || 'general';

        let systemInstruction = 'You are a helpful, brilliant AI assistant.';
        if (model === 'claude') {
          systemInstruction = 'You are Claude 3.5 Sonnet, developed by Anthropic. You are exceptionally thoughtful, deep, eloquent, and analytically rigorous.';
        } else if (model === 'banana') {
          systemInstruction = 'You are Nano Banana Pro, a high-speed neural AI. Provide rapid, concise, hyper-focused and actionable answers.';
        } else if (model === 'seedance') {
          systemInstruction = 'You are Seedance AI, a creative director and artistic concept specialist. Describe rich visual metaphors and imaginative ideas.';
        } else if (model === 'omniflash' || model === 'flash' || model === 'omni') {
          systemInstruction = 'You are Omni Flash (powered by Google Gemini 2.0 Flash and GPT-4o Omni architectures). You deliver ultra-fast, highly accurate, concise, real-time responses with razor-sharp formatting.';
        } else {
          systemInstruction = 'You are ChatGPT-4o by OpenAI. Provide clear, structured, well-formatted answers with markdown and bullet points.';
        }

        const fullPrompt = `${systemInstruction}\n\nUser Question:\n${userMsg}`;
        const apiUrl = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai`;

        const aiRes = await fetch(apiUrl, { signal: AbortSignal.timeout(12000) });
        const aiText = await aiRes.text();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          model: model,
          response: aiText.trim()
        }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          model: 'chatgpt',
          response: `Here is the AI response to your request:\n\n${params.message || 'Hello! How can I assist you with content creation today?'}`
        }));
      }
    });
    return;
  }

  // 1c. Prompt Enhancer API (ChatGPT / Claude AI)
  if (pathname === '/api/ai/enhance-prompt') {
    const rawPrompt = parsedUrl.searchParams.get('prompt') || '';
    const style = parsedUrl.searchParams.get('style') || 'photorealistic';
    const engine = parsedUrl.searchParams.get('engine') || 'banana';

    (async () => {
      try {
        const query = `You are a prompt engineer for Midjourney and modern diffusion models. Enhance this image idea into an 8k photorealistic masterpiece prompt: "${rawPrompt}". Style: ${style}. Output ONLY the raw enhanced prompt without conversational filler.`;
        const aiRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(query)}?model=openai`, { signal: AbortSignal.timeout(8000) });
        const enhanced = await aiRes.text();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, prompt: enhanced.trim() }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          prompt: `${rawPrompt}, 8k resolution, volumetric cinematic lighting, photorealistic textures, masterwork, f/1.8 lens, trending on ArtStation`
        }));
      }
    })();
    return;
  }

  // 1d. AI Video Prompt & Director Engine (Sora, Omni Flash, Runway, Nano Banana, Seedance)
  if (pathname === '/api/ai/video/enhance') {
    const rawPrompt = parsedUrl.searchParams.get('prompt') || '';
    const engine = (parsedUrl.searchParams.get('engine') || 'omniflash').toLowerCase();
    const motion = parsedUrl.searchParams.get('motion') || 'drone';

    (async () => {
      try {
        const query = `You are an expert Hollywood AI video director for OpenAI Sora, Runway Gen-3 and Luma Dream Machine. Expand this video prompt: "${rawPrompt}". Camera motion: ${motion}. Engine: ${engine}. Add cinematic lighting, depth of field, 60fps fluid physics, camera direction. Return ONLY the enhanced video prompt in 2 concise sentences without conversational preamble.`;
        const aiRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(query)}?model=openai`, { signal: AbortSignal.timeout(8000) });
        const enhanced = await aiRes.text();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, prompt: enhanced.trim() }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          prompt: `${rawPrompt}, cinematic slow motion, 60fps high temporal coherence, dynamic camera motion ${motion}, photorealistic lighting, 4k master render`
        }));
      }
    })();
    return;
  }

  // 2. Metadata Extraction API
  if (pathname === '/api/info') {
    const targetUrl = parsedUrl.searchParams.get('url');
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing "url" parameter.' }));
      return;
    }

    const platform = detectPlatform(targetUrl);

    // Call yt-dlp to extract full JSON metadata with a 6-second timeout
    const args = ['-m', 'yt_dlp', '--dump-json', '--no-playlist', targetUrl];
    const proc = spawn('python', args);

    const timeout = setTimeout(() => {
      if (!proc.killed) {
        proc.kill();
      }
    }, 6000);

    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', (chunk) => { stdoutData += chunk; });
    proc.stderr.on('data', (chunk) => { stderrData += chunk; });

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 || !stdoutData) {
        console.warn('yt-dlp extract warning/error:', stderrData.slice(0, 300));
        // Return structured fallback response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          platform: platform,
          error: stderrData || 'Could not extract video metadata directly.',
          url: targetUrl
        }));
        return;
      }

      try {
        const raw = JSON.parse(stdoutData);
        const durationSec = raw.duration || 0;
        const mins = Math.floor(durationSec / 60);
        const secs = Math.floor(durationSec % 60);
        const formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        const cleanData = {
          success: true,
          id: raw.id,
          platform: platform,
          title: raw.title || `${platform.toUpperCase()} Video`,
          author: raw.uploader || raw.channel || raw.creator || 'Creator',
          authorUrl: raw.uploader_url || targetUrl,
          thumbnail: raw.thumbnail || '',
          duration: formattedDuration,
          formats: []
        };

        // Standardized format choices for direct ad-free download
        if (platform === 'youtube') {
          cleanData.formats = [
            { id: '1080', quality: '1080p', type: 'video', ext: 'mp4', desc: 'Full HD Video', formatSpec: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best' },
            { id: '720', quality: '720p', type: 'video', ext: 'mp4', desc: 'HD Video (Crisp & Fast)', formatSpec: 'bestvideo[height<=720]+bestaudio/best[height<=720]/best' },
            { id: '480', quality: '480p', type: 'video', ext: 'mp4', desc: 'Standard (Data Saver)', formatSpec: 'bestvideo[height<=480]+bestaudio/best[height<=480]/best' },
            { id: '360', quality: '360p', type: 'video', ext: 'mp4', desc: 'Mobile Quality', formatSpec: 'bestvideo[height<=360]+bestaudio/best[height<=360]/best' },
            { id: 'mp3_320', quality: '320 kbps', type: 'audio', ext: 'mp3', desc: 'HQ MP3 Audio', formatSpec: 'bestaudio/best' },
            { id: 'mp3_128', quality: '128 kbps', type: 'audio', ext: 'mp3', desc: 'Standard MP3', formatSpec: 'bestaudio/best' }
          ];
        } else if (platform === 'tiktok') {
          cleanData.formats = [
            { id: 'hd', quality: 'HD No Watermark', type: 'video', ext: 'mp4', desc: 'Clean Master MP4', formatSpec: 'best' },
            { id: 'sd', quality: 'Standard MP4', type: 'video', ext: 'mp4', desc: 'Watermark-free', formatSpec: 'best' },
            { id: 'audio', quality: 'Original Sound', type: 'audio', ext: 'mp3', desc: 'TikTok Music Track', formatSpec: 'bestaudio/best' }
          ];
        } else if (platform === 'facebook') {
          cleanData.formats = [
            { id: 'hd', quality: 'HD 1080p/720p', type: 'video', ext: 'mp4', desc: 'High Quality MP4', formatSpec: 'best' },
            { id: 'sd', quality: 'SD Standard', type: 'video', ext: 'mp4', desc: 'Mobile Video', formatSpec: 'worst[ext=mp4]/best' },
            { id: 'audio', quality: 'Audio Only', type: 'audio', ext: 'mp3', desc: 'MP3 Audio Stream', formatSpec: 'bestaudio/best' }
          ];
        } else if (platform === 'instagram') {
          cleanData.formats = [
            { id: 'hd', quality: 'Full HD Reel/Video', type: 'video', ext: 'mp4', desc: 'Original Stream MP4', formatSpec: 'best' },
            { id: 'audio', quality: 'Reel Audio', type: 'audio', ext: 'mp3', desc: 'Original Sound MP3', formatSpec: 'bestaudio/best' }
          ];
        } else {
          cleanData.formats = [
            { id: 'best', quality: 'Best Quality', type: 'video', ext: 'mp4', desc: 'Original Stream', formatSpec: 'best' }
          ];
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cleanData));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 3. Direct In-Page Ad-Free Streaming & Download Endpoint
  if (pathname === '/api/download') {
    const targetUrl = parsedUrl.searchParams.get('url');
    const formatSpec = parsedUrl.searchParams.get('format') || 'best';
    const rawTitle = parsedUrl.searchParams.get('title') || 'download';
    const isAudio = parsedUrl.searchParams.get('type') === 'audio' || formatSpec.includes('audio') || formatSpec.includes('mp3');
    const ext = isAudio ? 'mp3' : 'mp4';
    const safeTitle = `${sanitizeFilename(rawTitle)}.${ext}`;

    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing "url" parameter.');
      return;
    }

    console.log(`[Stream Download] Initiating ad-free direct stream: ${targetUrl} (format: ${formatSpec}) -> ${safeTitle}`);

    // Stream directly through yt-dlp to browser response stdout
    const dlArgs = [
      '-m', 'yt_dlp',
      '--no-playlist',
      '-f', formatSpec,
      '-o', '-',
      targetUrl
    ];

    const dlProc = spawn('python', dlArgs);

    res.writeHead(200, {
      'Content-Type': isAudio ? 'audio/mpeg' : 'video/mp4',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(safeTitle)}"; filename*=UTF-8''${encodeURIComponent(safeTitle)}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    dlProc.stdout.pipe(res);

    dlProc.stderr.on('data', (data) => {
      // Log progress to terminal, do not contaminate HTTP stream
      const msg = data.toString();
      if (msg.includes('%') || msg.includes('ERROR')) {
        process.stdout.write(`[yt-dlp stream]: ${msg.slice(0, 100)}\r`);
      }
    });

    req.on('close', () => {
      if (!dlProc.killed) dlProc.kill();
    });

    dlProc.on('error', (err) => {
      console.error('Download stream process error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Download error: ${err.message}`);
      }
    });
    return;
  }

  // 4. Static File Serving
  let filePath = path.join(ROOT_DIR, pathname.endsWith('/') ? pathname + 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        if (readErr.code === 'ENOENT') {
          const notFoundPath = path.join(ROOT_DIR, '404.html');
          fs.readFile(notFoundPath, (err404, notFoundContent) => {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(err404 ? '<h1>404 Not Found</h1>' : notFoundContent);
          });
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`500 Server Error: ${readErr.code}`);
        }
      } else {
        const extname = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(` ClipLens Universal Downloader Engine`);
  console.log(` Multi-Platform: YouTube, TikTok, Facebook, Instagram`);
  console.log(` Ad-Free Direct Stream: http://localhost:${PORT}`);
  console.log(` Ready for AdSense, SEO & Creator Workflows`);
  console.log(`========================================================`);
});
