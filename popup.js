const toggleDelete = document.getElementById('toggle-delete');
const inputName    = document.getElementById('input-name');
const inputText = document.getElementById('input-text');
const btnAdd    = document.getElementById('btn-add');
const list      = document.getElementById('prompt-list');

// Load and render saved prompts
function loadPrompts() {
  chrome.storage.sync.get('prompts', ({ prompts = [] }) => {
    list.innerHTML = '';

    if (prompts.length === 0) {
      list.innerHTML = '<div class="empty">No saved prompts yet.</div>';
      return;
    }

    prompts.forEach((prompt, index) => {
      const item = document.createElement('div');
      item.className = 'prompt-item';
      item.innerHTML = `
        <div class="prompt-info">
          <div class="prompt-name">//${prompt.name}</div>
          <div class="prompt-text">${prompt.text}</div>
        </div>
        <button class="delete" data-index="${index}" title="Delete">×</button>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll('button.delete').forEach(btn => {
      btn.addEventListener('click', () => deletePrompt(parseInt(btn.dataset.index)));
    });
  });
}

// Save a new prompt
btnAdd.addEventListener('click', () => {
  const name = inputName.value.trim();
  const text = inputText.value.trim();

  if (!name || !text) return;

  chrome.storage.sync.get('prompts', ({ prompts = [] }) => {
    prompts.push({ name, text });
    chrome.storage.sync.set({ prompts }, () => {
      inputName.value = '';
      inputText.value = '';
      loadPrompts();
    });
  });
});

// Delete a prompt by index
function deletePrompt(index) {
  chrome.storage.sync.get('prompts', ({ prompts = [] }) => {
    prompts.splice(index, 1);
    chrome.storage.sync.set({ prompts }, loadPrompts);
  });
}

// Allow saving with Enter in the name field
inputName.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnAdd.click();
});

// Toggle delete mode
chrome.storage.sync.get('deleteMode', ({ deleteMode = false }) => {
  toggleDelete.checked = deleteMode;
});

toggleDelete.addEventListener('change', () => {
  chrome.storage.sync.set({ deleteMode: toggleDelete.checked });
});

loadPrompts();
