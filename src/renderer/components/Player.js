import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  playMedia,
  pauseMedia,
  stopMedia,
  seekMedia,
  setVolume,
  getMediaTime,
  getMediaDuration,
  isMediaPlaying,
  setCurrentTime,
  setDuration,
  setPlaybackState,
  setCurrentMedia,
  setMediaInfo,
  setTracks
} from '../store/slices/mediaSlice';
import { addToLastPlayed } from '../store/slices/appSlice';
import AudioControls from './AudioControls';
import VideoControls from './VideoControls';
import SubtitleControls from './SubtitleControls';
import NetworkDialog from './NetworkDialog';

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: ${props => props.theme.spacing.lg};
`;

const VideoContainer = styled.div`
  background: #000;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  position: relative;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VideoArea = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 18px;
  position: relative;
`;

const DropZone = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  border: 2px dashed ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  opacity: ${props => props.isDragging ? 1 : 0};
  pointer-events: ${props => props.isDragging ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
`;

const ControlsContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PlayButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #000;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    background: ${props => props.theme.colors.secondary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ControlButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: #000;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  border-radius: 4px;
  width: ${props => props.percentage}%;
  transition: width 0.1s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: ${props => props.theme.colors.secondary};
    border-radius: 50%;
    opacity: ${props => props.isDragging ? 1 : 0};
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const TimeDisplay = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  min-width: 120px;
  text-align: center;
  font-family: 'Courier New', monospace;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const VolumeSlider = styled.div`
  width: 100px;
  height: 6px;
  background: ${props => props.theme.colors.border};
  border-radius: 3px;
  cursor: pointer;
  position: relative;
`;

const VolumeFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  border-radius: 3px;
  width: ${props => props.percentage}%;
  transition: width 0.1s ease;
`;

const VolumeDisplay = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  min-width: 40px;
`;

const MediaInfo = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

