<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'marketing/welcome')->name('home');

require __DIR__.'/dashboard.php';
