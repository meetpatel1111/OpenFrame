Below is a **complete, production-grade feature catalog** of **everything you can build using FFmpeg** in an application **powered by LibVLC (playback) + FFmpeg (processing, analysis, conversion, automation)**.

This is written from the perspective of a **desktop media player + media processing suite + CLI tool**, exactly matching your use case.

---

# FFmpeg FEATURE MASTER LIST

**(Media Player · Media Processing · Transcoding · Converter · CLI)**

---

## 1. MEDIA ANALYSIS & INSPECTION (FFPROBE)

### Media File Inspection

* Container format detection
* Codec identification (audio/video/subtitle)
* Bitrate (overall / per stream)
* Resolution & aspect ratio
* Frame rate (avg / real)
* Color space (BT.709 / BT.2020 / HDR)
* HDR metadata (HDR10, HLG, Dolby Vision flags)
* Pixel format (yuv420p, yuv422p10, etc.)
* Sample rate & channel layout
* Duration (exact & estimated)
* Stream index mapping
* Timebase inspection
* B-frames / reference frames
* GOP structure
* Rotation metadata
* SAR / DAR values

### Metadata

* Title, artist, album, year
* Track language
* Encoder / muxer info
* Chapter metadata
* GPS metadata (videos/photos)
* Camera metadata
* Custom metadata injection
* Metadata stripping (privacy mode)

---

## 2. MEDIA PLAYER ENHANCEMENTS (USING FFMPEG WITH LIBVLC)

### Pre-Playback Enhancements

* Smart stream selection
* Best audio/video track auto-selection
* Preferred language auto-pick
* Auto downmixing for headphones
* Auto HDR → SDR tone mapping
* Pre-buffering optimization
* Network jitter handling

### Playback Assistance

* Thumbnail previews on seek bar
* Chapter thumbnails
* Scene detection
* Black frame detection
* Silence detection
* Loudness detection
* Playback error recovery
* Corrupt file tolerance

---

## 3. VIDEO TRANSCODING & CONVERSION

### Video Codec Conversion

* H.264 / AVC
* H.265 / HEVC
* AV1
* VP9 / VP8
* MPEG-2
* ProRes
* DNxHD / DNxHR
* Theora
* MJPEG
* Lossless (FFV1, Huffyuv)

### Hardware Acceleration

* NVIDIA NVENC / NVDEC
* Intel QSV
* AMD AMF
* VAAPI
* DXVA2
* VideoToolbox (macOS)
* Automatic fallback to software

### Resolution & Scaling

* Upscale / downscale
* Aspect-ratio preservation
* Letterboxing / pillarboxing
* Smart scaling (lanczos, bicubic)
* AI-ready pipeline integration
* Super-resolution hooks

### Frame Rate

* FPS change
* Frame interpolation
* CFR ↔ VFR conversion
* Drop / duplicate frames
* Motion estimation

---

## 4. AUDIO TRANSCODING & PROCESSING

### Audio Codec Conversion

* AAC
* MP3
* Opus
* Vorbis
* FLAC
* WAV / PCM
* AC3 / E-AC3
* DTS (decode)
* ALAC

### Audio Processing

* Volume normalization (EBU R128)
* Loudness measurement
* Gain adjustment
* Dynamic range compression
* Limiter
* Noise reduction
* De-essing
* Bass boost
* Treble boost
* Equalization (parametric / graphic)
* Channel remixing
* Stereo ↔ Mono
* Downmix / upmix (5.1 → stereo)
* Audio delay / sync correction
* Time-stretching
* Pitch shifting
* Silence removal
* Silence insertion

---

## 5. SUBTITLES & CAPTIONS

### Subtitle Formats

* SRT
* ASS / SSA
* VTT
* SUB / IDX
* DVB subtitles
* Closed captions (CEA-608/708)

### Subtitle Processing

* Extract subtitles
* Convert subtitle formats
* Burn subtitles into video
* Soft subtitle muxing
* Subtitle delay adjustment
* Subtitle re-timing
* Font embedding
* Encoding correction
* Forced subtitle detection
* Subtitle language tagging

---

## 6. MEDIA EDITING (NON-LINEAR / FAST)

