import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.xl};
  min-width: 500px;
  max-width: 80%;
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const InputGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
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

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
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

const PresetButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
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

const NetworkDialog = ({ isOpen, onClose, onConfirm, url, setUrl }) => {
  if (!isOpen) return null;

  const streamPresets = [
    { name: 'YouTube', url: 'https://www.youtube.com/watch?v=VIDEO_ID' },
    { name: 'Twitch', url: 'https://www.twitch.tv/CHANNEL_NAME' },
    { name: 'RTSP Stream', url: 'rtsp://IP_ADDRESS:PORT/STREAM' },
    { name: 'HTTP Stream', url: 'http://IP_ADDRESS:PORT/STREAM' },
    { name: 'HLS Stream', url: 'https://example.com/playlist.m3u8' },
    { name: 'DASH Stream', url: 'https://example.com/manifest.mpd' },
    { name: 'IPTV M3U', url: 'https://example.com/playlist.m3u' },
    { name: 'Radio Stream', url: 'http://example.com/stream.mp3' }
  ];

  const handlePresetClick = (presetUrl) => {
    setUrl(presetUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Title>Open Network Stream</Title>
        
        <InputGroup>
          <Label>Stream URL:</Label>
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter stream URL (e.g., https://example.com/stream.mp4)"
            autoFocus
          />
        </InputGroup>

        <InputGroup>
          <Label>Quick Presets:</Label>
          <PresetButtons>
            {streamPresets.map((preset, index) => (
              <PresetButton
                key={index}
                onClick={() => handlePresetClick(preset.url)}
              >
                {preset.name}
              </PresetButton>
            ))}
          </PresetButtons>
        </InputGroup>

        <InputGroup>
          <Label>Supported Protocols:</Label>
          <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.4' }}>
            <div>• HTTP/HTTPS - Direct media streams</div>
            <div>• RTSP - IP cameras and surveillance</div>
            <div>• RTMP - Live streaming servers</div>
            <div>• HLS - Adaptive streaming (m3u8)</div>
            <div>• DASH - Adaptive streaming (mpd)</div>
            <div>• UDP/RTP - Multicast streams</div>
            <div>• M3U - IPTV playlists</div>
            <div>• Icecast - Audio streaming</div>
          </div>
        </InputGroup>

        <ButtonGroup>
          <Button onClick={onClose}>Cancel</Button>
          <Button primary onClick={handleSubmit}>Open Stream</Button>
        </ButtonGroup>
      </Dialog>
    </Overlay>
  );
};

export default NetworkDialog;
