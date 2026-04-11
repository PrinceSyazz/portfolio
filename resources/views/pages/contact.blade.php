@extends('layouts.portfolio')

@section('title', 'Contact me')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-20">
        <div class="mx-auto max-w-3xl text-center">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="contact-title">Contact me</h1>
            <p class="mt-4 text-mystic-300" data-reveal data-editable-id="contact-sub">Have a project that needs atmosphere? Say hello.</p>
            <div id="contact-links" class="mt-10 grid gap-4 text-left md:grid-cols-3" data-reveal>
                <a id="contact-instagram-link" href="#" target="_blank" rel="noopener noreferrer" class="glass-panel group flex items-center gap-4 px-5 py-5 transition hover:border-pink-400/35 hover:bg-white/[0.06]">
                    <span class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-pink-500/15 text-pink-300 shadow-[0_0_24px_rgba(236,72,153,0.12)]">
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <rect x="4" y="4" width="16" height="16" rx="5" />
                            <circle cx="12" cy="12" r="3.5" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                    </span>
                    <span class="min-w-0 flex-1">
                        <span class="block text-xs uppercase tracking-[0.25em] text-pink-300/85">Instagram</span>
                        <span id="contact-instagram-text" class="mt-1 block truncate text-sm font-medium text-mystic-100">Tap to connect</span>
                        <span class="mt-1 block text-xs text-mystic-400">Open profile</span>
                    </span>
                </a>

                <a id="contact-whatsapp-link" href="#" target="_blank" rel="noopener noreferrer" class="glass-panel group flex items-center gap-4 px-5 py-5 transition hover:border-green-400/35 hover:bg-white/[0.06]">
                    <span class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-green-500/15 text-green-300 shadow-[0_0_24px_rgba(34,197,94,0.12)]">
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2a10 10 0 0 0-8.74 14.8L2 22l5.39-1.2A10 10 0 1 0 12 2zm0 18a7.96 7.96 0 0 1-4.07-1.11l-.29-.17-3.2.71.68-3.12-.18-.32A8 8 0 1 1 12 20zm4.61-5.8c-.25-.12-1.48-.73-1.71-.81-.23-.08-.4-.12-.57.12-.17.25-.66.81-.81.98-.15.17-.3.19-.55.06-.25-.12-1.04-.38-1.98-1.2-.73-.65-1.22-1.45-1.36-1.7-.14-.25-.02-.38.1-.5.1-.1.25-.26.37-.39.12-.13.16-.23.25-.38.08-.15.04-.28-.02-.4-.06-.12-.57-1.37-.79-1.88-.21-.5-.43-.44-.57-.45h-.49c-.17 0-.45.06-.69.28-.23.22-.89.87-.89 2.12 0 1.25.92 2.46 1.05 2.63.13.17 1.8 2.75 4.36 3.86.61.26 1.09.42 1.46.54.61.2 1.17.17 1.61.1.49-.07 1.48-.61 1.69-1.2.21-.59.21-1.1.15-1.2-.06-.1-.22-.16-.47-.28z" />
                        </svg>
                    </span>
                    <span class="min-w-0 flex-1">
                        <span class="block text-xs uppercase tracking-[0.25em] text-green-300/85">WhatsApp</span>
                        <span id="contact-whatsapp-text" class="mt-1 block truncate text-sm font-medium text-mystic-100">Tap to connect</span>
                        <span class="mt-1 block text-xs text-mystic-400">Tap to open chat</span>
                    </span>
                </a>

                <a id="contact-email-link" href="#" class="glass-panel group flex items-center gap-4 px-5 py-5 transition hover:border-purple-400/35 hover:bg-white/[0.06]">
                    <span class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300 shadow-[0_0_24px_rgba(168,85,247,0.12)]">
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16v12H4z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="m4 7 8 6 8-6" />
                        </svg>
                    </span>
                    <span class="min-w-0 flex-1">
                        <span class="block text-xs uppercase tracking-[0.25em] text-purple-300/85">Gmail</span>
                        <span id="contact-email-text" class="mt-1 block truncate text-sm font-medium text-mystic-100">Tap to connect</span>
                        <span class="mt-1 block text-xs text-mystic-400">Open email composer</span>
                    </span>
                </a>
            </div>

            <div id="contact-editor" class="events-editor mt-16 text-left" data-editing-only hidden>
                <h3 class="font-display text-2xl font-semibold text-mystic-50">Contact Links</h3>
                <p class="mt-2 text-sm text-mystic-300">Add your WhatsApp number, Gmail address, and Instagram username. WhatsApp and Instagram links can be auto-generated if you leave the custom link blank.</p>

                <form id="contact-form" class="mt-6 grid gap-4 md:grid-cols-2">
                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">WhatsApp Number</span>
                        <input id="contact-whatsapp-number" type="text" class="events-editor__input" placeholder="+60123456789">
                    </label>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">WhatsApp Link (optional)</span>
                        <input id="contact-whatsapp-link-input" type="url" class="events-editor__input" placeholder="https://wa.me/60123456789">
                    </label>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Gmail Address</span>
                        <input id="contact-email-address" type="email" class="events-editor__input" placeholder="you@gmail.com">
                    </label>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Instagram Username</span>
                        <input id="contact-instagram-username" type="text" class="events-editor__input" placeholder="your_username">
                    </label>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Instagram Link (optional)</span>
                        <input id="contact-instagram-link-input" type="url" class="events-editor__input" placeholder="https://instagram.com/your_username">
                    </label>

                    <div class="events-editor__actions md:col-span-2">
                        <button type="submit" id="contact-save" class="events-editor__button events-editor__button--primary">Save Contact Links</button>
                        <button type="button" id="contact-reset" class="events-editor__button">Reset</button>
                    </div>
                </form>
            </div>

            <section class="mt-16 text-left" data-reveal>
                <div class="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 class="font-display text-2xl font-semibold text-mystic-50 md:text-3xl">Comments</h2>
                    </div>
                </div>

                <div class="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div class="glass-panel p-6 md:p-8">
                        <h3 class="font-display text-xl font-semibold text-mystic-50">Leave a comment</h3>
                        <p class="mt-2 text-sm text-mystic-300">Your username is optional. If you leave it empty, the comment will show as Anonymous.</p>

                        <form id="comment-form" class="mt-6 space-y-4">
                            <label class="events-editor__field">
                                <span class="events-editor__label">Instagram Username</span>
                                <input id="comment-username" type="text" class="events-editor__input" placeholder="your_username or leave blank">
                            </label>

                            <label class="events-editor__field">
                                <span class="events-editor__label">Comment</span>
                                <textarea id="comment-body" rows="5" class="events-editor__input" placeholder="Write your comment here..."></textarea>
                            </label>

                            <div class="events-editor__actions">
                                <button type="submit" id="comment-submit" class="events-editor__button events-editor__button--primary">Post Comment</button>
                            </div>
                        </form>
                    </div>

                    <div class="space-y-4">
                        <div class="glass-panel p-6 md:p-8">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <h3 class="font-display text-xl font-semibold text-mystic-50">Comment feed</h3>
                                </div>
                                <span id="comment-count" class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-mystic-200">0 comments</span>
                            </div>
                        </div>

                        <div id="comment-list" class="space-y-4"></div>
                    </div>
                </div>
            </section>
        </div>
    </div>
@endsection
