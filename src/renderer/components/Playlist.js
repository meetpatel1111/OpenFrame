import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

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

const Content = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${props => props.theme.spacing.lg};
`;

const PlaylistSidebar = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
`;

const PlaylistItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
  }
  
  &.active {
    background: ${props => props.theme.colors.primary};
    color: #000;
  }
`;

const PlaylistContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: #000;
    transform: translateX(4px);
  }
  
  &.playing {
    background: ${props => props.theme.colors.secondary};
    color: #000;
  }
`;

const TrackNumber = styled.div`
  width: 30px;
  text-align: center;
  font-weight: 500;
`;

const TrackInfo = styled.div`
  flex: 1;
  margin-left: ${props => props.theme.spacing.md};
`;

const TrackTitle = styled.div`
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const TrackDetails = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const TrackDuration = styled.div`
  margin-left: ${props => props.theme.spacing.md};
  font-family: 'Courier New', monospace;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
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

const Playlist = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(1);
  
  // Mock playlists data
  const playlists = [
    { id: 1, name: 'All Music', count: 25, duration: 5400 },
    { id: 2, name: 'Favorites', count: 8, duration: 1800 },
    { id: 3, name: 'Recently Added', count: 12, duration: 3600 },
    { id: 4, name: 'Workout Mix', count: 15, duration: 2700 },
    { id: 5, name: 'Chill Vibes', count: 20, duration: 4800 }
  ];
  
  // Mock tracks data
  const tracks = [
    {
      id: 1,
      title: 'Summer Breeze',
      artist: 'Acoustic Dreams',
      album: 'Relaxation',
      duration: 180,
      path: '/path/to/track1.mp3'
    },
    {
      id: 2,
      title: 'City Lights',
      artist: 'Urban Jazz',
      album: 'Night Sessions',
      duration: 240,
      path: '/path/to/track2.mp3'
    },
    {
      id: 3,
      title: 'Mountain Echo',
      artist: 'Nature Sounds',
      album: 'Ambient Collection',
      duration: 300,
      path: '/path/to/track3.mp3'
    },
    {
      id: 4,
      title: 'Ocean Waves',
      artist: 'Coastal Vibes',
      album: 'Beach Relaxation',
      duration: 220,
      path: '/path/to/track4.mp3'
    },
    {
      id: 5,
      title: 'Forest Rain',
      artist: 'Nature Sounds',
      album: 'Ambient Collection',
      duration: 280,
      path: '/path/to/track5.mp3'
    }
  ];
  
  const currentPlaylist = playlists.find(p => p.id === selectedPlaylist);
  
  const handleCreatePlaylist = () => {
    const name = prompt('Enter playlist name:');
    if (name) {
      // Create new playlist logic
      console.log('Creating playlist:', name);
    }
  };
  
  const handleTrackClick = (track) => {
    // Play the track
    window.dispatchEvent(new CustomEvent('file-selected', { 
      detail: { filePath: track.path } 
    }));
  };
  
  return (
    <Container>
      <Header>
        <Title>Playlists</Title>
        <Controls>
          <Button primary onClick={handleCreatePlaylist}>
            New Playlist
          </Button>
          <Button>
            Import Playlist
          </Button>
          <Button>
            Shuffle All
          </Button>
        </Controls>
      </Header>
      
      <Content>
        <PlaylistSidebar>
          <h3 style={{ marginBottom: '16px', color: '#fff' }}>My Playlists</h3>
          {playlists.map(playlist => (
            <PlaylistItem
              key={playlist.id}
              className={selectedPlaylist === playlist.id ? 'active' : ''}
              onClick={() => setSelectedPlaylist(playlist.id)}
            >
              <div style={{ fontWeight: '500' }}>{playlist.name}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {playlist.count} tracks • {formatDuration(playlist.duration)}
              </div>
            </PlaylistItem>
          ))}
        </PlaylistSidebar>
        
        <PlaylistContent>
          <h3 style={{ marginBottom: '16px', color: '#fff' }}>
            {currentPlaylist?.name}
          </h3>
          
          {tracks.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3>No tracks in playlist</h3>
              <p>Add some tracks to get started</p>
            </EmptyState>
          ) : (
            <TrackList>
              {tracks.map((track, index) => (
                <TrackItem
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                >
                  <TrackNumber>{index + 1}</TrackNumber>
                  <TrackInfo>
                    <TrackTitle>{track.title}</TrackTitle>
                    <TrackDetails>
                      {track.artist} • {track.album}
                    </TrackDetails>
                  </TrackInfo>
                  <TrackDuration>{formatDuration(track.duration)}</TrackDuration>
                </TrackItem>
              ))}
            </TrackList>
          )}
        </PlaylistContent>
      </Content>
    </Container>
  );
};

export default Playlist;
