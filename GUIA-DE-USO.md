# 📱 WA Multi - Guia Completo de Uso

## 🎯 Visão Geral

**WA Multi** é um aplicativo Electron que permite executar **múltiplas sessões do WhatsApp Web** simultaneamente no mesmo computador, cada uma com login independente.

---

## ⚙️ O que é este sistema?

### **Funcionalidades Principais:**
- ✅ **Múltiplas Sessões**: Abra quantas contas de WhatsApp quiser ao mesmo tempo
- ✅ **Perfis Persistentes**: Cada sessão mantém seu login salvo (não precisa escanear QR code toda vez)
- ✅ **Zoom Individual**: Configure zoom de 30% a 300% para cada sessão
- ✅ **Interface Moderna**: Tema escuro e design responsivo
- ✅ **100% Local**: Todos os dados ficam no seu computador
- ✅ **Versão Portable**: Não precisa instalar, pode rodar de pen-drive

---

## 🏗️ Arquitetura do Sistema

### **Estrutura de Arquivos:**

```
Monitoramento-Whats/
├── main.js              # Processo principal do Electron
├── preload.js           # Script de segurança (bridge)
├── portable-paths.js    # Configuração para modo portátil
├── package.json         # Configurações e dependências
├── public/
│   └── index.html       # Interface do usuário (HTML/CSS/JS)
└── dist/                # Arquivos compilados (gerados)
    ├── win-unpacked/    # Versão descompactada
    ├── WA-Multi-Portable/ # Versão portable (pasta)
    └── WA-Multi-1.3.0-Portable.zip # Versão portable (ZIP)
```

### **Como Funciona Tecnicamente:**

1. **Motor Electron**: Usa Chromium para renderizar as páginas
2. **WebView Tags**: Cada sessão roda em um `<webview>` isolado
3. **Partições Persistentes**: Usa `partition: "persist:wa_<ID>"` para separar cookies/cache
4. **IPC (Inter-Process Communication)**: Comunicação segura entre interface e sistema
5. **Estado Salvo**: Armazena configurações em `state.json`

---

## 🚀 Como Usar

### **Modo Desenvolvimento:**
```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo dev
npm start
```

### **Versão Portable (Recomendado):**
1. Extraia o arquivo `WA-Multi-1.3.0-Portable.zip`
2. Execute `WA Multi.exe`
3. Faça login escaneando o QR Code em cada sessão
4. Pronto! Seus logins ficarão salvos na pasta `data`

---

## 🎮 Controles da Interface

### **Barra de Ferramentas:**

| Botão | Função |
|-------|--------|
| **+ Adicionar** | Cria uma nova sessão (A, B, C, D...) |
| **Remover** | Remove a sessão selecionada |
| **Maximizar** | Expande a sessão selecionada para tela cheia |
| **Restaurar** | Volta ao modo grade (todas as sessões visíveis) |
| **−10%** | Diminui o zoom da sessão selecionada em 10% |
| **+10%** | Aumenta o zoom da sessão selecionada em 10% |
| **Recarregar** | Atualiza a página da sessão selecionada |

### **Campo de Zoom:**
- Você pode digitar manualmente o valor do zoom (30-300)
- O valor é aplicado imediatamente ao pressionar Enter

---

## 💾 Onde Ficam os Dados?

### **Modo Portable:**
```
[Pasta do Executável]/
└── data/
    ├── state.json           # Configurações (IDs, zoom)
    ├── Cache/               # Cache do navegador
    ├── GPUCache/            # Cache da GPU
    ├── Partitions/
    │   ├── persist_wa_A/    # Dados da sessão A
    │   ├── persist_wa_B/    # Dados da sessão B
    │   └── ...
    └── ...outros dados do Electron
```

### **Modo Instalado (se usar NSIS):**
```
%APPDATA%/WA Multi/
```

---

## 🔧 Como Gerar os Instaladores

### **1. Portable (ZIP):**
```bash
npm run dist:win:portable
```
→ Gera arquivo executável sem instalação

### **2. NSIS (Instalador Completo):**
```bash
npm run dist:win
```
→ Gera instalador `.exe` completo (~110 MB)

### **3. NSIS-Web (Instalador Leve):**
```bash
npm run dist:win:web
```
→ Gera instalador leve que baixa arquivos na primeira execução

⚠️ **Nota**: Para NSIS-Web, configure `build.nsisWeb.appPackageUrl` no `package.json`

---

## 🛠️ Configurações Avançadas

### **User Agent:**
O sistema usa um User-Agent moderno do Chrome para evitar avisos do WhatsApp:
```javascript
const UA_CHROME_RECENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
```

### **Segurança:**
- ✅ `contextIsolation: true` - Isola contextos
- ✅ `nodeIntegration: false` - Desabilita Node.js no renderer
- ✅ `contextBridge` - Expõe apenas APIs necessárias

### **Modificar Configurações:**
Edite `package.json` → seção `build`:

