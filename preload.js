// preload.js - Versão melhorada com mais APIs

const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para o renderer process
contextBridge.exposeInMainWorld('waAPI', {
  // ORIGINAL: Estado e configurações
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (st) => ipcRenderer.invoke('state:save', st),
  userAgent: () => ipcRenderer.invoke('app:userAgent'),
  
  // NOVO: Importar/Exportar
  exportConfig: (data) => ipcRenderer.invoke('app:export', data),
  importConfig: () => ipcRenderer.invoke('app:import'),
  
  // NOVO: Notificações
  notify: (options) => ipcRenderer.invoke('app:notify', options),
  
  // NOVO: Informações do app
  getInfo: () => ipcRenderer.invoke('app:info'),
  
  // NOVO: Listeners para eventos do menu
  onMenuAction: (callback) => {
    const channels = [
      'menu:new-session',
      'menu:export',
      'menu:import',
      'menu:maximize',
      'menu:restore',
      'menu:zoom-in',
      'menu:zoom-out',
      'menu:zoom-reset'
    ];
    
    channels.forEach(channel => {
      ipcRenderer.on(channel, (_event, ...args) => callback(channel, ...args));
    });
    
    // Retorna função para remover listeners
    return () => {
      channels.forEach(channel => {
        ipcRenderer.removeAllListeners(channel);
      });
    };
  }
});
