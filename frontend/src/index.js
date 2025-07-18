// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
// import { ThemeProvider } from "@mui/material/styles"; // Remove this
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
// import theme from "./assets/jss/material-dashboard-react.js"; // Remove this import as well

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <ThemeProvider theme={theme}> Removed ThemeProvider from here */}
      <CssBaseline />
      <App />
    {/* </ThemeProvider> */}
  </React.StrictMode>
);