@extends('layouts.portfolio')

@section('title', 'Other Events')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-16">
        <div class="mx-auto max-w-6xl">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="events-page-title">Other Events</h1>
            <p class="mt-3 max-w-xl text-mystic-400" data-reveal data-editable-id="events-page-sub">A full breakdown of non-featured events in a list layout.</p>
            <div id="all-events-list" class="mt-12 space-y-6"></div>
        </div>
    </div>
@endsection
