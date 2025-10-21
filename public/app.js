// ==================== APP.JS - VERSÃO MELHORADA ====================

// ========== ESTADO GLOBAL ==========
let state = { ids: ['A','B'], zoom: {}, names: {}, theme: 'dark' };
let UA = '';
let selectedId = null;
let confirmCallback = null;

// ========== UTILIDADES ==========
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);
const viewOf = (id) => document.querySelector(`.tile[data-id="${escapeCSS(id)}"] webview`);
const tileOf = (id) => document.querySelector(`.tile[data-id="${escapeCSS(id)}"]`);
const escapeCSS = (str) => String(str).replace(/"/g, '\\"');

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'success') {
  const toast = $('toast');
  toast.textContent = message;
  toast.className = 'show ' + type;
  setTimeout(() => toast.className = '', 3000);
}

// ========== MODAL DE CONFIRMAÇÃO ==========
function confirm(message) {
  return new Promise((resolve) => {
    const modal = $('confirmModal');
    $('confirmMessage').textContent = message;
    modal.classList.add('show');

    const cleanup = () => {
      modal.classList.remove('show');
      $('confirmOk').onclick = null;
      $('confirmCancel').onclick = null;
    };

    $('confirmOk').onclick = () => {
      cleanup();
      resolve(true);
    };

    $('confirmCancel').onclick = () => {
      cleanup();
      resolve(false);
    };
  });
}

// ========== PERSISTÊNCIA ==========
const persistDebounced = debounce(async () => {
  try {
    const result = await window.waAPI.saveState(state);
    if (!result.ok) {
      console.error('Erro ao salvar:', result.error);
    }
  } catch (error) {
    console.error('Erro ao persistir:', error);
  }
}, 1000); // CORRIGIDO: Aumentado para 1 segundo para evitar piscadas

async function persist() {
  persistDebounced(); // CORRIGIDO: Removido await para não bloquear
}

// ========== EXPORTAR/IMPORTAR ==========
async function exportConfig() {
  try {
    const result = await window.waAPI.exportConfig(state);
    if (result.ok && !result.canceled) {
      showToast('Configurações exportadas com sucesso!', 'success');
    }
  } catch (error) {
    console.error('Erro ao exportar:', error);
    showToast('Erro ao exportar: ' + error.message, 'error');
  }
}

async function importConfig() {
  try {
    const confirmed = await confirm('Importar substituirá as configurações atuais. Continuar?');
    if (!confirmed) return;

    const result = await window.waAPI.importConfig();
    if (result.ok && !result.canceled) {
      state = result.data;
      await render();
      persist();
      showToast('Configurações importadas com sucesso!', 'success');
    }
  } catch (error) {
    console.error('Erro ao importar:', error);
    showToast('Erro ao importar: ' + error.message, 'error');
  }
}

// ========== TEMA ==========
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  persist();
  showToast(`Tema ${state.theme === 'dark' ? 'escuro' : 'claro'} ativado`, 'success');
}

// ========== GERENCIAMENTO DE SESSÕES ==========
function nextId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const c of letters) {
    if (!state.ids.includes(c)) return c;
  }
  let i = 1;
  while (state.ids.includes('S' + i)) i++;
  return 'S' + i;
}

async function addSession() {
  const id = nextId();
  state.ids.push(id);
  persist();
  await render();
  setTimeout(() => selectAndFocus(id), 100);
  showToast(`Sessão "${getDisplayName(id)}" adicionada`, 'success');
}

async function removeSession() {
  if (!selectedId) {
    showToast('Selecione uma sessão primeiro', 'warning');
    return;
  }

  const confirmed = await confirm(
    `Remover sessão "${getDisplayName(selectedId)}"?\n\nIsso apagará todos os dados desta sessão (login, conversas, etc).`
  );
  
  if (!confirmed) return;

  state.ids = state.ids.filter(x => x !== selectedId);
  delete state.zoom[selectedId];
  delete state.names[selectedId];
  const wasSelected = selectedId;
  selectedId = null;
  persist();
  await render();
  showToast(`Sessão "${getDisplayName(wasSelected)}" removida`, 'success');
}

