import React, { useEffect, useState, useCallback } from 'react';
import { fetchAlerts, classifyAlert, createTicket } from '../services/api';
import axios from 'axios';
// Removed DashboardLayout import
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

function AnalystDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ text: '', severity: 'info', open: false });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '', organizationId: '' });
  const [canCreateUsers, setCanCreateUsers] = useState(false);
  const [organizations, setOrganizations] = useState([]);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const userOrgId = localStorage.getItem('organizationId');
  const username = localStorage.getItem('username');


  const handleCloseSnackbar = () => {
    setStatusMessage({ ...statusMessage, open: false });
  };

  const loadAlerts = useCallback(() => {
    setLoadingAlerts(true);
    fetchAlerts(userRole === 'Analyst' && userOrgId ? userOrgId : null)
      .then((res) => {
        setAlerts(res.data.alerts || []);
        setLoadingAlerts(false);
      })
      .catch((err) => {
        console.error('Error fetching alerts:', err);
        setStatusMessage({ text: 'Failed to load alerts.', severity: 'error', open: true });
        setLoadingAlerts(false);
      });
  }, [userRole, userOrgId]);

  useEffect(() => {
    const storedCanCreateUsers = localStorage.getItem('can_create_users') === 'true';
    setCanCreateUsers(storedCanCreateUsers);

    axios.get("http://localhost:5000/api/organizations")
      .then((res) => {
        setOrganizations(
          Array.isArray(res.data.organizations) ? res.data.organizations : []
        );
      })
      .catch((err) => {
        console.error("Failed to load organizations:", err);
        setStatusMessage({ text: "Failed to load organizations for user creation.", severity: "error", open: true });
      });

    loadAlerts();
    const intervalId = setInterval(loadAlerts, 5000);
    return () => clearInterval(intervalId);
  }, [loadAlerts]);

  const handleClassify = (alertId, type) => {
    classifyAlert(alertId, type)
      .then(() => {
        setStatusMessage({ text: `Alert ${alertId} classified as ${type}`, severity: 'success', open: true });
        loadAlerts();
      })
      .catch((err) => {
        console.error('Error classifying alert:', err);
        setStatusMessage({ text: 'Error classifying alert', severity: 'error', open: true });
      });
  };

  const handleCreateTicket = (alertId) => {
    const description = prompt('Enter ticket description:');
    if (description) {
      createTicket(alertId, description)
        .then(() => {
          setStatusMessage({ text: `Ticket created for alert ${alertId}`, severity: 'success', open: true });
          loadAlerts();
        })
        .catch((err) => {
          console.error('Error creating ticket:', err);
          setStatusMessage({ text: 'Error creating ticket', severity: 'error', open: true });
        });
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.role || (newUser.role !== 'Analyst' && !newUser.organizationId)) {
      setStatusMessage({ text: 'Please fill all required fields to create user.', severity: 'warning', open: true });
      return;
    }
    try {
      const res = await axios.post(
        'http://localhost:5000/api/register',
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setStatusMessage({ text: 'User created successfully!', severity: 'success', open: true });
        setNewUser({ username: '', password: '', role: '', organizationId: '' });
      } else {
        setStatusMessage({ text: res.data.error, severity: 'error', open: true });
      }
    } catch (err) {
      setStatusMessage({ text: err.response?.data?.error || 'Error creating user', severity: 'error', open: true });
    }
  };

  return (
    // <DashboardLayout> // Removed wrapper here
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Welcome, {username}!
          <Typography variant="subtitle1" color="text.secondary">
            Analyst Dashboard - Incoming Alerts
          </Typography>
        </Typography>

        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardHeader
            title="Active Alerts"
            avatar={<WarningIcon color="error" />}
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
          />
          <CardContent>
            {loadingAlerts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading alerts...</Typography>
              </Box>
            ) : alerts.length > 0 ? (
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="alerts table">
                  <TableHead sx={{ backgroundColor: 'primary.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Alert ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>User ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Organization</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Message</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'common.white' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow
                        key={alert._id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">{alert._id}</TableCell>
                        <TableCell>{alert.userId}</TableCell>
                        <TableCell>{alert.organizationId}</TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>
                          <Alert
                            severity={alert.status === 'New' ? 'info' : alert.status === 'Classified' ? 'warning' : 'success'}
                            icon={false}
                            sx={{ p: '0 8px', py: '4px', display: 'inline-flex' }}
                          >
                            {alert.status}
                          </Alert>
                        </TableCell>
                        <TableCell>{alert.type || 'N/A'}</TableCell>
                        <TableCell align="right">
                          {alert.status === 'New' && (
                            <Box>
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={() => handleClassify(alert._id, 'Spam')}
                                sx={{ mr: 1, my: 0.5 }}
                              >
                                Mark as Spam
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleClassify(alert._id, 'Threat')}
                                sx={{ my: 0.5 }}
                              >
                                Mark as Threat
                              </Button>
                            </Box>
                          )}
                          {alert.status === 'Classified' && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleCreateTicket(alert._id)}
                            >
                              Create Ticket
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>No alerts found.</Typography>
            )}
          </CardContent>
        </Card>

        {canCreateUsers && (
          <Card sx={{ mt: 4, boxShadow: 3 }}>
            <CardHeader
              title="Create New User"
              avatar={<GroupAddIcon color="secondary" />}
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                variant="outlined"
                value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              />
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="">Select Role</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Analyst">Analyst</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Organization (Optional for Analyst)</InputLabel>
                <Select
                  value={newUser.organizationId}
                  onChange={e => setNewUser({ ...newUser, organizationId: e.target.value })}
                  label="Organization (Optional for Analyst)"
                  disabled={newUser.role === 'Analyst'}
                >
                  <MenuItem value="">Select Organization</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCreateUser}
                sx={{ mt: 2 }}
              >
                Create User
              </Button>
            </CardContent>
          </Card>
        )}

        <Snackbar open={statusMessage.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={statusMessage.severity} sx={{ width: '100%' }}>
            {statusMessage.text}
          </Alert>
        </Snackbar>
      </Box>
    // </DashboardLayout> // Removed wrapper here
  );
}

export default AnalystDashboard;