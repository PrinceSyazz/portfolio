const STORAGE_KEY = 'portfolio-edits-v1';
const EVENTS_KEY = 'portfolio-events-v2';
const ABOUT_KEY = 'portfolio-about-v1';
const DEFAULT_EVENTS = [];

let editingMode = false;
let periodHeld = false;
let secretLeftClicks = 0;
let pendingUploadImageData = '';
let editingEventImageData = '';
let aboutImageRotateInterval = null;

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
        carouselRoot.innerHTML = `
            <article class="event-card featured-carousel-item featured-carousel-item--active event-card--empty">
                <div class="event-card__media">
                    <div class="event-card__fallback">
                        <p class="event-card__domain">Featured Events</p>
                        <p class="mt-2 text-sm text-mystic-200">No featured events yet</p>
                    </div>
                </div>
                <div class="event-card__body">
                    <p class="event-card__meta">Date TBD</p>
                    <h3 class="event-card__title">Add your first event</h3>
                    <p class="event-card__description">Enter editing mode and create an event to start the auto carousel.</p>
                </div>
            </article>
        `;
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
    const nonFeatured = sorted.slice(5);

    listRoot.innerHTML = nonFeatured.length
        ? nonFeatured.map((event) => renderEventListItem(event)).join('')
        : '<p class="glass-panel p-6 text-mystic-300 text-center py-12">No other events yet.</p>';
}

function renderEvents() {
    renderFeaturedCarousel();
    renderAllEventsList();
}

