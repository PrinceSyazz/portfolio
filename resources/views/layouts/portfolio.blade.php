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

        <title>@yield('title', 'Portfolio') — {{ config('app.name', 'Portfolio') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link
            href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700|space-grotesk:500,600,700&display=swap"
            rel="stylesheet"
        >

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    @php
        $onCredential = request()->routeIs('credential.*');
        $showLoader = request()->routeIs('home');
    @endphp
    <body @class([
        'min-h-full bg-mystic-950 font-sans text-mystic-100 antialiased',
        'overflow-hidden' => $showLoader,
    ])>
        @if ($showLoader)
            <div id="loader" class="loader" role="status" aria-live="polite" aria-busy="true">
                <div class="loader__content">
                    <p class="loader__hello font-display" lang="ar">
                        <span id="loader-hello" class="loader__hello-word" dir="rtl">السلام عليكم</span>
                    </p>
                    <p id="loader-hello-label" class="loader__hello-label">العربية</p>
                    <div class="loader__line" aria-hidden="true"></div>
                </div>
            </div>
        @endif

        <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div class="absolute -left-1/4 top-0 h-[70vh] w-[70vw] rounded-full bg-purple-600/25 blur-[120px] animate-smoke-a" aria-hidden="true"></div>
            <div class="absolute -right-1/4 bottom-0 h-[65vh] w-[65vw] rounded-full bg-violet-900/30 blur-[100px] animate-smoke-b" aria-hidden="true"></div>
            <div class="absolute left-1/3 top-1/4 h-[50vh] w-[50vw] rounded-full bg-fuchsia-950/35 blur-[90px] animate-smoke-c" aria-hidden="true"></div>
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(88,28,135,0.35),transparent_55%)]" aria-hidden="true"></div>
            {{-- Soft violet wash only — avoid a heavy black band at the bottom (it was showing through glass & around cards) --}}
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,6,18,0.06)_0%,rgba(88,28,135,0.1)_50%,rgba(10,6,18,0.22)_100%)]" aria-hidden="true"></div>
            <div
                class="absolute inset-0 opacity-[0.07] mix-blend-overlay"
                style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');"
                aria-hidden="true"
            ></div>
        </div>

        <header class="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-mystic-950/40 backdrop-blur-xl">
            <div class="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 md:px-8">
                <div class="flex items-center justify-between gap-4">
                    <a href="{{ route('home') }}" class="site-header__link font-display text-xl font-semibold tracking-tight text-mystic-100 md:text-2xl" aria-label="Home">
                        <span class="text-gradient-mystic" data-editable-id="brand">{{ config('app.name', 'Portfolio') }}</span>
                    </a>
                    <nav class="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-xs font-medium sm:gap-x-5 sm:text-sm md:gap-x-8" aria-label="Main">
                        <a
                            href="{{ route('about') }}"
                            @class(['site-header__link', 'nav-main__link', 'nav-main__link--active' => request()->routeIs('about')])
                            @if(request()->routeIs('about')) aria-current="page" @endif
                        >About me</a>
                        <a
                            href="{{ route('project') }}"
                            @class(['site-header__link', 'nav-main__link', 'nav-main__link--active' => request()->routeIs('project')])
                            @if(request()->routeIs('project')) aria-current="page" @endif
                        >Project</a>
                        <a
                            href="{{ route('credential.education') }}"
                            @class(['site-header__link', 'nav-main__link', 'nav-main__link--active' => $onCredential])
                            @if($onCredential) aria-current="page" @endif
                        >Credential</a>
                        <a
                            href="{{ route('contact') }}"
                            @class(['site-header__link', 'nav-main__link', 'nav-main__link--active' => request()->routeIs('contact')])
                            @if(request()->routeIs('contact')) aria-current="page" @endif
                        >Contact me</a>
                    </nav>
                </div>
                @if ($onCredential)
                    <nav class="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/5 pt-3 text-xs sm:text-sm" aria-label="Credential">
                        <a
                            href="{{ route('credential.education') }}"
                            @class(['site-header__link', 'credential-nav__link', 'credential-nav__link--active' => request()->routeIs('credential.education')])
                            @if(request()->routeIs('credential.education')) aria-current="page" @endif
                        >Education</a>
                        <a
                            href="{{ route('credential.experience') }}"
                            @class(['site-header__link', 'credential-nav__link', 'credential-nav__link--active' => request()->routeIs('credential.experience')])
                            @if(request()->routeIs('credential.experience')) aria-current="page" @endif
                        >Experience</a>
                        <a
                            href="{{ route('credential.certification') }}"
                            @class(['site-header__link', 'credential-nav__link', 'credential-nav__link--active' => request()->routeIs('credential.certification')])
                            @if(request()->routeIs('credential.certification')) aria-current="page" @endif
                        >Certification</a>
                    </nav>
                @endif
            </div>
        </header>

        <main class="min-h-screen pt-32 md:pt-36">
            @yield('content')
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
