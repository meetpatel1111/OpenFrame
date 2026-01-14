import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Recording state
  isRecording: false,
  isPaused: false,
  isPreviewing: false,
  
  // Recording settings
  settings: {
    source: 'screen', // screen, window, camera
    audioSource: 'system', // system, microphone, both
    quality: '1080p', // 720p, 1080p, 4k
    fps: 30,
    format: 'mp4', // mp4, webm, avi
    codec: 'libx264',
    bitrate: '5000k',
    audioCodec: 'aac',
    audioBitrate: '192k',
    outputPath: '',
    filename: '',
    showCursor: true,
    highlightClicks: false,
    recordMic: true,
    recordSystemAudio: true
  },
  
  // Recording info
  currentRecording: null,
  duration: 0,
  startTime: null,
  pausedTime: 0,
  fileSize: 0,
  
  // Available sources
  availableScreens: [],
  availableWindows: [],
  availableCameras: [],
  availableMicrophones: [],
  
  // Recordings list
  recordings: [],
  
  // UI state
  showSettings: false,
  selectedRegion: null,
  countdown: 0,
  
  // Error state
  error: null
};

const recorderSlice = createSlice({
  name: 'recorder',
  initialState,
  reducers: {
    setRecordingState: (state, action) => {
      const { isRecording, isPaused, isPreviewing } = action.payload;
      state.isRecording = isRecording ?? state.isRecording;
      state.isPaused = isPaused ?? state.isPaused;
      state.isPreviewing = isPreviewing ?? state.isPreviewing;
    },
    setRecordingSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setCurrentRecording: (state, action) => {
      state.currentRecording = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },
    setPausedTime: (state, action) => {
      state.pausedTime = action.payload;
    },
    setFileSize: (state, action) => {
      state.fileSize = action.payload;
    },
    setAvailableScreens: (state, action) => {
      state.availableScreens = action.payload;
    },
    setAvailableWindows: (state, action) => {
      state.availableWindows = action.payload;
    },
    setAvailableCameras: (state, action) => {
      state.availableCameras = action.payload;
    },
    setAvailableMicrophones: (state, action) => {
      state.availableMicrophones = action.payload;
    },
    addRecording: (state, action) => {
      state.recordings.unshift({
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString()
      });
    },
    removeRecording: (state, action) => {
      state.recordings = state.recordings.filter(recording => recording.id !== action.payload);
    },
    updateRecording: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.recordings.findIndex(recording => recording.id === id);
      if (index !== -1) {
        state.recordings[index] = { ...state.recordings[index], ...updates };
      }
    },
    clearRecordings: (state) => {
      state.recordings = [];
    },
    setShowSettings: (state, action) => {
      state.showSettings = action.payload;
    },
    setSelectedRegion: (state, action) => {
      state.selectedRegion = action.payload;
    },
    setCountdown: (state, action) => {
      state.countdown = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetRecording: (state) => {
      state.isRecording = false;
      state.isPaused = false;
      state.isPreviewing = false;
      state.currentRecording = null;
      state.duration = 0;
      state.startTime = null;
      state.pausedTime = 0;
      state.fileSize = 0;
      state.countdown = 0;
      state.selectedRegion = null;
    }
  }
});

export const {
  setRecordingState,
  setRecordingSettings,
  setCurrentRecording,
  setDuration,
  setStartTime,
  setPausedTime,
  setFileSize,
  setAvailableScreens,
  setAvailableWindows,
  setAvailableCameras,
  setAvailableMicrophones,
  addRecording,
  removeRecording,
  updateRecording,
  clearRecordings,
  setShowSettings,
  setSelectedRegion,
  setCountdown,
  setError,
  clearError,
  resetRecording
} = recorderSlice.actions;

export default recorderSlice.reducer;
