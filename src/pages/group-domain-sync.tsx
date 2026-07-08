import Head from "next/head";
import Image from "next/image";
import GroupDomainSyncPanel from "../components/GroupDomainSyncPanel";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import styles from '../styles/Home.module.css'

const theme = createTheme();

export default function GroupDomainSyncPage() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Group Domain Sync</title>
        <meta name="description" content="Group domain synchronization status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <div className={styles.logo}>
          <Image src="/images/nav-logo-red.svg" alt="" width={75} height={75} title="DataPower Status" />
          <h1>Welcome to DataPower Status</h1>
        </div>
      <GroupDomainSyncPanel />
      </ThemeProvider >
    </div>
  );
}
