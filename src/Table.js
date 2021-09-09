import React from "react";
import axios from "axios";
import DomainListModal from "./DomainListModal";

export default class DataPowerTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dpInstances: [],
    };
  }

  async componentDidMount() {
    const response = await axios.get("/status");
    this.setState({ dpInstances: response.data });
  }

  domainList(domains) {
    console.log(domains);
    return domains.map((domain) => {
      return <li>{domain}</li>;
    });
  }

  renderTabledata() {
    return this.state.dpInstances.map((instance, index) => {
      const {
        dpInstance,
        Version,
        State,
        uptime,
        bootuptime2,
        MachineType,
        Domains,
      } = instance;

      return (
        <tr key={dpInstance}>
          <td>
            <a
              href={"https://" + dpInstance + ":9090"}
              target="_blank"
              rel="noreferrer"
            >
              {dpInstance}
            </a>
          </td>
          <td>{Version}</td>
          <td>{State}</td>
          <td>{uptime}</td>
          <td>{bootuptime2}</td>
          <td>{MachineType}</td>
          <td>
            <DomainListModal domains={Domains} />
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Standby</th>
            <th>Reload</th>
            <th>Reboot</th>
            <th>MachineType</th>
            <th>Domains</th>
          </tr>
        </thead>
        <tbody>{this.state.dpInstances && this.renderTabledata()}</tbody>
      </table>
    );
  }
}
