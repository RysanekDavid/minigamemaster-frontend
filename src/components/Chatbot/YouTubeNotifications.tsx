import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';

interface YouTubeSettings {
  channelId: string;
  checkIntervalMinutes: number;
  notificationFormat: string;
  lastCheckedAt: string | null;
  lastVideoId: string | null;
}

interface TestChannelResult {
  success: boolean;
  channelTitle: string | null;
  videos: YouTubeVideo[];
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  channelTitle: string;
  url: string;
}

export const YouTubeNotifications: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<YouTubeSettings>({
    channelId: '',
    checkIntervalMinutes: 30,
    notificationFormat: '🔴 New video from {channelTitle}: {title} - {url}',
    lastCheckedAt: null,
    lastVideoId: null,
  });
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestChannelResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Fetch current settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/youtube/settings');
        if (!response.ok) {
          throw new Error(`Failed to fetch settings: ${response.statusText}`);
        }
        const data = await response.json();
        setSettings(data);
        setEnabled(!!data.channelId); // Enable if channelId is set
      } catch (err) {
        console.error('Error fetching YouTube settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // If disabled, clear the channelId
      const dataToSave = enabled ? settings : { ...settings, channelId: '' };
      
      const response = await fetch('/api/youtube/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to save settings: ${response.statusText}`);
      }
      
      setSuccess(t('youtube.saveSuccess'));
    } catch (err) {
      console.error('Error saving YouTube settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestChannel = async () => {
    if (!settings.channelId) {
      setError(t('youtube.noChannelId'));
      return;
    }
    
    setTesting(true);
    setError(null);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/youtube/test-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId: settings.channelId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to test channel: ${response.statusText}`);
      }
      
      const result = await response.json();
      setTestResult(result);
      
      if (!result.success) {
        setError(t('youtube.channelNotFound'));
      }
    } catch (err) {
      console.error('Error testing YouTube channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to test channel');
    } finally {
      setTesting(false);
    }
  };

  const handleCheckNow = async () => {
    if (!settings.channelId) {
      setError(t('youtube.noChannelId'));
      return;
    }
    
    setChecking(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/youtube/check-now', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to check for videos: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.newVideoFound) {
        setSuccess(t('youtube.newVideoFound', { title: result.video.title }));
      } else {
        setSuccess(t('youtube.noNewVideos'));
      }
      
      // Refresh settings to get updated lastCheckedAt
      const settingsResponse = await fetch('/api/youtube/settings');
      if (settingsResponse.ok) {
        const updatedSettings = await settingsResponse.json();
        setSettings(updatedSettings);
      }
    } catch (err) {
      console.error('Error checking for new videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for videos');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'error.main' }}>
            <YouTubeIcon />
          </Avatar>
        }
        title={t('youtube.title')}
        subheader={t('youtube.subtitle')}
        action={
          <Tooltip title={t('youtube.helpTooltip')}>
            <IconButton onClick={() => setShowHelp(!showHelp)}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        }
      />
      
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Collapse in={showHelp}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">{t('youtube.helpText')}</Typography>
            </Alert>
          </Collapse>
          
          {/* Enable/Disable Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                disabled={loading || saving}
              />
            }
            label={t('youtube.enableNotifications')}
          />
          
          <Divider />
          
          {/* Channel ID */}
          <TextField
            label={t('youtube.channelId')}
            value={settings.channelId}
            onChange={(e) => setSettings({ ...settings, channelId: e.target.value })}
            disabled={!enabled || loading || saving}
            fullWidth
            helperText={t('youtube.channelIdHelp')}
            size="small"
          />
          
          {/* Test Channel Button */}
          <Button
            variant="outlined"
            onClick={handleTestChannel}
            disabled={!enabled || !settings.channelId || loading || saving || testing}
            startIcon={testing ? <CircularProgress size={20} /> : <RefreshIcon />}
            size="small"
          >
            {testing ? t('common.testing') : t('youtube.testChannel')}
          </Button>
          
          {/* Test Results */}
          {testResult && testResult.success && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="success.main">
                {t('youtube.channelFound', { name: testResult.channelTitle })}
              </Typography>
              {testResult.videos.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">{t('youtube.latestVideos')}:</Typography>
                  <Box sx={{ ml: 2 }}>
                    {testResult.videos.map((video) => (
                      <Typography key={video.videoId} variant="caption" display="block">
                        • {video.title} ({new Date(video.publishedAt).toLocaleDateString()})
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          <Divider />
          
          {/* Check Interval */}
          <TextField
            label={t('youtube.checkInterval')}
            type="number"
            value={settings.checkIntervalMinutes}
            onChange={(e) => setSettings({ ...settings, checkIntervalMinutes: parseInt(e.target.value) || 30 })}
            disabled={!enabled || loading || saving}
            inputProps={{ min: 5, max: 1440 }}
            fullWidth
            helperText={t('youtube.checkIntervalHelp')}
            size="small"
          />
          
          {/* Notification Format */}
          <TextField
            label={t('youtube.notificationFormat')}
            value={settings.notificationFormat}
            onChange={(e) => setSettings({ ...settings, notificationFormat: e.target.value })}
            disabled={!enabled || loading || saving}
            fullWidth
            multiline
            rows={2}
            helperText={t('youtube.notificationFormatHelp')}
            size="small"
          />
          
          {/* Last Checked Info */}
          {settings.lastCheckedAt && (
            <Typography variant="caption" color="text.secondary">
              {t('youtube.lastChecked')}: {new Date(settings.lastCheckedAt).toLocaleString()}
            </Typography>
          )}
          
          {/* Check Now Button */}
          <Button
            variant="outlined"
            onClick={handleCheckNow}
            disabled={!enabled || !settings.channelId || loading || saving || checking}
            startIcon={checking ? <CircularProgress size={20} /> : <PlayArrowIcon />}
            size="small"
          >
            {checking ? t('common.checking') : t('youtube.checkNow')}
          </Button>
          
          {/* Error and Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 1 }}>
              {success}
            </Alert>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || saving}
          fullWidth
        >
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </CardActions>
    </Card>
  );
};
