import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FeatureList = styled.ul`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
`;

const Settings = () => {
  return (
    <Container>
      <Title>Settings</Title>
      <Description>
        Comprehensive application settings and preferences management.
      </Description>
      <FeatureList>
        <li>General preferences</li>
        <li>Playback settings</li>
        <li>Audio and video preferences</li>
        <li>Library management</li>
        <li>Conversion presets</li>
        <li>Keyboard shortcuts</li>
        <li>Theme customization</li>
        <li>Network and streaming settings</li>
      </FeatureList>
    </Container>
  );
};

export default Settings;
