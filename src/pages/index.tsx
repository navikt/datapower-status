//import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import DataPowerTable from "../components/DataPowerTable";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import RefreshIcon from "@mui/icons-material/Refresh";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState, useEffect } from 'react'
import '@fontsource/roboto';
import { dpInstance } from '../libs/interfaces'
import axios from 'axios';

const theme = createTheme();

export default function Index() {
  console.log("Index component rendered");

  const [data, setData] = useState<dpInstance[]>([]);
  const [isDataFetched, setIsDataFetched] = useState(false);

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
          <Image src="/images/nav-logo-red.svg" alt="" width={75} height={75} title="DataPower Status" />
          <h1>Welcome to DataPower Status</h1>
        </div>
        <div className={styles.content}>
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
          <DataPowerTable data={data} />
        </div>
      </ThemeProvider >
    </div >
  )
}