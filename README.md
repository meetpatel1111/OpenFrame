# OpenFrame

Professional cross-platform media player and processor powered by LibVLC and FFmpeg.

## Features

### Core Playback
- **Multi-format Support**: MP4, MKV, AVI, MOV, WebM, FLV, WMV, and more
- **High Performance**: Hardware-accelerated playback with GPU support
- **Advanced Controls**: Play, pause, stop, seek, volume, and playback speed
- **Chapter Navigation**: Jump to specific chapters and scenes
- **Playback History**: Resume from last position and watch history
- **Frame Stepping**: Frame-by-frame navigation for precise control

### Audio Processing
- **Multi-track Audio**: Switch between different audio tracks
- **10-band Equalizer**: Professional audio enhancement with presets
- **Audio Effects**: Bass boost, treble boost, compressor, spatializer
- **Audio Formats**: MP3, FLAC, AAC, Opus, Vorbis, DTS support
- **Audio Analysis**: Real-time spectrum analyzer and visualization

### Video Enhancement
- **Video Filters**: Brightness, contrast, saturation, hue, gamma, sharpen, blur
- **Video Presets**: Cinematic, vibrant, vintage, B&W, warm, cool, dark
- **Aspect Ratio**: Multiple aspect ratio support with zoom controls
- **Deinterlacing**: Advanced deinterlacing algorithms
- **Video Scaling**: High-quality upscaling and downscaling

### Subtitle Support
- **Multiple Formats**: SRT, ASS, SSA, VTT, IDX/SUB support
- **Subtitle Styling**: Custom fonts, colors, positioning, and effects
- **Subtitle Search**: Online subtitle search with auto-download
- **Timing Controls**: Precise subtitle synchronization and delay adjustment
- **Multi-language**: Support for multiple subtitle tracks

### Media Library
- **Smart Scanning**: Automatic media library scanning with metadata extraction
- **Advanced Search**: Full-text search with filters and sorting
- **Collections**: Create and manage smart playlists and collections
- **Metadata Management**: Automatic metadata fetching and editing
- **Thumbnail Generation**: Generate thumbnails for all media files
- **Watch Folders**: Monitor folders for automatic library updates

### Conversion & Processing
- **Video Transcoding**: H.264, H.265/HEVC, AV1, VP9, VP8 support
- **Audio Conversion**: Convert between all major audio formats
- **Hardware Acceleration**: NVIDIA NVENC, Intel QSV, AMD AMF, VideoToolbox
- **Batch Processing**: Queue multiple conversions with progress tracking
- **Custom Presets**: Create and save custom conversion profiles
- **Quality Control**: Precise bitrate, resolution, and frame rate control

### Recording & Capture
- **Screen Recording**: Full screen, window, region, and camera capture
- **Audio Recording**: System audio, microphone, and combined recording
- **Recording Settings**: Countdown timer, cursor highlighting, click effects
- **Multiple Formats**: MP4, WebM, AVI, MOV output support
- **Recording Management**: History, settings, and automatic file naming

### Network Streaming
- **Protocol Support**: HTTP, HTTPS, RTSP, RTMP, HLS, DASH, IPTV
- **Live Streaming**: Stream to YouTube, Twitch, and custom RTMP servers
- **Network Playback**: Play network streams and online content
- **Adaptive Streaming**: HLS and DASH adaptive bitrate streaming
- **Buffer Control**: Advanced buffering and network optimization

### AI Integration
- **AI Subtitles**: Generate subtitles automatically from audio tracks
- **Audio Enhancement**: AI-powered noise reduction and clarity enhancement
- **Video Enhancement**: AI upscaling, denoising, and color correction
- **Content Analysis**: Automatic genre detection and content tagging
- **Smart Recommendations**: AI-powered content recommendations
- **Scene Detection**: Automatic scene detection and chapter creation

### Advanced Features
- **Plugin System**: Extensible architecture with safe plugin sandboxing
- **Scripting Support**: JavaScript scripting with OpenFrame API access
- **CLI Tools**: Complete command-line interface for all operations
- **Automation**: Batch processing and workflow automation
- **Custom Shortcuts**: Fully customizable keyboard shortcuts
- **Theme System**: Multiple themes with customization options

## Technology Stack

- **Framework**: Electron 28.0.0
- **Frontend**: React 18.2.0 with Redux Toolkit
- **Styling**: Styled Components with modern CSS-in-JS
- **Media Engine**: LibVLC 3.0+ for playback
- **Processing**: FFmpeg 6.0+ for conversion and processing
- **Build System**: Webpack 5 with Babel transpilation
- **Packaging**: Electron Builder for cross-platform distribution

## Installation

### Prerequisites
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Operating System**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

### Install Dependencies
```bash
npm install
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Package application
npm run package
```

## Usage

### GUI Application
```bash
# Start the application
npm start
```

