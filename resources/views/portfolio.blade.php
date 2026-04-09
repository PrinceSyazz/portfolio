<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <script>
            document.documentElement.classList.add('js');
        </script>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#0a0612">
        <meta name="description" content="Portfolio — mystical purple design & development.">

        <title>{{ config('app.name', 'Portfolio') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=manrope:400,500,600,700|space-grotesk:400,500,600,700&display=swap" rel="stylesheet" />

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="min-h-full overflow-hidden bg-mystic-950 font-sans text-mystic-100 antialiased">
        <div id="loader" class="loader" role="status" aria-live="polite" aria-busy="true">
            <div class="loader__content">
                <p class="loader__hello font-display" lang="ar">
                    <span id="loader-hello" class="loader__hello-word" dir="rtl">السلام عليكم</span>
                </p>
                <p id="loader-hello-label" class="loader__hello-label">العربية</p>
                <div class="loader__line" aria-hidden="true"></div>
            </div>
        </div>

        <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div
                class="absolute -left-1/4 top-0 h-[70vh] w-[70vw] rounded-full bg-purple-600/25 blur-[120px] animate-smoke-a"
                aria-hidden="true"
            ></div>
            <div
                class="absolute -right-1/4 bottom-0 h-[65vh] w-[65vw] rounded-full bg-violet-900/30 blur-[100px] animate-smoke-b"
                aria-hidden="true"
            ></div>
            <div
                class="absolute left-1/3 top-1/4 h-[50vh] w-[50vw] rounded-full bg-fuchsia-950/35 blur-[90px] animate-smoke-c"
                aria-hidden="true"
            ></div>
            <div
                class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(88,28,135,0.35),transparent_55%)]"
                aria-hidden="true"
            ></div>
            <div
                class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,6,18,0.3)_0%,rgba(10,6,18,0.85)_55%,#0a0612_100%)]"
                aria-hidden="true"
            ></div>
            <div
                class="absolute inset-0 opacity-[0.07] mix-blend-overlay"
                style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');"
                aria-hidden="true"
            ></div>
        </div>

        <header class="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-mystic-950/40 backdrop-blur-xl">
            <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
                <a href="#" class="font-display text-xl font-semibold tracking-tight text-mystic-100 md:text-2xl">
                    <span class="text-gradient-mystic" data-editable-id="brand">{{ config('app.name', 'Portfolio') }}</span>
                </a>
                <nav class="flex max-w-[65%] flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs font-medium text-mystic-300 sm:max-w-none sm:gap-6 sm:text-sm md:gap-10 md:text-[0.95rem]">
                    <a href="#about" class="transition hover:text-mystic-100">About</a>
                    <a href="#skills" class="transition hover:text-mystic-100">Skills</a>
                    <a href="#work" class="transition hover:text-mystic-100">Work</a>
                    <a href="#contact" class="rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-1.5 text-mystic-100 transition hover:border-purple-400/60 hover:bg-purple-500/20">Contact</a>
                </nav>
            </div>
        </header>

        <main>
            <section class="relative flex min-h-screen flex-col justify-center px-5 pb-24 pt-32 md:px-8 md:pt-36">
                <div class="mx-auto max-w-4xl text-center">
                    <p class="mb-4 font-display text-lg text-purple-300/90 md:text-xl" data-reveal data-editable-id="hero-kicker">Creative technologist</p>
                    <h1 class="font-display text-4xl font-semibold leading-tight tracking-tight text-mystic-50 md:text-6xl md:leading-[1.1]" data-reveal data-editable-id="hero-heading">
                        Weaving <span class="text-gradient-mystic">code &amp; atmosphere</span> into the dark
                    </h1>
                    <p class="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mystic-300 md:text-lg" data-reveal data-editable-id="hero-blurb">
                        I design and build web experiences with depth—purple haze, soft motion, and interfaces that feel like stepping through mist into something real.
                    </p>
                    <div class="mt-10 flex flex-wrap items-center justify-center gap-4" data-reveal>
                        <a
                            href="#work"
                            data-editable-id="hero-cta-work"
                            class="rounded-full bg-gradient-to-r from-purple-600 to-violet-700 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_40px_rgba(124,58,237,0.35)] transition hover:from-purple-500 hover:to-violet-600 hover:shadow-[0_0_50px_rgba(124,58,237,0.45)]"
                        >
                            View work
                        </a>
                        <a
                            href="#contact"
                            data-editable-id="hero-cta-contact"
                            class="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-medium text-mystic-100 backdrop-blur-sm transition hover:border-purple-400/40 hover:bg-white/10"
                        >
                            Get in touch
                        </a>
                    </div>
                </div>
                <div class="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 animate-float" aria-hidden="true">
                    <div class="flex flex-col items-center gap-2 opacity-50">
                        <span class="text-xs uppercase tracking-[0.2em] text-mystic-400">Scroll</span>
                        <span class="block h-10 w-px bg-gradient-to-b from-purple-400/60 to-transparent"></span>
                    </div>
                </div>
            </section>

            <section id="about" class="scroll-mt-24 px-5 py-24 md:px-8">
                <div class="mx-auto max-w-6xl">
                    <h2 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="about-title">About</h2>
                    <p class="mt-3 max-w-xl text-mystic-400" data-reveal data-editable-id="about-sub">Smoke, signal, and craft.</p>
                    <div class="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
                        <div class="glass-panel p-8 md:p-10" data-reveal>
                            <p class="leading-relaxed text-mystic-200" data-editable-id="about-p1">
                                I’m a developer who cares about mood as much as mechanics. This portfolio runs on Laravel and Tailwind—built to feel like a quiet ritual: gradients that breathe, type that whispers, and structure you can trust under the haze.
                            </p>
                        </div>
                        <div class="glass-panel p-8 md:p-10" data-reveal>
                            <p class="leading-relaxed text-mystic-200" data-editable-id="about-p2">
                                When I’m not chasing perfect purples, I’m prototyping interactions, tightening performance, and making sure the magic doesn’t come at the cost of accessibility or clarity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="skills" class="scroll-mt-24 px-5 py-24 md:px-8">
                <div class="mx-auto max-w-6xl">
                    <h2 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="skills-title">Skills</h2>
                    <p class="mt-3 max-w-xl text-mystic-400" data-reveal data-editable-id="skills-sub">Tools I reach for in the fog.</p>
                    <ul class="mt-12 flex flex-wrap gap-3" data-reveal>
                        @foreach (['Laravel', 'PHP', 'JavaScript', 'Tailwind CSS', 'Vite', 'MySQL', 'REST APIs', 'Git'] as $skill)
                            <li>
                                <span
                                    data-editable-id="skill-{{ $loop->index }}"
                                    class="inline-flex rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-2 text-sm text-mystic-200 shadow-[0_0_24px_rgba(88,28,135,0.12)]"
                                >
                                    {{ $skill }}
                                </span>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </section>

            <section id="work" class="scroll-mt-24 px-5 py-24 md:px-8">
                <div class="mx-auto max-w-6xl">
                    <h2 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="work-title">Selected work</h2>
                    <p class="mt-3 max-w-xl text-mystic-400" data-reveal data-editable-id="work-sub">Replace these with your projects—links and images optional.</p>
                    <div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        @foreach ([
                            ['title' => 'Ethereal dashboard', 'desc' => 'Analytics UI with glass panels and soft purple telemetry.', 'tag' => 'UI'],
                            ['title' => 'API constellation', 'desc' => 'REST services behind a Laravel stack—clean contracts, solid docs.', 'tag' => 'Backend'],
                            ['title' => 'Mist landing', 'desc' => 'Marketing page with gradient storytelling and scroll reveals.', 'tag' => 'Front-end'],
                        ] as $project)
                            <article class="glass-panel group flex flex-col p-8 transition hover:border-purple-400/30 hover:shadow-[0_0_48px_rgba(88,28,135,0.2)]" data-reveal>
                                <span data-editable-id="project-{{ $loop->index }}-tag" class="text-xs font-medium uppercase tracking-wider text-purple-400/90">{{ $project['tag'] }}</span>
                                <h3 data-editable-id="project-{{ $loop->index }}-title" class="mt-4 font-display text-xl font-semibold text-mystic-50">{{ $project['title'] }}</h3>
                                <p data-editable-id="project-{{ $loop->index }}-desc" class="mt-3 flex-1 text-sm leading-relaxed text-mystic-300">{{ $project['desc'] }}</p>
                                <span class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-purple-300 transition group-hover:text-purple-200">
                                    Details
                                    <svg class="h-4 w-4 translate-x-0 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </article>
                        @endforeach
                    </div>
                </div>
            </section>

            <section id="contact" class="scroll-mt-24 px-5 py-28 md:px-8">
                <div class="mx-auto max-w-3xl text-center">
                    <h2 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="contact-title">Contact</h2>
                    <p class="mt-4 text-mystic-300" data-reveal data-editable-id="contact-sub">Have a project that needs atmosphere? Say hello.</p>
                    <div class="mt-10 flex flex-wrap items-center justify-center gap-4" data-reveal>
                        <a
                            href="mailto:hello@example.com"
                            data-editable-id="contact-email"
                            data-editable-link="email"
                            class="rounded-full bg-gradient-to-r from-purple-600 to-violet-700 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_40px_rgba(124,58,237,0.35)] transition hover:from-purple-500 hover:to-violet-600"
                        >
                            hello@example.com
                        </a>
                        <a
                            href="https://github.com"
                            data-editable-id="contact-github"
                            data-editable-link="url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-sm font-medium text-mystic-100 backdrop-blur-sm transition hover:border-purple-400/40"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </section>
        </main>

        <footer class="border-t border-white/5 px-5 py-10 md:px-8">
            <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-mystic-500 md:flex-row">
                <p data-editable-id="footer-left">&copy; {{ date('Y') }} {{ config('app.name', 'Portfolio') }}. Crafted in purple mist.</p>
                <p class="text-mystic-600" data-editable-id="footer-right">Built with Laravel &amp; Tailwind</p>
            </div>
        </footer>

        <div id="edit-mode-banner" class="edit-mode-banner" hidden role="status" aria-live="polite" aria-hidden="true">
            <p>
                <strong class="font-medium text-mystic-100">Editing mode</strong>
                — click highlighted text to edit; changes save to this browser. Press
                <kbd class="rounded border border-purple-500/40 bg-mystic-900 px-1.5 py-0.5 font-mono text-xs text-mystic-300">Q</kbd>
                to exit when focus is outside a field (or refresh the page). Secret entry: hold
                <kbd class="rounded border border-purple-500/40 bg-mystic-900 px-1.5 py-0.5 font-mono text-xs text-mystic-300">.</kbd>
                and left-click three times.
            </p>
        </div>
    </body>
</html>
