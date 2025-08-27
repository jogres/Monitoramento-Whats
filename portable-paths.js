// portable-paths.js
// Configura o Electron para salvar todos os dados de usuário (userData/cache)
// em uma pasta local ao executável, tornando o app "portátil".


const { app } = require('electron');
const path = require('path');
const fs = require('fs');


// Detecta se está em desenvolvimento (electron .) ou empacotado (.exe)
const isDev = !app.isPackaged;


function resolvePortableRoot() {
// 1) electron-builder modo portable expõe PORTABLE_EXECUTABLE_DIR
if (process.env.PORTABLE_EXECUTABLE_DIR) return process.env.PORTABLE_EXECUTABLE_DIR;
// 2) Empacotado: usa a pasta do executável
if (!isDev) return path.dirname(process.execPath);
// 3) Dev: usa a pasta do projeto (onde você executa `electron .`)
return process.cwd(); 
}


const portableRoot = resolvePortableRoot();
// Mantemos os dados dentro de uma subpasta "data" para evitar bagunça
const portableDataDir = path.join(portableRoot, 'data');


try { fs.mkdirSync(portableDataDir, { recursive: true }); } catch {}


// Define caminhos ANTES do app ficar pronto, para que todo o Chromium use este local
app.setPath('userData', portableDataDir);
app.setPath('cache', path.join(portableDataDir, 'Cache'));


// Exporta utilitários (opcional)
module.exports = {
getPortableRoot: () => portableRoot,
getUserDataDir: () => app.getPath('userData'),
};