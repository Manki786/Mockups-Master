# MOCKUPS MASTER V3 — PREMIUM REALISTIC MOCKUPS + CINEMATIC VIDEO GENERATOR

**MOCKUPS MASTER V3** turns any uploaded printable product image into a commercial-grade Etsy media package containing **10 high-resolution 2000×2000 PNG mockups** and **3 cinematic 9:16 vertical commercial MP4 videos**.

---

## 🌟 KEY UPGRADES IN V3 PRO

### 1. Absolute Product Lock (Pixel Fidelity Guarantee)
- Sourced directly from your original uploaded artwork.
- **NEVER uses AI to recreate text, illustrations, characters, poses, arrows, or lines.**
- Employs two-stage compositing:
  - **Stage A**: Photorealistic studio scene & background rendering.
  - **Stage B**: OpenCV homography / perspective transformation, alpha masking, paper fiber texturing, contact shadow calculation.
- Source artwork checksum is verified and maintained 100% pixel-faithful.

### 2. 10 Reference-Based Etsy Mockups (2000×2000 PNG)
Inspired directly by professional Etsy commercial product photography benchmarks:
1. **01 — MAIN HERO THUMBNAIL**: Bold title, large product presentation, verified format badges.
2. **02 — WALL DISPLAY MOCKUP**: Framed printable in natural oak picture frame with realistic wall shadow & monstera plant leaf shadow.
3. **03 — TABLETOP FLAT LAY**: Overhead desktop photography with natural wood, ceramic mug, fountain pen, and notebook.
4. **04 — HAPPY ADULT HOLDING**: Photorealistic adult model holding printed sheet in warm room setting.
5. **05 — PRINTING IN PROGRESS**: Modern desktop printer with print emerging naturally from tray slot.
6. **06 — BEFORE & AFTER COMPARISON**: Professional split-screen comparison layout.
7. **07 — PRODUCT DETAIL VIEW**: Full product display paired with enlarged genuine high-res crop cards and connecting leader lines.
8. **08 — WHAT'S INCLUDED**: Product overview with verified feature bullet points and specs.
9. **09 — WHY YOU'LL LOVE IT**: Value proposition display with green checkmark benefit cards.
10. **10 — HOW TO USE**: 3-step numbered setup guide (Download, Print, Enjoy).

### 3. 3 Platform-Specific Commercial Videos (1080×1920 MP4)
- **Instagram Reel (9:16)**: 2-sec visual hook pullback opening, dynamic camera moves, 30fps H.264 MP4.
- **Facebook Reel (9:16)**: Smooth, relaxed pacing, gentle camera arcs, 30fps H.264 MP4.
- **Etsy Listing Video (9:16)**: Photographic product focus, silent export, Etsy compliant file size.
- **4-Shot Cinematic Production Structure**:
  - *Shot 1 (0–2.5s)*: Title area close-up pullback
  - *Shot 2 (2.5–5.5s)*: Full product overhead horizontal glide
  - *Shot 3 (5.5–8.5s)*: Opposite-angle front-right perspective arc
  - *Shot 4 (8.5–11.0s)*: Elevated full product push-in & 2-sec hold

---

## 🚀 QUICK START GUIDE

### 1. Start Backend API Server
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Open Frontend UI
Open `mockups-master/index.html` in your web browser, or serve using any static server.

### 3. Workflow
1. **Upload Product Artwork**: Drag & drop your PNG/JPG printable.
2. **Review Intelligent Analysis**: View detected category, title, dominant color palette, and internal creative strategy brief.
3. **Select Art Direction Style**: Choose *Reference-Based Premium* (default) or other style presets.
4. **Generate Media Package**: Click **Generate Complete Media Package** to create all 13 assets.
5. **Preview & Download**: Inspect individual previews, regenerate any asset, or download complete ZIP packages!

---

## 📂 OUTPUT FILE STRUCTURE

```
storage/outputs/{session_id}/
├── 01-hero-thumbnail.png
├── 02-wall-display.png
├── 03-tabletop-display.png
├── 04-happy-adult.png
├── 05-printing-scene.png
├── 06-before-after.png
├── 07-detail-view.png
├── 08-whats-included.png
├── 09-why-youll-love-it.png
├── 10-how-to-use.png
├── instagram-reel.mp4
├── facebook-reel.mp4
└── etsy-listing-video.mp4
```

---

## 🛡️ ACCEPTANCE & QUALITY CHECKS
- **Product Lock**: Sourced directly from uploaded file with checksum integrity check.
- **Image Resolution**: Exactly 2000×2000 pixels PNG.
- **Video Specs**: 1080×1920 pixels MP4, 30 fps, H.264 codec, web-optimized.
- **Compatibility**: Full standalone local rendering engine with fallback for AI generation.
