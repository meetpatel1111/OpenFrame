const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  
  // File dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Media operations
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  onFolderOpened: (callback) => ipcRenderer.on('folder-opened', callback),
  
  // Playback controls
  onPlaybackToggle: (callback) => ipcRenderer.on('playback-toggle', callback),
  onPlaybackStop: (callback) => ipcRenderer.on('playback-stop', callback),
  onFullscreenToggle: (callback) => ipcRenderer.on('fullscreen-toggle', callback),
  
  // UI events
  onShowMediaInfo: (callback) => ipcRenderer.on('show-media-info', callback),
  onShowConverter: (callback) => ipcRenderer.on('show-converter', callback),
  onShowRecorder: (callback) => ipcRenderer.on('show-recorder', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // VLC operations
  vlc: {
    play: (filePath) => ipcRenderer.invoke('vlc-play', filePath),
    pause: () => ipcRenderer.invoke('vlc-pause'),
    stop: () => ipcRenderer.invoke('vlc-stop'),
    seek: (time) => ipcRenderer.invoke('vlc-seek', time),
    setVolume: (volume) => ipcRenderer.invoke('vlc-set-volume', volume),
    getTime: () => ipcRenderer.invoke('vlc-get-time'),
    getDuration: () => ipcRenderer.invoke('vlc-get-duration'),
    isPlaying: () => ipcRenderer.invoke('vlc-is-playing'),
    
    // Events
    onTimeChanged: (callback) => ipcRenderer.on('vlc-time-changed', callback),
    onStateChanged: (callback) => ipcRenderer.on('vlc-state-changed', callback),
    onMediaEnded: (callback) => ipcRenderer.on('vlc-media-ended', callback)
  },
  
  // FFmpeg operations
  ffmpeg: {
    probe: (filePath) => ipcRenderer.invoke('ffmpeg-probe', filePath),
    convert: (options) => ipcRenderer.invoke('ffmpeg-convert', options),
    extractAudio: (options) => ipcRenderer.invoke('ffmpeg-extract-audio', options),
    extractSubtitles: (options) => ipcRenderer.invoke('ffmpeg-extract-subtitles', options),
    generateThumbnail: (options) => ipcRenderer.invoke('ffmpeg-generate-thumbnail', options),
    
    // Progress events
    onProgress: (callback) => ipcRenderer.on('ffmpeg-progress', callback),
    onComplete: (callback) => ipcRenderer.on('ffmpeg-complete', callback),
    onError: (callback) => ipcRenderer.on('ffmpeg-error', callback)
  }
});
