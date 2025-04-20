import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { useTranslation } from 'react-i18next';

export const CustomCommands: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <CodeIcon />
          </Avatar>
        }
        title={t('customCommands.title')}
        subheader={t('customCommands.subtitle')}
      />
      
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info">
            {t('customCommands.comingSoon')}
          </Alert>
          
          <Typography variant="body2">
            {t('customCommands.description')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
