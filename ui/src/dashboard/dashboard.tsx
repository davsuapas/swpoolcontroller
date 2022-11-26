/*
 *   Copyright (c) 2022 CARISA
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chart from './chart';
import Meassure from './meassure';
import AppBar from '@mui/material/AppBar';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { Assignment } from '@mui/icons-material';
import Config from '../config/config';
import { useRef } from 'react';
import Tooltip from '@mui/material/Tooltip';
import { CircularProgress } from '@mui/material';
import React from 'react';
import Alert from '../support/alert';
import { colorPurple } from '../support/color';
import SocketFactory from '../net/socket';

const drawerWidth: number = 255;

const temperatureName = "Temperatura";
const temperatureUnit = "Grados";

const phName = "Ph";
const phUnit = "";

const chlorineName = "Cloro";
const chlorineUnit = "mg/L";

const mdTheme = createTheme();

function DashboardContent() {
  const config = useRef<any>(null);
  const alert = useRef<Alert>(null);

  const [loadingConfig, setloadingConfig] = React.useState(false);

  const socket = new SocketFactory(alert).open();
  
  return (
    <ThemeProvider theme={mdTheme}>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
                Métricas piscina
              </Typography>
              <Tooltip title="Configuración">
                <IconButton color="inherit" onClick={() => config.current.open(setloadingConfig)}>
                  <Assignment />
                  {loadingConfig && (
                    <CircularProgress
                      size={40}
                      sx={{
                        color: colorPurple,
                        position: 'absolute',
                        zIndex: 1,
                      }}
                    />
                )}                  
                </IconButton>
              </Tooltip>
              <Tooltip title="Salir">
                <IconButton color="inherit">
                    <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
          <Container maxWidth="xl" sx={{ mt:5, mb: 5}}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={9} lg={10}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: drawerWidth,
                  }}
                >
                  <Chart name={temperatureName} unitName={temperatureUnit} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={3} lg={2}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: drawerWidth,
                  }}
                >
                  <Meassure name={temperatureName} value='15' unitName={temperatureUnit} src="temp.png" />
                </Paper>
              </Grid>
              <Grid item xs={12} md={9} lg={10}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: drawerWidth,
                  }}
                >
                  <Chart name={phName} unitName={phUnit} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={3} lg={2}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: drawerWidth,
                  }}
                >
                  <Meassure name={phName} value='1,4' unitName={phUnit} src="ph.png" />
                </Paper>
              </Grid>
              <Grid item xs={12} md={9} lg={10}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: drawerWidth,
                  }}
                >
                  <Chart name={chlorineName} unitName={chlorineUnit} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={3} lg={2}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: drawerWidth,
                  }}
                >
                  <Meassure name={chlorineName} value='0,4' unitName={chlorineUnit} src="chlorine.png" />
                </Paper>
              </Grid>
            </Grid>
          </Container>
          <Alert ref={alert}></Alert>
          <Config ref={config} alert={alert} />
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
