import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for VLC operations
export const initializeVLC = createAsyncThunk(
  'media/initializeVLC',
  async () => {
    // VLC initialization happens in main process
    // This just confirms connection
    return true;
  }
);

export const playMedia = createAsyncThunk(
  'media/playMedia',
  async (filePath) => {
    if (window.electronAPI && window.electronAPI.vlc) {
      return await window.electronAPI.vlc.play(filePath);
    }
    throw new Error('VLC not available');
  }
);

export const pauseMedia = createAsyncThunk(
  'media/pauseMedia',
  async () => {
    if (window.electronAPI && window.electronAPI.vlc) {
      return await window.electronAPI.vlc.pause();
    }
    throw new Error('VLC not available');
  }
);

export const stopMedia = createAsyncThunk(
  'media/stopMedia',
  async () => {
    if (window.electronAPI && window.electronAPI.vlc) {
      return await window.electronAPI.vlc.stop();
    }
    throw new Error('VLC not available');
  }
);

export const seekMedia = createAsyncThunk(
  'media/seekMedia',
  async (timeMs) => {
    if (window.electronAPI && window.electronAPI.vlc) {
      return await window.electronAPI.vlc.seek(timeMs);
    }
    throw new Error('VLC not available');
  }
);

export const setVolume = createAsyncThunk(
  'media/setVolume',
  async (volume) => {
    if (window.electronAPI && window.electronAPI.vlc) {
      return await window.electronAPI.vlc.setVolume(volume);
    }
    throw new Error('VLC not available');
  }
);

export const getMediaTime = createAsyncThunk(
  'media/getMediaTime',
  async () => {
    if (window.electronAPI && window.electronAPI.vlc) {
      return await window.electronAPI.vlc.getTime();
    }
    return 0;
  }
);

export const getMediaDuration = createAsyncThunk(
  'media/getMediaDuration',
  async () => {
    if (window.electronAPI && window.electronAPI.vlc) {
      return await window.electronAPI.vlc.getDuration();
    }
    return 0;
  }
);

export const isMediaPlaying = createAsyncThunk(
  'media/isMediaPlaying',
  async () => {
    if (window.electronAPI && window.electronAPI.vlc) {
      return await window.electronAPI.vlc.isPlaying();
    }
    return false;
  }
);

// Async thunks for FFmpeg operations
export const initializeFFmpeg = createAsyncThunk(
  'media/initializeFFmpeg',
  async () => {
    // FFmpeg initialization happens in main process
    return true;
  }
);

export const probeMedia = createAsyncThunk(
  'media/probeMedia',
  async (filePath) => {
    if (window.electronAPI && window.electronAPI.ffmpeg) {
      return await window.electronAPI.ffmpeg.probe(filePath);
    }
    throw new Error('FFmpeg not available');
  }
);

export const convertMedia = createAsyncThunk(
  'media/convertMedia',
  async (options) => {
    if (window.electronAPI && window.electronAPI.ffmpeg) {
      return await window.electronAPI.ffmpeg.convert(options);
    }
    throw new Error('FFmpeg not available');
  }
);

export const extractAudio = createAsyncThunk(
  'media/extractAudio',
  async (options) => {
    if (window.electronAPI && window.electronAPI.ffmpeg) {
      return await window.electronAPI.ffmpeg.extractAudio(options);
    }
    throw new Error('FFmpeg not available');
  }
);

export const extractSubtitles = createAsyncThunk(
  'media/extractSubtitles',
  async (options) => {
    if (window.electronAPI && window.electronAPI.ffmpeg) {
      return await window.electronAPI.ffmpeg.extractSubtitles(options);
    }
    throw new Error('FFmpeg not available');
  }
);

export const generateThumbnail = createAsyncThunk(
  'media/generateThumbnail',
  async (options) => {
    if (window.electronAPI && window.electronAPI.ffmpeg) {
      return await window.electronAPI.ffmpeg.generateThumbnail(options);
    }
    throw new Error('FFmpeg not available');
  }
);