function initOtherEventsToggle() {
    const trigger = document.getElementById('view-other-events-trigger');
    const section = document.getElementById('other-events');
    if (!trigger || !section) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        section.hidden = false;
        section.setAttribute('aria-hidden', 'false');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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

function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
        if (!file) {
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

function clampPercent(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return 0;
    return Math.max(0, Math.min(100, Math.round(numeric)));
}

function loadAboutData() {
    const fallback = {
        profileImages: [],
        cvDataUrl: '',
        cvFileName: '',
        languages: [],
        skills: [],
    };

    try {
        const raw = localStorage.getItem(ABOUT_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return fallback;

        const profileImages = Array.isArray(parsed.profileImages)
            ? parsed.profileImages.filter((src) => typeof src === 'string' && src.startsWith('data:image/'))
            : [];

        const languages = Array.isArray(parsed.languages)
            ? parsed.languages
                  .map((item) => ({
                      name: String(item.name || '').trim(),
                      speaking: clampPercent(item.speaking),
                      writing: clampPercent(item.writing),
                  }))
                  .filter((item) => item.name.length > 0)
            : [];

        const skills = Array.isArray(parsed.skills)
            ? parsed.skills
                  .map((item) => ({
                      name: String(item.name || '').trim(),
                      percentage: clampPercent(item.percentage),
                  }))
                  .filter((item) => item.name.length > 0)
            : [];

        return {
            profileImages,
            cvDataUrl: typeof parsed.cvDataUrl === 'string' ? parsed.cvDataUrl : '',
            cvFileName: typeof parsed.cvFileName === 'string' ? parsed.cvFileName : '',
            languages,
            skills,
        };
    } catch {
        return fallback;
    }
}

function saveAboutData(data) {
    try {
        localStorage.setItem(ABOUT_KEY, JSON.stringify(data));
    } catch {
        /* ignore */
    }
}

function renderAboutLanguages(languages) {
    const root = document.getElementById('about-language-list');
    if (!root) return;

    if (!languages.length) {
        root.innerHTML = '<p class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-mystic-300 sm:col-span-2">No languages added.</p>';
        return;
    }

    root.innerHTML = languages
        .map(
            (item) => `
                <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-mystic-200">
                    <p class="font-medium text-mystic-100">${escapeHtml(item.name)}</p>
                    <p class="mt-1 text-xs text-mystic-400">Speaking ${item.speaking}% · Written ${item.writing}%</p>
                </div>
            `,
        )
        .join('');
}

function renderAboutSkills(skills) {
    const root = document.getElementById('about-skills-list');
    if (!root) return;

    if (!skills.length) {
        root.innerHTML = '<p class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-mystic-300">No skills added.</p>';
        return;
    }

    root.innerHTML = skills
        .map(
            (item) => `
                <span class="inline-flex items-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 py-2 text-sm text-mystic-100">
                    <span>${escapeHtml(item.name)}</span>
                    <span class="text-xs text-mystic-300">${item.percentage}%</span>
                </span>
            `,
        )
        .join('');
}

function renderAboutCv(data) {
    const link = document.getElementById('about-cv-download');
    const note = document.getElementById('about-cv-note');
    if (!link) return;

    if (!link.dataset.defaultHref) {
        link.dataset.defaultHref = link.getAttribute('href') || '#';
    }

    if (data.cvDataUrl) {
        link.href = data.cvDataUrl;
        link.setAttribute('download', data.cvFileName || 'cv-file');
        if (note) note.textContent = `Current CV: ${data.cvFileName || 'uploaded file'}`;
        return;
    }

    link.href = link.dataset.defaultHref;
    link.setAttribute('download', '');
    if (note) note.textContent = 'Add your CV file at public/cv.pdf';
}

function renderAboutProfileImages(profileImages) {
    const stage = document.getElementById('about-profile-picture-stage');
    if (!stage) {
        if (aboutImageRotateInterval) {
            clearInterval(aboutImageRotateInterval);
            aboutImageRotateInterval = null;
        }
        return;
    }

    if (aboutImageRotateInterval) {
        clearInterval(aboutImageRotateInterval);
        aboutImageRotateInterval = null;
    }

    if (!profileImages.length) {
        stage.innerHTML = '<div class="flex min-h-[24rem] items-center justify-center p-6 text-center text-mystic-400">No profile image uploaded.</div>';
        return;
    }

    let idx = 0;
    stage.innerHTML = `<img src="${escapeHtml(profileImages[idx])}" alt="Profile picture" class="h-full min-h-[24rem] w-full object-cover">`;

    if (profileImages.length > 1) {
        aboutImageRotateInterval = setInterval(() => {
            idx = (idx + 1) % profileImages.length;
            const image = stage.querySelector('img');
            if (image) image.src = profileImages[idx];
        }, 500);
    }
}

function renderAboutEditorLists(data) {
    const languageEditorRoot = document.getElementById('about-language-editor-list');
    const skillEditorRoot = document.getElementById('about-skill-editor-list');

    if (languageEditorRoot) {
        languageEditorRoot.innerHTML = data.languages.length
            ? data.languages
                  .map(
                      (item, index) => `
                        <div class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-mystic-200">
                            <span>${escapeHtml(item.name)} (S ${item.speaking}% / W ${item.writing}%)</span>
                            <button type="button" class="event-card__button event-card__button--danger" data-about-remove-language="${index}">Remove</button>
                        </div>
                    `,
                  )
                  .join('')
            : '<p class="text-xs text-mystic-400">No languages added.</p>';
    }

    if (skillEditorRoot) {
        skillEditorRoot.innerHTML = data.skills.length
            ? data.skills
                  .map(
                      (item, index) => `
                        <div class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-mystic-200">
                            <span>${escapeHtml(item.name)} (${item.percentage}%)</span>
                            <button type="button" class="event-card__button event-card__button--danger" data-about-remove-skill="${index}">Remove</button>
                        </div>
                    `,
                  )
                  .join('')
            : '<p class="text-xs text-mystic-400">No skills added.</p>';
    }
}

function renderAboutSection(data) {
    renderAboutProfileImages(data.profileImages);
    renderAboutCv(data);
    renderAboutLanguages(data.languages);
    renderAboutSkills(data.skills);
    renderAboutEditorLists(data);
}

function initAboutEditor() {
    const data = loadAboutData();
    renderAboutSection(data);

    const editor = document.getElementById('about-editor');
    if (!editor) return;

    const imageInput = document.getElementById('about-profile-images');
    const clearImagesBtn = document.getElementById('about-clear-images');
    const cvInput = document.getElementById('about-cv-file');
    const cvFileName = document.getElementById('about-cv-file-name');

    const languageName = document.getElementById('about-language-name');
    const languageSpeaking = document.getElementById('about-language-speaking');
    const languageWriting = document.getElementById('about-language-writing');
    const addLanguageBtn = document.getElementById('about-add-language');

    const skillName = document.getElementById('about-skill-name');
    const skillPercent = document.getElementById('about-skill-percent');
    const addSkillBtn = document.getElementById('about-add-skill');

    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            if (!files.length) return;

            const uploaded = await Promise.all(files.map((file) => readImageFileAsDataUrl(file)));
            const valid = uploaded.filter(Boolean);
            if (!valid.length) return;

            data.profileImages = [...data.profileImages, ...valid];
            saveAboutData(data);
            renderAboutSection(data);
            imageInput.value = '';
        });
    }

    if (clearImagesBtn) {
        clearImagesBtn.addEventListener('click', () => {
            data.profileImages = [];
            saveAboutData(data);
            renderAboutSection(data);
        });
    }

    if (cvInput) {
        cvInput.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
            if (!file) return;

            const encoded = await readFileAsDataUrl(file);
            if (!encoded) return;

            data.cvDataUrl = encoded;
            data.cvFileName = file.name || 'cv-file';
            saveAboutData(data);
            renderAboutSection(data);
            if (cvFileName) cvFileName.textContent = data.cvFileName;
        });
    }

    if (addLanguageBtn && languageName && languageSpeaking && languageWriting) {
        addLanguageBtn.addEventListener('click', () => {
            const name = languageName.value.trim();
            if (!name) return;

            data.languages.push({
                name,
                speaking: clampPercent(languageSpeaking.value),
                writing: clampPercent(languageWriting.value),
            });
            saveAboutData(data);
            renderAboutSection(data);
            languageName.value = '';
            languageSpeaking.value = '';
            languageWriting.value = '';
        });
    }

    if (addSkillBtn && skillName && skillPercent) {
        addSkillBtn.addEventListener('click', () => {
            const name = skillName.value.trim();
            if (!name) return;

            data.skills.push({
                name,
                percentage: clampPercent(skillPercent.value),
            });
            saveAboutData(data);
            renderAboutSection(data);
            skillName.value = '';
            skillPercent.value = '';
        });
    }

    editor.addEventListener('click', (e) => {
        const removeLanguageBtn = e.target.closest('[data-about-remove-language]');
        if (removeLanguageBtn) {
            const index = Number(removeLanguageBtn.getAttribute('data-about-remove-language'));
            if (!Number.isNaN(index)) {
                data.languages.splice(index, 1);
                saveAboutData(data);
                renderAboutSection(data);
            }
            return;
        }

        const removeSkillBtn = e.target.closest('[data-about-remove-skill]');
        if (removeSkillBtn) {
            const index = Number(removeSkillBtn.getAttribute('data-about-remove-skill'));
            if (!Number.isNaN(index)) {
                data.skills.splice(index, 1);
                saveAboutData(data);
                renderAboutSection(data);
            }
        }
    });

    if (cvFileName) {
        cvFileName.textContent = data.cvFileName || 'No file selected';
    }
}

