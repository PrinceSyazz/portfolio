@extends('layouts.portfolio')

@section('title', 'Experience')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-16">
        <div class="mx-auto max-w-3xl">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="cred-exp-title">Experience</h1>
            <p class="mt-4 leading-relaxed text-mystic-300" data-reveal data-editable-id="cred-exp-intro">
                List roles, companies, and impact. Replace this placeholder with your real experience.
            </p>
            <ul class="mt-10 space-y-6" data-reveal>
                <li class="glass-panel p-6">
                    <p class="font-medium text-mystic-100" data-editable-id="cred-exp-1-title">Job title</p>
                    <p class="mt-1 text-sm text-mystic-400" data-editable-id="cred-exp-1-meta">Company · 20XX – Present</p>
                    <p class="mt-3 text-sm leading-relaxed text-mystic-300" data-editable-id="cred-exp-1-desc">Brief summary of responsibilities and wins.</p>
                </li>
            </ul>
        </div>
    </div>
@endsection
