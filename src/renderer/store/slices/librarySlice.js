import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const scanLibrary = createAsyncThunk(
  'library/scanLibrary',
  async (folderPaths) => {
    // This would scan folders and extract metadata
    // For now, return mock data
    return [];
  }
);

export const addToLibrary = createAsyncThunk(
  'library/addToLibrary',
  async (filePath) => {
    // Add file to library with metadata
    return {
      id: Date.now(),
      path: filePath,
      title: filePath.split('/').pop(),
      duration: 0,
      size: 0,
      format: '',
      addedDate: new Date().toISOString(),
      lastPlayed: null,
      playCount: 0,
      rating: 0,
      tags: []
    };
  }
);

const initialState = {
  items: [],
  folders: [],
  isScanning: false,
  sortBy: 'title',
  sortOrder: 'asc',
  filterBy: 'all',
  searchQuery: '',
  selectedItems: [],
  viewMode: 'grid', // grid, list, detail
  error: null
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLibraryItems: (state, action) => {
      state.items = action.payload;
    },
    setLibraryFolders: (state, action) => {
      state.folders = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setFilterBy: (state, action) => {
      state.filterBy = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    updateLibraryItem: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    removeLibraryItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearLibrary: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanLibrary.pending, (state) => {
        state.isScanning = true;
        state.error = null;
      })
      .addCase(scanLibrary.fulfilled, (state, action) => {
        state.isScanning = false;
        state.items = action.payload;
      })
      .addCase(scanLibrary.rejected, (state, action) => {
        state.isScanning = false;
        state.error = action.error.message;
      })
      .addCase(addToLibrary.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  }
});

export const {
  setLibraryItems,
  setLibraryFolders,
  setSortBy,
  setSortOrder,
  setFilterBy,
  setSearchQuery,
  setSelectedItems,
  setViewMode,
  updateLibraryItem,
  removeLibraryItem,
  clearLibrary
} = librarySlice.actions;

export default librarySlice.reducer;
