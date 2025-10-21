// main.js – versão portátil melhorada
// Salva userData (state.json, cookies/IndexedDB das partições persist:wa_*) na pasta do app

const { app, BrowserWindow, ipcMain, Menu, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

// MELHORADO: GPU habilitada para melhor performance (removido disable-gpu)
// Apenas desabilita em caso de problemas específicos
if (process.argv.includes('--disable-gpu-sandbox')) {
  app.commandLine.appendSwitch('disable-gpu-sandbox');
}

/* =======================
   BLOCO PORTÁTIL INLINE
   - Define userData/cache ao lado do executável
   - Tem que rodar ANTES de qualquer app.getPath('userData'),
     app.whenReady() ou criação de janela
======================= */
(() => {
  const isDev = !app.isPackaged;

  // 1) electron-builder portable define PORTABLE_EXECUTABLE_DIR
  // 2) Empacotado: usar pasta do executável
  // 3) Dev: usar diretório de trabalho
  const portableRoot =
    process.env.PORTABLE_EXECUTABLE_DIR
      || (!isDev ? path.dirname(process.execPath) : process.cwd());

  // Mantemos tudo em ./data para não poluir a raiz
  const portableDataDir = path.join(portableRoot, 'data');
  try { fs.mkdirSync(portableDataDir, { recursive: true }); } catch {}

  // Redireciona os caminhos principais
  app.setPath('userData', portableDataDir);
  // (opcional) separar cache em subpasta; por padrão já usa userData
  app.setPath('cache', path.join(portableDataDir, 'Cache'));
})();

/* =======================
   Agora é seguro usar app.getPath('userData')
======================= */
const STATE_PATH = path.join(app.getPath('userData'), 'state.json');
const WINDOW_STATE_PATH = path.join(app.getPath('userData'), 'window-state.json');
const BACKUP_DIR = path.join(app.getPath('userData'), 'backups');
const UA_CHROME_RECENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// MELHORADO: Logging estruturado
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`, data);
}

// MELHORADO: Tratamento de erro robusto
function loadState() {
  try {
    const data = fs.readFileSync(STATE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    log('INFO', 'Estado carregado com sucesso', { ids: parsed.ids?.length });
    return parsed;
  } catch (error) {
    log('WARN', 'Falha ao carregar estado, usando padrão', { error: error.message });
    return { ids: ['A','B'], zoom: {}, names: {}, theme: 'dark' };
  }
}

// MELHORADO: Backup automático antes de salvar
function saveState(st) {
  try {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    
    // Backup do estado anterior
    if (fs.existsSync(STATE_PATH)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      const backupName = `state-${Date.now()}.json`;
      fs.copyFileSync(STATE_PATH, path.join(BACKUP_DIR, backupName));
      
      // Manter apenas últimos 10 backups
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('state-'))
        .sort()
        .reverse();
      
      backups.slice(10).forEach(f => {
        try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {}
      });
    }
    
    fs.writeFileSync(STATE_PATH, JSON.stringify(st, null, 2));
    log('INFO', 'Estado salvo com sucesso');
  } catch (error) {
    log('ERROR', 'Falha ao salvar estado', { error: error.message });
    throw error;
  }
}

// NOVO: Carregar estado da janela
function loadWindowState() {
  try {
    const data = fs.readFileSync(WINDOW_STATE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { width: 1400, height: 900, x: undefined, y: undefined, isMaximized: false };
  }
}

// NOVO: Salvar estado da janela
function saveWindowState(win) {
  try {
    const bounds = win.getBounds();
    const state = {
      ...bounds,
      isMaximized: win.isMaximized()
    };
    fs.writeFileSync(WINDOW_STATE_PATH, JSON.stringify(state, null, 2));
  } catch (error) {
    log('ERROR', 'Falha ao salvar estado da janela', { error: error.message });
  }
}

function resolveApp(...parts){
  // Caminho robusto (dev e empacotado .asar)
  const base = app.getAppPath();
  return path.join(base, ...parts);
}

let mainWin;

// NOVO: Menu da aplicação
function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Nova Sessão',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWin?.webContents.send('menu:new-session')
        },
        { type: 'separator' },
        {
          label: 'Exportar Configurações',
          click: () => mainWin?.webContents.send('menu:export')
        },
        {
          label: 'Importar Configurações',
          click: () => mainWin?.webContents.send('menu:import')
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Exibir',
      submenu: [
        {
          label: 'Recarregar',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWin?.reload()
        },
        {
          label: 'Alternar DevTools',
          accelerator: 'F12',
          click: () => mainWin?.webContents.toggleDevTools()
        },
        { type: 'separator' },
        {
          label: 'Maximizar Sessão',
          accelerator: 'F11',
          click: () => mainWin?.webContents.send('menu:maximize')
        },
        {
          label: 'Restaurar Grade',
          accelerator: 'Esc',
          click: () => mainWin?.webContents.send('menu:restore')
        }
      ]
    },
    {
      label: 'Zoom',
      submenu: [
        {
          label: 'Aumentar Zoom',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => mainWin?.webContents.send('menu:zoom-in')
        },
        {
          label: 'Diminuir Zoom',
          accelerator: 'CmdOrCtrl+-',
          click: () => mainWin?.webContents.send('menu:zoom-out')
        },
        {
          label: 'Resetar Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWin?.webContents.send('menu:zoom-reset')
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Abrir Pasta de Dados',
          click: () => shell.openPath(app.getPath('userData'))
        },
        {
          label: 'Abrir Pasta de Backups',
          click: () => {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            shell.openPath(BACKUP_DIR);
          }
        },
        { type: 'separator' },
        {
          label: 'Sobre',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWin, {
              type: 'info',
              title: 'Sobre WA Multi',
              message: 'WA Multi v1.3.0',
              detail: 'Múltiplas sessões do WhatsApp Web\n\nElectron ' + process.versions.electron + '\nChrome ' + process.versions.chrome + '\nNode.js ' + process.versions.node
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow () {
  // MELHORADO: Restaurar posição e tamanho da janela
  const winState = loadWindowState();
  
  mainWin = new BrowserWindow({
    width: winState.width,
    height: winState.height,
    x: winState.x,
    y: winState.y,
    webPreferences: {
      preload: resolveApp('preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true, // habilita <webview>
      // MELHORADO: Adicionar CSP básico
      enableRemoteModule: false
    },
    // NOVO: Ícone (se existir)
    icon: fs.existsSync(resolveApp('build', 'icon.png')) 
      ? resolveApp('build', 'icon.png') 
      : undefined
  });

  // MELHORADO: Restaurar estado maximizado
  if (winState.isMaximized) {
    mainWin.maximize();
  }

  // NOVO: Criar menu
  createMenu();

  // MELHORADO: Salvar estado ao redimensionar/mover
  let saveTimeout;
  const saveWindowStateDebounced = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveWindowState(mainWin), 500);
  };

  mainWin.on('resize', saveWindowStateDebounced);
  mainWin.on('move', saveWindowStateDebounced);
  mainWin.on('maximize', () => saveWindowState(mainWin));
  mainWin.on('unmaximize', () => saveWindowState(mainWin));

  // MELHORADO: Salvar estado ao fechar
  mainWin.on('close', () => {
    saveWindowState(mainWin);
  });

  // MELHORADO: Tentar versão melhorada primeiro, depois fallback para original
  let indexPath = resolveApp('public', 'index-melhorado.html');
  if (!fs.existsSync(indexPath)) {
    indexPath = resolveApp('public', 'index.html');
  }

  if (!fs.existsSync(indexPath)) {
    log('ERROR', 'index.html não encontrado', { path: indexPath });
    const safe = indexPath.replace(/&/g,'&amp;').replace(/</g,'&lt;');
    mainWin.loadURL('data:text/html,<h3>Erro: index.html não encontrado</h3><p>'+ safe +'</p>');
  } else {
    mainWin.loadFile(indexPath);
    log('INFO', 'Janela criada com sucesso', { indexPath });
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ==================== IPC HANDLERS ====================

// ORIGINAL: Estado básico
ipcMain.handle('state:load', async () => {
  try {
    return loadState();
  } catch (error) {
    log('ERROR', 'Erro ao carregar estado via IPC', { error: error.message });
    throw error;
  }
});

ipcMain.handle('state:save', async (_evt, st) => {
  try {
    // MELHORADO: Validar entrada
    if (!st || typeof st !== 'object') {
      throw new Error('Estado inválido');
    }
    if (!Array.isArray(st.ids)) {
      throw new Error('IDs devem ser um array');
    }
    
    saveState(st);
    return { ok: true };
  } catch (error) {
    log('ERROR', 'Erro ao salvar estado via IPC', { error: error.message });
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('app:userAgent', async () => UA_CHROME_RECENT);

// NOVO: Exportar configurações
ipcMain.handle('app:export', async (_evt, data) => {
  try {
    const { dialog } = require('electron');
    const result = await dialog.showSaveDialog(mainWin, {
      title: 'Exportar Configurações',
      defaultPath: `wa-multi-config-${Date.now()}.json`,
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'Todos', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
      log('INFO', 'Configurações exportadas', { path: result.filePath });
      return { ok: true, path: result.filePath };
    }
    
    return { ok: false, canceled: true };
  } catch (error) {
    log('ERROR', 'Erro ao exportar', { error: error.message });
    return { ok: false, error: error.message };
  }
});

// NOVO: Importar configurações
ipcMain.handle('app:import', async () => {
  try {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog(mainWin, {
      title: 'Importar Configurações',
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'Todos', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const data = fs.readFileSync(result.filePaths[0], 'utf-8');
      const parsed = JSON.parse(data);
      log('INFO', 'Configurações importadas', { path: result.filePaths[0] });
      return { ok: true, data: parsed };
    }
    
    return { ok: false, canceled: true };
  } catch (error) {
    log('ERROR', 'Erro ao importar', { error: error.message });
    return { ok: false, error: error.message };
  }
});

// NOVO: Notificações
ipcMain.handle('app:notify', async (_evt, options) => {
  try {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title || 'WA Multi',
        body: options.body || '',
        icon: options.icon
      });
      notification.show();
      return { ok: true };
    }
    return { ok: false, error: 'Notificações não suportadas' };
  } catch (error) {
    log('ERROR', 'Erro ao mostrar notificação', { error: error.message });
    return { ok: false, error: error.message };
  }
});

// NOVO: Obter informações do app
ipcMain.handle('app:info', async () => {
  return {
    version: '1.3.0',
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
    platform: process.platform,
    dataPath: app.getPath('userData'),
    backupPath: BACKUP_DIR
  };
});