const initialState = {
  // VLC state
  currentMedia: null,
  isPlaying: false,
  isPaused: false,
  isStopped: true,
  currentTime: 0,
  duration: 0,
  volume: 70,
  isMuted: false,
  playbackRate: 1.0,
  
  // Media info
  mediaInfo: null,
  tracks: {
    video: [],
    audio: [],
    subtitle: []
  },
  currentTracks: {
    video: -1,
    audio: -1,
    subtitle: -1
  },
  
  // Video effects
  videoFilters: {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    gamma: 0,
    sharpen: 0,
    blur: 0
  },
  
  // Audio effects
  audioFilters: {
    equalizer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    bassBoost: 0,
    trebleBoost: 0,
    compressor: false,
    spatializer: false
  },
  
  // FFmpeg state
  activeJobs: [],
  conversionHistory: [],
  
  // Loading and error states
  isLoading: false,
  error: null,
  
  // VLC initialization
  isVLCInitialized: false,
  isFFmpegInitialized: false
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setCurrentMedia: (state, action) => {
      state.currentMedia = action.payload;
    },
    setPlaybackState: (state, action) => {
      const { isPlaying, isPaused, isStopped } = action.payload;
      state.isPlaying = isPlaying ?? state.isPlaying;
      state.isPaused = isPaused ?? state.isPaused;
      state.isStopped = isStopped ?? state.isStopped;
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setMuted: (state, action) => {
      state.isMuted = action.payload;
    },
    setPlaybackRate: (state, action) => {
      state.playbackRate = action.payload;
    },
    setMediaInfo: (state, action) => {
      state.mediaInfo = action.payload;
    },
    setTracks: (state, action) => {
      state.tracks = action.payload;
    },
    setCurrentTracks: (state, action) => {
      state.currentTracks = { ...state.currentTracks, ...action.payload };
    },
    setVideoFilter: (state, action) => {
      const { filter, value } = action.payload;
      state.videoFilters[filter] = value;
    },
    setAudioFilter: (state, action) => {
      const { filter, value } = action.payload;
      state.audioFilters[filter] = value;
    },
    addActiveJob: (state, action) => {
      state.activeJobs.push(action.payload);
    },
    updateActiveJob: (state, action) => {
      const { jobId, updates } = action.payload;
      const jobIndex = state.activeJobs.findIndex(job => job.id === jobId);
      if (jobIndex !== -1) {
        state.activeJobs[jobIndex] = { ...state.activeJobs[jobIndex], ...updates };
      }
    },
    removeActiveJob: (state, action) => {
      state.activeJobs = state.activeJobs.filter(job => job.id !== action.payload);
    },
    addToConversionHistory: (state, action) => {
      state.conversionHistory.unshift(action.payload);
      // Keep only last 50 items
      state.conversionHistory = state.conversionHistory.slice(0, 50);
    },
    clearConversionHistory: (state) => {
      state.conversionHistory = [];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // VLC initialization
      .addCase(initializeVLC.fulfilled, (state) => {
        state.isVLCInitialized = true;
      })
      .addCase(initializeVLC.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // FFmpeg initialization
      .addCase(initializeFFmpeg.fulfilled, (state) => {
        state.isFFmpegInitialized = true;
      })
      .addCase(initializeFFmpeg.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Playback operations
      .addCase(playMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(playMedia.fulfilled, (state) => {
        state.isLoading = false;
        state.isPlaying = true;
        state.isPaused = false;
        state.isStopped = false;
      })
      .addCase(playMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(pauseMedia.fulfilled, (state) => {
        state.isPlaying = false;
        state.isPaused = true;
      })
      .addCase(stopMedia.fulfilled, (state) => {
        state.isPlaying = false;
        state.isPaused = false;
        state.isStopped = true;
        state.currentTime = 0;
      })
      .addCase(seekMedia.fulfilled, (state, action) => {
        state.currentTime = action.payload;
      })
      .addCase(setVolume.fulfilled, (state, action) => {
        state.volume = action.payload;
      })
      .addCase(getMediaTime.fulfilled, (state, action) => {
        state.currentTime = action.payload;
      })
      .addCase(getMediaDuration.fulfilled, (state, action) => {
        state.duration = action.payload;
      })
      .addCase(isMediaPlaying.fulfilled, (state, action) => {
        state.isPlaying = action.payload;
      })
      // Media analysis
      .addCase(probeMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(probeMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mediaInfo = action.payload;
      })
      .addCase(probeMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Conversion operations
      .addCase(convertMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(convertMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addToConversionHistory(action.payload);
      })
      .addCase(convertMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export const {
  setCurrentMedia,
  setPlaybackState,
  setCurrentTime,
  setDuration,
  setVolume: setVolumeAction,
  setMuted,
  setPlaybackRate,
  setMediaInfo,
  setTracks,
  setCurrentTracks,
  setVideoFilter,
  setAudioFilter,
  addActiveJob,
  updateActiveJob,
  removeActiveJob,
  addToConversionHistory,
  clearConversionHistory,
  setError,
  clearError
} = mediaSlice.actions;

export default mediaSlice.reducer;
