let vlc;
try {
  vlc = require('node-vlc');
} catch (error) {
  console.warn('node-vlc module not found. VLC functionality will be disabled.');
  console.warn('To enable VLC features, install node-vlc: npm install node-vlc');
}

const { EventEmitter } = require('events');
const path = require('path');

class VLCManager extends EventEmitter {
  constructor() {
    super();
    this.instance = null;
    this.player = null;
    this.media = null;
    this.currentFile = null;
    this.isInitialized = false;
    
    this.initialize();
  }

  initialize() {
    if (!vlc) {
      console.warn('VLC module not available - VLC features disabled');
      this.emit('error', new Error('VLC module not available'));
      return;
    }

    try {
      // Create VLC instance
      this.instance = new vlc();
      
      // Create player
      this.player = this.instance.mediaPlayerNew();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      this.isInitialized = true;
      console.log('VLC Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize VLC:', error);
      this.emit('error', error);
    }
  }

  setupEventHandlers() {
    if (!this.player) return;

    // Time changed event
    this.player.eventManager().attach(
      this.instance.EventType.MediaPlayerTimeChanged,
      (event) => {
        const time = this.player.getTime();
        this.emit('timeChanged', time);
      },
      null
    );

    // State changed event
    this.player.eventManager().attach(
      this.instance.EventType.MediaPlayerStateChanged,
      (event) => {
        const state = this.player.getState();
        this.emit('stateChanged', state);
      },
      null
    );

    // Media ended event
    this.player.eventManager().attach(
      this.instance.EventType.MediaPlayerEndReached,
      (event) => {
        this.emit('mediaEnded');
      },
      null
    );

    // Media parsed event
    this.player.eventManager().attach(
      this.instance.EventType.MediaParsedChanged,
      (event) => {
        this.emit('mediaParsed');
      },
      null
    );
  }

