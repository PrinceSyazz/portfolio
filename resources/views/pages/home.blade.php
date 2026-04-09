@extends('layouts.portfolio')

@section('title', 'Home')

@section('content')
    <section class="px-5 pb-24 pt-6 md:px-8 md:pb-28 md:pt-10">
        <div class="mx-auto max-w-6xl">
            <div class="flex flex-wrap items-end justify-between gap-4" data-reveal>
                <div>
                    <h2 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-editable-id="events-featured-title">Featured Events</h2>
                    <p class="mt-3 max-w-2xl text-mystic-300" data-editable-id="events-featured-subtitle">A snapshot of the latest events I joined recently.</p>
                </div>
            </div>

            <div class="mt-10 flex justify-center" data-reveal>
                <div class="featured-carousel-container">
                    <button type="button" id="featured-carousel-prev" class="featured-carousel__arrow featured-carousel__arrow--prev" aria-label="Previous event">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div id="featured-events-list" class="featured-carousel" data-reveal></div>
                    <button type="button" id="featured-carousel-next" class="featured-carousel__arrow featured-carousel__arrow--next" aria-label="Next event">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <p class="mt-10 text-center" data-reveal>
                <a
                    href="#other-events"
                    id="view-other-events-trigger"
                    class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-mystic-100 transition hover:border-purple-400/45 hover:bg-white/10"
                    data-editable-id="events-view-other-link-text"
                >
                    View other events
                </a>
            </p>

            <div id="other-events" class="mt-20 scroll-mt-36" data-reveal hidden aria-hidden="true">
                <div class="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h3 class="font-display text-2xl font-semibold text-mystic-50 md:text-3xl" data-editable-id="events-other-title">Other Events</h3>
                        <p class="mt-2 max-w-2xl text-mystic-300" data-editable-id="events-other-subtitle">A breakdown of non-featured events listed below.</p>
                    </div>
                </div>
                <div id="all-events-list" class="mt-8 space-y-6"></div>
            </div>

            <div id="events-editor" class="events-editor mt-16" data-editing-only hidden>
                <h3 class="font-display text-2xl font-semibold text-mystic-50">Events CRUD</h3>
                <p class="mt-2 text-sm text-mystic-300">Create, edit, and delete events. Upload image by selecting a file or dropping it below.</p>

                <form id="event-form" class="mt-6 grid gap-4 md:grid-cols-2">
                    <input type="hidden" id="event-id" name="id">

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Title</span>
                        <input id="event-title" name="title" type="text" required class="events-editor__input" placeholder="Event title">
                    </label>

                    <label class="events-editor__field">
                        <span class="events-editor__label">Event Date</span>
                        <input id="event-date" name="date" type="date" required class="events-editor__input">
                    </label>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Description</span>
                        <textarea id="event-description" name="description" rows="3" class="events-editor__input" placeholder="What happened in this event?"></textarea>
                    </label>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Event/Post Link (optional)</span>
                        <input id="event-link" name="link" type="url" class="events-editor__input" placeholder="https://instagram.com/p/... or any event link">
                    </label>

                    <div class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Image Upload (optional)</span>
                        <input id="event-image-file" name="imageFile" type="file" accept="image/*" class="sr-only">
                        <button type="button" id="event-image-dropzone" class="events-editor__dropzone" aria-label="Upload event image">
                            <span>Drop image here or click to upload</span>
                            <span id="event-image-name" class="events-editor__dropzone-note">No file selected</span>
                        </button>
                    </div>

                    <div class="events-editor__actions md:col-span-2">
                        <button type="submit" id="event-save" class="events-editor__button events-editor__button--primary">Create Event</button>
                        <button type="button" id="event-reset" class="events-editor__button">Cancel Edit</button>
                    </div>
                </form>
            </div>
        </div>
    </section>
@endsection
