const loader = document.getElementById('loader');
const loaderVideo = document.getElementById('loader-video');

const LOADER_MIN_MS = 2200;
const LOADER_MAX_MS = 14500;

function hideLoader() {
    if (!loader) return;
    loader.classList.add('loader--hide');
    window.setTimeout(() => {
        loader.remove();
        document.body.classList.remove('overflow-hidden');
    }, 900);
}

function initLoader() {
    if (!loader) return;

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

    const videoDone = new Promise((resolve) => {
        if (!loaderVideo) {
            resolve();
            return;
        }

        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            resolve();
        };

        const cap = window.setTimeout(finish, LOADER_MAX_MS);

        loaderVideo.addEventListener(
            'ended',
            () => {
                window.clearTimeout(cap);
                finish();
            },
            { once: true },
        );

        loaderVideo.addEventListener(
            'error',
            () => {
                window.clearTimeout(cap);
                finish();
            },
            { once: true },
        );

        const tryPlay = loaderVideo.play();
        if (tryPlay !== undefined) {
            tryPlay.catch(() => {
                window.clearTimeout(cap);
                finish();
            });
        }
    });

    Promise.all([pageLoaded, minVisible, videoDone]).then(() => {
        hideLoader();
    });
}

initLoader();

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
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
