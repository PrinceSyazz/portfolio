<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'pages.home')->name('home');
Route::view('/about', 'pages.about')->name('about');
Route::view('/project', 'pages.project')->name('project');

Route::redirect('/credential', '/credential/education');

Route::view('/credential/education', 'pages.credential.education')->name('credential.education');
Route::view('/credential/experience', 'pages.credential.experience')->name('credential.experience');
Route::view('/credential/certification', 'pages.credential.certification')->name('credential.certification');

Route::view('/contact', 'pages.contact')->name('contact');
