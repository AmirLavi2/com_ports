const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { spawn } = require('child_process');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.openDevTools();
}

app.on('ready', createWindow);

ipcMain.handle('list-ports', async () => {
  try {
    const serialPortList = await SerialPort.list();
    console.log(serialPortList);
    return serialPortList;
  } catch (err) {
    console.log(err);
    return []; // Return an empty array or handle the error as needed
  }
});

ipcMain.handle('run-script', async (event, scriptPath) => {
  return new Promise((resolve, reject) => {
    console.log('-----------------------------');
    const script = spawn('cmd.exe', ['/c', scriptPath]);

    let stdout = '';
    let stderr = '';

    script.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('main -> run-script -> stdout:', stdout);
    });

    script.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('main -> run-script -> stderr:', stderr);
    });

    script.on('close', (code) => {
      console.log('main -> run-script -> close with code:', code);

      if (code !== 0) {
        reject(`Script exited with code ${code}`);
        return;
      }

      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        reject(`Script stderr: ${stderr}`);
        return;
      }

      console.log(`Script stdout: ${stdout}`);
      resolve(stdout);
    });

    script.on('error', (error) => {
      console.error(`Error executing script: ${error.message}`);
      reject(`Error executing script: ${error.message}`);
    });
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle the save-config event
ipcMain.handle('save-config', async (event, comName) => {
  try {
    console.log('main -> save-config -> comName:', comName);

    // const configPath = path.join(app.getPath('userData'), 'config.json');
    // await fs.promises.writeFile(configPath, JSON.stringify({ comName }));
    const configPath = 'boardsNickname.json'
    const data = await fs.promises.readFile(configPath, 'utf-8');

    return { success: true, message: data };
  } catch (error) {
    console.error('Error writing to file', error);
    return { success: false, message: 'Failed to save configuration' };
  }
});