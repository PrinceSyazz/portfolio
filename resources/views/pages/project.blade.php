@extends('layouts.portfolio')

@section('title', 'Project')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-16">
        <div class="mx-auto max-w-6xl">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="work-title">All Events</h1>
            <p class="mt-3 max-w-xl text-mystic-400" data-reveal data-editable-id="work-sub">Browse all the events I've participated in recently.</p>
            <div id="all-events-list" class="mt-12 space-y-6">
            </div>
            @if (false)
            <div class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                @foreach ([
                    ['title' => 'Ethereal dashboard', 'desc' => 'Analytics UI with glass panels and soft purple telemetry.', 'tag' => 'UI'],
                    ['title' => 'API constellation', 'desc' => 'REST services behind a Laravel stack—clean contracts, solid docs.', 'tag' => 'Backend'],
                    ['title' => 'Mist landing', 'desc' => 'Marketing page with gradient storytelling and scroll reveals.', 'tag' => 'Front-end'],
                ] as $project)
                    <article class="glass-panel group flex flex-col p-8 transition hover:border-purple-400/30 hover:shadow-[0_0_48px_rgba(88,28,135,0.2)]" data-reveal>
                        <span data-editable-id="project-{{ $loop->index }}-tag" class="text-xs font-medium uppercase tracking-wider text-purple-400/90">{{ $project['tag'] }}</span>
                        <h2 data-editable-id="project-{{ $loop->index }}-title" class="mt-4 font-display text-xl font-semibold text-mystic-50">{{ $project['title'] }}</h2>
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
            @endif
        </div>
    </div>
@endsection
