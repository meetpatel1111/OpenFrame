import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  setRecordingState,
  setRecordingSettings,
  setCurrentRecording,
  setDuration,
  setStartTime,
  setPausedTime,
  setFileSize,
  setShowSettings,
  setSelectedRegion,
  setCountdown,
  resetRecording,
  addRecording
} from '../store/slices/recorderSlice';
import { showSaveDialog } from '../store/slices/appSlice';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  align-items: center;
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.surfaceLight};
  color: ${props => props.primary ? '#000' : props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? props.theme.colors.secondary : props.theme.colors.primary};
    color: #000;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  overflow-y: auto;
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 16px;
`;

const InputGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Checkbox = styled.input`
  margin-right: ${props => props.theme.spacing.sm};
`;

const RecordingArea = styled.div`
  background: ${props => props.theme.colors.surfaceLight};
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: crosshair;
`;

const RecordingOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${props => props.theme.colors.primary};
  color: #000;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const RecordingDot = styled.div`
  width: 12px;
  height: 12px;
  background: #ff0000;
  border-radius: 50%;
  animation: pulse 1s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const RecordingsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.surfaceLight};
`;

const RecordingItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const RecordingInfo = styled.div`
  flex: 1;
  margin-left: ${props => props.theme.spacing.md};
`;

const RecordingTitle = styled.div`
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const RecordingDetails = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const RecordingActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const formatDuration = (seconds) => {
  if (!seconds) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '--';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const Recorder = () => {
  const dispatch = useDispatch();
  const {
    isRecording,
    isPaused,
    isPreviewing,
    settings,
    currentRecording,
    duration,
    startTime,
    recordings,
    showSettings,
    countdown
  } = useSelector(state => state.recorder);
  
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [durationInterval, setDurationInterval] = useState(null);
  const recordingAreaRef = useRef(null);
  
  useEffect(() => {
    // Mock recording data
    const mockRecordings = [
      {
        id: 1,
        title: 'Screen Recording 1',
        path: '/path/to/recording1.mp4',
        duration: 120,
        size: 50000000,
        format: 'mp4',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Screen Recording 2',
        path: '/path/to/recording2.mp4',
        duration: 300,
        size: 120000000,
        format: 'mp4',
        createdAt: new Date().toISOString()
      }
    ];
    
    mockRecordings.forEach(recording => {
      dispatch(addRecording(recording));
    });
  }, [dispatch]);
  
  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        dispatch(setDuration(Date.now() - startTime));
      }, 100);
      setDurationInterval(interval);
    } else {
      if (durationInterval) {
        clearInterval(durationInterval);
        setDurationInterval(null);
      }
    }
    
    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [isRecording, isPaused, startTime, dispatch, durationInterval]);
  
  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        dispatch(setCountdown(countdown - 1));
      }, 1000);
      setCountdownInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [countdown, dispatch]);
  
  const handleStartRecording = () => {
    if (settings.countdown > 0) {
      dispatch(setCountdown(settings.countdown));
    } else {
      startRecording();
    }
  };
  
  const startRecording = () => {
    dispatch(setRecordingState({
      isRecording: true,
      isPaused: false,
      isPreviewing: false
    }));
    dispatch(setStartTime(Date.now()));
    dispatch(setDuration(0));
    dispatch(setCurrentRecording({
      title: `Recording ${new Date().toLocaleString()}`,
      path: '',
      format: settings.format
    }));
  };
  
  const handleStopRecording = () => {
    dispatch(setRecordingState({
      isRecording: false,
      isPaused: false,
      isPreviewing: false
    }));
    
    if (currentRecording) {
      const finalRecording = {
        ...currentRecording,
        duration: duration,
        size: Math.floor(duration * 1000000), // Mock size calculation
        createdAt: new Date().toISOString()
      };
      
      dispatch(addRecording(finalRecording));
    }
    
    dispatch(resetRecording());
  };
  
  const handlePauseRecording = () => {
    dispatch(setRecordingState({
      isRecording: true,
      isPaused: true,
      isPreviewing: false
    }));
    dispatch(setPausedTime(Date.now()));
  };
  
  const handleResumeRecording = () => {
    const pauseDuration = Date.now() - pausedTime;
    dispatch(setStartTime(startTime + pauseDuration));
    dispatch(setRecordingState({
      isRecording: true,
      isPaused: false,
      isPreviewing: false
    }));
  };
  
  const handleSettingChange = (field, value) => {
    dispatch(setRecordingSettings({ [field]: value }));
  };
  
  const handleSelectRegion = () => {
    // Region selection logic would go here
    alert('Region selection would be implemented here');
  };
  
  const handleOpenRecording = (recording) => {
    // Open recording in player
    window.dispatchEvent(new CustomEvent('file-selected', { 
      detail: { filePath: recording.path } 
    }));
  };
  
  const handleDeleteRecording = (recording) => {
    if (confirm(`Delete recording: ${recording.title}?`)) {
      // Delete logic would go here
      console.log('Deleting recording:', recording);
    }
  };
  
  return (
    <Container>
      <Header>
        <Title>Screen Recorder</Title>
        <Controls>
          <Button onClick={() => dispatch(setShowSettings(!showSettings))}>
            {showSettings ? 'Hide Settings' : 'Show Settings'}
          </Button>
        </Controls>
      </Header>
      
      <Content>
        <Section>
          <SectionTitle>Recording Area</SectionTitle>
          
          <RecordingArea ref={recordingAreaRef}>
            {isRecording && (
              <RecordingOverlay>
                <RecordingDot />
                <span>{isPaused ? 'Paused' : 'Recording'}</span>
                <span>{formatDuration(duration)}</span>
              </RecordingOverlay>
            )}
            
            {!isRecording && !isPreviewing && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎥</div>
                <div>Click to select recording area or use settings below</div>
              </div>
            )}
            
            {countdown > 0 && (
              <div style={{ fontSize: '72px', fontWeight: 'bold', color: '#ff6b35' }}>
                {countdown}
              </div>
            )}
          </RecordingArea>
          
          <Controls style={{ marginTop: '16px', justifyContent: 'center' }}>
            {!isRecording && (
              <Button primary onClick={handleStartRecording}>
                Start Recording
              </Button>
            )}
            
            {isRecording && !isPaused && (
              <>
                <Button onClick={handlePauseRecording}>
                  Pause
                </Button>
                <Button onClick={handleStopRecording}>
                  Stop
                </Button>
              </>
            )}
            
            {isRecording && isPaused && (
              <>
                <Button primary onClick={handleResumeRecording}>
                  Resume
                </Button>
                <Button onClick={handleStopRecording}>
                  Stop
                </Button>
              </>
            )}
            
            <Button onClick={handleSelectRegion}>
              Select Region
            </Button>
          </Controls>
        </Section>
        
        {showSettings && (
          <Section>
            <SectionTitle>Recording Settings</SectionTitle>
            
            <InputGroup>
              <Label>Recording Source:</Label>
              <Select
                value={settings.source}
                onChange={(e) => handleSettingChange('source', e.target.value)}
              >
                <option value="screen">Full Screen</option>
                <option value="window">Window</option>
                <option value="region">Region</option>
                <option value="camera">Camera</option>
              </Select>
            </InputGroup>
            
            <InputGroup>
              <Label>Audio Source:</Label>
              <Select
                value={settings.audioSource}
                onChange={(e) => handleSettingChange('audioSource', e.target.value)}
              >
                <option value="system">System Audio</option>
                <option value="microphone">Microphone</option>
                <option value="both">System + Microphone</option>
                <option value="none">No Audio</option>
              </Select>
            </InputGroup>
            
            <InputGroup>
              <Label>Quality:</Label>
              <Select
                value={settings.quality}
                onChange={(e) => handleSettingChange('quality', e.target.value)}
              >
                <option value="720p">720p (HD)</option>
                <option value="1080p">1080p (Full HD)</option>
                <option value="4k">4K (Ultra HD)</option>
              </Select>
            </InputGroup>
            
            <InputGroup>
              <Label>Frame Rate:</Label>
              <Select
                value={settings.fps}
                onChange={(e) => handleSettingChange('fps', e.target.value)}
              >
                <option value="15">15 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
              </Select>
            </InputGroup>
            
            <InputGroup>
              <Label>Format:</Label>
              <Select
                value={settings.format}
                onChange={(e) => handleSettingChange('format', e.target.value)}
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="avi">AVI</option>
                <option value="mov">MOV</option>
              </Select>
            </InputGroup>
            
            <InputGroup>
              <Label>Countdown (seconds):</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={settings.countdown}
                onChange={(e) => handleSettingChange('countdown', parseInt(e.target.value))}
              />
            </InputGroup>
            
            <InputGroup>
              <Label>
                <Checkbox
                  type="checkbox"
                  checked={settings.showCursor}
                  onChange={(e) => handleSettingChange('showCursor', e.target.checked)}
                />
                Show Cursor
              </Label>
            </InputGroup>
            
            <InputGroup>
              <Label>
                <Checkbox
                  type="checkbox"
                  checked={settings.highlightClicks}
                  onChange={(e) => handleSettingChange('highlightClicks', e.target.checked)}
                />
                Highlight Clicks
              </Label>
            </InputGroup>
          </Section>
        )}
        
        <Section>
          <SectionTitle>Recordings</SectionTitle>
          <RecordingsList>
            {recordings.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                No recordings yet
              </div>
            ) : (
              recordings.map(recording => (
                <RecordingItem key={recording.id}>
                  <div style={{ fontSize: '24px' }}>🎥</div>
                  <RecordingInfo>
                    <RecordingTitle>{recording.title}</RecordingTitle>
                    <RecordingDetails>
                      {formatDuration(recording.duration)} • {formatFileSize(recording.size)} • {recording.format}
                    </RecordingDetails>
                  </RecordingInfo>
                  <RecordingActions>
                    <Button onClick={() => handleOpenRecording(recording)}>
                      Play
                    </Button>
                    <Button onClick={() => handleDeleteRecording(recording)}>
                      Delete
                    </Button>
                  </RecordingActions>
                </RecordingItem>
              ))
            )}
          </RecordingsList>
        </Section>
      </Content>
    </Container>
  );
};

export default Recorder;
