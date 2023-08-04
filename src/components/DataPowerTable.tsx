import DomainListModal from "./DomainListModal";
import styles from '../styles/DataPowerTable.module.css';
import { dpInstance } from "../libs/interfaces";

interface Props {
  data: dpInstance[]
}

function DataPowerTableContent({ data }: Props) {
  return (
    <tbody>
      {data.length ? (
        data.map((dp: dpInstance) => (
          <tr key={dp.dpInstance} className={styles.tr}>
            <td className={styles.td}>
              <a href={"https://" + dp.dpInstance + ":9090"} target="_blank" rel="noreferrer" > {dp.dpInstance}</a>
            </td >
            <td className={styles.td}>{dp.Version}</td>
            <td className={styles.td} id={styles[dp.State]}>{dp.State}</td>
            <td className={styles.td}>{dp.uptime}</td>
            <td className={styles.td}>{dp.bootuptime2}</td>
            <td className={styles.td}>{dp.MachineType}</td>
            <td className={styles.td}>
              <DomainListModal domains={dp.Domains} dpInstanceName={dp.dpInstance} />
            </td>
          </tr>
        ))
      ) : (
        <tr><td colSpan={7} align="center">No content</td></tr>
      )
      }
    </tbody >
  )
}

export default function DataPowerTable({ data }: Props) {
  return (
    <table className={styles.table}>
      <thead>
        <tr className={styles.tr}>
          <th className={styles.th}>Name</th>
          <th className={styles.th}>Version</th>
          <th className={styles.th}>Standby</th>
          <th className={styles.th}>Reload</th>
          <th className={styles.th}>Reboot</th>
          <th className={styles.th}>MachineType</th>
          <th className={styles.th}>Domains</th>
        </tr>
      </thead>
      {data && (
        <DataPowerTableContent data={data} />
      )}
    </table>
  )
}
