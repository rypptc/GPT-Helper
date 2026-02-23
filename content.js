// --- Cache local (evita leer storage en cada evento) ---

let cachedPrompts    = [];
let cachedDeleteMode = false;

chrome.storage.sync.get(['prompts', 'deleteMode'], ({ prompts = [], deleteMode = false }) => {
  cachedPrompts    = prompts;
  cachedDeleteMode = deleteMode;
  applyDeleteMode(deleteMode);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.prompts)    cachedPrompts    = changes.prompts.newValue    || [];
  if (changes.deleteMode) {
    cachedDeleteMode = changes.deleteMode.newValue;
    applyDeleteMode(cachedDeleteMode);
  }
});

// --- Helpers ---

function waitFor(selector, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout: no apareció "${selector}"`));
    }, timeout);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Lógica de borrado ---

async function deleteCurrentChat() {
  const optionsButton = document.querySelector('[data-testid="conversation-options-button"]');
  if (!optionsButton) throw new Error('No se encontró el botón de opciones');

  optionsButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  optionsButton.dispatchEvent(new MouseEvent('mousedown',   { bubbles: true, cancelable: true }));
  optionsButton.dispatchEvent(new PointerEvent('pointerup',  { bubbles: true, cancelable: true }));
  optionsButton.dispatchEvent(new MouseEvent('mouseup',     { bubbles: true, cancelable: true }));
  optionsButton.click();
  await sleep(500);

  await waitFor('[role="menuitem"]');
  const menuItems = document.querySelectorAll('[role="menuitem"]');
  const deleteItem = [...menuItems].find(el => el.textContent.trim() === 'Delete');
  if (!deleteItem) throw new Error('No se encontró la opción Delete en el menú');
  deleteItem.click();

  await sleep(300);
  const allButtons = document.querySelectorAll('button');
  const confirmButton = [...allButtons].find(el => el.textContent.trim() === 'Delete');
  if (!confirmButton) throw new Error('No se encontró el botón de confirmación');
  confirmButton.click();
}

// --- Botón de borrado ---

function createDeleteButton() {
  const btn = document.createElement('button');
  btn.id = 'ccgpt-delete-btn';
  btn.title = 'Borrar chat';
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  `;

  Object.assign(btn.style, {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '36px',
    height:         '36px',
    borderRadius:   '8px',
    border:         'none',
    cursor:         'pointer',
    background:     'transparent',
    color:          '#ef4444',
    transition:     'background 0.2s',
  });

  btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(239,68,68,0.15)'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; });

  btn.addEventListener('click', async () => {
    try {
      await deleteCurrentChat();
    } catch (err) {
      console.error('[CustomChatGPT]', err.message);
    }
  });

  return btn;
}

function positionButton() {
  const btn = document.getElementById('ccgpt-delete-btn');
  if (!btn) return;
  const optionsButton = document.querySelector('[data-testid="conversation-options-button"]');
  if (!optionsButton) return;
  const rect = optionsButton.getBoundingClientRect();
  btn.style.top  = (rect.bottom + 4) + 'px';
  btn.style.left = rect.left + 'px';
}

function injectButton() {
  if (document.getElementById('ccgpt-delete-btn')) return;
  const optionsButton = document.querySelector('[data-testid="conversation-options-button"]');
  if (!optionsButton) return;
  const btn = createDeleteButton();
  btn.style.position = 'fixed';
  document.body.appendChild(btn); // fuera del árbol de React
  positionButton();
}

function removeButton() {
  document.getElementById('ccgpt-delete-btn')?.remove();
}

// Muestra u oculta el botón según el estado del modo borrado
function applyDeleteMode(enabled) {
  if (enabled) {
    injectButton();
  } else {
    removeButton();
  }
}

// Re-inyecta el botón si ChatGPT re-renderiza el header
// Debounced para no dispararse en cada mutación individual de React
let observerTimer    = null;
let reconnectTimer   = null;
const observer = new MutationObserver(() => {
  clearTimeout(observerTimer);
  observerTimer = setTimeout(() => {
    if (cachedDeleteMode) {
      if (!document.getElementById('ccgpt-delete-btn')) {
        injectButton();
      } else {
        positionButton();
      }
    }
  }, 150);
});

observer.observe(document.body, { childList: true, subtree: true });

// --- Slash command (//) ---

let slashMenu     = null;
let slashFilter   = '';
let slashItems    = [];
let slashSelected = 0;
let slashInputEl  = null;

