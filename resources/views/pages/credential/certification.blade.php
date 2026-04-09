@extends('layouts.portfolio')

@section('title', 'Certification')

@section('content')
    <div class="px-5 py-12 md:px-8 md:py-16">
        <div class="mx-auto max-w-3xl">
            <h1 class="font-display text-3xl font-semibold text-mystic-50 md:text-4xl" data-reveal data-editable-id="cred-cert-title">Certification</h1>
            <p class="mt-4 leading-relaxed text-mystic-300" data-reveal data-editable-id="cred-cert-intro">
                Professional certifications, licenses, and credentials belong here.
            </p>
            <ul class="mt-10 space-y-4" data-reveal>
                <li class="glass-panel flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <span class="font-medium text-mystic-100" data-editable-id="cred-cert-1-name">Certification name</span>
                    <span class="text-sm text-mystic-400" data-editable-id="cred-cert-1-meta">Issuer · Year</span>
                </li>
            </ul>
        </div>
    </div>
@endsection
