@extends('layouts.portfolio')

@section('title', 'Project')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-16">
        <div class="mx-auto max-w-6xl">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="work-title">Project</h1>
            <p class="mt-3 max-w-xl text-mystic-400" data-reveal data-editable-id="work-sub">Selected work—replace with your own projects.</p>
            <div id="projects-list" class="mt-12 space-y-6"></div>

            <div id="projects-editor" class="events-editor mt-16" data-editing-only hidden>
                <h3 class="font-display text-2xl font-semibold text-mystic-50">Projects CRUD</h3>
                <p class="mt-2 text-sm text-mystic-300">Create, edit, and delete projects. The preview image links to the project website.</p>

                <form id="project-form" class="mt-6 grid gap-4 md:grid-cols-2">
                    <input type="hidden" id="project-id" name="id">

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Title</span>
                        <input id="project-title" name="title" type="text" required class="events-editor__input" placeholder="Project title">
                    </label>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Description</span>
                        <textarea id="project-description" name="description" rows="3" class="events-editor__input" placeholder="Short project summary"></textarea>
                    </label>

                    <label class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Project Link</span>
                        <input id="project-link" name="link" type="url" class="events-editor__input" placeholder="https://your-project-site.com">
                    </label>

                    <div class="events-editor__field md:col-span-2">
                        <span class="events-editor__label">Preview Image (optional)</span>
                        <input id="project-image-file" name="imageFile" type="file" accept="image/*" class="sr-only">
                        <button type="button" id="project-image-dropzone" class="events-editor__dropzone" aria-label="Upload project image">
                            <span>Drop image here or click to upload</span>
                            <span id="project-image-name" class="events-editor__dropzone-note">No file selected</span>
                        </button>
                    </div>

                    <div class="events-editor__actions md:col-span-2">
                        <button type="submit" id="project-save" class="events-editor__button events-editor__button--primary">Create Project</button>
                        <button type="button" id="project-reset" class="events-editor__button">Cancel Edit</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
