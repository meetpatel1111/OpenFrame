import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setCurrentView } from '../store/slices/appSlice';

const SidebarContainer = styled.div`
  width: 280px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  span {
    color: ${props => props.theme.colors.secondary};
  }
`;

const Tagline = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
`;

const NavMenu = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg} 0;
  overflow-y: auto;
`;

const NavItem = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
    border-left-color: ${props => props.theme.colors.primary};
  }
  
  &.active {
    background: ${props => props.theme.colors.surfaceLight};
    border-left-color: ${props => props.theme.colors.secondary};
    color: ${props => props.theme.colors.primary};
  }
`;

const NavIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentView } = useSelector(state => state.app);
  
  const menuItems = [
    { id: 'player', label: 'Player', icon: '▶' },
    { id: 'library', label: 'Media Library', icon: '📁' },
    { id: 'converter', label: 'Converter', icon: '⚡' },
    { id: 'recorder', label: 'Recorder', icon: '🎥' },
    { id: 'playlist', label: 'Playlists', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙' }
  ];
  
  const handleNavClick = (viewId) => {
    dispatch(setCurrentView(viewId));
  };
  
  return (
    <SidebarContainer>
      <SidebarHeader>
        <Logo>Open<span>Frame</span></Logo>
        <Tagline>Professional Media Suite</Tagline>
      </SidebarHeader>
      
      <NavMenu>
        {menuItems.map(item => (
          <NavItem
            key={item.id}
            className={currentView === item.id ? 'active' : ''}
            onClick={() => handleNavClick(item.id)}
          >
            <NavIcon>{item.icon}</NavIcon>
            <div>{item.label}</div>
          </NavItem>
        ))}
      </NavMenu>
    </SidebarContainer>
  );
};

export default Sidebar;