// ========== NOMES CUSTOMIZADOS ==========
function getDisplayName(id) {
  return state.names[id] || `WA ${id}`;
}

function startRenaming(id) {
  const tile = tileOf(id);
  if (!tile) return;

  const titleEl = tile.querySelector('.tile-title');
  const inputEl = tile.querySelector('.tile-title-input');

  titleEl.classList.add('hidden');
  inputEl.classList.remove('hidden');
  inputEl.value = state.names[id] || '';
  inputEl.focus();
  inputEl.select();

  const finishRenaming = () => {
    const newName = inputEl.value.trim();
    if (newName) {
      state.names[id] = newName;
    } else {
      delete state.names[id];
    }
    
    titleEl.textContent = getDisplayName(id);
    titleEl.classList.remove('hidden');
    inputEl.classList.add('hidden');
    persist();
    showToast(`Sessão renomeada para "${getDisplayName(id)}"`, 'success');
  };

  inputEl.onblur = finishRenaming;
  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishRenaming();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      titleEl.classList.remove('hidden');
      inputEl.classList.add('hidden');
    }
  };
}

// ========== ZOOM ==========
function clampZoom(f) {
  return Math.max(0.3, Math.min(3, Number(f) || 1));
}

function clampPercent(p) {
  return Math.max(30, Math.min(300, Number(p) || 100));
}

function nudgeZoom(deltaPercent) {
  if (!selectedId) {
    showToast('Selecione uma sessão primeiro', 'warning');
    return;
  }

  const wv = viewOf(selectedId);
  if (!wv) return;

  wv.getZoomFactor(current => {
    const p = clampPercent(Math.round(current * 100) + deltaPercent);
    applyZoom(selectedId, p / 100);
  });
}

function resetZoom() {
  if (!selectedId) {
    showToast('Selecione uma sessão primeiro', 'warning');
    return;
  }
  applyZoom(selectedId, 1.0);
  showToast('Zoom resetado para 100%', 'success');
}

function applyZoom(id, factor) {
  const wv = viewOf(id);
  if (!wv) return;

  const f = clampZoom(factor);
  try {
    wv.setZoomFactor(f);
  } catch (error) {
    console.error('Erro ao aplicar zoom:', error);
  }

  state.zoom[id] = f;

  const tile = tileOf(id);
  if (tile) {
    const lbl = tile.querySelector('.zoomLbl');
    const input = tile.querySelector('.zoomInput');
    if (input) input.value = Math.round(f * 100);
    if (lbl) lbl.textContent = `(${Math.round(f * 100)}%)`;
  }

  // CORRIGIDO: Persistir apenas uma vez ao final
  persist();
}

function refreshZoomUI(id) {
  const wv = viewOf(id);
  if (!wv) return;

  wv.getZoomFactor(actual => {
    const tile = tileOf(id);
    if (tile) {
      const lbl = tile.querySelector('.zoomLbl');
      const input = tile.querySelector('.zoomInput');
      if (input) input.value = Math.round(actual * 100);
      if (lbl) lbl.textContent = `(${Math.round(actual * 100)}%)`;
    }
  });
}