### Command Line Interface
```bash
# Probe media file
openframe probe video.mp4

# Convert media
openframe convert input.mp4 output.mp4 --format mp4 --video-codec libx264

# Extract audio
openframe extract-audio video.mp4 audio.mp3 --codec mp3

# Generate thumbnail
openframe thumbnail video.mp4 thumb.jpg --time 00:00:01

# Batch convert
openframe batch input-dir/ output-dir/ --format mp4
```

## Project Structure

```
OpenFrame/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.js         # Application entry point
│   │   ├── vlcManager.js   # LibVLC integration
│   │   ├── ffmpegManager.js # FFmpeg integration
│   │   ├── aiManager.js     # AI features
│   │   ├── pluginManager.js # Plugin system
│   │   ├── scriptManager.js # Scripting system
│   │   └── cli.js          # Command line interface
│   └── renderer/           # Electron renderer process
│       ├── components/      # React components
│       ├── store/          # Redux store
│       └── index.js        # Renderer entry
├── assets/                # Application assets
├── build/                 # Built application
├── dist/                  # Packaged distributions
└── plugins/               # Plugin directory
└── scripts/               # Script directory
```

## Configuration

### Settings
- **General**: Language, theme, startup behavior
- **Playback**: Default volume, playback speed, subtitle settings
- **Library**: Media folders, scanning intervals, metadata settings
- **Conversion**: Default formats, quality presets, hardware acceleration
- **Recording**: Output format, quality settings, audio sources
- **Network**: Proxy settings, streaming preferences
- **Advanced**: Plugin management, script permissions, AI settings

### File Locations
- **Windows**: `%APPDATA%/OpenFrame/`
- **macOS**: `~/Library/Application Support/OpenFrame/`
- **Linux**: `~/.config/OpenFrame/`

## API Reference

### Main Process APIs
- **VLC Manager**: `play()`, `pause()`, `stop()`, `seek()`, `setVolume()`
- **FFmpeg Manager**: `probe()`, `convert()`, `extractAudio()`, `generateThumbnail()`
- **AI Manager**: `generateSubtitles()`, `enhanceAudio()`, `enhanceVideo()`, `analyzeContent()`
- **Plugin Manager**: `loadPlugin()`, `unloadPlugin()`, `executePluginHook()`
- **Script Manager**: `executeScript()`, `createScript()`, `enableScript()`

### Renderer Process APIs
- **Electron API**: `showOpenDialog()`, `showSaveDialog()`, `showNotification()`
- **Media API**: `playMedia()`, `pauseMedia()`, `stopMedia()`, `seekMedia()`
- **Library API**: `scanLibrary()`, `addToLibrary()`, `setLibraryItems()`
- **Converter API**: `convertMedia()`, `addToQueue()`, `setConversionSettings()`
- **Recorder API**: `startRecording()`, `stopRecording()`, `setRecordingSettings()`

## Development

### Building from Source
```bash
# Clone repository
git clone https://github.com/openframe/openframe.git
cd openframe

# Install dependencies
npm install

# Start development
npm run dev
```

### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Code Style
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Distribution

### Supported Platforms
- **Windows**: Windows 10/11 (x64, x86)
- **macOS**: macOS 10.14+ (Intel, Apple Silicon)
- **Linux**: Ubuntu 18.04+, Fedora 35+, openSUSE Leap 15.4+

### Package Formats
- **Windows**: NSIS installer, portable ZIP
- **macOS**: DMG disk image, ZIP archive
- **Linux**: AppImage, DEB package, RPM package, Snap package

### Installation Commands
```bash
# Build for all platforms
npm run dist

# Build Windows only
npm run package:win

# Build macOS only
npm run package:mac

# Build Linux only
npm run package:linux
```

## Security

### Code Signing
- **Windows**: Authenticode signing with certificate
- **macOS**: Notarization and Developer ID signing
- **Linux**: GPG signature verification

### Security Features
- **Sandboxing**: Plugin and script execution in secure sandbox
- **Permission System**: Granular permission control for plugins and scripts
- **Input Validation**: Comprehensive input validation and sanitization
- **Secure Updates**: Automatic updates with signature verification

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **LibVLC**: For excellent media playback engine
- **FFmpeg**: For powerful media processing capabilities
- **Electron**: For cross-platform desktop application framework
- **React**: For modern user interface development
- **Redux**: For state management
- **Styled Components**: For CSS-in-JS styling solution

## Support

- **Documentation**: [OpenFrame Wiki](https://github.com/openframe/openframe/wiki)
- **Issues**: [GitHub Issues](https://github.com/openframe/openframe/issues)
- **Discussions**: [GitHub Discussions](https://github.com/openframe/openframe/discussions)
- **Community**: [Discord Server](https://discord.gg/openframe)

---

**OpenFrame** - Professional Media Player and Processor

*Built with ❤️ by the OpenFrame Team*
