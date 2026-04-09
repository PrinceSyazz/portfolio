const loader = document.getElementById('loader');
const loaderHelloEl = document.getElementById('loader-hello');
const loaderHelloLabelEl = document.getElementById('loader-hello-label');

const LOADER_GREETINGS = [
    { lang: 'ar', label: 'العربية', text: 'السلام عليكم' },
    { lang: 'en', label: 'English', text: 'Hello' },
    { lang: 'es', label: 'Español', text: 'Hola' },
    { lang: 'fr', label: 'Français', text: 'Bonjour' },
    { lang: 'de', label: 'Deutsch', text: 'Hallo' },
    { lang: 'it', label: 'Italiano', text: 'Ciao' },
    { lang: 'pt', label: 'Português', text: 'Olá' },
    { lang: 'ja', label: '日本語', text: 'こんにちは' },
    { lang: 'ko', label: '한국어', text: '안녕하세요' },
    { lang: 'zh-CN', label: '中文', text: '你好' },
    { lang: 'ms', label: 'Bahasa Melayu', text: 'Hai' },
    { lang: 'th', label: 'ภาษาไทย', text: 'สวัสดี' },
    { lang: 'hi', label: 'हिन्दी', text: 'नमस्ते' },
    { lang: 'ru', label: 'Русский', text: 'Привет' },
    { lang: 'tl', label: 'Tagalog', text: 'Kumusta' },
    { lang: 'el', label: 'Ελληνικά', text: 'Γεια σας' },
    { lang: 'sw', label: 'Kiswahili', text: 'Jambo' },
];

const LOADER_MIN_MS = 1800;
const LOADER_HELLO_INTERVAL_MS = 240;

let loaderHelloTimer = null;
let loaderHelloIndex = 0;

function hideLoader() {
    if (!loader) return;
    if (loaderHelloTimer != null) {
        window.clearInterval(loaderHelloTimer);
        loaderHelloTimer = null;
    }
    loader.classList.add('loader--hide');
    window.setTimeout(() => {
        loader.remove();
        document.body.classList.remove('overflow-hidden');
    }, 650);
}

function applyLoaderGreeting(index) {
    const g = LOADER_GREETINGS[index];
    if (!g || !loaderHelloEl) return;
    loaderHelloEl.style.opacity = '0';
    window.setTimeout(() => {
        loaderHelloEl.textContent = g.text;
        loaderHelloEl.setAttribute('lang', g.lang);
        if (g.lang === 'ar') {
            loaderHelloEl.setAttribute('dir', 'rtl');
        } else {
            loaderHelloEl.removeAttribute('dir');
        }
        const helloBlock = loaderHelloEl.closest('.loader__hello');
        if (helloBlock) helloBlock.setAttribute('lang', g.lang);
        if (loaderHelloLabelEl) loaderHelloLabelEl.textContent = g.label;
        loaderHelloEl.style.opacity = '1';
    }, 55);
}

function startLoaderHelloCycle() {
    if (!loaderHelloEl || LOADER_GREETINGS.length < 2) return;
    loaderHelloTimer = window.setInterval(() => {
        loaderHelloIndex = (loaderHelloIndex + 1) % LOADER_GREETINGS.length;
        applyLoaderGreeting(loaderHelloIndex);
    }, LOADER_HELLO_INTERVAL_MS);
}

function initLoader() {
    if (!loader) return;

    startLoaderHelloCycle();

    const pageLoaded = new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve, { once: true });
        }
    });

    const minVisible = new Promise((resolve) => {
        window.setTimeout(resolve, LOADER_MIN_MS);
    });

    Promise.all([pageLoaded, minVisible]).then(() => {
        hideLoader();
    });
}

initLoader();

const SECTION_IDS = ['home', 'about', 'skills', 'work', 'contact'];
const navLinks = document.querySelectorAll('[data-nav-section]');

function getActiveSectionId() {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return 'home';

    const viewportMid = window.innerHeight * 0.38;
    let bestId = 'home';
    let bestScore = -Infinity;

    sections.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        const score = visible > 0 ? visible - Math.abs(center - viewportMid) * 0.02 : -1e9;
        if (score > bestScore) {
            bestScore = score;
            bestId = el.id;
        }
    });

    return bestId;
}

function syncNavActive() {
    const id = getActiveSectionId();
    navLinks.forEach((a) => {
        const on = a.getAttribute('data-nav-section') === id;
        a.classList.toggle('vr-dock__link--active', on);
        if (on) {
            a.setAttribute('aria-current', 'page');
        } else {
            a.removeAttribute('aria-current');
        }
    });
}

let navRaf = 0;
function onScrollNav() {
    if (navRaf) return;
    navRaf = window.requestAnimationFrame(() => {
        navRaf = 0;
        syncNavActive();
    });
}

window.addEventListener('scroll', onScrollNav, { passive: true });
window.addEventListener('resize', onScrollNav, { passive: true });
window.addEventListener('load', syncNavActive, { once: true });
syncNavActive();

function scrollToSection(id) {
    const el = document.querySelector(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(syncNavActive, 480);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        if (document.body.classList.contains('editing-mode')) {
            e.preventDefault();
            return;
        }
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const el = document.querySelector(id);
        if (el) {
            e.preventDefault();
            scrollToSection(id);
        }
    });
});

const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    io.unobserve(entry.target);
                }
            });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    revealEls.forEach((el) => io.observe(el));
}
