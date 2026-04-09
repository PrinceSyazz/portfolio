const STORAGE_KEY = 'portfolio-edits-v1';

let editingMode = false;
let periodHeld = false;
let secretLeftClicks = 0;

function getLoaderEl() {
    return document.getElementById('loader');
}

function isLoaderBlocking() {
    const el = getLoaderEl();
    return Boolean(el);
}

function loadStoredEdits() {
    let data = {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) data = JSON.parse(raw);
    } catch {
        /* ignore */
    }
    return data && typeof data === 'object' ? data : {};
}

function saveStoredEdits(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        /* ignore */
    }
}

function applyStoredEdits() {
    const data = loadStoredEdits();
    document.querySelectorAll('[data-editable-id]').forEach((el) => {
        const id = el.getAttribute('data-editable-id');
        if (!id || data[id] == null) return;
        if (el.tagName === 'A' && el.dataset.editableLink === 'email') {
            el.textContent = data[id];
            const t = String(data[id]).trim();
            if (t) el.href = `mailto:${t.replace(/^mailto:/i, '')}`;
            return;
        }
        if (el.tagName === 'A' && el.dataset.editableLink === 'url') {
            el.textContent = data[id];
            const t = String(data[id]).trim();
            if (t.startsWith('http')) el.href = t;
            return;
        }
        if (el.tagName === 'A' && !el.dataset.editableLink) {
            el.textContent = data[id];
            return;
        }
        el.innerHTML = data[id];
    });
}

function collectEditsFromDom() {
    const data = {};
    document.querySelectorAll('[data-editable-id]').forEach((el) => {
        const id = el.getAttribute('data-editable-id');
        if (!id) return;
        if (el.tagName === 'A' && el.dataset.editableLink === 'email') {
            data[id] = el.textContent.trim();
            const t = data[id];
            if (t) el.href = `mailto:${t.replace(/^mailto:/i, '')}`;
            return;
        }
        if (el.tagName === 'A' && el.dataset.editableLink === 'url') {
            data[id] = el.textContent.trim();
            const t = data[id];
            if (t.startsWith('http')) el.href = t;
            return;
        }
        if (el.tagName === 'A' && !el.dataset.editableLink) {
            data[id] = el.textContent.trim();
            return;
        }
        data[id] = el.innerHTML;
    });
    saveStoredEdits(data);
}

function setEditingMode(on) {
    editingMode = on;
    document.body.classList.toggle('editing-mode', on);

    const banner = document.getElementById('edit-mode-banner');
    if (banner) {
        banner.hidden = !on;
        banner.setAttribute('aria-hidden', on ? 'false' : 'true');
    }

    document.querySelectorAll('[data-editable-id]').forEach((el) => {
        if (on) {
            el.setAttribute('contenteditable', 'true');
            el.setAttribute('spellcheck', 'true');
        } else {
            el.removeAttribute('contenteditable');
            el.removeAttribute('spellcheck');
        }
    });

    if (!on) {
        collectEditsFromDom();
    }
}

function saveEditsIfNeeded() {
    if (editingMode) {
        collectEditsFromDom();
    }
}

window.addEventListener('beforeunload', saveEditsIfNeeded);
window.addEventListener('pagehide', saveEditsIfNeeded);

function enterEditingMode() {
    if (editingMode) return;
    setEditingMode(true);
}

function exitEditingMode() {
    if (!editingMode) return;
    setEditingMode(false);
}

document.addEventListener('keydown', (e) => {
    const isPeriod = e.code === 'Period' || e.code === 'NumpadDecimal' || e.key === '.';
    if (isPeriod) {
        periodHeld = true;
    }

    if (!editingMode) return;

    const exitKey = e.key === 'q' || e.key === 'Q';
    if (!exitKey) return;

    const inEditable = e.target && e.target.closest && e.target.closest('[contenteditable="true"]');
    if (inEditable) return;

    e.preventDefault();
    exitEditingMode();
});

document.addEventListener('keyup', (e) => {
    const isPeriod = e.code === 'Period' || e.code === 'NumpadDecimal' || e.key === '.';
    if (isPeriod) {
        periodHeld = false;
        secretLeftClicks = 0;
    }
});

document.addEventListener(
    'click',
    (e) => {
        if (editingMode || isLoaderBlocking()) return;
        if (!periodHeld) return;
        if (e.button !== 0) return;

        secretLeftClicks += 1;
        if (secretLeftClicks >= 3) {
            e.preventDefault();
            e.stopImmediatePropagation();
            secretLeftClicks = 0;
            enterEditingMode();
        }
    },
    true,
);

applyStoredEdits();
