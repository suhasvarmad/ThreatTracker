import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Avatar,
  CircularProgress,
  Fade,
  Alert,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  useTheme, // Added useTheme hook
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", severity: "error" });
  const [darkMode, setDarkMode] = useState(false); // State for dark mode
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme(); // Access the current theme for background/card colors

  useEffect(() => {
    // Fetch organizations
    axios
      .get("http://localhost:5000/api/organizations")
      .then((res) => {
        setOrganizations(
          Array.isArray(res.data.organizations) ? res.data.organizations : []
        );
      })
      .catch((err) => {
        console.error(err);
        setMessage({ text: "Failed to load organizations", severity: "error" });
      });

    // Apply dark mode preference if stored (optional, for persistent dark mode)
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    // You would typically update the MUI theme palette type here if not using a global context
    // For now, it just changes the local background.
  }, []);

  const handleSubmit = async () => {
    if (!username || !password) {
      setMessage({ text: "Please fill all fields", severity: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", severity: "error" });

    try {
      if (mode === "login") {
        const payload = { username, password };
        if (organizationId) payload.organizationId = organizationId;

        const res = await axios.post("http://localhost:5000/api/login", payload);

        if (res.data.success) {
          const user = res.data.user;

          if ((user.role === "User" || user.role === "IT") && !organizationId) {
            setMessage({
              text: "Please select an organization",
              severity: "error",
            });
            setLoading(false);
            return;
          }

          localStorage.setItem("token", res.data.token);
          localStorage.setItem("userId", user.id);
          localStorage.setItem("username", user.username); // Store username for display
          if (user.organizationId)
            localStorage.setItem("organizationId", user.organizationId);
          localStorage.setItem("role", user.role);

          if (user.can_create_users) {
            localStorage.setItem("can_create_users", "true");
          } else {
            localStorage.removeItem("can_create_users");
          }

          navigate(
            user.role === "User"
              ? "/user"
              : user.role === "Analyst"
              ? "/analyst"
              : "/it"
          );
        } else {
          setMessage({ text: res.data.error || "Login failed", severity: "error" });
        }
      } else { // Change password mode
        if (!newPassword) {
          setMessage({ text: "Please enter new password", severity: "error" });
          setLoading(false);
          return;
        }

        const res = await axios.post(
          "http://localhost:5000/api/change-password",
          {
            username,
            oldPassword: password,
            newPassword,
          }
        );

        if (res.data.success) {
          setMessage({ text: "Password changed. Please login.", severity: "success" });
          setMode("login");
        } else {
          setMessage({ text: res.data.error || "Change password failed", severity: "error" });
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || "Something went wrong",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode); // Persist preference
    // If you're using a custom theme provider, you'd call a context function here
    // For now, it visually updates the background color.
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: darkMode ? "#121212" : theme.palette.background.default, // Use theme background color
        color: darkMode ? "white" : theme.palette.text.primary,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Fade in>
        <Card
          sx={{
            width: { xs: "100%", sm: 400 },
            bgcolor: darkMode ? "#1e1e1e" : theme.palette.background.paper,
            color: "inherit",
            p: 2,
            boxShadow: 6,
            borderRadius: 3,
            position: "relative",
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={toggleDarkMode} // Call the toggle function
            color="inherit" // Use current text color for icon
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
          </Box>

          <CardHeader
            title={
              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: "bold", mt: 1 }}
              >
                {mode === "login" ? "Login to Threat Tracker" : "Change Password"}
              </Typography>
            }
          />

          <CardContent>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined" // Corporate look typically uses outlined
            />

            <TextField
              label={mode === "login" ? "Password" : "Old Password"}
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {mode === "login" && (
              <Select
                fullWidth
                displayEmpty
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                sx={{ mt: 2 }}
                variant="outlined"
              >
                <MenuItem value="">
                  Select Organization (only for User/IT)
                </MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org._id} value={org._id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            )}

            {mode === "change-password" && (
              <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="outlined"
              />
            )}

            {mode === "login" && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
                sx={{ mt: 1 }}
              />
            )}

            {message.text && (
              <Alert severity={message.severity} sx={{ mt: 2 }}>
                {message.text}
              </Alert>
            )}

            <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
              {mode === "login" ? (
                <>
                  Forgot password?{" "}
                  <Button size="small" onClick={() => setMode("change-password")}>
                    Change Password
                  </Button>
                </>
              ) : (
                <>
                  Back to{" "}
                  <Button size="small" onClick={() => setMode("login")}>
                    Login
                  </Button>
                </>
              )}
            </Typography>
          </CardContent>

          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              sx={{ height: 45 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Change Password"
              )}
            </Button>
          </CardActions>
        </Card>
      </Fade>
    </Box>
  );
}

export default Login;