import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  setTracks,
  setCurrentTracks
} from '../store/slices/mediaSlice';
import { showOpenDialog } from '../store/slices/appSlice';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 16px;
`;

const TrackSelector = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  min-width: 200px;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  min-width: 120px;
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
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Slider = styled.input`
  flex: 1;
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
  min-width: 50px;
  text-align: right;
  font-size: 12px;
  color: ${props => props.theme.colors.text};
`;

const ColorPicker = styled.input`
  width: 50px;
  height: 30px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
`;

const FontSelector = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
`;

const SubtitlePreview = styled.div`
  background: #000;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.md};
  text-align: center;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreviewText = styled.div`
  color: ${props => props.color};
  font-size: ${props => props.size}px;
  font-family: ${props => props.font};
  background-color: ${props => props.backgroundColor};
  padding: 4px 8px;
  border-radius: 2px;
`;

const SubtitleControls = () => {
  const dispatch = useDispatch();
  const { tracks, currentTracks } = useSelector(state => state.media);
  
  const [subtitleDelay, setSubtitleDelay] = useState(0);
  const [subtitleSize, setSubtitleSize] = useState(20);
  const [subtitleColor, setSubtitleColor] = useState('#ffffff');
  const [subtitleBackgroundColor, setSubtitleBackgroundColor] = useState('#000000');
  const [subtitleFont, setSubtitleFont] = useState('Arial');
  
  const subtitleFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
    'Verdana', 'Georgia', 'Palatino', 'Garamond',
    'Comic Sans MS', 'Impact', 'Lucida Console'
  ];
  
  useEffect(() => {
    // Apply subtitle delay
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setSubtitleDelay(subtitleDelay);
    }
  }, [subtitleDelay]);
  
  const handleSubtitleTrackChange = (trackId) => {
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setSubtitleTrack(parseInt(trackId));
      dispatch(setCurrentTracks({ subtitle: parseInt(trackId) }));
    }
  };
  
  const handleLoadExternalSubtitle = async () => {
    try {
      const result = await dispatch(showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Subtitle Files', extensions: ['srt', 'ass', 'ssa', 'vtt', 'sub', 'idx'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })).unwrap();
      
      if (!result.canceled && result.filePaths.length > 0) {
        const subtitlePath = result.filePaths[0];
        // Load external subtitle logic
        console.log('Loading external subtitle:', subtitlePath);
        
        // This would typically involve:
        // 1. Adding the subtitle file to VLC
        // 2. Setting it as the current subtitle track
        alert(`External subtitle loaded: ${subtitlePath}`);
      }
    } catch (error) {
      console.error('Load subtitle error:', error);
    }
  };
  
  const handleSearchOnlineSubtitles = () => {
    // Search for subtitles online (OpenSubtitles integration)
    alert('Online subtitle search would be implemented here');
  };
  
  const handleDownloadSubtitles = () => {
    // Download subtitles for current media
    alert('Auto-download subtitles would be implemented here');
  };
  
  const resetSubtitleSettings = () => {
    setSubtitleDelay(0);
    setSubtitleSize(20);
    setSubtitleColor('#ffffff');
    setSubtitleBackgroundColor('#000000');
    setSubtitleFont('Arial');
  };
  
  return (
    <Container>
      <Section>
        <SectionTitle>Subtitle Tracks</SectionTitle>
        <TrackSelector>
          <Label>Subtitle Track:</Label>
          <Select
            value={currentTracks.subtitle || -1}
            onChange={(e) => handleSubtitleTrackChange(e.target.value)}
          >
            <option value={-1}>Disabled</option>
            {tracks.subtitle.map((track, index) => (
              <option key={track.id} value={track.id}>
                Track {track.id + 1} - {track.language || 'Unknown'} ({track.codec})
              </option>
            ))}
          </Select>
        </TrackSelector>
        
        <FilterRow>
          <Button primary onClick={handleLoadExternalSubtitle}>
            Load External Subtitle
          </Button>
          <Button onClick={handleSearchOnlineSubtitles}>
            Search Online
          </Button>
          <Button onClick={handleDownloadSubtitles}>
            Auto-Download
          </Button>
        </FilterRow>
      </Section>
      
      <Section>
        <SectionTitle>Subtitle Settings</SectionTitle>
        
        <FilterRow>
          <Label>Delay (ms):</Label>
          <Slider
            type="range"
            min="-5000"
            max="5000"
            step="100"
            value={subtitleDelay}
            onChange={(e) => setSubtitleDelay(parseInt(e.target.value))}
          />
          <SliderValue>{subtitleDelay}ms</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Font Size:</Label>
          <Slider
            type="range"
            min="10"
            max="50"
            value={subtitleSize}
            onChange={(e) => setSubtitleSize(parseInt(e.target.value))}
          />
          <SliderValue>{subtitleSize}px</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Font:</Label>
          <FontSelector
            value={subtitleFont}
            onChange={(e) => setSubtitleFont(e.target.value)}
          >
            {subtitleFonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </FontSelector>
        </FilterRow>
        
        <FilterRow>
          <Label>Text Color:</Label>
          <ColorPicker
            type="color"
            value={subtitleColor}
            onChange={(e) => setSubtitleColor(e.target.value)}
          />
          <SliderValue>{subtitleColor}</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Background:</Label>
          <ColorPicker
            type="color"
            value={subtitleBackgroundColor}
            onChange={(e) => setSubtitleBackgroundColor(e.target.value)}
          />
          <SliderValue>{subtitleBackgroundColor}</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Reset:</Label>
          <Button onClick={resetSubtitleSettings}>
            Reset Settings
          </Button>
        </FilterRow>
      </Section>
      
      <Section>
        <SectionTitle>Preview</SectionTitle>
        <SubtitlePreview>
          <PreviewText
            color={subtitleColor}
            size={subtitleSize}
            font={subtitleFont}
            backgroundColor={subtitleBackgroundColor}
          >
            This is a sample subtitle text
          </PreviewText>
        </SubtitlePreview>
      </Section>
    </Container>
  );
};

export default SubtitleControls;
