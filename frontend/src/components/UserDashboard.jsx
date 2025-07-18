import React, { useState } from 'react';
import { triggerAlert } from '../services/api';
import { // Removed DashboardLayout import
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Link,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LinkIcon from '@mui/icons-material/Link';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

function UserDashboard() {
  const [status, setStatus] = useState({ text: '', severity: 'info', open: false });
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem('userId');
  const orgId = localStorage.getItem('organizationId');
  const username = localStorage.getItem('username');

  const handleCloseSnackbar = () => {
    setStatus({ ...status, open: false });
  };

  const handleMaliciousClick = async (link) => {
    setLoading(true);
    setStatus({ text: '', severity: 'info', open: false });

    const freshToken = localStorage.getItem('token');
    if (!freshToken) {
      setStatus({ text: 'Error: You must be logged in to report a malicious link.', severity: 'error', open: true });
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      setLoading(false);
      return;
    }

    try {
      await triggerAlert(userId, `User clicked a malicious link: ${link}`);
      setStatus({ text: `✅ Alert raised for malicious link: ${link}`, severity: 'success', open: true });
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;
      console.error('Error raising alert:', errMsg);
      setStatus({ text: `❌ Error: ${errMsg}`, severity: 'error', open: true });

      if (errMsg === 'Token has expired') {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // <DashboardLayout> // Removed wrapper here
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Welcome, {username}!
          <Typography variant="subtitle1" color="text.secondary">
            User Dashboard (Org ID: {orgId || 'N/A'})
          </Typography>
        </Typography>

        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardHeader
            title="Report Suspicious Activity"
            avatar={<ReportProblemIcon color="primary" />}
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
          />
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              If you encounter any suspicious links or behavior, please click the corresponding button below to report it.
              An alert will be sent to our security team for investigation.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="text.secondary" sx={{ mt: 2 }}>
                Normal Links:
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon><LinkIcon color="action" /></ListItemIcon>
                  <ListItemText>
                    <Link href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer" color="primary">
                      https://www.wikipedia.org
                    </Link>
                  </ListItemText>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon><LinkIcon color="action" /></ListItemIcon>
                  <ListItemText>
                    <Link href="https://www.google.com" target="_blank" rel="noopener noreferrer" color="primary">
                      https://www.google.com
                    </Link>
                  </ListItemText>
                </ListItem>
              </List>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="error.main" sx={{ mt: 2 }}>
                Malicious Links (Clicking will raise an alert!):
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<NotificationsActiveIcon />}
                onClick={() => handleMaliciousClick('http://malicious-site.com/phishing')}
                disabled={loading}
                sx={{ mr: 2, mb: 1 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Report Phishing Link'}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<NotificationsActiveIcon />}
                onClick={() => handleMaliciousClick('http://badactor.com/malware')}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Report Malware Link'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Snackbar open={status.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={status.severity} sx={{ width: '100%' }}>
            {status.text}
          </Alert>
        </Snackbar>
      </Box>
    // </DashboardLayout> // Removed wrapper here
  );
}

export default UserDashboard;