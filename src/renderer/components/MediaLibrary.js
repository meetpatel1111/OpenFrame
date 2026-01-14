import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  setLibraryItems,
  setLibraryFolders,
  setSortBy,
  setSortOrder,
  setFilterBy,
  setSearchQuery,
  setSelectedItems,
  setViewMode,
  scanLibrary,
  addToLibrary
} from '../store/slices/librarySlice';
import { showOpenDialog, addLibraryFolder } from '../store/slices/appSlice';

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
    color: ${props => props.primary ? '#000' : '#000'};
  }
`;

const SearchInput = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  background: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 2px;
`;

const ViewButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? '#000' : props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
`;

const Content = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const MediaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const MediaItem = styled.div`
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: #000;
    transform: translateY(-2px);
  }
  
  &.selected {
    background: ${props => props.theme.colors.secondary};
    color: #000;
    border-color: ${props => props.theme.colors.secondary};
  }
`;

const MediaThumbnail = styled.div`
  width: 100%;
  height: 120px;
  background: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
`;

const MediaTitle = styled.div`
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MediaInfo = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  justify-content: space-between;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const formatDuration = (seconds) => {
  if (!seconds) return '--:--';
  
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

const MediaLibrary = () => {
  const dispatch = useDispatch();
  const {
    items,
    folders,
    isScanning,
    sortBy,
    sortOrder,
    filterBy,
    searchQuery,
    selectedItems,
    viewMode
  } = useSelector(state => state.library);
  
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  // Mock data for demonstration
  const mockItems = [
    {
      id: 1,
      title: 'Sample Video 1',
      path: '/path/to/video1.mp4',
      duration: 120,
      size: 50000000,
      format: 'mp4',
      addedDate: new Date().toISOString(),
      lastPlayed: null,
      playCount: 0,
      rating: 0,
      tags: []
    },
    {
      id: 2,
      title: 'Sample Audio 1',
      path: '/path/to/audio1.mp3',
      duration: 180,
      size: 8000000,
      format: 'mp3',
      addedDate: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      playCount: 5,
      rating: 4,
      tags: ['music']
    },
    {
      id: 3,
      title: 'Sample Video 2',
      path: '/path/to/video2.mkv',
      duration: 3600,
      size: 2000000000,
      format: 'mkv',
      addedDate: new Date().toISOString(),
      lastPlayed: null,
      playCount: 0,
      rating: 0,
      tags: ['movie']
    }
  ];
  
  useEffect(() => {
    // Load mock data
    dispatch(setLibraryItems(mockItems));
  }, [dispatch]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearchQuery(localSearch));
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [localSearch, dispatch]);
  
  const handleAddFolder = async () => {
    try {
      const result = await dispatch(showOpenDialog({
        properties: ['openDirectory']
      })).unwrap();
      
      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        dispatch(addLibraryFolder(folderPath));
        dispatch(scanLibrary([folderPath]));
      }
    } catch (error) {
      console.error('Add folder error:', error);
    }
  };
  
  const handleAddFiles = async () => {
    try {
      const result = await dispatch(showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Media Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'mp3', 'flac', 'wav', 'webm', 'm4v'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })).unwrap();
      
      if (!result.canceled && result.filePaths.length > 0) {
        result.filePaths.forEach(filePath => {
          dispatch(addToLibrary(filePath));
        });
      }
    } catch (error) {
      console.error('Add files error:', error);
    }
  };
  
  const handleScanLibrary = () => {
    if (folders.length > 0) {
      dispatch(scanLibrary(folders));
    }
  };
  
  const handleItemClick = (item) => {
    // Play the selected item
    window.dispatchEvent(new CustomEvent('file-selected', { 
      detail: { filePath: item.path } 
    }));
  };
  
  const handleItemSelect = (item, event) => {
    event.stopPropagation();
    
    const isSelected = selectedItems.includes(item.id);
    if (isSelected) {
      dispatch(setSelectedItems(selectedItems.filter(id => id !== item.id)));
    } else {
      dispatch(setSelectedItems([...selectedItems, item.id]));
    }
  };
  
  const filteredItems = items.filter(item => {
    if (searchQuery) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });
  
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'duration':
        comparison = a.duration - b.duration;
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'addedDate':
        comparison = new Date(a.addedDate) - new Date(b.addedDate);
        break;
      case 'playCount':
        comparison = a.playCount - b.playCount;
        break;
      default:
        comparison = a.title.localeCompare(b.title);
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  const renderMediaItem = (item) => {
    const isSelected = selectedItems.includes(item.id);
    
    if (viewMode === 'grid') {
      return (
        <MediaItem
          key={item.id}
          className={isSelected ? 'selected' : ''}
          onClick={() => handleItemClick(item)}
          onContextMenu={(e) => handleItemSelect(item, e)}
        >
          <MediaThumbnail>
            {item.format.startsWith('video') ? '🎬' : '🎵'}
          </MediaThumbnail>
          <MediaTitle>{item.title}</MediaTitle>
          <MediaInfo>
            <span>{formatDuration(item.duration)}</span>
            <span>{formatFileSize(item.size)}</span>
          </MediaInfo>
        </MediaItem>
      );
    }
    
    return (
      <MediaItem
        key={item.id}
        className={isSelected ? 'selected' : ''}
        onClick={() => handleItemClick(item)}
        onContextMenu={(e) => handleItemSelect(item, e)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px' }}>
            {item.format.startsWith('video') ? '🎬' : '🎵'}
          </div>
          <div style={{ flex: 1 }}>
            <MediaTitle>{item.title}</MediaTitle>
            <MediaInfo>
              <span>{formatDuration(item.duration)}</span>
              <span>{formatFileSize(item.size)}</span>
              <span>{item.playCount} plays</span>
            </MediaInfo>
          </div>
        </div>
      </MediaItem>
    );
  };
  
  return (
    <Container>
      <Header>
        <Title>Media Library</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Search media..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          
          <Select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value))}
          >
            <option value="title">Title</option>
            <option value="duration">Duration</option>
            <option value="size">Size</option>
            <option value="addedDate">Date Added</option>
            <option value="playCount">Play Count</option>
          </Select>
          
          <Select
            value={sortOrder}
            onChange={(e) => dispatch(setSortOrder(e.target.value))}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
          
          <ViewToggle>
            <ViewButton
              active={viewMode === 'grid'}
              onClick={() => dispatch(setViewMode('grid'))}
            >
              Grid
            </ViewButton>
            <ViewButton
              active={viewMode === 'list'}
              onClick={() => dispatch(setViewMode('list'))}
            >
              List
            </ViewButton>
          </ViewToggle>
        </Controls>
      </Header>
      
      <Header>
        <Controls>
          <Button primary onClick={handleAddFiles}>
            Add Files
          </Button>
          <Button onClick={handleAddFolder}>
            Add Folder
          </Button>
          <Button onClick={handleScanLibrary} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Scan Library'}
          </Button>
        </Controls>
      </Header>
      
      <Content>
        {sortedItems.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📁</EmptyIcon>
            <h3>No media found</h3>
            <p>Add files or folders to start building your library</p>
          </EmptyState>
        ) : viewMode === 'grid' ? (
          <MediaGrid>
            {sortedItems.map(renderMediaItem)}
          </MediaGrid>
        ) : (
          <MediaList>
            {sortedItems.map(renderMediaItem)}
          </MediaList>
        )}
      </Content>
    </Container>
  );
};

export default MediaLibrary;
