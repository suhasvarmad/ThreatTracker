import React, { useEffect, useState, useCallback } from 'react';
import { fetchTickets, updateTicketStatus } from '../services/api';
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
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

function ITDashboard() {
  const [tickets, setTickets] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ text: '', severity: 'info', open: false });
  const [loadingTickets, setLoadingTickets] = useState(true);

  const orgId = localStorage.getItem('organizationId');
  const username = localStorage.getItem('username');

  const handleCloseSnackbar = () => {
    setStatusMessage({ ...statusMessage, open: false });
  };

  const loadTickets = useCallback(() => {
    if (!orgId) {
      setStatusMessage({ text: 'Error: No organization ID found. Cannot fetch tickets.', severity: 'error', open: true });
      setLoadingTickets(false);
      return;
    }

    setLoadingTickets(true);
    fetchTickets(orgId)
      .then((res) => {
        setTickets(res.data.tickets || []);
        setLoadingTickets(false);
      })
      .catch((err) => {
        console.error('Error fetching tickets:', err);
        setTickets([]);
        setStatusMessage({ text: 'Error fetching tickets', severity: 'error', open: true });
        setLoadingTickets(false);
      });
  }, [orgId]);

  useEffect(() => {
    loadTickets();
    const intervalId = setInterval(loadTickets, 5000);
    return () => clearInterval(intervalId);
  }, [loadTickets]);

  const handleUpdateStatus = (ticketId, newStatus) => {
    updateTicketStatus(ticketId, newStatus)
      .then(() => {
        setStatusMessage({ text: `Ticket ${ticketId} updated to ${newStatus}`, severity: 'success', open: true });
        loadTickets();
      })
      .catch((err) => {
        console.error('Error updating ticket:', err);
        setStatusMessage({ text: 'Error updating ticket status', severity: 'error', open: true });
      });
  };

  return (
    // <DashboardLayout> // Removed wrapper here
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Welcome, {username}!
          <Typography variant="subtitle1" color="text.secondary">
            IT Dashboard - Open Tickets (Org ID: {orgId || 'N/A'})
          </Typography>
        </Typography>

        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardHeader
            title="Tickets for Remediation"
            avatar={<AssignmentIcon color="info" />}
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
          />
          <CardContent>
            {loadingTickets ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading tickets...</Typography>
              </Box>
            ) : tickets.length === 0 ? (
              <Typography sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>No tickets found for this organization.</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="tickets table">
                  <TableHead sx={{ backgroundColor: 'primary.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Ticket ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Alert ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'common.white' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'common.white' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket._id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">{ticket._id}</TableCell>
                        <TableCell>{ticket.alertId}</TableCell>
                        <TableCell>{ticket.description}</TableCell>
                        <TableCell>
                          <Alert
                            severity={
                              ticket.status === 'Open' ? 'error' :
                              ticket.status === 'in-progress' ? 'info' :
                              'success'
                            }
                            icon={false}
                            sx={{ p: '0 8px', py: '4px', display: 'inline-flex' }}
                          >
                            {ticket.status}
                          </Alert>
                        </TableCell>
                        <TableCell align="right">
                          {ticket.status !== 'closed' && (
                            <>
                              {ticket.status !== 'in-progress' && (
                                <Button
                                  variant="outlined"
                                  color="info"
                                  size="small"
                                  onClick={() => handleUpdateStatus(ticket._id, 'in-progress')}
                                  sx={{ mr: 1, my: 0.5 }}
                                >
                                  Mark In Progress
                                </Button>
                              )}
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleUpdateStatus(ticket._id, 'closed')}
                                sx={{ my: 0.5 }}
                              >
                                Close Ticket
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Snackbar open={statusMessage.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={statusMessage.severity} sx={{ width: '100%' }}>
            {statusMessage.text}
          </Alert>
        </Snackbar>
      </Box>
    // </DashboardLayout> // Removed wrapper here
  );
}

export default ITDashboard;