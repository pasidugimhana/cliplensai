// download.js (වෙනම Node.js file එකක් ලෙස save කරන්න)
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

    const writeStream = fs.createWriteStream(file);

    ytdl(url, { quality: 'highest', filter: 'audioandvideo' })
      .on('progress', (_, downloaded, total) => {
        if (total) {
          process.stdout.write(`\r${((downloaded / total) * 100).toFixed(1)}%`);
        }
      })
      .on('error', (err) => console.error('\nDownload Error:', err.message))
      .pipe(writeStream);

    writeStream.on('finish', () => console.log(`\nDone! Saved: ${file}`));
    writeStream.on('error', (err) => console.error('\nFile Error:', err.message));
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
