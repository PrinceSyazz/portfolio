const STORAGE_KEY = 'portfolio-edits-v1';
const EVENTS_KEY = 'portfolio-events-v2';
const PROJECTS_KEY = 'portfolio-projects-v1';
const CONTACT_KEY = 'portfolio-contact-v1';
const COMMENTS_KEY = 'portfolio-comments-v1';
const ABOUT_KEY = 'portfolio-about-v1';
const DEFAULT_EVENTS = [];
const DEFAULT_PROJECTS = [];
const DEFAULT_CONTACT = {
    whatsappNumber: '',
    whatsappLink: '',
    emailAddress: '',
    instagramUsername: '',
    instagramLink: '',
};

let editingMode = false;
let periodHeld = false;
let secretLeftClicks = 0;
let pendingUploadImageData = '';
let editingEventImageData = '';
let pendingProjectImageData = '';
let editingProjectImageData = '';
let pendingCommentReply = '';
let aboutImageRotateInterval = null;

function confirmDeleteAction() {
    return window.confirm('Are you sure you wanna delete this?');
}

function confirmChangeAction() {
    return window.confirm('Are you sure you wanna make this changes?');
}

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
                hidden: Boolean(item.hidden),
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

function loadProjects() {
    try {
        const raw = localStorage.getItem(PROJECTS_KEY);
        if (!raw) return DEFAULT_PROJECTS.slice();
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return DEFAULT_PROJECTS.slice();
        return parsed
            .map((item) => ({
                id: typeof item.id === 'string' ? item.id : `proj-${Date.now()}`,
                title: String(item.title || '').trim(),
                description: String(item.description || '').trim(),
                link: String(item.link || '').trim(),
                image: String(item.image || '').trim(),
                hidden: Boolean(item.hidden),
                createdAt: String(item.createdAt || new Date().toISOString()),
            }))
            .filter((item) => item.title.length > 0);
    } catch {
        return DEFAULT_PROJECTS.slice();
    }
}

function saveProjects(projects) {
    try {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch {
        /* ignore */
    }
}

function loadContactLinks() {
    try {
        const raw = localStorage.getItem(CONTACT_KEY);
        if (!raw) return { ...DEFAULT_CONTACT };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_CONTACT };
        return {
            whatsappNumber: String(parsed.whatsappNumber || '').trim(),
            whatsappLink: String(parsed.whatsappLink || '').trim(),
            emailAddress: String(parsed.emailAddress || '').trim(),
            instagramUsername: String(parsed.instagramUsername || '').trim(),
            instagramLink: String(parsed.instagramLink || '').trim(),
        };
    } catch {
        return { ...DEFAULT_CONTACT };
    }
}

function saveContactLinks(contact) {
    try {
        localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
    } catch {
        /* ignore */
    }
}

