import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loadSettings = createAsyncThunk(
  'app/loadSettings',
  async () => {
    if (window.electronAPI) {
      return await window.electronAPI.getSettings();
    }
    return {};
  }
);

export const saveSetting = createAsyncThunk(
  'app/saveSetting',
  async ({ key, value }) => {
    if (window.electronAPI) {
      await window.electronAPI.setSetting(key, value);
    }
    return { key, value };
  }
);

export const showOpenDialog = createAsyncThunk(
  'app/showOpenDialog',
  async (options) => {
    if (window.electronAPI) {
      return await window.electronAPI.showOpenDialog(options);
    }
    return { canceled: true, filePaths: [] };
  }
);

export const showSaveDialog = createAsyncThunk(
  'app/showSaveDialog',
  async (options) => {
    if (window.electronAPI) {
      return await window.electronAPI.showSaveDialog(options);
    }
    return { canceled: true, filePath: '' };
  }
);

const initialState = {
  currentView: 'player',
  settings: {
    theme: 'dark',
    language: 'en',
    autoPlay: true,
    rememberPosition: true,
    hardwareAcceleration: true,
    defaultAudioLanguage: 'en',
    defaultSubtitleLanguage: 'en',
    volume: 70,
    lastPlayedFiles: [],
    libraryFolders: [],
    outputFolder: '',
    conversionPresets: [],
    recordingFolder: ''
  },
  isLoading: false,
  error: null,
  isFullscreen: false,
  notifications: []
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    setFullscreen: (state, action) => {
      state.isFullscreen = action.payload;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info',
        duration: 3000,
        ...action.payload
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateLocalSetting: (state, action) => {
      const { key, value } = action.payload;
      state.settings[key] = value;
    },
    addToLastPlayed: (state, action) => {
      const filePath = action.payload;
      const lastPlayed = state.settings.lastPlayedFiles || [];
      
      // Remove if already exists
      const filtered = lastPlayed.filter(file => file !== filePath);
      
      // Add to beginning
      state.settings.lastPlayedFiles = [filePath, ...filtered].slice(0, 20);
    },
    addLibraryFolder: (state, action) => {
      const folder = action.payload;
      const folders = state.settings.libraryFolders || [];
      
      if (!folders.includes(folder)) {
        state.settings.libraryFolders.push(folder);
      }
    },
    removeLibraryFolder: (state, action) => {
      const folder = action.payload;
      state.settings.libraryFolders = state.settings.libraryFolders.filter(
        f => f !== folder
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Load settings
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Save setting
      .addCase(saveSetting.fulfilled, (state, action) => {
        const { key, value } = action.payload;
        state.settings[key] = value;
      })
      // Show dialogs
      .addCase(showOpenDialog.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(showSaveDialog.rejected, (state, action) => {
        state.error = action.error.message;
      });
  }
});

export const {
  setCurrentView,
  toggleFullscreen,
  setFullscreen,
  addNotification,
  removeNotification,
  clearNotifications,
  updateLocalSetting,
  addToLastPlayed,
  addLibraryFolder,
  removeLibraryFolder
} = appSlice.actions;

export default appSlice.reducer;
