import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  setVideoFilter,
  setTracks,
  setCurrentTracks
} from '../store/slices/mediaSlice';

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

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  min-width: 120px;
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

const ToggleButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surfaceLight};
  color: ${props => props.active ? '#000' : props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.secondary : props.theme.colors.primary};
    color: #000;
  }
`;

const PresetButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PresetButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.surfaceLight};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: #000;
  }
`;

const VideoControls = () => {
  const dispatch = useDispatch();
  const { tracks, currentTracks, videoFilters } = useSelector(state => state.media);
  
  const [brightness, setBrightness] = useState(videoFilters.brightness);
  const [contrast, setContrast] = useState(videoFilters.contrast);
  const [saturation, setSaturation] = useState(videoFilters.saturation);
  const [hue, setHue] = useState(videoFilters.hue);
  const [gamma, setGamma] = useState(videoFilters.gamma);
  const [sharpen, setSharpen] = useState(videoFilters.sharpen);
  const [blur, setBlur] = useState(videoFilters.blur);
  
  // Video presets
  const videoPresets = {
    normal: { brightness: 0, contrast: 0, saturation: 0, hue: 0, gamma: 0, sharpen: 0, blur: 0 },
    vibrant: { brightness: 5, contrast: 10, saturation: 20, hue: 0, gamma: 0, sharpen: 2, blur: 0 },
    cinematic: { brightness: -5, contrast: 15, saturation: -10, hue: 0, gamma: 5, sharpen: 1, blur: 0 },
    vintage: { brightness: 10, contrast: -5, saturation: -20, hue: 10, gamma: 10, sharpen: 0, blur: 1 },
    blackwhite: { brightness: 0, contrast: 10, saturation: -100, hue: 0, gamma: 0, sharpen: 1, blur: 0 },
    warm: { brightness: 5, contrast: 5, saturation: 10, hue: 5, gamma: 0, sharpen: 0, blur: 0 },
    cool: { brightness: -5, contrast: 5, saturation: -10, hue: -5, gamma: 0, sharpen: 0, blur: 0 },
    dark: { brightness: -10, contrast: 20, saturation: -5, hue: 0, gamma: 10, sharpen: 0, blur: 0 }
  };
  
  useEffect(() => {
    // Apply brightness filter
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setVideoFilter('brightness', brightness !== 0);
    }
    dispatch(setVideoFilter({ filter: 'brightness', value: brightness }));
  }, [brightness, dispatch]);
  
  useEffect(() => {
    // Apply contrast filter
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setVideoFilter('contrast', contrast !== 0);
    }
    dispatch(setVideoFilter({ filter: 'contrast', value: contrast }));
  }, [contrast, dispatch]);
  
  useEffect(() => {
    // Apply saturation filter
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setVideoFilter('saturation', saturation !== 0);
    }
    dispatch(setVideoFilter({ filter: 'saturation', value: saturation }));
  }, [saturation, dispatch]);
  
  useEffect(() => {
    // Apply hue filter
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setVideoFilter('hue', hue !== 0);
    }
    dispatch(setVideoFilter({ filter: 'hue', value: hue }));
  }, [hue, dispatch]);
  
  useEffect(() => {
    // Apply gamma filter
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setVideoFilter('gamma', gamma !== 0);
    }
    dispatch(setVideoFilter({ filter: 'gamma', value: gamma }));
  }, [gamma, dispatch]);
  
  useEffect(() => {
    // Apply sharpen filter
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setVideoFilter('sharpen', sharpen !== 0);
    }
    dispatch(setVideoFilter({ filter: 'sharpen', value: sharpen }));
  }, [sharpen, dispatch]);
  
  useEffect(() => {
    // Apply blur filter
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setVideoFilter('blur', blur !== 0);
    }
    dispatch(setVideoFilter({ filter: 'blur', value: blur }));
  }, [blur, dispatch]);
  
  const handleVideoTrackChange = (trackId) => {
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setVideoTrack(parseInt(trackId));
      dispatch(setCurrentTracks({ video: parseInt(trackId) }));
    }
  };
  
  const applyVideoPreset = (presetName) => {
    const preset = videoPresets[presetName];
    if (preset) {
      setBrightness(preset.brightness);
      setContrast(preset.contrast);
      setSaturation(preset.saturation);
      setHue(preset.hue);
      setGamma(preset.gamma);
      setSharpen(preset.sharpen);
      setBlur(preset.blur);
    }
  };
  
  const resetVideoFilters = () => {
    applyVideoPreset('normal');
  };
  
  const takeScreenshot = async () => {
    if (window.electronAPI && window.electronAPI.vlc) {
      try {
        const screenshot = await window.electronAPI.vlc.takeScreenshot();
        if (screenshot) {
          alert('Screenshot saved successfully!');
        }
      } catch (error) {
        console.error('Screenshot error:', error);
        alert('Failed to take screenshot');
      }
    }
  };
  
  return (
    <Container>
      <Section>
        <SectionTitle>Video Tracks</SectionTitle>
        <FilterRow>
          <Label>Video Track:</Label>
          <Select
            value={currentTracks.video || -1}
            onChange={(e) => handleVideoTrackChange(e.target.value)}
          >
            <option value={-1}>Disabled</option>
            {tracks.video.map((track, index) => (
              <option key={track.id} value={track.id}>
                Track {track.id + 1} - {track.codec} ({track.width}x{track.height})
              </option>
            ))}
          </Select>
        </FilterRow>
      </Section>
      
      <Section>
        <SectionTitle>Video Presets</SectionTitle>
        <PresetButtons>
          <PresetButton onClick={() => applyVideoPreset('normal')}>Normal</PresetButton>
          <PresetButton onClick={() => applyVideoPreset('vibrant')}>Vibrant</PresetButton>
          <PresetButton onClick={() => applyVideoPreset('cinematic')}>Cinematic</PresetButton>
          <PresetButton onClick={() => applyVideoPreset('vintage')}>Vintage</PresetButton>
          <PresetButton onClick={() => applyVideoPreset('blackwhite')}>B&W</PresetButton>
          <PresetButton onClick={() => applyVideoPreset('warm')}>Warm</PresetButton>
          <PresetButton onClick={() => applyVideoPreset('cool')}>Cool</PresetButton>
          <PresetButton onClick={() => applyVideoPreset('dark')}>Dark</PresetButton>
        </PresetButtons>
      </Section>
      
      <Section>
        <SectionTitle>Video Adjustments</SectionTitle>
        
        <FilterRow>
          <Label>Brightness:</Label>
          <Slider
            type="range"
            min="-100"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
          />
          <SliderValue>{brightness}</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Contrast:</Label>
          <Slider
            type="range"
            min="-100"
            max="100"
            value={contrast}
            onChange={(e) => setContrast(parseInt(e.target.value))}
          />
          <SliderValue>{contrast}</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Saturation:</Label>
          <Slider
            type="range"
            min="-100"
            max="100"
            value={saturation}
            onChange={(e) => setSaturation(parseInt(e.target.value))}
          />
          <SliderValue>{saturation}</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Hue:</Label>
          <Slider
            type="range"
            min="-180"
            max="180"
            value={hue}
            onChange={(e) => setHue(parseInt(e.target.value))}
          />
          <SliderValue>{hue}°</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Gamma:</Label>
          <Slider
            type="range"
            min="-100"
            max="100"
            value={gamma}
            onChange={(e) => setGamma(parseInt(e.target.value))}
          />
          <SliderValue>{gamma}</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Sharpen:</Label>
          <Slider
            type="range"
            min="0"
            max="20"
            value={sharpen}
            onChange={(e) => setSharpen(parseInt(e.target.value))}
          />
          <SliderValue>{sharpen}</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Blur:</Label>
          <Slider
            type="range"
            min="0"
            max="20"
            value={blur}
            onChange={(e) => setBlur(parseInt(e.target.value))}
          />
          <SliderValue>{blur}</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Reset All:</Label>
          <ToggleButton onClick={resetVideoFilters}>
            Reset Filters
          </ToggleButton>
        </FilterRow>
        
        <FilterRow>
          <Label>Screenshot:</Label>
          <ToggleButton onClick={takeScreenshot}>
            📸 Take Screenshot
          </ToggleButton>
        </FilterRow>
      </Section>
    </Container>
  );
};

export default VideoControls;
