import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  setAudioFilter,
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
  min-width: 100px;
`;

const EqualizerContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.sm};
  height: 120px;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const EQBand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

const EQSlider = styled.input`
  writing-mode: bt-lr; /* IE */
  -webkit-appearance: slider-vertical; /* WebKit */
  width: 80px;
  height: 80px;
  background: transparent;
  outline: none;
  cursor: pointer;
`;

const EQLabel = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const EQValue = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
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
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: ${props => props.theme.colors.text};
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

const AudioControls = () => {
  const dispatch = useDispatch();
  const { tracks, currentTracks, audioFilters } = useSelector(state => state.media);
  
  const [localEQ, setLocalEQ] = useState(audioFilters.equalizer);
  const [bassBoost, setBassBoost] = useState(audioFilters.bassBoost);
  const [trebleBoost, setTrebleBoost] = useState(audioFilters.trebleBoost);
  const [compressor, setCompressor] = useState(audioFilters.compressor);
  const [spatializer, setSpatializer] = useState(audioFilters.spatializer);
  
  // EQ frequencies (Hz)
  const eqFrequencies = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
  
  // EQ presets
  const eqPresets = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    rock: [5, 4, 3, 1, 0, -1, 1, 3, 4, 5],
    pop: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2],
    jazz: [3, 2, 1, 2, -2, -2, 0, 1, 3, 3],
    classical: [4, 3, 1, 0, -2, -2, 0, 2, 3, 4],
    electronic: [5, 4, 3, 0, -1, -1, 0, 2, 4, 5],
    vocal: [-1, 0, 2, 4, 4, 2, 0, -1, -2, -2]
  };
  
  useEffect(() => {
    // Apply EQ changes
    dispatch(setAudioFilter({ filter: 'equalizer', value: localEQ }));
  }, [localEQ, dispatch]);
  
  useEffect(() => {
    // Apply bass boost
    dispatch(setAudioFilter({ filter: 'bassBoost', value: bassBoost }));
  }, [bassBoost, dispatch]);
  
  useEffect(() => {
    // Apply treble boost
    dispatch(setAudioFilter({ filter: 'trebleBoost', value: trebleBoost }));
  }, [trebleBoost, dispatch]);
  
  useEffect(() => {
    // Apply compressor
    dispatch(setAudioFilter({ filter: 'compressor', value: compressor }));
  }, [compressor, dispatch]);
  
  useEffect(() => {
    // Apply spatializer
    dispatch(setAudioFilter({ filter: 'spatializer', value: spatializer }));
  }, [spatializer, dispatch]);
  
  const handleAudioTrackChange = (trackId) => {
    if (window.electronAPI && window.electronAPI.vlc) {
      window.electronAPI.vlc.setAudioTrack(parseInt(trackId));
      dispatch(setCurrentTracks({ audio: parseInt(trackId) }));
    }
  };
  
  const handleEQBandChange = (bandIndex, value) => {
    const newEQ = [...localEQ];
    newEQ[bandIndex] = parseInt(value);
    setLocalEQ(newEQ);
  };
  
  const applyEQPreset = (presetName) => {
    const preset = eqPresets[presetName];
    if (preset) {
      setLocalEQ(preset);
    }
  };
  
  const resetAudioFilters = () => {
    setLocalEQ(eqPresets.flat);
    setBassBoost(0);
    setTrebleBoost(0);
    setCompressor(false);
    setSpatializer(false);
  };
  
  return (
    <Container>
      <Section>
        <SectionTitle>Audio Tracks</SectionTitle>
        <TrackSelector>
          <Label>Audio Track:</Label>
          <Select
            value={currentTracks.audio || -1}
            onChange={(e) => handleAudioTrackChange(e.target.value)}
          >
            <option value={-1}>Disabled</option>
            {tracks.audio.map((track, index) => (
              <option key={track.id} value={track.id}>
                Track {track.id + 1} - {track.language || 'Unknown'} ({track.codec})
              </option>
            ))}
          </Select>
        </TrackSelector>
      </Section>
      
      <Section>
        <SectionTitle>Equalizer</SectionTitle>
        <PresetButtons>
          <PresetButton onClick={() => applyEQPreset('flat')}>Flat</PresetButton>
          <PresetButton onClick={() => applyEQPreset('rock')}>Rock</PresetButton>
          <PresetButton onClick={() => applyEQPreset('pop')}>Pop</PresetButton>
          <PresetButton onClick={() => applyEQPreset('jazz')}>Jazz</PresetButton>
          <PresetButton onClick={() => applyEQPreset('classical')}>Classical</PresetButton>
          <PresetButton onClick={() => applyEQPreset('electronic')}>Electronic</PresetButton>
          <PresetButton onClick={() => applyEQPreset('vocal')}>Vocal</PresetButton>
        </PresetButtons>
        
        <EqualizerContainer>
          {eqFrequencies.map((freq, index) => (
            <EQBand key={freq}>
              <EQValue>{localEQ[index]}dB</EQValue>
              <EQSlider
                type="range"
                min="-12"
                max="12"
                value={localEQ[index]}
                onChange={(e) => handleEQBandChange(index, e.target.value)}
                orient="vertical"
              />
              <EQLabel>{freq}</EQLabel>
            </EQBand>
          ))}
        </EqualizerContainer>
      </Section>
      
      <Section>
        <SectionTitle>Audio Effects</SectionTitle>
        
        <FilterRow>
          <Label>Bass Boost:</Label>
          <Slider
            type="range"
            min="0"
            max="20"
            value={bassBoost}
            onChange={(e) => setBassBoost(parseInt(e.target.value))}
          />
          <SliderValue>{bassBoost}dB</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Treble Boost:</Label>
          <Slider
            type="range"
            min="0"
            max="20"
            value={trebleBoost}
            onChange={(e) => setTrebleBoost(parseInt(e.target.value))}
          />
          <SliderValue>{trebleBoost}dB</SliderValue>
        </FilterRow>
        
        <FilterRow>
          <Label>Compressor:</Label>
          <ToggleButton
            active={compressor}
            onClick={() => setCompressor(!compressor)}
          >
            {compressor ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </FilterRow>
        
        <FilterRow>
          <Label>Spatializer:</Label>
          <ToggleButton
            active={spatializer}
            onClick={() => setSpatializer(!spatializer)}
          >
            {spatializer ? 'Enabled' : 'Disabled'}
          </ToggleButton>
        </FilterRow>
        
        <FilterRow>
          <Label>Reset All:</Label>
          <ToggleButton onClick={resetAudioFilters}>
            Reset Filters
          </ToggleButton>
        </FilterRow>
      </Section>
    </Container>
  );
};

export default AudioControls;