function showSlashMenu(filter, inputEl) {
  slashInputEl = inputEl;
  const prompts = cachedPrompts;
  {
    slashItems = filter
      ? prompts.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
      : prompts;

    if (slashItems.length === 0) { hideSlashMenu(); return; }

    if (!slashMenu) {
      slashMenu = document.createElement('div');
      slashMenu.id = 'ccgpt-slash-menu';
      Object.assign(slashMenu.style, {
        position:     'fixed',
        background:   '#ffffff',
        border:       '1px solid #cbd5e0',
        borderRadius: '10px',
        boxShadow:    '0 8px 24px rgba(0,0,0,0.12)',
        zIndex:       '9999',
        minWidth:     '280px',
        maxHeight:    '240px',
        overflowY:    'auto',
      });

      // Listeners agregados una sola vez al crear el menú
      slashMenu.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.ccgpt-item');
        if (!item) return;
        slashMenu.querySelectorAll('.ccgpt-item').forEach(el => {
          el.style.background = el === item ? '#f7fafc' : 'transparent';
        });
        slashSelected = parseInt(item.dataset.index);
      });

      slashMenu.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const item = e.target.closest('.ccgpt-item');
        if (item) {
          slashSelected = parseInt(item.dataset.index);
          confirmSlashSelection();
        }
      });

      document.body.appendChild(slashMenu);
    }

    const rect = inputEl.getBoundingClientRect();
    slashMenu.style.left   = rect.left + 'px';
    slashMenu.style.bottom = (window.innerHeight - rect.top + 8) + 'px';

    slashSelected = 0;
    renderSlashMenu();
  }
}

function renderSlashMenu() {
  if (!slashMenu) return;
  slashMenu.innerHTML = slashItems.map((p, i) => `
    <div class="ccgpt-item" data-index="${i}" style="
      padding: 9px 14px;
      cursor: pointer;
      background: ${i === slashSelected ? '#f7fafc' : 'transparent'};
      border-bottom: 1px solid #e2e8f0;
    ">
      <div style="font-size:12px;font-weight:600;color:#6b46c1;">//${p.name}</div>
      <div style="font-size:11px;color:#718096;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.text.substring(0, 60)}${p.text.length > 60 ? '…' : ''}</div>
    </div>
  `).join('');

}

function hideSlashMenu() {
  slashMenu?.remove();
  slashMenu     = null;
  slashItems    = [];
  slashSelected = 0;
}

function confirmSlashSelection() {
  if (!slashItems[slashSelected] || !slashInputEl) return;
  const prompt = slashItems[slashSelected];
  const searchStr = '//' + slashFilter;

hideSlashMenu();
  slashFilter = '';

  clearTimeout(observerTimer);
  clearTimeout(reconnectTimer);
  observer.disconnect();

  console.time('[CCGPT] solo insercion');

  // Setear texto directo en el DOM — evita la reconciliación pesada de React
  const currentText = slashInputEl.innerText || '';
  const newText = currentText.replace(searchStr, prompt.text);

  console.time('[CCGPT] innerText');
  slashInputEl.innerText = newText;
  console.timeEnd('[CCGPT] innerText');

  // Cursor al final
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(slashInputEl);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);

  console.time('[CCGPT] dispatchEvent');
  slashInputEl.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
  console.timeEnd('[CCGPT] dispatchEvent');

  console.timeEnd('[CCGPT] solo insercion');
  console.timeEnd('[CCGPT] // → prompt insertado');

  // Reconectar — usamos una sola variable para no acumular timers
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    observer.observe(document.body, { childList: true, subtree: true });
  }, 500);
}

// Detecta // mientras el usuario escribe
document.addEventListener('input', (e) => {
  if (!e.target.isContentEditable) return;
  const text = e.target.innerText || '';
  const match = text.match(/\/\/(\w*)$/);
  if (match) {
    if (!slashMenu) console.time('[CCGPT] // → prompt insertado');
    slashFilter = match[1];
    showSlashMenu(slashFilter, e.target);
  } else {
    hideSlashMenu();
  }
});

// Navegación con teclado dentro del menú
document.addEventListener('keydown', (e) => {
  if (!slashMenu || !slashItems.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    slashSelected = Math.min(slashSelected + 1, slashItems.length - 1);
    renderSlashMenu();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    slashSelected = Math.max(slashSelected - 1, 0);
    renderSlashMenu();
  } else if (e.key === 'Escape') {
    hideSlashMenu();
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault();
    confirmSlashSelection();
  }
}, true);
