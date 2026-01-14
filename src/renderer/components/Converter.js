import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  setSelectedPreset,
  setCustomSettings,
  addToQueue,
  getActiveJobs,
  setShowAdvanced
} from '../store/slices/converterSlice';
import { showOpenDialog, showSaveDialog } from '../store/slices/appSlice';

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

const Slider = styled.input`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: ${props => props.theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
  }
`;

const SliderValue = styled.div`
  text-align: right;
  font-size: 12px;
  color: ${props => props.theme.colors.text};
  margin-top: ${props => props.theme.spacing.xs};
`;

const QueueList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.surfaceLight};
`;

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const QueueItemInfo = styled.div`
  flex: 1;
  margin-left: ${props => props.theme.spacing.md};
`;

const QueueItemTitle = styled.div`
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const QueueItemDetails = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const QueueItemProgress = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  margin-top: ${props => props.theme.spacing.sm};
  overflow: hidden;
`;

const QueueItemProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const QueueItemStatus = styled.div`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => {
    switch (props.status) {
      case 'completed': return props.theme.colors.primary;
      case 'error': return '#ff4444';
      case 'running': return props.theme.colors.secondary;
      default: return props.theme.colors.surfaceLight;
    }
  }};
  color: ${props => props.status === 'running' ? '#000' : props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 12px;
  font-weight: 500;
`;

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PresetCard = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surfaceLight};
  color: ${props => props.active ? '#000' : props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: #000;
  }
`;

const formatFileSize = (bytes) => {
  if (!bytes) return '--';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const Converter = () => {
  const dispatch = useDispatch();
  const { presets, customSettings, selectedPreset, queue, showAdvanced } = useSelector(state => state.converter);
  
  const [inputFile, setInputFile] = useState('');
  const [outputFile, setOutputFile] = useState('');
  
  useEffect(() => {
    // Get active jobs from FFmpeg manager
    const updateQueue = async () => {
      if (window.electronAPI && window.electronAPI.ffmpeg) {
        try {
          const jobs = await window.electronAPI.ffmpeg.getActiveJobs();
          // Update queue with active jobs
        } catch (error) {
          console.error('Get jobs error:', error);
        }
      }
    };
    
    updateQueue();
    const interval = setInterval(updateQueue, 1000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const handleSelectInput = async () => {
    try {
      const result = await dispatch(showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Media Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'mp3', 'flac', 'wav', 'webm', 'm4v'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })).unwrap();
      
      if (!result.canceled && result.filePaths.length > 0) {
        setInputFile(result.filePaths[0]);
        
        // Auto-generate output filename
        const inputPath = result.filePaths[0];
        const inputName = inputPath.split('\\').pop().split('.')[0];
        const outputPath = inputPath.replace(/[^\\]+$/, `${inputName}_converted.mp4`);
        setOutputFile(outputPath);
      }
    } catch (error) {
      console.error('Select input error:', error);
    }
  };
  
  const handleSelectOutput = async () => {
    try {
      const result = await dispatch(showSaveDialog({
        defaultPath: outputFile,
        filters: [
          { name: 'MP4', extensions: ['mp4'] },
          { name: 'MKV', extensions: ['mkv'] },
          { name: 'AVI', extensions: ['avi'] },
          { name: 'MP3', extensions: ['mp3'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })).unwrap();
      
      if (!result.canceled) {
        setOutputFile(result.filePath);
      }
    } catch (error) {
      console.error('Select output error:', error);
    }
  };
  
  const handlePresetSelect = (presetId) => {
    dispatch(setSelectedPreset(presetId));
  };
  
  const handleCustomSettingChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      dispatch(setCustomSettings({ [parent]: { ...customSettings[parent], [child]: value } }));
    } else {
      dispatch(setCustomSettings({ [field]: value }));
    }
  };
  
  const handleAddToQueue = () => {
    if (!inputFile || !outputFile) {
      alert('Please select input and output files');
      return;
    }
    
    const conversionJob = {
      input: inputFile,
      output: outputFile,
      preset: selectedPreset,
      settings: customSettings,
      status: 'pending'
    };
    
    dispatch(addToQueue(conversionJob));
    
    // Clear form
    setInputFile('');
    setOutputFile('');
  };
  
  const handleStartConversion = async () => {
    if (!inputFile || !outputFile) {
      alert('Please select input and output files');
      return;
    }
    
    try {
      const job = await dispatch(convertMedia({
        input: inputFile,
        output: outputFile,
        format: customSettings.format || 'mp4',
        video: customSettings.video,
        audio: customSettings.audio,
        subtitle: customSettings.subtitle,
        filters: customSettings.filters,
        hardwareAcceleration: customSettings.hardwareAcceleration
      })).unwrap();
      
      console.log('Conversion started:', job);
    } catch (error) {
      console.error('Conversion error:', error);
      alert(`Conversion failed: ${error.message}`);
    }
  };
  
  return (
    <Container>
      <Header>
        <Title>Media Converter</Title>
        <Controls>
          <Button onClick={() => dispatch(setShowAdvanced(!showAdvanced))}>
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
          <Button primary onClick={handleAddToQueue} disabled={!inputFile || !outputFile}>
            Add to Queue
          </Button>
        </Controls>
      </Header>
      
      <Content>
        <Section>
          <SectionTitle>Conversion Settings</SectionTitle>
          
          <InputGroup>
            <Label>Input File:</Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                type="text"
                value={inputFile}
                onChange={(e) => setInputFile(e.target.value)}
                placeholder="Select input file..."
                readOnly
              />
              <Button onClick={handleSelectInput}>Browse</Button>
            </div>
          </InputGroup>
          
          <InputGroup>
            <Label>Output File:</Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                type="text"
                value={outputFile}
                onChange={(e) => setOutputFile(e.target.value)}
                placeholder="Select output file..."
                readOnly
              />
              <Button onClick={handleSelectOutput}>Browse</Button>
            </div>
          </InputGroup>
          
          <InputGroup>
            <Label>Presets:</Label>
            <PresetGrid>
              {presets.map(preset => (
                <PresetCard
                  key={preset.id}
                  active={selectedPreset === preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  <div style={{ fontWeight: '500' }}>{preset.name}</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {preset.format}
                  </div>
                </PresetCard>
              ))}
            </PresetGrid>
          </InputGroup>
          
          {showAdvanced && (
            <>
              <InputGroup>
                <Label>Output Format:</Label>
                <Select
                  value={customSettings.format || ''}
                  onChange={(e) => handleCustomSettingChange('format', e.target.value)}
                >
                  <option value="">Auto</option>
                  <option value="mp4">MP4</option>
                  <option value="mkv">MKV</option>
                  <option value="avi">AVI</option>
                  <option value="webm">WebM</option>
                  <option value="mp3">MP3</option>
                  <option value="flac">FLAC</option>
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Video Codec:</Label>
                <Select
                  value={customSettings.video?.codec || ''}
                  onChange={(e) => handleCustomSettingChange('video.codec', e.target.value)}
                >
                  <option value="">Auto</option>
                  <option value="libx264">H.264</option>
                  <option value="libx265">H.265/HEVC</option>
                  <option value="libvpx-vp9">VP9</option>
                  <option value="libaom-av1">AV1</option>
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Video Bitrate:</Label>
                <Select
                  value={customSettings.video?.bitrate || ''}
                  onChange={(e) => handleCustomSettingChange('video.bitrate', e.target.value)}
                >
                  <option value="">Auto</option>
                  <option value="1000k">1 Mbps</option>
                  <option value="2500k">2.5 Mbps</option>
                  <option value="5000k">5 Mbps</option>
                  <option value="10000k">10 Mbps</option>
                  <option value="20000k">20 Mbps</option>
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Audio Codec:</Label>
                <Select
                  value={customSettings.audio?.codec || ''}
                  onChange={(e) => handleCustomSettingChange('audio.codec', e.target.value)}
                >
                  <option value="">Auto</option>
                  <option value="aac">AAC</option>
                  <option value="mp3">MP3</option>
                  <option value="libvorbis">Vorbis</option>
                  <option value="libopus">Opus</option>
                  <option value="flac">FLAC</option>
                </Select>
              </InputGroup>
              
              <InputGroup>
                <Label>Hardware Acceleration:</Label>
                <Select
                  value={customSettings.hardwareAcceleration || ''}
                  onChange={(e) => handleCustomSettingChange('hardwareAcceleration', e.target.value)}
                >
                  <option value="">None</option>
                  <option value="nvenc">NVIDIA NVENC</option>
                  <option value="qsv">Intel QSV</option>
                  <option value="amf">AMD AMF</option>
                  <option value="videotoolbox">VideoToolbox</option>
                </Select>
              </InputGroup>
            </>
          )}
          
          <Button primary onClick={handleStartConversion} disabled={!inputFile || !outputFile}>
            Start Conversion
          </Button>
        </Section>
        
        <Section>
          <SectionTitle>Conversion Queue</SectionTitle>
          <QueueList>
            {queue.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                No jobs in queue
              </div>
            ) : (
              queue.map(job => (
                <QueueItem key={job.id}>
                  <div style={{ fontSize: '24px' }}>
                    {job.status === 'completed' ? '✅' : job.status === 'error' ? '❌' : '⏳'}
                  </div>
                  <QueueItemInfo>
                    <QueueItemTitle>{job.input?.split('\\').pop()}</QueueItemTitle>
                    <QueueItemDetails>
                      {job.output?.split('\\').pop()} • {formatFileSize(job.size)}
                    </QueueItemDetails>
                    {job.status === 'running' && (
                      <QueueItemProgress>
                        <QueueItemProgressFill percentage={job.progress || 0} />
                      </QueueItemProgress>
                    )}
                  </QueueItemInfo>
                  <QueueItemStatus status={job.status}>
                    {job.status}
                  </QueueItemStatus>
                </QueueItem>
              ))
            )}
          </QueueList>
        </Section>
      </Content>
    </Container>
  );
};

export default Converter;
