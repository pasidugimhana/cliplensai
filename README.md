# ClipLens AI — Universal Multi-Platform Media Downloader & Creator AI Suite

A high-performance, modern, mobile-responsive media downloader and AI utility platform built with modern HTML5, CSS3, Vanilla JavaScript, and an optional Node.js backend. Zero spam ads, 100% Google AdSense & Search Console compliant.

## 🌟 Key Features

- **Multi-Platform Video & Audio Downloader**:
  - **YouTube**: 1080p Full HD, 720p HD, 480p, 360p MP4, Shorts, and 320kbps MP3 audio tracks with clean in-page conversion.
  - **TikTok**: 100% Watermark-Free HD MP4 downloads directly from the master CDN stream + audio sound extraction.
  - **Facebook**: Watch videos, public group posts, and FB Reels in 1080p HD or 480p SD.
  - **Instagram**: Reels, video posts, and carousel video slides in crisp Full HD MP4.
- **🛡️ 100% Ad-Free Direct Stream Engine**:
  - Unlike legacy services (y2mate, savefrom, etc.), ClipLens has **NO popup ads**, no malicious redirect loops, and no casino/adult ads. Downloads stream directly in the browser or via clean modal converters.
- **⏱️ 10-Second High-Engagement Processing Animation**:
  - Includes an animated SVG circular progress meter (0% to 100%), 10-second countdown timer, dynamic status updates ("Resolving CDN streams", "Synthesizing audio/video"), and a 4-step checklist before revealing direct download buttons.
- **🤖 Modern Multi-Model AI Suite**:
  - **Free AI Video Generator (`tools/ai-video-generator/`)**: Synthesize cinematic 1080p MP4 videos with natural camera motion (Drone, Zoom, Pan, Tilt) powered by **Omni Flash Motion**, **OpenAI Sora Mode**, **Runway Gen-3**, **Nano Banana Pro Video**, and **Seedance Video Diffusion**.
  - **Universal AI Chat Assistant (`tools/ai-chat-assistant/`)**: Switch between **⚡ Omni Flash** (Gemini/Omni), **ChatGPT-4o** (OpenAI), **Claude 3.5 Sonnet** (Anthropic), **Nano Banana Pro** (Fast Neural), and **Seedance AI** (Creative Vision) with zero API keys required.
  - **Free AI Image Generator (`tools/ai-image-generator/`)**: 8K text-to-image neural synthesis with **Omni Flash**, **Nano Banana Pro**, **Seedance AI**, **ChatGPT DALL-E 3 Mode**, and **Claude Vision**, plus one-click prompt expansion.
  - **Universal PDF Converter (`tools/pdf-converter/`)**: Convert Images to PDF, Text to PDF, and merge files 100% locally with zero cloud uploads for maximum privacy.
  - **QR Code Hub (`tools/qr-code-scanner-generator/`)**: Live camera/webcam scanner, image barcode/QR scanner, and customizable color Wi-Fi & URL generator.
  - **AI Video Summarizer (`tools/youtube-ai-summarizer/`)**: Executive summary (TL;DR), 5 core takeaways, and timestamped key moments.
  - **AI Video-to-Prompt Generator (`tools/youtube-prompt-generator/`)**: Instant prompts for ChatGPT, Claude, Midjourney v6, and viral 60s Shorts scripts.
  - **AI Thumbnail Analyzer & CTR Score (`tools/youtube-thumbnail-analyzer/`)**: Empirical click-through rate score with visual contrast, mobile readability, and focal subject audit.
- **🛠️ Universal Everyday Converters & Utility Suites**:
  - **Document Converter (`tools/document-converter/`)**: PDF to Word, Word to PDF, PDF to Excel, Excel to PDF, PDF to PowerPoint, PowerPoint to PDF, TXT to PDF, and PDF to JPG.
  - **Image Converter & Compressor (`tools/image-converter/`)**: JPG to PNG, PNG to JPG, WEBP to JPG, JPG to WEBP, HEIC to JPG, SVG to PNG, Image to PDF, and lossless/lossy Image Compressor with live file size savings.
  - **Video Converter & Compressor (`tools/video-converter/`)**: MP4 to MP3, MOV to MP4, MKV to MP4, AVI to MP4, Video to GIF loop generator, and Video Compressor (720p/480p).
  - **Studio Audio Converter (`tools/audio-converter/`)**: MP3 to WAV, WAV to MP3, M4A to MP3, AAC to MP3, and FLAC to MP3 at up to 320kbps studio bitrate.
  - **Advanced PDF Suite (`tools/pdf-tools/`)**: PDF Merger, PDF Splitter, PDF Compressor, and PDF Page Remover.
  - **ZIP & Archive Suite (`tools/archive-tools/`)**: ZIP Extractor with live file tree inspection & individual file download, plus in-browser ZIP Creator.