  async play(filePath) {
    if (!this.isInitialized) {
      throw new Error('VLC Manager not initialized');
    }

    try {
      // Stop current playback
      this.stop();

      // Create new media
      this.media = this.instance.mediaNewPath(filePath);
      this.currentFile = filePath;

      // Set media to player
      this.player.setMedia(this.media);

      // Parse media for metadata
      this.media.parseWithOptions(
        this.instance.MediaParseOptions.parseLocal,
        5000
      );

      // Start playback
      this.player.play();
      
      console.log(`Playing: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to play media:', error);
      this.emit('error', error);
      return false;
    }
  }

  pause() {
    if (!this.player) return;
    
    if (this.player.isPlaying()) {
      this.player.pause();
      this.emit('paused');
    } else {
      this.player.play();
      this.emit('resumed');
    }
  }

  stop() {
    if (!this.player) return;
    
    this.player.stop();
    this.currentFile = null;
    this.media = null;
    this.emit('stopped');
  }

  seek(timeMs) {
    if (!this.player || !this.media) return;
    
    this.player.setTime(timeMs);
    this.emit('seeked', timeMs);
  }

  setVolume(volume) {
    if (!this.player) return;
    
    // VLC volume is 0-100
    const vlcVolume = Math.max(0, Math.min(100, volume));
    this.player.setVolume(vlcVolume);
    this.emit('volumeChanged', vlcVolume);
  }

  getVolume() {
    if (!this.player) return 0;
    return this.player.getVolume();
  }

  getTime() {
    if (!this.player) return 0;
    return this.player.getTime();
  }

  getDuration() {
    if (!this.media) return 0;
    return this.media.getDuration();
  }

  isPlaying() {
    if (!this.player) return false;
    return this.player.isPlaying();
  }

  getState() {
    if (!this.player) return 'Nothing';
    return this.player.getState();
  }

  getMediaInfo() {
    if (!this.media) return null;

    const mediaInfo = {
      title: this.media.getMeta(vlc.MetaType.Title) || path.basename(this.currentFile),
      artist: this.media.getMeta(vlc.MetaType.Artist) || '',
      album: this.media.getMeta(vlc.MetaType.Album) || '',
      duration: this.getDuration(),
      tracks: this.getTracks(),
      video: this.getVideoInfo(),
      audio: this.getAudioInfo()
    };

    return mediaInfo;
  }

  getTracks() {
    if (!this.media) return [];

    const tracks = [];
    
    // Get video tracks
    const videoTracks = this.media.tracksGet();
    for (const track of videoTracks) {
      if (track.type === 'video') {
        tracks.push({
          type: 'video',
          id: track.id,
          codec: track.codec,
          language: track.language || '',
          description: track.description || ''
        });
      }
    }

    // Get audio tracks
    const audioTracks = this.media.tracksGet();
    for (const track of audioTracks) {
      if (track.type === 'audio') {
        tracks.push({
          type: 'audio',
          id: track.id,
          codec: track.codec,
          language: track.language || '',
          description: track.description || '',
          channels: track.audioChannels || 0,
          rate: track.audioRate || 0
        });
      }
    }

    // Get subtitle tracks
    const subtitleTracks = this.media.tracksGet();
    for (const track of subtitleTracks) {
      if (track.type === 'subtitle') {
        tracks.push({
          type: 'subtitle',
          id: track.id,
          codec: track.codec,
          language: track.language || '',
          description: track.description || ''
        });
      }
    }

    return tracks;
  }

  getVideoInfo() {
    if (!this.media) return null;

    const tracks = this.media.tracksGet();
    const videoTrack = tracks.find(track => track.type === 'video');
    
    if (!videoTrack) return null;

    return {
      width: videoTrack.width || 0,
      height: videoTrack.height || 0,
      codec: videoTrack.codec || '',
      bitrate: videoTrack.bitrate || 0,
      fps: videoTrack.fps || 0
    };
  }

  getAudioInfo() {
    if (!this.media) return null;

    const tracks = this.media.tracksGet();
    const audioTrack = tracks.find(track => track.type === 'audio');
    
    if (!audioTrack) return null;

    return {
      channels: audioTrack.audioChannels || 0,
      rate: audioTrack.audioRate || 0,
      codec: audioTrack.codec || '',
      bitrate: audioTrack.bitrate || 0
    };
  }

  setAudioTrack(trackId) {
    if (!this.player) return;
    
    this.player.setAudioTrack(trackId);
    this.emit('audioTrackChanged', trackId);
  }

  setSubtitleTrack(trackId) {
    if (!this.player) return;
    
    this.player.setSpuTrack(trackId);
    this.emit('subtitleTrackChanged', trackId);
  }

  toggleFullscreen() {
    if (!this.player) return;
    
    // This would need to be implemented based on the video output
    this.emit('fullscreenToggled');
  }

  takeScreenshot() {
    if (!this.player) return null;
    
    try {
      const screenshot = this.player.takeSnapshot(0, 320, 240);
      this.emit('screenshotTaken', screenshot);
      return screenshot;
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return null;
    }
  }

  setVideoFilter(filterName, enabled) {
    if (!this.player) return;
    
    const filter = enabled ? filterName : '';
    this.player.setVideoFilter(filter);
    this.emit('videoFilterChanged', filterName, enabled);
  }

  setAudioFilter(filterName, enabled) {
    if (!this.player) return;
    
    const filter = enabled ? filterName : '';
    this.player.setAudioFilter(filter);
    this.emit('audioFilterChanged', filterName, enabled);
  }

  destroy() {
    if (this.player) {
      this.player.stop();
      this.instance.mediaPlayerRelease(this.player);
    }
    
    if (this.media) {
      this.instance.mediaRelease(this.media);
    }
    
    if (this.instance) {
      this.instance.release();
    }
    
    this.removeAllListeners();
    this.isInitialized = false;
  }
}

module.exports = VLCManager;
