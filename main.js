
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Estabilidade/compatibilidade
app.commandLine.appendSwitch('disable-gpu');
app.disableHardwareAcceleration();

const STATE_PATH = path.join(app.getPath('userData'), 'state.json');
const UA_CHROME_RECENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8')); }
  catch { return { ids: ['A','B'], zoom: {} }; }
}
function saveState(st) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(st, null, 2));
}

function resolveApp(...parts){
  // Caminho absoluto robusto, funciona em dev e empacotado (asar)
  const base = app.getAppPath();
  return path.join(base, ...parts);
}

let mainWin;
function createWindow () {
  mainWin = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: resolveApp('preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true // habilita <webview>
    }
  });
  mainWin.setMenuBarVisibility(false);

  const indexPath = resolveApp('public', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('[ERRO] index.html não encontrado em:', indexPath);
    mainWin.loadURL('data:text/html,<h3>Erro: index.html não encontrado</h3><p>'+indexPath.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</p>');
  } else {
    mainWin.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// IPC bridge
ipcMain.handle('state:load', async () => loadState());
ipcMain.handle('state:save', async (_evt, st) => { saveState(st); return { ok:true }; });
ipcMain.handle('app:userAgent', async () => UA_CHROME_RECENT);