### Cutting & Trimming

* Lossless trimming
* Frame-accurate cutting
* Segment extraction
* Multi-segment concat
* Scene-based splitting
* Chapter-based splitting

### Merging & Concatenation

* Video concat (same format)
* Audio concat
* Subtitle concat
* Container-level concat
* Smart stream copy

### Overlays & Composition

* Text overlays
* Logo overlays
* Watermarks
* Timecode overlay
* Subtitle burn-in
* Picture-in-picture
* Split screen
* Video stacking (horizontal/vertical)
* Alpha blending

---

## 7. VIDEO FILTERS & EFFECTS

### Color & Visual

* Brightness / contrast
* Saturation / hue
* Gamma correction
* LUT application
* HDR tone mapping
* Color grading
* Sepia
* Grayscale
* Invert colors
* Film grain
* Sharpen / blur
* Denoise
* Edge detection
* Vignette
* Fade in/out
* Motion blur
* Deinterlacing
* Video stabilization

---

## 8. STREAMING & LIVE MEDIA

### Streaming Protocols

* HLS
* DASH
* RTMP
* RTSP
* RTP
* UDP
* SRT
* Icecast (audio)

### Live Streaming

* Live transcoding
* Adaptive bitrate streaming
* Live overlays
* Live subtitles
* Stream recording
* Latency tuning
* Failover streams

---

## 9. RECORDING & CAPTURE

### Capture Sources

* Screen recording
* Window capture
* Webcam capture
* Microphone capture
* System audio capture
* Multi-device capture
* Virtual camera output

### Recording Features

* Scheduled recording
* Segment recording
* Background recording
* Instant replay buffer
* Live clipping
* Time-shift recording

---

## 10. IMAGE & THUMBNAILS

### Image Extraction

* Frame capture
* Thumbnail generation
* Scene thumbnails
* Contact sheets
* Sprite sheets
* Poster images

### Image Conversion

* PNG / JPG / WebP
* GIF creation
* Animated WebP
* Image scaling
* Image rotation
* Image cropping

---

## 11. DVD / BLURAY / LEGACY MEDIA

* DVD demuxing
* Title & chapter extraction
* Audio track extraction
* Subtitle extraction
* ISO handling
* Legacy MPEG formats
* VOB processing

---

## 12. PLAYLIST & MEDIA AUTOMATION

* Batch conversion
* Folder-based processing
* Watch-folder automation
* Preset pipelines
* Conditional workflows
* Multi-output jobs
* Parallel encoding
* Job queues
* Resume interrupted jobs

---

## 13. MEDIA SECURITY & PRIVACY

* Metadata stripping
* Audio fingerprint removal
* Video fingerprint noise
* Re-muxing for anonymization
* Watermark embedding
* DRM-adjacent preprocessing (no DRM bypass)

---

## 14. CLI TOOL FEATURES (FFMPEG-POWERED)

### Media CLI Capabilities

* `convert` – format conversion
* `probe` – inspect media
* `extract` – audio/subtitles
* `merge` – concat media
* `trim` – cut segments
* `record` – screen/audio
* `stream` – broadcast media
* `filter` – apply effects
* `batch` – mass operations
* `verify` – integrity checks
* `normalize` – loudness
* `thumbnail` – previews

---

## 15. ENTERPRISE / ADVANCED USE CASES

* Media pipelines
* Transcoding farms
* Cloud rendering
* Headless processing
* CI/CD media validation
* Media QA automation
* Surveillance video processing
* Broadcast workflows
* OTT content preparation

---

## 16. FEATURE COUNT SUMMARY

Using **FFmpeg alone**, you can implement:

* **200+ processing features**
* **100+ conversion/transcoding options**
* **50+ streaming/recording workflows**

Combined with **LibVLC**, your app becomes a **complete VLC + HandBrake + OBS + MediaInfo + CLI hybrid**.

---

## HOW LIBVLC + FFMPEG WORK TOGETHER

| Component | Responsibility                   |
| --------- | -------------------------------- |
| LibVLC    | Playback, rendering, controls    |
| FFmpeg    | Analysis, processing, conversion |
| Electron  | UI, workflow, automation         |
| IPC       | Secure orchestration             |
