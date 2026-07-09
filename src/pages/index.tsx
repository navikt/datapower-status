//import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import DataPowerTable from "../components/DataPowerTable";
import GroupDomainSyncPanel from "../components/GroupDomainSyncPanel";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import RefreshIcon from "@mui/icons-material/Refresh";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useEffect } from 'react'
import { Tabs, Tab, Box } from "@mui/material";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { dpInstance } from '../libs/interfaces'
import axios from 'axios';
import { margin } from '@mui/system';

const theme = createTheme();

export default function Index() {
  console.log("Index component rendered");

  const [data, setData] = useState<dpInstance[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const makeRequest = async () => {
    console.log("Fetching new status")
    await axios.get('/api/status')
      .then(({ data }) => {
        setData(data);
        setIsDataFetched(true);
      })
  }

  useEffect(() => {
    if ( !isDataFetched) {
      console.log("data is not fetched")
      makeRequest();
    }
  }, [isDataFetched]);

  return (
    <div className={styles.container}>
      <Head>
        <title>DataPower Status</title>
        <meta name="description" content="DataPower status page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThemeProvider theme={theme}>
        <div className={styles.logo}>
          <Image src="/images/nav-logo-red.svg" alt="Nav logo" width={83} height={53}   title="DataPower Status" />
          <p>Welcome to DataPower Status</p>
        </div>
        <div className={styles.content}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={(e, newTab) => setCurrentTab(newTab)} centered>
              <Tab label="Host Status" />
              <Tab label="Domain Sync" />
            </Tabs>
            <IconButton
              color="primary"
              aria-label="refresh"
              component="div"
              onClick={makeRequest}
              size="small"
              edge="end"
              className={styles.refresh}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {currentTab === 0 && <DataPowerTable data={data} />}
          {currentTab === 1 && <GroupDomainSyncPanel />}
        </div>
      </ThemeProvider >
    </div >
  )
}