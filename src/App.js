import React from "react";
import "./styles.css";
import DataPowerTable from "./Table.js";

export default class App extends React.Component {
  render() {
    return (
      <div>
        <image-block>
          <img src="images/nav-logo-red.svg" alt=""/>
          <h1>Welcome to DataPower Status</h1>
        </image-block>
        <DataPowerTable />
      </div>
    );
  }
}