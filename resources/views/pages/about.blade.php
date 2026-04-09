@extends('layouts.portfolio')

@section('title', 'About me')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-16">
        <div class="mx-auto max-w-6xl">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="about-title">About me</h1>
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

            <h2 class="mt-20 font-display text-2xl font-semibold text-mystic-50 md:text-3xl" data-reveal data-editable-id="skills-title">Skills</h2>
            <p class="mt-3 max-w-xl text-mystic-400" data-reveal data-editable-id="skills-sub">Tools I reach for in the fog.</p>
            <ul class="mt-8 flex flex-wrap gap-3" data-reveal>
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
    </div>
@endsection
