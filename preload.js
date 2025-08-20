
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('waAPI', {
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (st) => ipcRenderer.invoke('state:save', st),
  userAgent: () => ipcRenderer.invoke('app:userAgent')
});
