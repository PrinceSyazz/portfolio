const STORAGE_KEY = 'portfolio-edits-v1';
const EVENTS_KEY = 'portfolio-events-v2';
const DEFAULT_EVENTS = [];

let editingMode = false;
let periodHeld = false;
let secretLeftClicks = 0;
let pendingUploadImageData = '';
let editingEventImageData = '';

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

function loadEvents() {
    try {
        const raw = localStorage.getItem(EVENTS_KEY);
        if (!raw) return DEFAULT_EVENTS.slice();
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_EVENTS.slice();
        return parsed
            .map((item) => ({
                id: typeof item.id === 'string' ? item.id : `evt-${Date.now()}`,
                title: String(item.title || '').trim(),
                eventDate: String(item.eventDate || item.date || '').trim(),
                description: String(item.description || '').trim(),
                link: String(item.link || '').trim(),
                image: String(item.image || '').trim(),
                createdAt: String(item.createdAt || new Date().toISOString()),
            }))
            .filter((item) => item.title.length > 0);
    } catch {
        return DEFAULT_EVENTS.slice();
    }
}

function saveEvents(events) {
    try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch {
        /* ignore */
    }
}

function sortEventsNewest(events) {
    return [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function extractDomain(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return 'event link';
    }
}

function previewImageFromLink(url) {
    if (!url) return '';
    const lowered = url.toLowerCase();
    if (/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/.test(lowered)) {
        return url;
    }

    const igMatch = url.match(/instagram\.com\/(?:p|reel)\/([^/?#]+)/i);
    if (igMatch && igMatch[1]) {
        return `https://www.instagram.com/p/${igMatch[1]}/media/?size=l`;
    }

    return '';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return String(text || '').replace(/[&<>"']/g, (ch) => map[ch]);
}

function formatUploadDateTime(value) {
    if (!value) return 'Upload time pending';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    try {
        return new Intl.DateTimeFormat(undefined, {
            timeZone: 'Asia/Brunei',
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }).format(parsed);
    } catch {
        return parsed.toLocaleString();
    }
}

function formatEventDate(value) {
    if (!value) return 'Date TBD';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderEventCard(event) {
    const safeTitle = escapeHtml(event.title || 'Untitled event');
    const safeMeta = escapeHtml(formatEventDate(event.eventDate || ''));
    const safeDesc = escapeHtml(event.description || 'No description yet.');
    const safeDomain = escapeHtml(extractDomain(event.link || ''));
    const safeLink = event.link && /^https?:\/\//i.test(event.link) ? event.link : '';
    const safeLinkAttr = escapeHtml(safeLink);

    const mediaCandidate = event.image || previewImageFromLink(event.link);
    const mediaMarkup = mediaCandidate
        ? `<img src="${escapeHtml(mediaCandidate)}" alt="${safeTitle}" loading="lazy" onerror="this.remove(); this.parentElement.insertAdjacentHTML('beforeend','<div class=\"event-card__fallback\"><p class=\"event-card__domain\">${safeDomain}</p><p class=\"mt-2 text-sm text-mystic-200\">Link preview</p></div>');">`
        : `<div class="event-card__fallback"><p class="event-card__domain">${safeDomain}</p><p class="mt-2 text-sm text-mystic-200">Link preview</p></div>`;

    return `
        <article class="event-card" data-event-id="${escapeHtml(event.id)}">
            <div class="event-card__media">
                ${mediaMarkup}
            </div>
            <div class="event-card__body">
                <p class="event-card__meta">${safeMeta}</p>
                <h3 class="event-card__title">${safeTitle}</h3>
                <p class="event-card__description">${safeDesc}</p>
                <div class="event-card__links">
                    ${safeLink ? `<a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__view-link">Open event</a>` : '<span class="event-card__view-link">No link</span>'}
                    <div class="event-card__controls">
                        <button type="button" class="event-card__button" data-event-action="edit">Edit</button>
                        <button type="button" class="event-card__button event-card__button--danger" data-event-action="delete">Delete</button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

let carouselState = {
    currentIndex: 0,
    autoRotateInterval: null,
    events: [],
};

function renderCarouselEvent(event) {
    const safeTitle = escapeHtml(event.title || 'Untitled event');
    const safeMeta = escapeHtml(formatEventDate(event.eventDate || ''));
    const safeDesc = escapeHtml(event.description || 'No description yet.');
    const safeDomain = escapeHtml(extractDomain(event.link || ''));
    const safeLink = event.link && /^https?:\/\//i.test(event.link) ? event.link : '';
    const safeLinkAttr = escapeHtml(safeLink);

    const mediaCandidate = event.image || previewImageFromLink(event.link);
    const mediaMarkup = mediaCandidate
        ? `<img src="${escapeHtml(mediaCandidate)}" alt="${safeTitle}" loading="lazy" onerror="this.remove(); this.parentElement.insertAdjacentHTML('beforeend','<div class=\"event-card__fallback\"><p class=\"event-card__domain\">${safeDomain}</p><p class=\"mt-2 text-sm text-mystic-200\">Link preview</p></div>');">`
        : `<div class="event-card__fallback"><p class="event-card__domain">${safeDomain}</p><p class="mt-2 text-sm text-mystic-200">Link preview</p></div>`;

    return `
        <article class="event-card featured-carousel-item" data-event-id="${escapeHtml(event.id)}">
            <div class="event-card__media">
                ${mediaMarkup}
            </div>
            <div class="event-card__body">
                <p class="event-card__meta">${safeMeta}</p>
                <h3 class="event-card__title">${safeTitle}</h3>
                <p class="event-card__description">${safeDesc}</p>
                <div class="event-card__links">
                    ${safeLink ? `<a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__view-link">Open event</a>` : '<span class="event-card__view-link">No link</span>'}
                    <div class="event-card__controls">
                        <button type="button" class="event-card__button" data-event-action="edit">Edit</button>
                        <button type="button" class="event-card__button event-card__button--danger" data-event-action="delete">Delete</button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function renderEventListItem(event) {
    const safeTitle = escapeHtml(event.title || 'Untitled event');
    const safeMeta = escapeHtml(formatEventDate(event.eventDate || ''));
    const safeDesc = escapeHtml(event.description || 'No description yet.');
    const safeDomain = escapeHtml(extractDomain(event.link || ''));
    const safeLink = event.link && /^https?:\/\//i.test(event.link) ? event.link : '';
    const safeLinkAttr = escapeHtml(safeLink);

    const mediaCandidate = event.image || previewImageFromLink(event.link);
    const mediaMarkup = mediaCandidate
        ? `<img src="${escapeHtml(mediaCandidate)}" alt="${safeTitle}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'event-list-item__fallback\\'><p class=\\'event-list-item__domain\\'>${safeDomain}</p></div>';">`
        : `<div class="event-list-item__fallback"><p class="event-list-item__domain">${safeDomain}</p></div>`;

    return `
        <article class="event-list-item" data-event-id="${escapeHtml(event.id)}">
            <div class="event-list-item__content">
                <p class="event-list-item__date">📅 ${safeMeta}</p>
                <h2 class="event-list-item__title">${safeTitle}</h2>
                <p class="event-list-item__description">${safeDesc}</p>
                ${safeLink ? `<a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-list-item__link">View event →</a>` : ''}
            </div>
            <div class="event-list-item__image">
                ${mediaMarkup}
            </div>
        </article>
    `;
}

function updateCarouselDisplay() {
    const carousel = document.getElementById('featured-events-list');
    if (!carousel) return;

    const items = carousel.querySelectorAll('.featured-carousel-item');
    items.forEach((item, i) => {
        item.classList.toggle('featured-carousel-item--active', i === carouselState.currentIndex);
    });
}

function carouselNext() {
    if (carouselState.events.length === 0) return;
    carouselState.currentIndex = (carouselState.currentIndex + 1) % carouselState.events.length;
    updateCarouselDisplay();
}

function carouselPrev() {
    if (carouselState.events.length === 0) return;
    carouselState.currentIndex = (carouselState.currentIndex - 1 + carouselState.events.length) % carouselState.events.length;
    updateCarouselDisplay();
}

function startCarouselAutoRotate() {
    if (carouselState.autoRotateInterval) {
        clearInterval(carouselState.autoRotateInterval);
    }
    if (carouselState.events.length <= 1) return;
    carouselState.autoRotateInterval = setInterval(carouselNext, 500);
}

function stopCarouselAutoRotate() {
    if (carouselState.autoRotateInterval) {
        clearInterval(carouselState.autoRotateInterval);
        carouselState.autoRotateInterval = null;
    }
}

function initCarousel() {
    const prevBtn = document.getElementById('featured-carousel-prev');
    const nextBtn = document.getElementById('featured-carousel-next');
    const carousel = document.getElementById('featured-events-list');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopCarouselAutoRotate();
            carouselPrev();
            startCarouselAutoRotate();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopCarouselAutoRotate();
            carouselNext();
            startCarouselAutoRotate();
        });
    }

    if (carousel) {
        carousel.addEventListener('mouseenter', stopCarouselAutoRotate);
        carousel.addEventListener('mouseleave', startCarouselAutoRotate);
    }

    startCarouselAutoRotate();
}

function renderFeaturedCarousel() {
    const carouselRoot = document.getElementById('featured-events-list');
    if (!carouselRoot) return;

    const sorted = sortEventsNewest(loadEvents());
    carouselState.events = sorted.slice(0, 5);
    carouselState.currentIndex = 0;

    if (carouselState.events.length === 0) {
        carouselRoot.innerHTML = '<p class="glass-panel p-6 text-mystic-300">No featured events yet. Enter editing mode to create one.</p>';
        stopCarouselAutoRotate();
        return;
    }

    carouselRoot.innerHTML = carouselState.events.map((event) => renderCarouselEvent(event)).join('');
    updateCarouselDisplay();
    startCarouselAutoRotate();
}

function renderAllEventsList() {
    const listRoot = document.getElementById('all-events-list');
    if (!listRoot) return;

    const sorted = sortEventsNewest(loadEvents());

    listRoot.innerHTML = sorted.length
        ? sorted.map((event) => renderEventListItem(event)).join('')
        : '<p class="glass-panel p-6 text-mystic-300 text-center py-12">No events yet.</p>';
}

function renderEvents() {
    renderFeaturedCarousel();
    renderAllEventsList();
}

function getEventFormEls() {
    return {
        form: document.getElementById('event-form'),
        id: document.getElementById('event-id'),
        title: document.getElementById('event-title'),
        eventDate: document.getElementById('event-date'),
        description: document.getElementById('event-description'),
        link: document.getElementById('event-link'),
        imageFile: document.getElementById('event-image-file'),
        imageDropzone: document.getElementById('event-image-dropzone'),
        imageName: document.getElementById('event-image-name'),
        save: document.getElementById('event-save'),
        reset: document.getElementById('event-reset'),
    };
}

function setImageNameLabel(text) {
    const els = getEventFormEls();
    if (!els.imageName) return;
    els.imageName.textContent = text || 'No file selected';
}

function resetEventForm() {
    const els = getEventFormEls();
    if (!els.form) return;
    els.form.reset();
    els.id.value = '';
    pendingUploadImageData = '';
    editingEventImageData = '';
    if (els.imageFile) els.imageFile.value = '';
    setImageNameLabel('No file selected');
    if (els.save) els.save.textContent = 'Create Event';
}

function fillEventForm(event) {
    const els = getEventFormEls();
    if (!els.form) return;
    els.id.value = event.id || '';
    els.title.value = event.title || '';
    els.eventDate.value = event.eventDate || '';
    els.description.value = event.description || '';
    els.link.value = event.link || '';
    pendingUploadImageData = '';
    editingEventImageData = event.image || '';
    if (els.imageFile) els.imageFile.value = '';
    setImageNameLabel(editingEventImageData ? 'Current image attached (drop/click to replace)' : 'No file selected');
    if (els.save) els.save.textContent = 'Update Event';
    els.title.focus();
}

function upsertEventFromForm() {
    const els = getEventFormEls();
    if (!els.form || !els.title || !els.eventDate) return;

    const title = els.title.value.trim();
    const eventDate = els.eventDate.value;
    if (!title || !eventDate) return;

    const events = loadEvents();
    const id = els.id.value.trim();
    const nowIso = new Date().toISOString();

    const payload = {
        id: id || `evt-${Date.now()}`,
        title,
        eventDate,
        description: (els.description.value || '').trim(),
        link: (els.link.value || '').trim(),
        image: pendingUploadImageData || editingEventImageData || '',
        createdAt: nowIso,
    };

    const existingIndex = events.findIndex((event) => event.id === payload.id);
    if (existingIndex >= 0) {
        payload.createdAt = events[existingIndex].createdAt || nowIso;
        events[existingIndex] = payload;
    } else {
        events.push(payload);
    }

    saveEvents(events);
    renderEvents();
    initCarousel();
    resetEventForm();
}

function deleteEventById(id) {
    if (!id) return;
    const events = loadEvents();
    const next = events.filter((event) => event.id !== id);
    saveEvents(next);
    renderEvents();
    initCarousel();
    const els = getEventFormEls();
    if (els.id && els.id.value === id) {
        resetEventForm();
    }
}

function readImageFileAsDataUrl(file) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) {
            resolve('');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            resolve(typeof reader.result === 'string' ? reader.result : '');
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
    });
}

function initEventCrud() {
    const els = getEventFormEls();
    if (!els.form) return;

    els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        upsertEventFromForm();
    });

    if (els.reset) {
        els.reset.addEventListener('click', () => {
            resetEventForm();
        });
    }

    if (els.imageFile) {
        els.imageFile.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
            pendingUploadImageData = await readImageFileAsDataUrl(file);
            if (pendingUploadImageData) {
                setImageNameLabel(file ? file.name : 'Image selected');
            } else {
                setImageNameLabel('No file selected');
            }
        });
    }

    if (els.imageDropzone && els.imageFile) {
        els.imageDropzone.addEventListener('click', () => {
            els.imageFile.click();
        });

        els.imageDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            els.imageDropzone.classList.add('events-editor__dropzone--active');
        });

        els.imageDropzone.addEventListener('dragleave', () => {
            els.imageDropzone.classList.remove('events-editor__dropzone--active');
        });

        els.imageDropzone.addEventListener('drop', async (e) => {
            e.preventDefault();
            els.imageDropzone.classList.remove('events-editor__dropzone--active');
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0] ? e.dataTransfer.files[0] : null;
            pendingUploadImageData = await readImageFileAsDataUrl(file);
            if (pendingUploadImageData) {
                setImageNameLabel(file ? file.name : 'Image selected');
            } else {
                setImageNameLabel('No file selected');
            }
        });
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-event-action]');
        if (!btn) return;
        const card = btn.closest('[data-event-id]');
        if (!card) return;
        const eventId = card.getAttribute('data-event-id');
        if (!eventId) return;

        if (btn.getAttribute('data-event-action') === 'edit') {
            const event = loadEvents().find((item) => item.id === eventId);
            if (event) fillEventForm(event);
        }

        if (btn.getAttribute('data-event-action') === 'delete') {
            deleteEventById(eventId);
        }
    });
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

    document.querySelectorAll('[data-editing-only]').forEach((el) => {
        el.hidden = !on;
        el.setAttribute('aria-hidden', on ? 'false' : 'true');
    });

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

    const exitKey = e.key === 'q' || e.key === 'Q' || e.key === 'Escape';
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
renderEvents();
initCarousel();
initEventCrud();
