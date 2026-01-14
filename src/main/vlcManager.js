const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs');
const os = require('os');
const koffi = require('koffi');

class VLCManager extends EventEmitter {
  constructor() {
    super();
    this.instance = null;
    this.player = null;
    this.media = null;
    this.currentFile = null;
    this.isInitialized = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 100;
    this.isPlaying = false;
    this.libvlc = null;
    this.lib = null;
    
    this.initialize();
  }

  async initialize() {
    try {
      // Load LibVLC library
      await this.loadLibVLC();
      
      // Initialize LibVLC
      this.instance = this.lib.libvlc_new(0, null);
      if (!this.instance) {
        throw new Error('Failed to create LibVLC instance');
      }

      // Create media player
      this.player = this.lib.libvlc_media_player_new(this.instance);
      if (!this.player) {
        throw new Error('Failed to create media player');
      }

      // Set up event handlers
      this.setupEventHandlers();
      
      this.isInitialized = true;
      console.log('LibVLC Manager initialized successfully');
      this.emit('initialized');
      
    } catch (error) {
      console.error('Failed to initialize LibVLC:', error);
      this.emit('error', error);
    }
  }

  async loadLibVLC() {
    const platform = process.platform;
    let libPath, libName;

    // Determine library path and name based on platform
    switch (platform) {
      case 'win32':
        libName = 'libvlc.dll';
        // Use the exact VLC installation path
        libPath = 'C:\\Program Files\\VideoLAN\\VLC';
        
        // Verify the exact path exists
        const fullPath = path.join(libPath, libName);
        if (!fs.existsSync(fullPath)) {
          // Fallback to checking other common locations
          const fallbackPaths = [
            'C:\\Program Files (x86)\\VideoLAN\\VLC',
            path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'VideoLAN\\VLC'),
            path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'VideoLAN\\VLC')
          ];
          
          for (const fallbackPath of fallbackPaths) {
            if (fs.existsSync(path.join(fallbackPath, libName))) {
              libPath = fallbackPath;
              break;
            }
          }
        }
        break;
        
      case 'darwin':
        libName = 'libvlc.dylib';
        libPath = '/Applications/VLC.app/Contents/MacOS';
        break;
        
      case 'linux':
        libName = 'libvlc.so.5';
        const linuxPaths = [
          '/usr/lib/x86_64-linux-gnu',
          '/usr/lib/x86_64-linux-gnu/vlc',
          '/usr/local/lib',
          '/usr/lib64'
        ];
        libPath = linuxPaths.find(p => fs.existsSync(path.join(p, libName))) || '/usr/lib';
        break;
        
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    if (!libPath) {
      throw new Error('LibVLC not found. Please install VLC media player.');
    }

