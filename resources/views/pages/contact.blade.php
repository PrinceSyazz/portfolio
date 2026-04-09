@extends('layouts.portfolio')

@section('title', 'Contact me')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-20">
        <div class="mx-auto max-w-3xl text-center">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="contact-title">Contact me</h1>
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
    </div>
@endsection
