const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
const VLCManager = require('./vlcManager');
const FFmpegManager = require('./ffmpegManager');

// Check if running in CLI mode
if (process.argv.length > 2 && process.argv[1] === '--cli') {
  // Load CLI module and run
  require('./cli');
  process.exit(0);
}

// Initialize application store for settings
const store = new Store();

// Keep a global reference of the window object
let mainWindow;
let playerWindow;

// Initialize media managers
let vlcManager;
let ffmpegManager;

// App configuration
const isDev = process.env.NODE_ENV === 'development';
const isProduction = !isDev;

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (playerWindow && !playerWindow.isDestroyed()) {
      playerWindow.close();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createPlayerWindow() {
  // Create a separate window for video playback
  playerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icons/icon.png'),
    show: false,
    frame: false,
    alwaysOnTop: false
  });

  playerWindow.loadFile(path.join(__dirname, '../../build/player.html'));

  playerWindow.on('closed', () => {
    playerWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Media Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'mp3', 'flac', 'wav'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                mainWindow.webContents.send('file-opened', result.filePaths[0]);
              }
            });
          }
        },
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            }).then(result => {
              if (!result.canceled && result.filePaths.length > 0) {
                mainWindow.webContents.send('folder-opened', result.filePaths[0]);
              }
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Playback',
      submenu: [
        {
          label: 'Play/Pause',
          accelerator: 'Space',
          click: () => {
            mainWindow.webContents.send('playback-toggle');
          }
        },
        {
          label: 'Stop',
          accelerator: 'CmdOrCtrl+.',
          click: () => {
            mainWindow.webContents.send('playback-stop');
          }
        },
        { type: 'separator' },
        {
          label: 'Fullscreen',
          accelerator: 'F11',
          click: () => {
            mainWindow.webContents.send('fullscreen-toggle');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Media Info',
          click: () => {
            mainWindow.webContents.send('show-media-info');
          }
        },
        {
          label: 'Convert',
          click: () => {
            mainWindow.webContents.send('show-converter');
          }
        },
        {
          label: 'Record Screen',
          click: () => {
            mainWindow.webContents.send('show-recorder');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About OpenFrame',
              message: 'OpenFrame',
              detail: 'Professional cross-platform media player and processor\nPowered by LibVLC and FFmpeg\nVersion 1.0.0'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  // Initialize media managers
  vlcManager = new VLCManager();
  ffmpegManager = new FFmpegManager();
  
  // Set up VLC event forwarding
  vlcManager.on('timeChanged', (time) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vlc-time-changed', time);
    }
  });

  vlcManager.on('stateChanged', (state) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vlc-state-changed', state);
    }
  });

  vlcManager.on('mediaEnded', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vlc-media-ended');
    }
  });

  vlcManager.on('error', (error) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('vlc-error', error.message);
    }
  });

  // Set up FFmpeg event forwarding
  ffmpegManager.on('jobStarted', (job) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('ffmpeg-job-started', job);
    }
  });

  ffmpegManager.on('jobProgress', (job) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('ffmpeg-progress', job);
    }
  });

  ffmpegManager.on('jobCompleted', (job) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('ffmpeg-complete', job);
    }
  });

  ffmpegManager.on('jobError', (job) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('ffmpeg-error', job);
    }
  });

  createMainWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Cleanup media managers
  if (vlcManager) {
    vlcManager.destroy();
    vlcManager = null;
  }
  
  if (ffmpegManager) {
    ffmpegManager.destroy();
    ffmpegManager = null;
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// VLC IPC handlers
ipcMain.handle('vlc-play', async (event, filePath) => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  return await vlcManager.play(filePath);
});

ipcMain.handle('vlc-pause', async () => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  vlcManager.pause();
  return true;
});

ipcMain.handle('vlc-stop', async () => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  vlcManager.stop();
  return true;
});

ipcMain.handle('vlc-seek', async (event, time) => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  vlcManager.seek(time);
  return true;
});

ipcMain.handle('vlc-set-volume', async (event, volume) => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  vlcManager.setVolume(volume);
  return vlcManager.getVolume();
});

ipcMain.handle('vlc-get-time', async () => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  return vlcManager.getTime();
});

ipcMain.handle('vlc-get-duration', async () => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  return vlcManager.getDuration();
});

ipcMain.handle('vlc-is-playing', async () => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  return vlcManager.isPlaying();
});

ipcMain.handle('vlc-get-media-info', async () => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  return vlcManager.getMediaInfo();
});

ipcMain.handle('vlc-get-tracks', async () => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  return vlcManager.getTracks();
});

ipcMain.handle('vlc-set-audio-track', async (event, trackId) => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  vlcManager.setAudioTrack(trackId);
  return true;
});

ipcMain.handle('vlc-set-subtitle-track', async (event, trackId) => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  vlcManager.setSubtitleTrack(trackId);
  return true;
});

ipcMain.handle('vlc-take-screenshot', async () => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  return vlcManager.takeScreenshot();
});

ipcMain.handle('vlc-set-video-filter', async (event, filterName, enabled) => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  vlcManager.setVideoFilter(filterName, enabled);
  return true;
});

ipcMain.handle('vlc-set-audio-filter', async (event, filterName, enabled) => {
  if (!vlcManager) throw new Error('VLC Manager not initialized');
  vlcManager.setAudioFilter(filterName, enabled);
  return true;
});

// FFmpeg IPC handlers
ipcMain.handle('ffmpeg-probe', async (event, filePath) => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return await ffmpegManager.probe(filePath);
});

ipcMain.handle('ffmpeg-convert', async (event, options) => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return await ffmpegManager.convert(options);
});

ipcMain.handle('ffmpeg-extract-audio', async (event, options) => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return await ffmpegManager.extractAudio(options);
});

ipcMain.handle('ffmpeg-extract-subtitles', async (event, options) => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return await ffmpegManager.extractSubtitles(options);
});

ipcMain.handle('ffmpeg-generate-thumbnail', async (event, options) => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return await ffmpegManager.generateThumbnail(options);
});

ipcMain.handle('ffmpeg-get-active-jobs', async () => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return ffmpegManager.getActiveJobs();
});

ipcMain.handle('ffmpeg-cancel-job', async (event, jobId) => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return ffmpegManager.cancelJob(jobId);
});

ipcMain.handle('ffmpeg-get-supported-formats', async () => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return ffmpegManager.getSupportedFormats();
});

ipcMain.handle('ffmpeg-get-supported-codecs', async () => {
  if (!ffmpegManager) throw new Error('FFmpeg Manager not initialized');
  return ffmpegManager.getSupportedCodecs();
});

// Auto-updater
if (isProduction) {
  autoUpdater.checkForUpdatesAndNotify();
}

autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version of OpenFrame is available.',
    detail: 'The update will be downloaded in the background.'
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded and ready to install.',
    detail: 'The application will restart to install the update.'
  }).then(() => {
    autoUpdater.quitAndInstall();
  });
});
