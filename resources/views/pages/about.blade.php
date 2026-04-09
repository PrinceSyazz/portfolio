@extends('layouts.portfolio')

@section('title', 'About me')

@section('content')
    <section class="px-5 py-12 md:px-8 md:py-16">
        <div class="mx-auto max-w-6xl">
            <h1 class="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-mystic-50 sm:text-5xl md:text-6xl" data-reveal data-editable-id="about-heading">About Me</h1>
            <p class="mt-6 max-w-3xl text-base leading-relaxed text-mystic-300 md:text-lg" data-reveal data-editable-id="about-bio">
                Share your short introduction here.
            </p>

            <div class="mt-10 grid gap-6 lg:grid-cols-3">
                <div class="glass-panel p-6 md:p-8 lg:col-span-2" data-reveal>
                    <h2 class="font-display text-xl font-semibold text-mystic-50" data-editable-id="about-profile-title">Profile Overview</h2>
                    <dl class="mt-6 grid gap-5 sm:grid-cols-2">
                        <div class="sm:col-span-2">
                            <dt class="text-xs font-semibold tracking-[0.3em] text-mystic-500">FULL NAME</dt>
                            <dd class="mt-2 text-base text-mystic-100 md:text-lg" data-editable-id="about-profile-fullname">Not set</dd>
                        </div>
                        <div>
                            <dt class="text-xs font-semibold tracking-[0.3em] text-mystic-500">DATE OF BIRTH</dt>
                            <dd id="about-profile-dob" class="mt-2 cursor-pointer text-sm text-mystic-200 md:text-base" data-editable-id="about-profile-dob" title="Double click to pick date in edit mode">Not set</dd>
                            <input id="about-profile-dob-picker" type="date" class="sr-only" aria-hidden="true" tabindex="-1">
                        </div>
                        <div>
                            <dt class="text-xs font-semibold tracking-[0.3em] text-mystic-500">LANGUAGES</dt>
                            <dd id="about-language-list" class="mt-3 grid gap-2 sm:grid-cols-2"></dd>
                        </div>
                    </dl>

                    <div class="mt-8 border-t border-white/10 pt-6">
                        <div class="grid gap-4 sm:grid-cols-3">
                            <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                                <p class="text-xs font-semibold tracking-[0.3em] text-mystic-500">EVENTS</p>
                                <p class="mt-2 font-display text-2xl font-semibold text-white" data-editable-id="about-count-events">-</p>
                            </div>
                            <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                                <p class="text-xs font-semibold tracking-[0.3em] text-mystic-500">PROJECTS</p>
                                <p class="mt-2 font-display text-2xl font-semibold text-white" data-editable-id="about-count-projects">-</p>
                            </div>
                            <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                                <p class="text-xs font-semibold tracking-[0.3em] text-mystic-500">CERTIFICATIONS</p>
                                <p class="mt-2 font-display text-2xl font-semibold text-white" data-editable-id="about-count-certifications">-</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 grid gap-3 sm:max-w-md sm:grid-cols-2">
                        <a
                            href="{{ route('contact') }}"
                            class="rounded-full bg-gradient-to-r from-purple-600 to-violet-700 px-4 py-2 text-center text-xs font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.3)] transition hover:from-purple-500 hover:to-violet-600"
                            data-editable-id="about-action-contact"
                        >
                            Contact me
                        </a>
                        <a
                            id="about-cv-download"
                            href="{{ asset('cv.pdf') }}"
                            class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-xs font-medium text-mystic-100 backdrop-blur-sm transition hover:border-purple-400/40 hover:bg-white/10"
                            download
                            data-editable-id="about-action-download"
                        >
                            Download CV
                        </a>
                        <p id="about-cv-note" class="sm:col-span-2 text-xs text-mystic-500" data-editable-id="about-action-note">Add your CV file at public/cv.pdf</p>
                    </div>
                </div>

                <div class="glass-panel p-6 md:p-8" data-reveal>
                    <h2 class="font-display text-xl font-semibold text-mystic-50">Profile Picture</h2>
                    <div id="about-profile-picture-stage" class="mt-6 min-h-[24rem] overflow-hidden rounded-2xl border border-white/10 bg-mystic-900/70">
                        <div class="flex min-h-[24rem] items-center justify-center p-6 text-center text-mystic-400">No profile image uploaded.</div>
                    </div>
                </div>
            </div>

            <div class="mt-12" data-reveal>
                <h2 class="font-display text-2xl font-semibold text-mystic-50 md:text-3xl" data-editable-id="skills-title">Skills</h2>
                <p class="mt-3 max-w-2xl text-mystic-400" data-editable-id="skills-subtitle">List your core skills below.</p>
                <div id="about-skills-list" class="mt-6 flex flex-wrap gap-3">
                    <p class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-mystic-300">No skills added.</p>
                </div>
            </div>

            <div id="about-editor" class="events-editor mt-16" data-editing-only hidden>
                <h3 class="font-display text-2xl font-semibold text-mystic-50">About Editor</h3>
                <p class="mt-2 text-sm text-mystic-300">Upload profile images/CV and manage languages and skills.</p>

                <div class="mt-6 grid gap-4 md:grid-cols-2">
                    <label class="events-editor__field">
                        <span class="events-editor__label">Profile Pictures (multiple)</span>
                        <input id="about-profile-images" type="file" accept="image/*" multiple class="events-editor__input">
                    </label>

                    <div class="events-editor__field justify-end">
                        <span class="events-editor__label">Profile Pictures Actions</span>
                        <button type="button" id="about-clear-images" class="events-editor__button">Clear All Pictures</button>
                    </div>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">CV Upload</span>
                        <input id="about-cv-file" type="file" accept=".pdf,.doc,.docx" class="events-editor__input">
                        <span id="about-cv-file-name" class="text-xs text-mystic-400">No file selected</span>
                    </label>
                </div>

                <div class="mt-8 grid gap-8 lg:grid-cols-2">
                    <div>
                        <h4 class="font-display text-lg font-semibold text-mystic-50">Languages</h4>
                        <div class="mt-3 grid gap-3">
                            <input id="about-language-name" type="text" class="events-editor__input" placeholder="Language name">
                            <input id="about-language-speaking" type="number" min="0" max="100" class="events-editor__input" placeholder="Speaking %">
                            <input id="about-language-writing" type="number" min="0" max="100" class="events-editor__input" placeholder="Written %">
                            <button type="button" id="about-add-language" class="events-editor__button events-editor__button--primary">Add Language</button>
                        </div>
                        <div id="about-language-editor-list" class="mt-4 grid gap-2"></div>
                    </div>

                    <div>
                        <h4 class="font-display text-lg font-semibold text-mystic-50">Skills</h4>
                        <div class="mt-3 grid gap-3">
                            <input id="about-skill-name" type="text" class="events-editor__input" placeholder="Skill name">
                            <input id="about-skill-percent" type="number" min="0" max="100" class="events-editor__input" placeholder="Skill %">
                            <button type="button" id="about-add-skill" class="events-editor__button events-editor__button--primary">Add Skill</button>
                        </div>
                        <div id="about-skill-editor-list" class="mt-4 grid gap-2"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