// ========== SELEÇÃO E FOCO ==========
function selectAndFocus(id) {
  $$('.tile').forEach(t => t.classList.remove('selected'));
  selectedId = id;
  const tile = tileOf(id);
  if (tile) {
    tile.classList.add('selected');
    tile.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ========== MAXIMIZAR/RESTAURAR ==========
function maximizeTile() {
  if (!selectedId) {
    showToast('Selecione uma sessão primeiro', 'warning');
    return;
  }

  $$('.tile').forEach(el => el.classList.remove('big'));
  const tile = tileOf(selectedId);
  if (tile) {
    tile.classList.add('big');
    showToast(`Sessão "${getDisplayName(selectedId)}" maximizada`, 'success');
  }
}

function restoreTiles() {
  $$('.tile').forEach(el => el.classList.remove('big'));
  showToast('Grade restaurada', 'success');
}

// ========== RECARREGAR ==========
function reloadSession() {
  if (!selectedId) {
    showToast('Selecione uma sessão primeiro', 'warning');
    return;
  }

  const wv = viewOf(selectedId);
  if (wv) {
    wv.reload();
    showToast(`Sessão "${getDisplayName(selectedId)}" recarregada`, 'success');
  }
}

// ========== RENDERIZAÇÃO ==========
let isRendering = false;

async function render() {
  // CORRIGIDO: Prevenir re-renderizações simultâneas que causam pisca-pisca
  if (isRendering) {
    console.log('Renderização já em progresso, pulando...');
    return;
  }

  isRendering = true;

  try {
    const grid = $('grid');
    
    // CORRIGIDO: Só limpar se realmente necessário
    const existingIds = Array.from($$('.tile')).map(t => t.dataset.id);
    const needsFullRender = JSON.stringify(existingIds) !== JSON.stringify(state.ids);
    
    if (!needsFullRender) {
      // Apenas atualizar nomes e zooms sem recriar tudo
      state.ids.forEach(id => {
        const tile = tileOf(id);
        if (tile) {
          const titleEl = tile.querySelector('.tile-title');
          if (titleEl) titleEl.textContent = getDisplayName(id);
        }
      });
      isRendering = false;
      return;
    }

    grid.innerHTML = '';

    for (const id of state.ids) {
      const node = $('tpl').content.cloneNode(true);
      const tile = node.querySelector('.tile');
      tile.dataset.id = id;

      const titleEl = node.querySelector('.tile-title');
      titleEl.textContent = getDisplayName(id);
      titleEl.onclick = () => startRenaming(id);

      const titleInput = node.querySelector('.tile-title-input');
      const zoomLbl = node.querySelector('.zoomLbl');
      const zoomInput = node.querySelector('.zoomInput');
      const wv = node.querySelector('.wv');
      const loadingOverlay = node.querySelector('.loading-overlay');

      const z = clampZoom(state.zoom[id] || 1.0);

      wv.setAttribute('partition', 'persist:wa_' + id);
      wv.setAttribute('useragent', UA);

      // Loading indicator
      loadingOverlay.classList.add('show');

      wv.addEventListener('dom-ready', () => {
        try {
          wv.setZoomFactor(z);
        } catch (error) {
          console.error('Erro ao definir zoom:', error);
        }
        refreshZoomUI(id);
        loadingOverlay.classList.remove('show');
      });

      wv.addEventListener('did-fail-load', (_e, errorCode, errorDesc, url) => {
        console.error('[did-fail-load]', id, errorCode, errorDesc, url);
        loadingOverlay.classList.remove('show');
        if (errorCode !== -3) { // -3 = ERR_ABORTED (normal)
          showToast(`Erro ao carregar sessão "${getDisplayName(id)}"`, 'error');
        }
      });

      wv.addEventListener('did-start-loading', () => {
        loadingOverlay.classList.add('show');
      });

      wv.addEventListener('did-stop-loading', () => {
        loadingOverlay.classList.remove('show');
      });

      wv.src = 'https://web.whatsapp.com';

      tile.addEventListener('click', (e) => {
        if (e.target !== titleEl && e.target !== titleInput) {
          selectAndFocus(id);
        }
      });

      zoomInput.addEventListener('change', () => {
        const p = clampPercent(parseInt(zoomInput.value || '100', 10));
        applyZoom(id, p / 100);
      });

      zoomInput.value = Math.round(z * 100);
      zoomLbl.textContent = `(${Math.round(z * 100)}%)`;

      grid.appendChild(node);
    }

    if (!selectedId && state.ids.length) {
      selectAndFocus(state.ids[0]);
    }
  } finally {
    isRendering = false;
  }
}

// ========== ATALHOS DE TECLADO ==========
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+N: Nova sessão
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      addSession();
    }
    // Del: Remover sessão
    else if (e.key === 'Delete') {
      e.preventDefault();
      removeSession();
    }
    // F11: Maximizar
    else if (e.key === 'F11') {
      e.preventDefault();
      maximizeTile();
    }
    // Esc: Restaurar
    else if (e.key === 'Escape') {
      e.preventDefault();
      restoreTiles();
    }
    // Ctrl++: Zoom in
    else if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      nudgeZoom(+10);
    }
    // Ctrl+-: Zoom out
    else if (e.ctrlKey && e.key === '-') {
      e.preventDefault();
      nudgeZoom(-10);
    }
    // Ctrl+0: Reset zoom
    else if (e.ctrlKey && e.key === '0') {
      e.preventDefault();
      resetZoom();
    }
    // F5: Reload
    else if (e.key === 'F5') {
      e.preventDefault();
      reloadSession();
    }
  });
}

