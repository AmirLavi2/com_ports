const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  listPorts: () => ipcRenderer.invoke('list-ports'),
  runScript: (scriptPath) => ipcRenderer.invoke('run-script', scriptPath),
  saveConfig: async (comName) => {
    const response = await ipcRenderer.invoke('save-config', comName);
    return response;
}
});