const formatTime = (ms) => {
  if (!ms || ms < 0) return '00:00';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '--';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const Player = () => {
  const dispatch = useDispatch();
  const {
    currentMedia,
    isPlaying,
    isPaused,
    isStopped,
    currentTime,
    duration,
    volume,
    mediaInfo,
    isLoading,
    tracks
  } = useSelector(state => state.media);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [showSubtitleControls, setShowSubtitleControls] = useState(false);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [networkUrl, setNetworkUrl] = useState('');
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  
  // Update time periodically
  useEffect(() => {
    if (isPlaying && !isDragging) {
      const interval = setInterval(async () => {
        const time = await dispatch(getMediaTime()).unwrap();
        dispatch(setCurrentTime(time));
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, isDragging, dispatch]);
  
  // Update duration when media changes
  useEffect(() => {
    if (currentMedia) {
      const updateDuration = async () => {
        const dur = await dispatch(getMediaDuration()).unwrap();
        dispatch(setDuration(dur));
      };
      
      updateDuration();
    }
  }, [currentMedia, dispatch]);
  
  // Handle VLC events
  useEffect(() => {
    if (window.electronAPI) {
      const handleTimeChanged = (event, time) => {
        if (!isDragging) {
          dispatch(setCurrentTime(time));
        }
      };
      
      const handleStateChanged = (event, state) => {
        const isPlayingState = state === 'Playing' || state === 'Buffering';
        const isPausedState = state === 'Paused';
        const isStoppedState = state === 'Stopped' || state === 'Ended';
        
        dispatch(setPlaybackState({
          isPlaying: isPlayingState,
          isPaused: isPausedState,
          isStopped: isStoppedState
        }));
      };
      
      const handleMediaEnded = () => {
        dispatch(setPlaybackState({
          isPlaying: false,
          isPaused: false,
          isStopped: true
        }));
      };
      
      window.electronAPI.vlc.onTimeChanged(handleTimeChanged);
      window.electronAPI.vlc.onStateChanged(handleStateChanged);
      window.electronAPI.vlc.onMediaEnded(handleMediaEnded);
      
      return () => {
        window.electronAPI.vlc.onTimeChanged(null);
        window.electronAPI.vlc.onStateChanged(null);
        window.electronAPI.vlc.onMediaEnded(null);
      };
    }
  }, [dispatch, isDragging]);
  
  // Handle file selection events
  useEffect(() => {
    const handleFileSelected = (event) => {
      const { filePath } = event.detail;
      loadFile(filePath);
    };

    window.addEventListener('file-selected', handleFileSelected);

    return () => {
      window.removeEventListener('file-selected', handleFileSelected);
    };
  }, [dispatch]);
  
  const handlePlayPause = async () => {
    if (!currentMedia) return;
    
    try {
      if (isPlaying) {
        await dispatch(pauseMedia()).unwrap();
      } else {
        await dispatch(playMedia(currentMedia)).unwrap();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };
  
  const handleStop = async () => {
    if (!currentMedia) return;
    
    try {
      await dispatch(stopMedia()).unwrap();
      dispatch(setCurrentTime(0));
    } catch (error) {
      console.error('Stop error:', error);
    }
  };
  
  const handleSeek = async (e) => {
    if (!duration || !currentMedia) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = duration * percentage;
    
    try {
      await dispatch(seekMedia(time)).unwrap();
      dispatch(setCurrentTime(time));
    } catch (error) {
      console.error('Seek error:', error);
    }
  };
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleSeek(e);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      handleSeek(e);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleVolumeChange = async (e) => {
    const rect = volumeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newVolume = Math.round(percentage * 100);
    
    try {
      await dispatch(setVolume(newVolume)).unwrap();
    } catch (error) {
      console.error('Volume error:', error);
    }
  };
  
  const handleVolumeMouseDown = (e) => {
    setIsVolumeDragging(true);
    handleVolumeChange(e);
  };
  
  const handleVolumeMouseMove = (e) => {
    if (isVolumeDragging) {
      handleVolumeChange(e);
    }
  };
  
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await loadFile(file.path);
    }
  };
  
  const loadFile = async (filePath) => {
    try {
      dispatch(setCurrentMedia(filePath));
      dispatch(addToLastPlayed(filePath));
      
      // Get media info
      if (window.electronAPI && window.electronAPI.ffmpeg) {
        const info = await window.electronAPI.ffmpeg.probe(filePath);
        dispatch(setMediaInfo(info));
        
        // Extract tracks from media info
        const extractedTracks = {
          video: info.streams.video || [],
          audio: info.streams.audio || [],
          subtitle: info.streams.subtitle || []
        };
        dispatch(setTracks(extractedTracks));
      }
    } catch (error) {
      console.error('Load file error:', error);
    }
  };
  
  const loadNetworkStream = async (url) => {
    try {
      dispatch(setCurrentMedia(url));
      
      // For network streams, we might not be able to probe immediately
      // Set basic track info and let VLC handle the rest
      dispatch(setTracks({
        video: [],
        audio: [],
        subtitle: []
      }));
      
      // Start playback
      await dispatch(playMedia(url)).unwrap();
    } catch (error) {
      console.error('Load network stream error:', error);
    }
  };
  
  const handleNetworkStream = () => {
    if (!networkUrl.trim()) {
      alert('Please enter a valid URL');
      return;
    }
    
    loadNetworkStream(networkUrl.trim());
    setShowNetworkDialog(false);
    setNetworkUrl('');
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsFileDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsFileDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsFileDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      loadFile(files[0].path);
    }
  };
  
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume;
  
  return (
    <PlayerContainer>
      <VideoContainer>
        <VideoArea
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {currentMedia ? (
            <div>Playing: {currentMedia.split('\\').pop()}</div>
          ) : (
            <div>
              <div>No media loaded</div>
              <ControlButton onClick={() => fileInputRef.current?.click()}>
                Open File
              </ControlButton>
              <ControlButton onClick={() => setShowNetworkDialog(true)}>
                Open Stream
              </ControlButton>
            </div>
          )}
          
          <DropZone isDragging={isFileDragging}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <div>Drop media file here</div>
          </DropZone>
        </VideoArea>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </VideoContainer>
      
      <ControlsContainer>
        <ControlsRow>
          <PlayButton
            onClick={handlePlayPause}
            disabled={!currentMedia || isLoading}
          >
            {isPlaying ? '⏸' : '▶'}
          </PlayButton>
          
          <ControlButton
            onClick={handleStop}
            disabled={!currentMedia || isLoading}
          >
            ⏹
          </ControlButton>
          
          <ProgressBar
            ref={progressRef}
            onClick={handleSeek}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <ProgressFill percentage={progressPercentage} isDragging={isDragging} />
          </ProgressBar>
          
          <TimeDisplay>
            {formatTime(currentTime)} / {formatTime(duration)}
          </TimeDisplay>
        </ControlsRow>
        
        <ControlsRow>
          <VolumeControl>
            <span>🔊</span>
            <VolumeSlider
              ref={volumeRef}
              onClick={handleVolumeChange}
              onMouseDown={handleVolumeMouseDown}
              onMouseMove={handleVolumeMouseMove}
              onMouseUp={() => setIsVolumeDragging(false)}
              onMouseLeave={() => setIsVolumeDragging(false)}
            >
              <VolumeFill percentage={volumePercentage} />
            </VolumeSlider>
            <VolumeDisplay>{volume}%</VolumeDisplay>
          </VolumeControl>
          
          <ControlButton onClick={() => setShowAudioControls(!showAudioControls)}>
            🎵 Audio
          </ControlButton>
          
          <ControlButton onClick={() => setShowVideoControls(!showVideoControls)}>
            🎬 Video
          </ControlButton>
          
          <ControlButton onClick={() => setShowSubtitleControls(!showSubtitleControls)}>
            📝 Subtitles
          </ControlButton>
        </ControlsRow>
      </ControlsContainer>
      
      {showAudioControls && <AudioControls />}
      {showVideoControls && <VideoControls />}
      {showSubtitleControls && <SubtitleControls />}
      
      <NetworkDialog
        isOpen={showNetworkDialog}
        onClose={() => setShowNetworkDialog(false)}
        onConfirm={handleNetworkStream}
        url={networkUrl}
        setUrl={setNetworkUrl}
      />
      
      {mediaInfo && (
        <MediaInfo>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Title:</InfoLabel>
              <InfoValue>{mediaInfo.format.tags.title || 'Unknown'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Duration:</InfoLabel>
              <InfoValue>{formatTime(mediaInfo.format.duration * 1000)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Format:</InfoLabel>
              <InfoValue>{mediaInfo.format.name}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Size:</InfoLabel>
              <InfoValue>{formatFileSize(mediaInfo.format.size)}</InfoValue>
            </InfoItem>
            {mediaInfo.streams.video.length > 0 && (
              <InfoItem>
                <InfoLabel>Video:</InfoLabel>
                <InfoValue>
                  {mediaInfo.streams.video[0].codec} {mediaInfo.streams.video[0].width}x{mediaInfo.streams.video[0].height}
                </InfoValue>
              </InfoItem>
            )}
            {mediaInfo.streams.audio.length > 0 && (
              <InfoItem>
                <InfoLabel>Audio:</InfoLabel>
                <InfoValue>
                  {mediaInfo.streams.audio[0].codec} {mediaInfo.streams.audio[0].channels}ch {mediaInfo.streams.audio[0].sampleRate}Hz
                </InfoValue>
              </InfoItem>
            )}
          </InfoGrid>
        </MediaInfo>
      )}
    </PlayerContainer>
  );
};

export default Player;