    const fullPath = path.join(libPath, libName);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`LibVLC library not found at ${fullPath}`);
    }

    console.log(`Loading LibVLC from: ${fullPath}`);
    
    // Load the library using Koffi
    this.lib = koffi.load(fullPath);
    
    // Define LibVLC functions
    this.defineLibVLCFunctions();
  }

  defineLibVLCFunctions() {
    // Core LibVLC functions
    this.lib.func('libvlc_new', 'void*', ['int32', 'char**']);
    this.lib.func('libvlc_release', 'void', ['void*']);
    this.lib.func('libvlc_media_player_new', 'void*', ['void*']);
    this.lib.func('libvlc_media_player_release', 'void', ['void*']);
    
    // Media functions
    this.lib.func('libvlc_media_new_path', 'void*', ['void*', 'string']);
    this.lib.func('libvlc_media_release', 'void', ['void*']);
    this.lib.func('libvlc_media_player_set_media', 'void', ['void*', 'void*']);
    
    // Playback functions
    this.lib.func('libvlc_media_player_play', 'int32', ['void*']);
    this.lib.func('libvlc_media_player_pause', 'void', ['void*']);
    this.lib.func('libvlc_media_player_stop', 'void', ['void*']);
    this.lib.func('libvlc_media_player_set_time', 'void', ['void*', 'int64']);
    this.lib.func('libvlc_media_player_get_time', 'int64', ['void*']);
    this.lib.func('libvlc_media_player_get_length', 'int64', ['void*']);
    
    // Audio functions
    this.lib.func('libvlc_audio_set_volume', 'int32', ['void*', 'int32']);
    this.lib.func('libvlc_audio_get_volume', 'int32', ['void*']);
    this.lib.func('libvlc_audio_get_track_count', 'int32', ['void*']);
    this.lib.func('libvlc_audio_get_track', 'int32', ['void*']);
    this.lib.func('libvlc_audio_set_track', 'int32', ['void*', 'int32']);
    
    // Video functions
    this.lib.func('libvlc_video_take_snapshot', 'int32', ['void*', 'uint32', 'string', 'int32', 'int32']);
    
    // State functions
    this.lib.func('libvlc_media_player_get_state', 'int32', ['void*']);
    
    // Event manager functions
    this.lib.func('libvlc_event_manager_new', 'void*', ['void*']);
    this.lib.func('libvlc_event_attach', 'int32', ['void*', 'uint32', 'void*', 'void*', 'void*']);
  }

  setupEventHandlers() {
    // Set up event callbacks using LibVLC event system
    // This is a simplified version - in production you'd want proper event handling
    setInterval(() => {
      if (this.isInitialized && this.player) {
        this.updateStatus();
      }
    }, 100);
  }

  updateStatus() {
    try {
      const state = this.lib.libvlc_media_player_get_state(this.player);
      const newTime = this.lib.libvlc_media_player_get_time(this.player) / 1000; // Convert to seconds
      const newDuration = this.lib.libvlc_media_player_get_length(this.player) / 1000;
      
      // Check for state changes
      const isPlayingNow = state === 3; // 3 = Playing state in LibVLC
      
      if (isPlayingNow !== this.isPlaying) {
        this.isPlaying = isPlayingNow;
        if (isPlayingNow) {
          this.emit('stateChanged', 'playing');
        } else if (state === 4) { // 4 = Paused state
          this.emit('stateChanged', 'paused');
        } else if (state === 6) { // 6 = Ended state
          this.emit('stateChanged', 'stopped');
          this.emit('mediaEnded');
        }
      }
      
      // Emit time changes
      if (Math.abs(newTime - this.currentTime) > 0.1) {
        this.currentTime = newTime;
        this.emit('timeChanged', this.currentTime);
      }
      
      // Update duration
      if (newDuration > 0 && newDuration !== this.duration) {
        this.duration = newDuration;
      }
      
    } catch (error) {
      // Ignore status update errors
    }
  }

  async play(filePath) {
    if (!this.isInitialized) {
      throw new Error('LibVLC Manager not initialized');
    }

    try {
      // Create media from file path
      this.media = this.lib.libvlc_media_new_path(this.instance, filePath);
      if (!this.media) {
        throw new Error('Failed to create media from file');
      }
      
      // Set media to player
      this.lib.libvlc_media_player_set_media(this.player, this.media);
      
      // Start playback
      const result = this.lib.libvlc_media_player_play(this.player);
      if (result !== 0) {
        throw new Error('Failed to start playback');
      }
      
      this.currentFile = filePath;
      console.log(`Playing: ${filePath}`);
      
      return true;
    } catch (error) {
      console.error('Failed to play media:', error);
      this.emit('error', error);
      throw error;
    }
  }

  pause() {
    if (!this.isInitialized || !this.player) return;
    
    this.lib.libvlc_media_player_pause(this.player);
    console.log('Playback paused');
  }

  stop() {
    if (!this.isInitialized || !this.player) return;
    
    this.lib.libvlc_media_player_stop(this.player);
    this.currentFile = null;
    console.log('Playback stopped');
  }

  seek(time) {
    if (!this.isInitialized || !this.player) return;
    
    const timeMs = Math.floor(time * 1000); // Convert seconds to milliseconds
    this.lib.libvlc_media_player_set_time(this.player, timeMs);
    console.log(`Seeked to: ${time}s`);
  }

  setVolume(volume) {
    if (!this.isInitialized || !this.player) return;
    
    const clampedVolume = Math.max(0, Math.min(100, volume));
    this.lib.libvlc_audio_set_volume(this.player, clampedVolume);
    this.volume = clampedVolume;
    console.log(`Volume set to: ${clampedVolume}%`);
  }

  getVolume() {
    if (!this.isInitialized || !this.player) return 0;
    return this.lib.libvlc_audio_get_volume(this.player);
  }

  getTime() {
    return this.currentTime;
  }

  getDuration() {
    return this.duration;
  }

  isPlaying() {
    return this.isPlaying;
  }

  getMediaInfo() {
    if (!this.currentFile) return null;
    
    return {
      title: path.basename(this.currentFile),
      duration: this.duration,
      currentTime: this.currentTime,
      isPlaying: this.isPlaying
    };
  }

  getTracks() {
    if (!this.isInitialized || !this.player) {
      return { audio: [], video: [], subtitle: [] };
    }
    
    try {
      const audioCount = this.lib.libvlc_audio_get_track_count(this.player);
      const currentAudioTrack = this.lib.libvlc_audio_get_track(this.player);
      
      const audioTracks = [];
      for (let i = 0; i < audioCount; i++) {
        audioTracks.push({
          id: i,
          name: `Audio Track ${i + 1}`,
          active: i === currentAudioTrack
        });
      }
      
      return {
        audio: audioTracks,
        video: [{ id: 0, name: 'Video Track' }],
        subtitle: [{ id: 0, name: 'Subtitle Track' }]
      };
    } catch (error) {
      console.error('Failed to get tracks:', error);
      return { audio: [], video: [], subtitle: [] };
    }
  }

  setAudioTrack(trackId) {
    if (!this.isInitialized || !this.player) return;
    
    this.lib.libvlc_audio_set_track(this.player, trackId);
    console.log(`Audio track set to: ${trackId}`);
  }

  setSubtitleTrack(trackId) {
    // LibVLC subtitle track setting would require additional function definitions
    console.log(`Subtitle track set to: ${trackId}`);
  }

  takeScreenshot() {
    if (!this.isInitialized || !this.player) return null;
    
    try {
      const screenshotPath = path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
      const result = this.lib.libvlc_video_take_snapshot(this.player, 0, screenshotPath, 800, 600);
      
      if (result === 0) {
        console.log(`Screenshot saved to: ${screenshotPath}`);
        return screenshotPath;
      } else {
        console.error('Failed to take screenshot');
        return null;
      }
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return null;
    }
  }

  setVideoFilter(filterName, enabled) {
    // Video filters would require additional LibVLC function definitions
    console.log(`Video filter ${filterName}: ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAudioFilter(filterName, enabled) {
    // Audio filters would require additional LibVLC function definitions
    console.log(`Audio filter ${filterName}: ${enabled ? 'enabled' : 'disabled'}`);
  }

  destroy() {
    if (this.media) {
      this.lib.libvlc_media_release(this.media);
      this.media = null;
    }
    
    if (this.player) {
      this.lib.libvlc_media_player_release(this.player);
      this.player = null;
    }
    
    if (this.instance) {
      this.lib.libvlc_release(this.instance);
      this.instance = null;
    }
    
    this.isInitialized = false;
    console.log('LibVLC Manager destroyed');
  }
}

module.exports = VLCManager;