// ========== MENU HANDLERS ==========
function setupMenuHandlers() {
  window.waAPI.onMenuAction((action) => {
    switch (action) {
      case 'menu:new-session':
        addSession();
        break;
      case 'menu:export':
        exportConfig();
        break;
      case 'menu:import':
        importConfig();
        break;
      case 'menu:maximize':
        maximizeTile();
        break;
      case 'menu:restore':
        restoreTiles();
        break;
      case 'menu:zoom-in':
        nudgeZoom(+10);
        break;
      case 'menu:zoom-out':
        nudgeZoom(-10);
        break;
      case 'menu:zoom-reset':
        resetZoom();
        break;
    }
  });
}

// ========== TOOLBAR BINDINGS ==========
function bindToolbar() {
  $('btnAdd').onclick = addSession;
  $('btnRemove').onclick = removeSession;
  $('btnMax').onclick = maximizeTile;
  $('btnRes').onclick = restoreTiles;
  $('btnZoomIn').onclick = () => nudgeZoom(+10);
  $('btnZoomOut').onclick = () => nudgeZoom(-10);
  $('btnZoomReset').onclick = resetZoom;
  $('btnReload').onclick = reloadSession;
  $('btnTheme').onclick = toggleTheme;
  $('btnExport').onclick = exportConfig;
  $('btnImport').onclick = importConfig;

  $('helpBtn').onclick = () => {
    $('shortcutsModal').classList.add('show');
  };

  $('shortcutsClose').onclick = () => {
    $('shortcutsModal').classList.remove('show');
  };

  // Fechar modal ao clicar fora
  $('shortcutsModal').onclick = (e) => {
    if (e.target === $('shortcutsModal')) {
      $('shortcutsModal').classList.remove('show');
    }
  };

  $('confirmModal').onclick = (e) => {
    if (e.target === $('confirmModal')) {
      $('confirmCancel').click();
    }
  };
}

// ========== INICIALIZAÇÃO ==========
async function init() {
  try {
    // Carregar User Agent
    UA = await window.waAPI.userAgent();

    // Carregar estado
    const loadedState = await window.waAPI.loadState();
    state = { ...state, ...loadedState };

    // Aplicar tema
    document.documentElement.setAttribute('data-theme', state.theme || 'dark');

    // Renderizar
    await render();

    // Configurar eventos
    bindToolbar();
    setupKeyboardShortcuts();
    setupMenuHandlers();

    // Obter informações do app
    const info = await window.waAPI.getInfo();
    console.log('WA Multi v' + info.version);
    console.log('Electron:', info.electron);
    console.log('Pasta de dados:', info.dataPath);

    showToast('WA Multi carregado com sucesso!', 'success');
  } catch (error) {
    console.error('Erro na inicialização:', error);
    showToast('Erro ao inicializar: ' + error.message, 'error');
  }
}

// Iniciar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