```json
{
  "build": {
    "appId": "com.seuprojeto.wamulti",
    "productName": "WA Multi",
    "asar": true,
    ...
  }
}
```

---

## 📊 Casos de Uso

### **1. Empresas:**
- Atendimento ao cliente com múltiplos operadores
- Separar departamentos (vendas, suporte, financeiro)

### **2. Autônomos:**
- Conta pessoal + conta profissional
- Diferentes projetos/clientes

### **3. Marketing:**
- Gerenciar múltiplas campanhas
- Contas de diferentes marcas

### **4. Suporte Técnico:**
- Teste de funcionalidades
- Múltiplas contas para debug

---

## ❓ Solução de Problemas

### **Problema: QR Code não carrega**
**Solução:**
```bash
# Limpe o cache e reinicie
1. Feche o app
2. Delete a pasta "data"
3. Reabra o app
```

### **Problema: Sessão não salva o login**
**Solução:**
- Verifique se a pasta `data` tem permissões de escrita
- Não execute de um local protegido (ex: Arquivos de Programas)

### **Problema: Tela em branco**
**Solução:**
1. Pressione `Ctrl+Shift+I` (DevTools)
2. Verifique erros no console
3. Use o botão "Recarregar"

### **Problema: Erro ao gerar portable (links simbólicos)**
**Solução:**
```bash
# Opção 1: Executar PowerShell como Administrador
# Opção 2: Habilitar Modo Desenvolvedor no Windows 11
# Opção 3: Usar a pasta dist/win-unpacked diretamente
```

---

## 🔒 Segurança e Privacidade

### **O que o app faz:**
- ✅ Carrega o WhatsApp Web oficial (web.whatsapp.com)
- ✅ Salva dados APENAS localmente
- ✅ Não envia informações para servidores externos
- ✅ Não tem acesso às suas mensagens (só renderiza a página)

### **O que o app NÃO faz:**
- ❌ Não lê suas conversas
- ❌ Não envia dados para terceiros
- ❌ Não modifica mensagens
- ❌ Não injeta código no WhatsApp

---

## 🎨 Personalização

### **Mudar Tema:**
Edite `public/index.html`, seção `<style>`:
```css
:root { color-scheme: dark; }
body { background:#0c0c0c; color:#f3f3f3; }
```

### **Adicionar Mais Botões:**
Edite `public/index.html`, seção `<header>`:
```html
<button id="btnNovo">Meu Botão</button>
```

E adicione a função em `<script>`:
```javascript
btn('btnNovo').onclick = () => { /* sua função */ };
```

---

## 📝 Estrutura do Código

### **main.js**
- Processo principal do Electron
- Gerencia janelas e configurações
- Implementa modo portátil
- Expõe APIs via IPC

### **preload.js**
- Bridge de segurança
- Expõe apenas APIs necessárias
- Usa `contextBridge`

### **public/index.html**
- Interface do usuário completa
- Gerencia tiles de sessões
- Controles de zoom
- Sistema de estados

### **portable-paths.js**
- Configuração de caminhos portáteis
- Detecta modo dev/produção
- Cria pasta `data` local

---

## 🚀 Próximos Passos / Melhorias Possíveis

### **Features Sugeridas:**
- [ ] Adicionar notificações de desktop
- [ ] Sistema de temas (claro/escuro/personalizado)
- [ ] Atalhos de teclado
- [ ] Exportar/importar configurações
- [ ] Backup automático da pasta `data`
- [ ] Modo "Boss Key" (esconder com um atalho)
- [ ] Estatísticas de uso por sessão

---

## 📚 Tecnologias Utilizadas

- **Electron 30.5.1** - Framework desktop
- **electron-builder 24.13.3** - Gerador de instaladores
- **HTML5/CSS3/JavaScript** - Interface
- **Node.js** - Backend
- **WebView API** - Isolamento de sessões

---

## 📞 Suporte

### **Problemas Comuns:**
1. **Erro de permissão ao gerar portable**: Execute como administrador
2. **WhatsApp pede QR code sempre**: Normal, depende da configuração do WhatsApp
3. **Sessão desconecta**: Verifique sua conexão com a internet

### **Debug:**
```bash
# Ver logs do Electron
npm start

# Abrir DevTools no app compilado
Pressione: Ctrl+Shift+I
```

---

## 📄 Licença

Este projeto utiliza Electron (MIT License) e se conecta ao WhatsApp Web oficial.

---

## 🎉 Conclusão

O **WA Multi** é uma solução completa, segura e eficiente para gerenciar múltiplas sessões do WhatsApp Web. 

**Principais vantagens:**
- ✅ 100% gratuito e sem propagandas
- ✅ Código open-source (pode auditar)
- ✅ Dados armazenados localmente
- ✅ Não requer instalação (modo portable)
- ✅ Funciona offline (após primeiro login)

**Aproveite!** 🚀