function normalizeDateInput(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/);
    if (slashMatch) {
        const day = Number(slashMatch[1]);
        const month = Number(slashMatch[2]);
        const yearPart = slashMatch[3];
        const fullYear = yearPart.length === 2 ? 2000 + Number(yearPart) : Number(yearPart);

        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && fullYear >= 1900) {
            return `${String(fullYear).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return '';
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDobDisplay(isoDate) {
    const normalized = normalizeDateInput(isoDate);
    if (!normalized) return String(isoDate || '').trim() || 'Not set';

    const [year, month, day] = normalized.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
}

function initAboutDobPicker() {
    const dobDisplay = document.getElementById('about-profile-dob');
    const dobPicker = document.getElementById('about-profile-dob-picker');
    if (!dobDisplay || !dobPicker) return;

    const initialNormalized = normalizeDateInput(dobDisplay.textContent || '');
    if (initialNormalized) {
        dobDisplay.textContent = formatDobDisplay(initialNormalized);
    }

    dobDisplay.addEventListener('dblclick', () => {
        if (!editingMode) return;

        const normalized = normalizeDateInput(dobDisplay.textContent || '');
        if (normalized) dobPicker.value = normalized;

        if (typeof dobPicker.showPicker === 'function') {
            dobPicker.showPicker();
        } else {
            dobPicker.click();
        }
    });

    dobPicker.addEventListener('change', () => {
        if (!dobPicker.value) return;
        dobDisplay.textContent = formatDobDisplay(dobPicker.value);
        collectEditsFromDom();
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
        if (el.id === 'about-profile-dob') {
            if (on) {
                el.removeAttribute('contenteditable');
                el.removeAttribute('spellcheck');
            }
            return;
        }

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
initOtherEventsToggle();
initEventCrud();
initAboutEditor();
initAboutDobPicker();
