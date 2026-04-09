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

function getNavigationType() {
    const entries = performance.getEntriesByType('navigation');
    if (entries.length > 0 && entries[0].type) {
        return entries[0].type;
    }
    if (typeof performance.navigation !== 'undefined') {
        if (performance.navigation.type === 1) return 'reload';
        if (performance.navigation.type === 2) return 'back_forward';
    }
    return 'navigate';
}

/** Full intro: first open / direct entry / external link, or explicit refresh — not in-site link clicks. */
function shouldPlayIntroLoader() {
    const navType = getNavigationType();
    if (navType === 'reload') {
        return true;
    }
    const ref = document.referrer;
    if (!ref) {
        return true;
    }
    try {
        return new URL(ref).origin !== window.location.origin;
    } catch {
        return true;
    }
}

function dismissLoaderInstant() {
    if (!loader) return;
    if (loaderHelloTimer != null) {
        window.clearInterval(loaderHelloTimer);
        loaderHelloTimer = null;
    }
    loader.remove();
    document.body.classList.remove('overflow-hidden');
}

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

    if (!shouldPlayIntroLoader()) {
        dismissLoaderInstant();
        return;
    }

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
