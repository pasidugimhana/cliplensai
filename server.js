const express = require('express');
const ytdl = require('@distube/ytdl-core');
const path = require('path');

const app = express();
const PORT = 3000;

// ඔයාගේ HTML, CSS, JS files තියෙන folder එක serve කරනවා
app.use(express.static(__dirname));

// 1. Video විස්තර ගන්න API එක (/api/info)
app.get('/api/info', async (req, res) => {
  const url = req.query.url;
  if (!url || !ytdl.validateURL(url)) {
    return res.json({ success: false, error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;

    res.json({
      success: true,
      id: details.videoId,
      platform: 'youtube',
      title: details.title,
      author: details.author ? details.author.name : 'YouTube Creator',
      thumbnail: `https://i.ytimg.com/vi/${details.videoId}/hqdefault.jpg`,
      thumbnailMax: `https://i.ytimg.com/vi/${details.videoId}/maxresdefault.jpg`,
      duration: details.lengthSeconds ? `${details.lengthSeconds}s` : '',
      formats: [
        { id: 'highest', quality: 'Best Quality MP4', type: 'video', ext: 'mp4', desc: 'Video + Audio' },
        { id: 'lowest', quality: 'Data Saver MP4', type: 'video', ext: 'mp4', desc: 'Smaller Size' },
        { id: 'mp3', quality: 'Audio Only', type: 'audio', ext: 'mp3', desc: 'Original Audio' }
      ]
    });
  } catch (err) {
    console.error('Info Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Video/Audio කෙලින්ම Download කරන API එක (/api/download)
app.get('/api/download', async (req, res) => {
  const { url, format, title, type } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  try {
    const safeTitle = (title || 'video').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const isAudio = type === 'audio' || format === 'mp3';
    const ext = isAudio ? 'mp3' : 'mp4';

    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);
    res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');

    const options = isAudio
      ? { quality: 'highestaudio', filter: 'audioonly' }
      : { quality: format === 'lowest' ? 'lowest' : 'highest', filter: 'audioandvideo' };

    ytdl(url, options)
      .on('error', (err) => {
        console.error('Stream Error:', err.message);
        if (!res.headersSent) res.status(500).send('Download failed');
      })
      .pipe(res);
  } catch (err) {
    console.error('Download Error:', err.message);
    if (!res.headersSent) res.status(500).send('Download failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
