// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles"; // Import ThemeProvider
import CssBaseline from "@mui/material/CssBaseline"; // Keep CssBaseline
import theme from "./assets/jss/material-dashboard-react.js"; // Import your theme

import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import AnalystDashboard from "./components/AnalystDashboard";
import ITDashboard from "./components/ITDashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      {/* Place ThemeProvider inside Router */}
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* CssBaseline here too, or in index.js, but ensures theme is applied */}
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Protected Routes using PrivateRoute */}
          <Route
            path="/user"
            element={
              <PrivateRoute allowedRoles={['User']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/analyst"
            element={
              <PrivateRoute allowedRoles={['Analyst']}>
                <AnalystDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/it"
            element={
              <PrivateRoute allowedRoles={['IT']}>
                <ITDashboard />
              </PrivateRoute>
            }
          />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;