import React from 'react';
import { Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChatbotControl } from '../components/Dashboard/ChatbotControl';
import { YouTubeNotifications } from '../components/Chatbot/YouTubeNotifications';
import { CustomCommands } from '../components/Chatbot/CustomCommands';

const ChatbotPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h4" gutterBottom color="text.primary">
        {t('chatbotPage.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('chatbotPage.subtitle')}
      </Typography>

      <Grid container spacing={3}>
        {/* Chatbot Control */}
        <Grid size={12}>
          <ChatbotControl
            initialIsConnected={false}
            onConnect={async () => {
              try {
                await fetch('/api/chatbot/connect', { method: 'POST' });
                return;
              } catch (error) {
                console.error('Error connecting chatbot:', error);
                throw error;
              }
            }}
            onDisconnect={async () => {
              try {
                await fetch('/api/chatbot/disconnect', { method: 'POST' });
                return;
              } catch (error) {
                console.error('Error disconnecting chatbot:', error);
                throw error;
              }
            }}
          />
        </Grid>

        {/* YouTube Notifications */}
        <Grid size={12} md={6}>
          <YouTubeNotifications />
        </Grid>

        {/* Custom Commands */}
        <Grid size={12} md={6}>
          <CustomCommands />
        </Grid>
      </Grid>
    </>
  );
};

export default ChatbotPage;