function loadComments() {
    try {
        const raw = localStorage.getItem(COMMENTS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((item) => ({
                id: typeof item.id === 'string' ? item.id : `cmt-${Date.now()}`,
                username: String(item.username || '').trim(),
                body: String(item.body || '').trim(),
                reply: String(item.reply || '').trim(),
                likes: Number.isFinite(Number(item.likes)) ? Math.max(0, Number(item.likes)) : 0,
                liked: Boolean(item.liked),
                createdAt: String(item.createdAt || new Date().toISOString()),
                updatedAt: String(item.updatedAt || new Date().toISOString()),
            }))
            .filter((item) => item.body.length > 0);
    } catch {
        return [];
    }
}

function saveComments(comments) {
    try {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    } catch {
        /* ignore */
    }
}

function sortCommentsNewest(comments) {
    return [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function normalizeWhatsAppNumber(value) {
    return String(value || '').replace(/[^\d]/g, '');
}

function normalizeInstagramUsername(value) {
    return String(value || '').trim().replace(/^@+/, '');
}

function renderContactLinks() {
    const contact = loadContactLinks();

    const whatsappText = document.getElementById('contact-whatsapp-text');
    const whatsappLink = document.getElementById('contact-whatsapp-link');
    const emailText = document.getElementById('contact-email-text');
    const emailLink = document.getElementById('contact-email-link');
    const instagramText = document.getElementById('contact-instagram-text');
    const instagramLink = document.getElementById('contact-instagram-link');

    const whatsappNumber = contact.whatsappNumber;
    const whatsappHref = contact.whatsappLink || (whatsappNumber ? `https://wa.me/${normalizeWhatsAppNumber(whatsappNumber)}` : '#');
    const emailAddress = contact.emailAddress;
    const emailHref = emailAddress ? `mailto:${emailAddress.replace(/^mailto:/i, '')}` : '#';
    const instagramUsername = normalizeInstagramUsername(contact.instagramUsername);
    const instagramHref = contact.instagramLink || (instagramUsername ? `https://instagram.com/${instagramUsername}` : '#');

    if (whatsappText) whatsappText.textContent = whatsappNumber || 'Tap to connect';
    if (whatsappLink) {
        whatsappLink.href = whatsappHref;
        whatsappLink.toggleAttribute('aria-disabled', !whatsappNumber && !contact.whatsappLink);
        whatsappLink.classList.toggle('pointer-events-none', !whatsappNumber && !contact.whatsappLink);
    }

    if (emailText) emailText.textContent = emailAddress || 'Tap to connect';
    if (emailLink) {
        emailLink.href = emailHref;
        emailLink.toggleAttribute('aria-disabled', !emailAddress);
        emailLink.classList.toggle('pointer-events-none', !emailAddress);
    }

    if (instagramText) instagramText.textContent = instagramUsername ? `@${instagramUsername}` : 'Tap to connect';
    if (instagramLink) {
        instagramLink.href = instagramHref;
        instagramLink.toggleAttribute('aria-disabled', !instagramUsername && !contact.instagramLink);
        instagramLink.classList.toggle('pointer-events-none', !instagramUsername && !contact.instagramLink);
    }
}

function getCommentFormEls() {
    return {
        form: document.getElementById('comment-form'),
        username: document.getElementById('comment-username'),
        body: document.getElementById('comment-body'),
        submit: document.getElementById('comment-submit'),
        list: document.getElementById('comment-list'),
        count: document.getElementById('comment-count'),
    };
}

function escapeComment(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function renderCommentCard(comment) {
    const safeUsername = escapeHtml(comment.username || 'Anonymous');
    const safeBody = escapeComment(comment.body || '');
    const safeReply = escapeComment(comment.reply || '');
    const timeLabel = escapeHtml(formatUploadDateTime(comment.createdAt || ''));
    const replyTime = comment.updatedAt && comment.reply ? escapeHtml(formatUploadDateTime(comment.updatedAt)) : '';
    const likeCount = Number.isFinite(Number(comment.likes)) ? Math.max(0, Number(comment.likes)) : 0;

    return `
        <article class="comment-card glass-panel p-5 md:p-6" data-comment-id="${escapeHtml(comment.id)}">
            <div>
                <p class="text-sm font-semibold text-mystic-100">@${safeUsername} <span class="text-mystic-500">· ${timeLabel}</span></p>
            </div>
            <div class="mt-4 relative pr-10">
                <p class="whitespace-pre-wrap text-sm leading-relaxed text-mystic-200" data-comment-body>${safeBody}</p>
                <button
                    type="button"
                    class="absolute bottom-0 right-0 inline-flex min-w-9 items-center gap-1 rounded-lg px-2 py-1 text-xs transition ${comment.liked ? 'text-rose-300' : 'text-mystic-400'}"
                    data-comment-action="toggle-like"
                    aria-label="${comment.liked ? 'Unlike comment' : 'Like comment'}"
                >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
                    </svg>
                    <span class="leading-none">${likeCount}</span>
                </button>
            </div>

            <div class="mt-5 space-y-3">
                <div class="comment-reply ${comment.reply ? '' : 'hidden'}" data-comment-reply-wrap>
                    <p class="text-xs uppercase tracking-[0.2em] text-purple-300/80">Reply</p>
                    <p class="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mystic-300" data-comment-reply>${safeReply}</p>
                    <p class="mt-2 text-xs text-mystic-500 ${comment.reply ? '' : 'hidden'}" data-comment-reply-time>${replyTime}</p>
                </div>

                <div class="comment-actions flex flex-wrap gap-2 ${editingMode ? '' : 'hidden'}" data-comment-actions>
                    <button type="button" class="events-editor__button" data-comment-action="reply">Reply</button>
                    <button type="button" class="events-editor__button event-card__button--danger" data-comment-action="delete">Delete</button>
                </div>

                <form class="comment-reply-form space-y-3 ${editingMode ? '' : 'hidden'}" data-comment-reply-form>
                    <label class="events-editor__field">
                        <span class="events-editor__label">Admin Reply</span>
                        <textarea class="events-editor__input" rows="3" data-comment-reply-input placeholder="Write a reply as admin..."></textarea>
                    </label>
                    <div class="events-editor__actions">
                        <button type="submit" class="events-editor__button events-editor__button--primary">Save Reply</button>
                        <button type="button" class="events-editor__button" data-comment-action="cancel-reply">Cancel</button>
                    </div>
                </form>
            </div>
        </article>
    `;
}

function renderComments() {
    const els = getCommentFormEls();
    if (!els.list) return;

    const comments = sortCommentsNewest(loadComments());
    els.list.innerHTML = comments.length
        ? comments.map((comment) => renderCommentCard(comment)).join('')
        : '<div class="glass-panel p-6 text-center text-sm text-mystic-300">No comments yet. Be the first to leave one.</div>';

    if (els.count) {
        els.count.textContent = `${comments.length} comment${comments.length === 1 ? '' : 's'}`;
    }
}

function addCommentFromForm() {
    const els = getCommentFormEls();
    if (!els.form || !els.body) return;

    const body = els.body.value.trim();
    if (!body) return;

    const comments = loadComments();
    comments.push({
        id: `cmt-${Date.now()}`,
        username: String(els.username?.value || '').trim(),
        body,
        reply: '',
        likes: 0,
        liked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    saveComments(comments);
    renderComments();
    els.body.value = '';
}

function updateCommentById(id, updater) {
    if (!id) return;
    const comments = loadComments();
    const index = comments.findIndex((item) => item.id === id);
    if (index < 0) return;

    const next = updater({ ...comments[index] });
    comments[index] = {
        ...comments[index],
        ...next,
        updatedAt: new Date().toISOString(),
    };
    saveComments(comments);
    renderComments();
}

function deleteCommentById(id) {
    if (!id) return;
    if (!confirmDeleteAction()) return;
    const next = loadComments().filter((item) => item.id !== id);
    saveComments(next);
    renderComments();
}

function initComments() {
    const els = getCommentFormEls();
    if (!els.form || !els.list) return;

    els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        addCommentFromForm();
    });

    els.list.addEventListener('click', (e) => {
        const actionBtn = e.target && e.target.closest ? e.target.closest('[data-comment-action]') : null;
        if (!actionBtn) return;

        const card = actionBtn.closest('[data-comment-id]');
        if (!card) return;
        const id = card.getAttribute('data-comment-id');
        const action = actionBtn.getAttribute('data-comment-action');

        if (action === 'delete' && editingMode) {
            deleteCommentById(id);
            return;
        }

        if (action === 'toggle-like') {
            updateCommentById(id, (comment) => {
                const currentLikes = Number.isFinite(Number(comment.likes)) ? Math.max(0, Number(comment.likes)) : 0;
                const isLiked = Boolean(comment.liked);
                return {
                    liked: !isLiked,
                    likes: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
                };
            });
            return;
        }

        if (action === 'reply' && editingMode) {
            const replyForm = card.querySelector('[data-comment-reply-form]');
            if (replyForm) {
                replyForm.classList.toggle('hidden');
                const replyInput = replyForm.querySelector('[data-comment-reply-input]');
                if (replyInput) replyInput.focus();
            }
            return;
        }

        if (action === 'cancel-reply' && editingMode) {
            const replyForm = card.querySelector('[data-comment-reply-form]');
            if (replyForm) replyForm.classList.add('hidden');
            return;
        }
    });

    els.list.addEventListener('submit', (e) => {
        const replyForm = e.target && e.target.closest ? e.target.closest('[data-comment-reply-form]') : null;
        if (!replyForm || !editingMode) return;

        e.preventDefault();
        const card = replyForm.closest('[data-comment-id]');
        if (!card) return;
        const id = card.getAttribute('data-comment-id');
        const replyInput = replyForm.querySelector('[data-comment-reply-input]');
        const reply = String(replyInput?.value || '').trim();
        if (!reply) return;
        if (!confirmChangeAction()) return;

        updateCommentById(id, (comment) => ({ reply }));
    });
}

function getContactFormEls() {
    return {
        form: document.getElementById('contact-form'),
        whatsappNumber: document.getElementById('contact-whatsapp-number'),
        whatsappLink: document.getElementById('contact-whatsapp-link-input'),
        emailAddress: document.getElementById('contact-email-address'),
        instagramUsername: document.getElementById('contact-instagram-username'),
        instagramLink: document.getElementById('contact-instagram-link-input'),
        reset: document.getElementById('contact-reset'),
    };
}

function fillContactForm(contact) {
    const els = getContactFormEls();
    if (!els.form) return;
    els.whatsappNumber.value = contact.whatsappNumber || '';
    els.whatsappLink.value = contact.whatsappLink || '';
    els.emailAddress.value = contact.emailAddress || '';
    els.instagramUsername.value = contact.instagramUsername || '';
    els.instagramLink.value = contact.instagramLink || '';
}

function resetContactForm() {
    const els = getContactFormEls();
    if (!els.form) return;
    els.form.reset();
    fillContactForm({ ...DEFAULT_CONTACT });
}

function saveContactFromForm() {
    const els = getContactFormEls();
    if (!els.form) return;
    if (!confirmChangeAction()) return;

    const payload = {
        whatsappNumber: String(els.whatsappNumber?.value || '').trim(),
        whatsappLink: String(els.whatsappLink?.value || '').trim(),
        emailAddress: String(els.emailAddress?.value || '').trim(),
        instagramUsername: String(els.instagramUsername?.value || '').trim(),
        instagramLink: String(els.instagramLink?.value || '').trim(),
    };

    saveContactLinks(payload);
    renderContactLinks();
}

function initContactEditor() {
    const els = getContactFormEls();
    if (!els.form) return;

    fillContactForm(loadContactLinks());

    els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveContactFromForm();
    });

    if (els.reset) {
        els.reset.addEventListener('click', () => {
            if (!confirmDeleteAction()) return;
            saveContactLinks({ ...DEFAULT_CONTACT });
            resetContactForm();
            renderContactLinks();
        });
    }
}

function sortProjectsNewest(projects) {
    return [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function sortEventsNewest(events) {
    return [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Add https:// for pasted links like instagram.com/... */
function normalizeExternalUrl(url) {
    const t = String(url || '').trim();
    if (!t) return '';
    if (/^https?:\/\//i.test(t)) return t;
    if (/^\/\//.test(t)) return `https:${t}`;
    if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}/i.test(t)) return `https://${t}`;
    return t;
}

function extractDomain(url) {
    try {
        const normalized = normalizeExternalUrl(url);
        return new URL(normalized).hostname.replace(/^www\./, '');
    } catch {
        return 'event link';
    }
}

/** Valid http(s) href for anchors — accepts stored links missing https:// */
function hrefFromStoredLink(url) {
    const n = normalizeExternalUrl(String(url || '').trim());
    if (!n) return '';
    try {
        const u = new URL(n);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
        return u.href;
    } catch {
        return '';
    }
}

/**
 * Preview image when no upload: direct image URL, else mshots screenshot.
 * Instagram /media/ hotlinks are blocked in browsers — use mshots for all pages.
 */
function previewImageFromLink(url, shotSize = {}) {
    const trimmed = normalizeExternalUrl(url);
    if (!trimmed) return '';
    const lowered = trimmed.toLowerCase();
    if (/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/.test(lowered)) {
        return trimmed;
    }

    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const encoded = encodeURIComponent(trimmed);
            const w = shotSize.w || 1280;
            const h = shotSize.h || 720;
            return `https://s0.wp.com/mshots/v1/${encoded}?w=${w}&h=${h}`;
        } catch {
            return '';
        }
    }

    return '';
}

/** Inner media markup for link previews (projects + events). */
function renderLinkPreviewMediaInner(mediaCandidate, rawDomain, safeTitle, emptyFallbackDetail, extraImgClass = '') {
    const safeDomain = escapeHtml(rawDomain);
    const domainAttr = encodeURIComponent(rawDomain);
    const detail = escapeHtml(emptyFallbackDetail || 'Add a link or image in edit mode');
    const imgExtra = extraImgClass ? ` ${extraImgClass}` : '';
    if (mediaCandidate) {
        return `<img src="${escapeHtml(mediaCandidate)}" alt="${safeTitle} preview" class="event-card__preview-img${imgExtra} h-full w-full object-cover object-top" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-link-preview-img data-preview-domain="${domainAttr}">`;
    }
    return `<div class="event-card__fallback"><p class="event-card__domain">${safeDomain || '—'}</p><p class="mt-2 text-sm text-mystic-200">${detail}</p></div>`;
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
    const rawDomain = extractDomain(event.link || '');
    const safeDomain = escapeHtml(rawDomain);
    const safeLink = hrefFromStoredLink(event.link);
    const safeLinkAttr = escapeHtml(safeLink);

    const mediaCandidate = event.image || previewImageFromLink(event.link);
    const mediaInner = renderLinkPreviewMediaInner(mediaCandidate, rawDomain, safeTitle, 'Add a link or image in edit mode');

    return `
        <article class="event-card event-card--event event-card--preview-stack" data-event-id="${escapeHtml(event.id)}">
            <div class="event-card__stack">
                <a href="${safeLinkAttr || '#'}" target="_blank" rel="noopener noreferrer" class="event-card__media event-card__media--stacked group block ${safeLink ? '' : 'pointer-events-none'}" aria-label="${safeTitle} — preview">
                    <div class="absolute inset-0 overflow-hidden" data-link-preview-inner>
                        ${mediaInner}
                    </div>
                </a>
                <div class="event-card__body event-card__body--stacked">
                    <p class="event-card__meta">${safeMeta}</p>
                    <h3 class="event-card__title">${safeTitle}</h3>
                    ${safeLink ? `<p class="event-card__hostname"><a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__hostname-link">${safeDomain}</a></p>` : ''}
                    <p class="event-card__description">${safeDesc}</p>
                    <div class="event-card__links">
                        ${safeLink ? `<a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__view-link">Open event</a>` : '<span class="event-card__view-link">No link</span>'}
                        <div class="event-card__controls">
                            <button type="button" class="event-card__button" data-event-action="edit">Edit</button>
                            <button type="button" class="event-card__button" data-event-action="hide">Hide</button>
                            <button type="button" class="event-card__button event-card__button--danger" data-event-action="delete">Delete</button>
                        </div>
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
    const rawDomain = extractDomain(event.link || '');
    const safeDomain = escapeHtml(rawDomain);
    const safeLink = hrefFromStoredLink(event.link);
    const safeLinkAttr = escapeHtml(safeLink);

    const mediaCandidate = event.image || previewImageFromLink(event.link, { w: 1920, h: 1080 });
    const mediaInner = renderLinkPreviewMediaInner(mediaCandidate, rawDomain, safeTitle, 'Add a link or image in edit mode');

    return `
        <article class="event-card event-card--event event-card--preview-stack featured-carousel-item" data-event-id="${escapeHtml(event.id)}">
            <div class="event-card__stack">
                <a href="${safeLinkAttr || '#'}" target="_blank" rel="noopener noreferrer" class="event-card__media event-card__media--stacked group block ${safeLink ? '' : 'pointer-events-none'}" aria-label="${safeTitle} — preview">
                    <div class="absolute inset-0 overflow-hidden" data-link-preview-inner>
                        ${mediaInner}
                    </div>
                </a>
                <div class="event-card__body event-card__body--stacked">
                    <p class="event-card__meta">${safeMeta}</p>
                    <h3 class="event-card__title">${safeTitle}</h3>
                    ${safeLink ? `<p class="event-card__hostname"><a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__hostname-link">${safeDomain}</a></p>` : ''}
                    <p class="event-card__description">${safeDesc}</p>
                    <div class="event-card__links">
                        ${safeLink ? `<a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__view-link">Open event</a>` : '<span class="event-card__view-link">No link</span>'}
                        <div class="event-card__controls">
                            <button type="button" class="event-card__button" data-event-action="edit">Edit</button>
                            <button type="button" class="event-card__button" data-event-action="hide">Hide</button>
                            <button type="button" class="event-card__button event-card__button--danger" data-event-action="delete">Delete</button>
                        </div>
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
    const rawDomain = extractDomain(event.link || '');
    const safeDomain = escapeHtml(rawDomain);
    const safeLink = hrefFromStoredLink(event.link);
    const safeLinkAttr = escapeHtml(safeLink);

    const mediaCandidate = event.image || previewImageFromLink(event.link);
    const mediaInner = renderLinkPreviewMediaInner(
        mediaCandidate,
        rawDomain,
        safeTitle,
        'Add a link or image in edit mode',
        'event-list-item__preview-img',
    );

    return `
        <article class="event-list-item" data-event-id="${escapeHtml(event.id)}">
            <div class="event-list-item__content">
                <p class="event-list-item__date">📅 ${safeMeta}</p>
                <h2 class="event-list-item__title">${safeTitle}</h2>
                ${safeLink ? `<p class="event-card__hostname event-list-item__hostname"><a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__hostname-link">${safeDomain}</a></p>` : ''}
                <p class="event-list-item__description">${safeDesc}</p>
                ${safeLink ? `<a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-list-item__link">View event →</a>` : ''}
            </div>
            <a href="${safeLinkAttr || '#'}" target="_blank" rel="noopener noreferrer" class="event-list-item__image group ${safeLink ? '' : 'pointer-events-none'}" aria-label="${safeTitle} — preview">
                <div class="relative h-full w-full overflow-hidden" data-link-preview-inner>
                    ${mediaInner}
                </div>
            </a>
        </article>
    `;
}

function bindLinkPreviewFallbacks(root) {
    if (!root) return;
    root.querySelectorAll('img[data-link-preview-img]').forEach((img) => {
        img.addEventListener(
            'error',
            () => {
                const inner = img.closest('[data-link-preview-inner]');
                if (!inner) return;
                let domain = '';
                try {
                    domain = decodeURIComponent(img.getAttribute('data-preview-domain') || '');
                } catch {
                    domain = '';
                }
                const label = escapeHtml(domain || 'Link');
                inner.innerHTML = `<div class="event-card__fallback"><p class="event-card__domain">${label}</p><p class="mt-2 text-sm text-mystic-200">Preview unavailable</p></div>`;
            },
            { once: true },
        );
    });
}

function renderProjectCard(project) {
    const safeTitle = escapeHtml(project.title || 'Untitled project');
    const safeDesc = escapeHtml(project.description || 'No description yet.');
    const rawDomain = extractDomain(project.link || '');
    const safeDomain = escapeHtml(rawDomain);
    const safeLink = hrefFromStoredLink(project.link);
    const safeLinkAttr = escapeHtml(safeLink);
    const safeCreatedAt = escapeHtml(formatEventDate(project.createdAt || ''));

    const mediaCandidate = project.image || previewImageFromLink(project.link);
    const mediaInner = renderLinkPreviewMediaInner(mediaCandidate, rawDomain, safeTitle, 'Add a link or image in edit mode');

    return `
        <article class="event-card event-card--project event-card--preview-stack" data-project-id="${escapeHtml(project.id)}">
            <div class="event-card__stack">
                <a href="${safeLinkAttr || '#'}" target="_blank" rel="noopener noreferrer" class="event-card__media event-card__media--stacked group block ${safeLink ? '' : 'pointer-events-none'}" aria-label="${safeTitle} — preview">
                    <div class="absolute inset-0 overflow-hidden" data-link-preview-inner>
                        ${mediaInner}
                    </div>
                </a>
                <div class="event-card__body event-card__body--stacked">
                    <p class="event-card__meta">${safeCreatedAt}</p>
                    <h3 class="event-card__title">${safeTitle}</h3>
                    ${
                        safeLink
                            ? `<p class="event-card__hostname"><a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__hostname-link">${safeDomain}</a></p>`
                            : ''
                    }
                    <p class="event-card__description">${safeDesc}</p>
                    <div class="event-card__links">
                        ${safeLink ? `<a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="event-card__view-link">View project</a>` : '<span class="event-card__view-link">No link</span>'}
                        <div class="event-card__controls">
                            <button type="button" class="event-card__button" data-project-action="edit">Edit</button>
                            <button type="button" class="event-card__button" data-project-action="hide">Hide</button>
                            <button type="button" class="event-card__button event-card__button--danger" data-project-action="delete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function renderProjectAdminListItem(project) {
    const safeId = escapeHtml(project.id);
    const safeTitle = escapeHtml(project.title || 'Untitled project');
    const safeDesc = escapeHtml(project.description || 'No description yet.');
    const rawDomain = extractDomain(project.link || '');
    const safeDomain = escapeHtml(rawDomain);
    const safeLink = hrefFromStoredLink(project.link);
    const safeLinkAttr = escapeHtml(safeLink);

    return `
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3" data-project-id="${safeId}">
            <div class="min-w-0">
                <p class="truncate text-sm font-medium text-mystic-100">${safeTitle}${project.hidden ? ' <span class="text-amber-300">(Hidden)</span>' : ''}</p>
                <p class="truncate text-xs text-mystic-400">${safeDesc}</p>
                ${safeLink ? `<a href="${safeLinkAttr}" target="_blank" rel="noopener noreferrer" class="text-xs text-mystic-300 transition hover:text-purple-200">${safeDomain}</a>` : '<p class="text-xs text-mystic-500">No link</p>'}
            </div>
            <div class="flex items-center gap-2">
                <button type="button" class="event-card__button" data-project-action="edit">Edit</button>
                <button type="button" class="event-card__button" data-project-action="hide">${project.hidden ? 'Unhide' : 'Hide'}</button>
                <button type="button" class="event-card__button event-card__button--danger" data-project-action="delete">Delete</button>
            </div>
        </div>
    `;
}

function updateCarouselDisplay() {
    const carousel = document.getElementById('featured-events-list');
    if (!carousel) return;

    const items = carousel.querySelectorAll('.featured-carousel-item');
    items.forEach((item, i) => {
        const active = i === carouselState.currentIndex;
        item.classList.toggle('featured-carousel-item--active', active);
        item.setAttribute('aria-hidden', active ? 'false' : 'true');
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
    carouselState.autoRotateInterval = setInterval(carouselNext, 4000);
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

    const carouselWrap = document.querySelector('.featured-carousel-wrap');
    const pauseTarget = carouselWrap || carousel;
    if (pauseTarget) {
        pauseTarget.addEventListener('mouseenter', stopCarouselAutoRotate);
        pauseTarget.addEventListener('mouseleave', startCarouselAutoRotate);
    }

    startCarouselAutoRotate();
}

function renderFeaturedCarousel() {
    const carouselRoot = document.getElementById('featured-events-list');
    if (!carouselRoot) return;

    const sorted = sortEventsNewest(loadEvents()).filter((event) => !event.hidden);
    carouselState.events = sorted.slice(0, 5);
    carouselState.currentIndex = 0;

    if (carouselState.events.length === 0) {
        carouselRoot.innerHTML = `
            <article class="event-card event-card--event featured-carousel-item featured-carousel-item--active event-card--empty" aria-hidden="false">
                <div class="event-card__stack event-card__stack--empty relative min-h-[280px] overflow-hidden rounded-2xl border border-white/15">
                    <div class="event-card__media pointer-events-none absolute inset-0">
                        <div class="absolute inset-0 overflow-hidden">
                            <div class="event-card__fallback">
                                <p class="event-card__domain">Featured Events</p>
                                <p class="mt-2 text-sm text-mystic-200">No featured events yet</p>
                            </div>
                        </div>
                    </div>
                    <div class="event-card__body event-card__body--stacked event-card__body--empty-placeholder">
                        <p class="event-card__meta">Date TBD</p>
                        <h3 class="event-card__title">Add your first event</h3>
                        <p class="event-card__description">Add an event to start the carousel.</p>
                    </div>
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

    const sorted = sortEventsNewest(loadEvents()).filter((event) => !event.hidden);
    const nonFeatured = sorted.slice(5);

    listRoot.innerHTML = nonFeatured.length
        ? nonFeatured.map((event) => renderEventListItem(event)).join('')
        : '<p class="glass-panel p-6 text-mystic-300 text-center py-12">No other events yet.</p>';
}

function renderEventsAdminList() {
    const root = document.getElementById('events-admin-list');
    if (!root) return;

    const sorted = sortEventsNewest(loadEvents());
    if (!sorted.length) {
        root.innerHTML = '<p class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mystic-300">No events added yet.</p>';
        return;
    }

    root.innerHTML = sorted
        .map((event) => {
            const safeId = escapeHtml(event.id);
            const safeTitle = escapeHtml(event.title || 'Untitled event');
            const safeDate = escapeHtml(formatEventDate(event.eventDate || ''));
            return `
                <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3" data-event-id="${safeId}">
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-mystic-100">${safeTitle}${event.hidden ? ' <span class="text-amber-300">(Hidden)</span>' : ''}</p>
                        <p class="text-xs text-mystic-400">${safeDate}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" class="event-card__button" data-event-action="edit">Edit</button>
                        <button type="button" class="event-card__button" data-event-action="hide">${event.hidden ? 'Unhide' : 'Hide'}</button>
                        <button type="button" class="event-card__button event-card__button--danger" data-event-action="delete">Delete</button>
                    </div>
                </div>
            `;
        })
        .join('');
}

function renderEvents() {
    renderFeaturedCarousel();
    renderAllEventsList();
    renderEventsAdminList();
    bindLinkPreviewFallbacks(document.getElementById('featured-events-list'));
    bindLinkPreviewFallbacks(document.getElementById('all-events-list'));
}

function getProjectFormEls() {
    return {
        form: document.getElementById('project-form'),
        id: document.getElementById('project-id'),
        title: document.getElementById('project-title'),
        description: document.getElementById('project-description'),
        link: document.getElementById('project-link'),
        imageFile: document.getElementById('project-image-file'),
        imageDropzone: document.getElementById('project-image-dropzone'),
        imageName: document.getElementById('project-image-name'),
        save: document.getElementById('project-save'),
        reset: document.getElementById('project-reset'),
    };
}

function setProjectImageNameLabel(text) {
    const els = getProjectFormEls();
    if (!els.imageName) return;
    els.imageName.textContent = text || 'No file selected';
}

function resetProjectForm() {
    const els = getProjectFormEls();
    if (!els.form) return;
    els.form.reset();
    els.id.value = '';
    pendingProjectImageData = '';
    editingProjectImageData = '';
    if (els.imageFile) els.imageFile.value = '';
    setProjectImageNameLabel('No file selected');
    if (els.save) els.save.textContent = 'Create Project';
}

function fillProjectForm(project) {
    const els = getProjectFormEls();
    if (!els.form) return;
    els.id.value = project.id || '';
    els.title.value = project.title || '';
    els.description.value = project.description || '';
    els.link.value = project.link || '';
    pendingProjectImageData = '';
    editingProjectImageData = project.image || '';
    if (els.imageFile) els.imageFile.value = '';
    setProjectImageNameLabel(editingProjectImageData ? 'Current image attached (drop/click to replace)' : 'No file selected');
    if (els.save) els.save.textContent = 'Update Project';
    els.title.focus();
}

function upsertProjectFromForm() {
    const els = getProjectFormEls();
    if (!els.form || !els.title || !els.description) return;
    if (!confirmChangeAction()) return;

    const title = els.title.value.trim();
    if (!title) return;

    const projects = loadProjects();
    const id = els.id.value.trim();
    const nowIso = new Date().toISOString();

    const existingIndex = projects.findIndex((project) => project.id === (id || ''));
    const existingProject = existingIndex >= 0 ? projects[existingIndex] : null;

    const payload = {
        id: id || `proj-${Date.now()}`,
        title,
        description: (els.description.value || '').trim(),
        link: (els.link.value || '').trim(),
        image: pendingProjectImageData || editingProjectImageData || '',
        hidden: Boolean(existingProject && existingProject.hidden),
        createdAt: nowIso,
    };

    const payloadIndex = projects.findIndex((project) => project.id === payload.id);
    if (payloadIndex >= 0) {
        payload.createdAt = projects[payloadIndex].createdAt || nowIso;
        projects[payloadIndex] = payload;
    } else {
        projects.push(payload);
    }

    saveProjects(projects);
    renderProjects();
    resetProjectForm();
}

function deleteProjectById(id) {
    if (!id) return;
    if (!confirmDeleteAction()) return;
    const projects = loadProjects();
    const next = projects.filter((project) => project.id !== id);
    saveProjects(next);
    renderProjects();
    const els = getProjectFormEls();
    if (els.id && els.id.value === id) {
        resetProjectForm();
    }
}

function toggleProjectHiddenById(id) {
    if (!id) return;
    const projects = loadProjects();
    const index = projects.findIndex((project) => project.id === id);
    if (index < 0) return;
    projects[index] = {
        ...projects[index],
        hidden: !projects[index].hidden,
    };
    saveProjects(projects);
    renderProjects();
}

function renderProjects() {
    const listRoot = document.getElementById('projects-list');
    if (!listRoot) return;

    const sorted = sortProjectsNewest(loadProjects());
    const visibleProjects = sorted.filter((project) => !project.hidden);
    listRoot.innerHTML = visibleProjects.length
        ? visibleProjects.map((project) => renderProjectCard(project)).join('')
        : '<p class="glass-panel p-6 text-mystic-300 text-center py-12">No projects yet.</p>';
    bindLinkPreviewFallbacks(listRoot);

    const adminListRoot = document.getElementById('projects-admin-list');
    if (adminListRoot) {
        adminListRoot.innerHTML = sorted.length
            ? sorted.map((project) => renderProjectAdminListItem(project)).join('')
            : '<p class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mystic-300">No projects added yet.</p>';
    }
}

function initProjectCrud() {
    const els = getProjectFormEls();
    const listRoot = document.getElementById('projects-list');
    const adminListRoot = document.getElementById('projects-admin-list');

    if (els.form) {
        els.form.addEventListener('submit', (e) => {
            e.preventDefault();
            upsertProjectFromForm();
        });
    }

    if (els.reset) {
        els.reset.addEventListener('click', () => {
            if (!confirmChangeAction()) return;
            resetProjectForm();
        });
    }

    if (els.imageFile) {
        els.imageFile.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
            pendingProjectImageData = await readImageFileAsDataUrl(file);
            if (pendingProjectImageData) {
                setProjectImageNameLabel(file ? file.name : 'Image selected');
            } else {
                setProjectImageNameLabel('No file selected');
            }
        });
    }

    if (els.imageDropzone && els.imageFile) {
        els.imageDropzone.addEventListener('click', () => {
            els.imageFile.click();
        });
    }

    const handleProjectActionClick = (e) => {
            const button = e.target && e.target.closest ? e.target.closest('[data-project-action]') : null;
            if (!button) return;

            const card = button.closest('[data-project-id]');
            if (!card) return;

            const id = card.getAttribute('data-project-id');
            const action = button.getAttribute('data-project-action');
            const projects = loadProjects();
            const project = projects.find((item) => item.id === id);
            if (!project) return;

            if (action === 'edit') {
                fillProjectForm(project);
            } else if (action === 'hide') {
                toggleProjectHiddenById(id);
            } else if (action === 'delete') {
                deleteProjectById(id);
            }
    };

    if (listRoot) {
        listRoot.addEventListener('click', handleProjectActionClick);
    }

    if (adminListRoot) {
        adminListRoot.addEventListener('click', handleProjectActionClick);
    }
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
    if (!confirmChangeAction()) return;

    const title = els.title.value.trim();
    const eventDate = els.eventDate.value;
    if (!title || !eventDate) return;

    const events = loadEvents();
    const id = els.id.value.trim();
    const nowIso = new Date().toISOString();

    const rawLink = (els.link.value || '').trim();
    const linkNormalized = rawLink ? hrefFromStoredLink(rawLink) || normalizeExternalUrl(rawLink) || rawLink : '';

    const existingIndex = events.findIndex((event) => event.id === (id || ''));
    const existingEvent = existingIndex >= 0 ? events[existingIndex] : null;

    const payload = {
        id: id || `evt-${Date.now()}`,
        title,
        eventDate,
        description: (els.description.value || '').trim(),
        link: linkNormalized,
        image: pendingUploadImageData || editingEventImageData || '',
        hidden: Boolean(existingEvent && existingEvent.hidden),
        createdAt: nowIso,
    };

    const payloadIndex = events.findIndex((event) => event.id === payload.id);
    if (payloadIndex >= 0) {
        payload.createdAt = events[payloadIndex].createdAt || nowIso;
        events[payloadIndex] = payload;
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
    if (!confirmDeleteAction()) return;
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

function toggleEventHiddenById(id) {
    if (!id) return;
    const events = loadEvents();
    const index = events.findIndex((event) => event.id === id);
    if (index < 0) return;
    events[index] = {
        ...events[index],
        hidden: !events[index].hidden,
    };
    saveEvents(events);
    renderEvents();
    initCarousel();
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
            if (!confirmChangeAction()) return;
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

        if (btn.getAttribute('data-event-action') === 'hide') {
            toggleEventHiddenById(eventId);
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
            if (!confirmChangeAction()) {
                imageInput.value = '';
                return;
            }
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
            if (!confirmDeleteAction()) return;
            data.profileImages = [];
            saveAboutData(data);
            renderAboutSection(data);
        });
    }

    if (cvInput) {
        cvInput.addEventListener('change', async (e) => {
            if (!confirmChangeAction()) {
                cvInput.value = '';
                return;
            }
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
            if (!confirmChangeAction()) return;
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
            if (!confirmChangeAction()) return;
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
                if (!confirmDeleteAction()) return;
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
                if (!confirmDeleteAction()) return;
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

    renderComments();
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
renderProjects();
renderContactLinks();
renderComments();
initCarousel();
initOtherEventsToggle();
initEventCrud();
initProjectCrud();
initContactEditor();
initComments();
initAboutEditor();
initAboutDobPicker();
