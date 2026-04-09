const loader = document.getElementById('loader');
const loaderHelloEl = document.getElementById('loader-hello');
const loaderHelloLabelEl = document.getElementById('loader-hello-label');

const LOADER_GREETINGS = [
    { lang: 'ar', label: 'Arabic', text: 'السلام عليكم' },
    { lang: 'es', label: 'Spanish', text: 'Hola' },
    { lang: 'fr', label: 'French', text: 'Bonjour' },
    { lang: 'de', label: 'German', text: 'Hallo' },
    { lang: 'it', label: 'Italian', text: 'Ciao' },
    { lang: 'pt', label: 'Portuguese', text: 'Olá' },
    { lang: 'ja', label: 'Japanese', text: 'こんにちは' },
    { lang: 'ko', label: 'Korean', text: '안녕하세요' },
    { lang: 'zh-CN', label: 'Chinese', text: '你好' },
    { lang: 'ms', label: 'Malay', text: 'Apa khabar' },
    { lang: 'th', label: 'Thai', text: 'สวัสดี' },
    { lang: 'hi', label: 'Hindi', text: 'नमस्ते' },
    { lang: 'ru', label: 'Russian', text: 'Привет' },
    { lang: 'tl', label: 'Tagalog', text: 'Kumusta' },
    { lang: 'el', label: 'Greek', text: 'Γεια σας' },
    { lang: 'en', label: 'English', text: 'Hello' },
];

const LOADER_HELLO_INTERVAL_MS = 300;
const LOADER_MIN_MS = Math.max(2600, LOADER_HELLO_INTERVAL_MS * (LOADER_GREETINGS.length - 1) + 300);
const LOADER_FIRST_VISIT_KEY = 'portfolio-loader-first-visit-done';
const LOADER_START_LANG = 'ar';

let loaderHelloTimer = null;
let loaderHelloIndex = LOADER_GREETINGS.findIndex((g) => g.lang === LOADER_START_LANG);
if (loaderHelloIndex < 0) loaderHelloIndex = 0;
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

function isHomePath() {
    const path = (window.location.pathname || '').replace(/\/+$/, '') || '/';
    return path === '/';
}

function isFirstVisit() {
    try {
        const seen = localStorage.getItem(LOADER_FIRST_VISIT_KEY) === '1';
        if (!seen) {
            localStorage.setItem(LOADER_FIRST_VISIT_KEY, '1');
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

/** Show intro only on first-ever visit, or when user refreshes Home page. */
function shouldPlayIntroLoader() {
    if (import.meta.env.DEV) {
        return true;
    }

    const navType = getNavigationType();
    if (isFirstVisit()) {
        return true;
    }

    return navType === 'reload' && isHomePath();
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
      let remainingTransitions = LOADER_GREETINGS.length - 1;
      loaderHelloTimer = window.setInterval(() => {
        if (remainingTransitions <= 0) {
          window.clearInterval(loaderHelloTimer);
          loaderHelloTimer = null;
          return;
        }

        loaderHelloIndex = (loaderHelloIndex + 1) % LOADER_GREETINGS.length;
        if (LOADER_GREETINGS[loaderHelloIndex].lang === LOADER_START_LANG) {
          loaderHelloIndex = (loaderHelloIndex + 1) % LOADER_GREETINGS.length;
        }
        applyLoaderGreeting(loaderHelloIndex);

        remainingTransitions -= 1;
        if (remainingTransitions <= 0) {
          window.clearInterval(loaderHelloTimer);
          loaderHelloTimer = null;
        }
      }, LOADER_HELLO_INTERVAL_MS);
    }

function initLoader() {
    if (!loader) return;

    if (!shouldPlayIntroLoader()) {
        dismissLoaderInstant();
        return;
    }

    applyLoaderGreeting(loaderHelloIndex);
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