- **🔐 Full Supabase User Authentication & Dashboard**:
  - **User Registration (`register/`)**: Full Name, Email, Password with real-time strength meter, 4-point validation checklist, confirm password, and **automatic 20 Free Credits bonus**.
  - **User Login (`login/`)**: Email, password toggle, remember session, inline error handling, unverified email resend prompt, and automatic return URL redirect.
  - **Password Recovery (`forgot-password/` & `reset-password/`)**: Clean Supabase auth email password recovery token workflow.
  - **Modern SaaS User Dashboard (`dashboard/`)**: Live user metadata, credits counter (⚡ 20 Free Credits), Current Subscription Plan, conversion log table, profile edit form (Full Name update), password update, and upgrade/credit top-up plans.
  - **Dynamic Navigation Widget (`js/auth-nav.js`)**: Automatically switches between Log In / Sign Up buttons and User Profile Pill with avatar, name, and credits balance.
  - **10 Secure Database Tables & RLS Policies (`supabase-schema.sql`)**: Full SQL schema with tables (`profiles`, `plans`, `subscriptions`, `payments`, `credit_transactions`, `tools`, `conversions`, `coupons`, `coupon_redemptions`, `admin_logs`), strict Row Level Security, and automated new user triggers.

- **💰 Google AdSense & Search Console Ready**:
  - Pre-configured with AdSense Publisher ID `pub-9047490935389649` (`ca-pub-9047490935389649`).
  - Active `ads.txt` containing `google.com, pub-9047490935389649, DIRECT, f08c47fec0942fa0`.
  - Comprehensive metadata, OpenGraph, Twitter Cards, Schema.org JSON-LD (WebApplication, Organization, FAQPage, Breadcrumbs), and XML sitemap for `https://cliplensai.com/`.

---

## 🚀 How to Run Locally

### Using Node.js (Recommended)
```bash
node server.js
```
Open **http://localhost:8000** in your browser. All AI endpoints (`/api/ai/chat`, `/api/ai/enhance-prompt`), downloader endpoints (`/api/info`, `/api/download`), and static pages work instantly!

### Using Python (Static Server)
```bash
python -m http.server 8000
```
Open **http://localhost:8000** in your browser. The client-side AI and downloader fallbacks will run seamlessly.

---

## 🔐 Supabase Authentication Setup & SQL Migration

ClipLens is pre-configured to connect to Supabase:
- **Project URL**: `https://zkqayqzyjjgztcucfysw.supabase.co`
- **Publishable Key**: `sb_publishable_imHwbUaHkQUxTaAxjqRmDA_xbcsqI7A`
- **Config File**: `js/supabase.js`

### 1. Run Database Migrations in Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project (`zkqayqzyjjgztcucfysw`).
2. Navigate to **SQL Editor** in the left sidebar.
3. Click **New Query**, paste the entire contents of `supabase-schema.sql`, and click **Run**.
4. This will create:
   - All 10 database tables (`profiles`, `plans`, `subscriptions`, `payments`, `credit_transactions`, `tools`, `conversions`, `coupons`, `coupon_redemptions`, `admin_logs`).
   - The `handle_new_user()` trigger that automatically creates the user's profile and awards **20 Free Credits** upon signup.
   - Strict **Row Level Security (RLS)** policies so users can only access their own data and cannot modify credit balances.

### 2. Configure Auth URL Settings in Supabase
1. In the Supabase Dashboard, go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to:
   - `https://cliplensai.com/` (or your GitHub Pages URL `https://<username>.github.io/<repo>/`).
3. Under **Redirect URLs**, add:
   - `https://cliplensai.com/**`
   - `https://cliplensai.com/dashboard/`
   - `https://cliplensai.com/reset-password/`
   - `http://localhost:8000/**` (for local testing)

---

## 🌐 How to Deploy to GitHub Pages or Custom Hosting

1. Push or upload these files to your GitHub repository or web hosting server (e.g. Hostinger, cPanel, Vercel, Netlify).
2. For GitHub Pages: In your repo, go to **Settings** → **Pages** → Source: `main` branch, folder `/(root)` → **Save**.
3. In Google AdSense, click **Verify** on your `cliplensai.com` site dashboard. AdSense will immediately detect the `ads.txt` file and start serving ads once the site review finishes!
