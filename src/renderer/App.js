import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import Player from './components/Player';
import MediaLibrary from './components/MediaLibrary';
import Converter from './components/Converter';
import Recorder from './components/Recorder';
import Playlist from './components/Playlist';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { setCurrentView, loadSettings } from './store/slices/appSlice';
import { initializeVLC, initializeFFmpeg } from './store/slices/mediaSlice';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #1a1a1a;
    color: #ffffff;
    overflow: hidden;
    height: 100vh;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  ::-webkit-scrollbar-thumb {
    background: #404040;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const theme = {
  colors: {
    primary: '#00d4ff',
    secondary: '#ff6b35',
    background: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceLight: '#333333',
    text: '#ffffff',
    textSecondary: '#888888',
    border: '#404040'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  }
};

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background} 0%, #2d2d2d 100%);
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
`;

const App = () => {
  const dispatch = useDispatch();
  const { currentView } = useSelector(state => state.app);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load settings
        await dispatch(loadSettings()).unwrap();
        
        // Initialize media engines
        await dispatch(initializeVLC()).unwrap();
        await dispatch(initializeFFmpeg()).unwrap();
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();

    // Set up IPC listeners
    const setupIPCListeners = () => {
      if (window.electronAPI) {
        // File operations
        window.electronAPI.onFileOpened((event, filePath) => {
          console.log('File opened:', filePath);
          // Handle file opening
        });

        window.electronAPI.onFolderOpened((event, folderPath) => {
          console.log('Folder opened:', folderPath);
          dispatch(setCurrentView('library'));
        });

        // Playback controls
        window.electronAPI.onPlaybackToggle(() => {
          // Handle playback toggle
        });

        window.electronAPI.onPlaybackStop(() => {
          // Handle playback stop
        });

        window.electronAPI.onFullscreenToggle(() => {
          // Handle fullscreen toggle
        });

        // UI events
        window.electronAPI.onShowMediaInfo(() => {
          // Show media info
        });

        window.electronAPI.onShowConverter(() => {
          dispatch(setCurrentView('converter'));
        });

        window.electronAPI.onShowRecorder(() => {
          dispatch(setCurrentView('recorder'));
        });
      }
      
      // Set up custom event listeners for file/folder selection
      const handleFileSelected = (event) => {
        const { filePath } = event.detail;
        console.log('File selected:', filePath);
        // This will be handled by the Player component
      };

      const handleFolderSelected = (event) => {
        const { folderPath } = event.detail;
        console.log('Folder selected:', folderPath);
        dispatch(setCurrentView('library'));
      };

      window.addEventListener('file-selected', handleFileSelected);
      window.addEventListener('folder-selected', handleFolderSelected);

      return () => {
        window.removeEventListener('file-selected', handleFileSelected);
        window.removeEventListener('folder-selected', handleFolderSelected);
      };
    };

    setupIPCListeners();

    // Cleanup
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('file-opened');
        window.electronAPI.removeAllListeners('folder-opened');
        window.electronAPI.removeAllListeners('playback-toggle');
        window.electronAPI.removeAllListeners('playback-stop');
        window.electronAPI.removeAllListeners('fullscreen-toggle');
        window.electronAPI.removeAllListeners('show-media-info');
        window.electronAPI.removeAllListeners('show-converter');
        window.electronAPI.removeAllListeners('show-recorder');
      }
    };
  }, [dispatch]);

  const renderCurrentView = () => {
    if (!isInitialized) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #404040',
            borderTop: '3px solid #00d4ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: '#888' }}>Initializing OpenFrame...</span>
        </div>
      );
    }

    switch (currentView) {
      case 'player':
        return <Player />;
      case 'library':
        return <MediaLibrary />;
      case 'converter':
        return <Converter />;
      case 'recorder':
        return <Recorder />;
      case 'playlist':
        return <Playlist />;
      case 'settings':
        return <Settings />;
      default:
        return <Player />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'player':
        return 'Media Player';
      case 'library':
        return 'Media Library';
      case 'converter':
        return 'Media Converter';
      case 'recorder':
        return 'Screen Recorder';
      case 'playlist':
        return 'Playlists';
      case 'settings':
        return 'Settings';
      default:
        return 'OpenFrame';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Sidebar />
        <MainContent>
          <Header title={getViewTitle()} />
          <ContentArea>
            {renderCurrentView()}
          </ContentArea>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
