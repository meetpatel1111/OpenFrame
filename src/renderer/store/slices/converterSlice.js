import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Current conversion job
  currentJob: null,
  
  // Conversion presets
  presets: [
    {
      id: 'mp4-1080p',
      name: 'MP4 1080p',
      format: 'mp4',
      video: {
        codec: 'libx264',
        bitrate: '5000k',
        resolution: '1920x1080',
        fps: 30
      },
      audio: {
        codec: 'aac',
        bitrate: '192k',
        channels: 2,
        sampleRate: 44100
      }
    },
    {
      id: 'mp4-720p',
      name: 'MP4 720p',
      format: 'mp4',
      video: {
        codec: 'libx264',
        bitrate: '2500k',
        resolution: '1280x720',
        fps: 30
      },
      audio: {
        codec: 'aac',
        bitrate: '128k',
        channels: 2,
        sampleRate: 44100
      }
    },
    {
      id: 'webm-1080p',
      name: 'WebM 1080p',
      format: 'webm',
      video: {
        codec: 'libvpx-vp9',
        bitrate: '4000k',
        resolution: '1920x1080',
        fps: 30
      },
      audio: {
        codec: 'libvorbis',
        bitrate: '192k',
        channels: 2,
        sampleRate: 44100
      }
    },
    {
      id: 'mp3-320',
      name: 'MP3 320kbps',
      format: 'mp3',
      audio: {
        codec: 'mp3',
        bitrate: '320k',
        channels: 2,
        sampleRate: 44100
      }
    }
  ],
  
  // Custom conversion settings
  customSettings: {
    input: '',
    output: '',
    format: '',
    video: {
      codec: '',
      bitrate: '',
      resolution: '',
      fps: '',
      aspect: ''
    },
    audio: {
      codec: '',
      bitrate: '',
      channels: '',
      sampleRate: ''
    },
    subtitle: {
      codec: '',
      extract: false
    },
    filters: [],
    hardwareAcceleration: false
  },
  
  // Queue
  queue: [],
  isProcessing: false,
  
  // UI state
  showAdvanced: false,
  selectedPreset: null,
  
  // History
  history: [],
  
  // Error state
  error: null
};

const converterSlice = createSlice({
  name: 'converter',
  initialState,
  reducers: {
    setCurrentJob: (state, action) => {
      state.currentJob = action.payload;
    },
    setCustomSettings: (state, action) => {
      state.customSettings = { ...state.customSettings, ...action.payload };
    },
    setSelectedPreset: (state, action) => {
      state.selectedPreset = action.payload;
      if (action.payload) {
        // Apply preset to custom settings
        const preset = state.presets.find(p => p.id === action.payload);
        if (preset) {
          state.customSettings = {
            ...state.customSettings,
            format: preset.format,
            video: { ...state.customSettings.video, ...preset.video },
            audio: { ...state.customSettings.audio, ...preset.audio },
            subtitle: { ...state.customSettings.subtitle, ...preset.subtitle }
          };
        }
      }
    },
    addToQueue: (state, action) => {
      state.queue.push({
        id: Date.now(),
        status: 'pending',
        ...action.payload,
        addedAt: new Date().toISOString()
      });
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter(job => job.id !== action.payload);
    },
    updateQueueItem: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.queue.findIndex(job => job.id === id);
      if (index !== -1) {
        state.queue[index] = { ...state.queue[index], ...updates };
      }
    },
    clearQueue: (state) => {
      state.queue = [];
    },
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    setShowAdvanced: (state, action) => {
      state.showAdvanced = action.payload;
    },
    addToHistory: (state, action) => {
      state.history.unshift({
        ...action.payload,
        completedAt: new Date().toISOString()
      });
      // Keep only last 100 items
      state.history = state.history.slice(0, 100);
    },
    clearHistory: (state) => {
      state.history = [];
    },
    addPreset: (state, action) => {
      state.presets.push(action.payload);
    },
    updatePreset: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.presets.findIndex(preset => preset.id === id);
      if (index !== -1) {
        state.presets[index] = { ...state.presets[index], ...updates };
      }
    },
    removePreset: (state, action) => {
      state.presets = state.presets.filter(preset => preset.id !== action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setCurrentJob,
  setCustomSettings,
  setSelectedPreset,
  addToQueue,
  removeFromQueue,
  updateQueueItem,
  clearQueue,
  setProcessing,
  setShowAdvanced,
  addToHistory,
  clearHistory,
  addPreset,
  updatePreset,
  removePreset,
  setError,
  clearError
} = converterSlice.actions;

export default converterSlice.reducer;
