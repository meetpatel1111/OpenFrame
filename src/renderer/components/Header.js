import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { showOpenDialog, toggleFullscreen } from '../store/slices/appSlice';

const HeaderContainer = styled.div`
  height: 60px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${props => props.theme.spacing.lg};
`;

const HeaderTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const HeaderControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.surfaceLight};
  color: ${props => props.primary ? '#000' : props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? props.theme.colors.secondary : props.theme.colors.primary};
    color: ${props => props.primary ? '#000' : '#000'};
    transform: translateY(-1px);
  }
`;

const Header = ({ title }) => {
  const dispatch = useDispatch();
  
  const handleOpenFile = async () => {
    try {
      const result = await dispatch(showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Media Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'mp3', 'flac', 'wav', 'webm', 'm4v'] },
          { name: 'Video Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'm4v'] },
          { name: 'Audio Files', extensions: ['mp3', 'flac', 'wav', 'aac', 'ogg', 'm4a'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })).unwrap();
      
      if (!result.canceled && result.filePaths.length > 0) {
        // Handle file opening - this will be handled by the Player component
        window.dispatchEvent(new CustomEvent('file-selected', { 
          detail: { filePath: result.filePaths[0] } 
        }));
      }
    } catch (error) {
      console.error('Open file error:', error);
    }
  };
  
  const handleOpenFolder = async () => {
    try {
      const result = await dispatch(showOpenDialog({
        properties: ['openDirectory']
      })).unwrap();
      
      if (!result.canceled && result.filePaths.length > 0) {
        // Handle folder opening
        window.dispatchEvent(new CustomEvent('folder-selected', { 
          detail: { folderPath: result.filePaths[0] } 
        }));
      }
    } catch (error) {
      console.error('Open folder error:', error);
    }
  };
  
  const handleFullscreen = () => {
    dispatch(toggleFullscreen());
  };
  
  return (
    <HeaderContainer>
      <HeaderTitle>{title}</HeaderTitle>
      
      <HeaderControls>
        <Button onClick={handleOpenFile}>
          Open File
        </Button>
        
        <Button onClick={handleOpenFolder}>
          Open Folder
        </Button>
        
        <Button onClick={handleFullscreen}>
          Fullscreen
        </Button>
      </HeaderControls>
    </HeaderContainer>
  );
};

export default Header;
