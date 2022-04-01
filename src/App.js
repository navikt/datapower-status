import React from "react";
import "./styles.css";
import DataPowerTable from "./Table.js";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme();

export default class App extends React.Component {
  state = {
    refresh: false,
  };

  handleRefresh() {
    this.setState((state) => ({ refresh: !state.refresh }));
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <div>
          <image-block>
            <img src="images/nav-logo-red.svg" alt="" />
            <h1 class="title">Welcome to DataPower Status</h1>
          </image-block>
          <div class="content">
            <IconButton
              color="primary"
              aria-label="refresh"
              component="div"
              onClick={this.handleRefresh.bind(this)}
              size="small"
              edge="end"
              className="refresh"
            >
              <RefreshIcon />
            </IconButton>
            <DataPowerTable key={this.state.refresh} />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}
