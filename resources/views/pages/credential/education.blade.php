@extends('layouts.portfolio')

@section('title', 'Education')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-16">
        <div class="mx-auto max-w-3xl">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="cred-edu-title">Education</h1>
            <p class="mt-4 leading-relaxed text-mystic-300" data-reveal data-editable-id="cred-edu-intro">
                Add your degrees, institutions, and graduation years here. This is placeholder copy you can replace whenever you want.
            </p>
            <ul class="mt-10 space-y-6" data-reveal>
                <li class="glass-panel p-6">
                    <p class="font-medium text-mystic-100" data-editable-id="cred-edu-1">Bachelor of Science in Computer Science</p>
                    <p class="mt-1 text-sm text-mystic-400" data-editable-id="cred-edu-1-meta">University name · 20XX – 20XX</p>
                </li>
            </ul>
        </div>
    </div>
@endsection
