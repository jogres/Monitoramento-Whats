
# WA Multi — Electron (final)

App **somente Electron** (sem servidor) que abre **várias sessões do WhatsApp Web** em tiles interativas usando `<webview>` e inclui **instalador Windows (.exe)** via **electron-builder**:

- **NSIS (offline)**: instalador completo.
- **NSIS‑Web (leve)**: setup pequeno que **baixa o pacote na primeira execução** e instala (ideal para “baixar dependências só na primeira vez”).
- **Portable**: executável sem instalação (útil para suporte).

## Rodando em dev
```bash
npm i
npm start
```

## Gerando instalador Windows
Offline (NSIS):
```bash
npm run dist:win
```
Instalador leve (NSIS‑Web):
```bash
npm run dist:win:web
```
> Para NSIS‑Web, ajuste `build.nsisWeb.appPackageUrl` e (opcional) `build.publish.url` no `package.json` para apontar onde você vai hospedar os pacotes do app (HTTP estático).

Portable:
```bash
npm run dist:win:portable
```

## Recursos técnicos
- `<webview>` habilitado com `webviewTag: true` e **contextIsolation** ativo.  
- **Perfis persistentes** por sessão com `partition: "persist:wa_<ID>"` (cookies/cache/logins separados).  
- **Zoom por sessão** com rótulo e campo numérico (30–300%).  
- **Caminhos absolutos** para `preload.js` e `public/index.html` usando `app.getAppPath()`.
- **Estado** salvo em `app.getPath('userData')/state.json` (local do sistema apropriado).

## Onde ficam os dados do usuário
No Windows, algo como:
```
%APPDATA%/WA Multi
```
(por trás, `app.getPath('userData')`).

## Observações
- O `<webview>` é um contêiner isolado para conteúdo externo e precisa ser **explicitamente habilitado**.  
- O **User‑Agent** é definido para um Chrome recente para evitar o aviso de navegador antigo.

## Segurança
- Mantemos `contextIsolation: true` e sem `nodeIntegration` no renderer. Exponha apenas o que precisa via `preload` + `contextBridge`.

---

### Referências úteis
- electron-builder **NSIS/NSIS‑Web** e configuração de Windows targets.  
- `<webview>` e `webviewTag`.  
- `webFrame.get/setZoomFactor()`; `webContents.get/setZoomFactor()`.  
- `app.getPath('userData')` e `app.getAppPath()`.
o inicio