<?php

namespace App\Http\Controllers\Settings;

use App\Enums\ApiScope;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiTokenController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $tokens = $request->user()->tokens()->orderBy('created_at', 'desc')->get();

        $availableScopes = array_map(function ($scope) {
            return [
                'value' => $scope->value,
                'label' => $scope->label(),
                'description' => $scope->description(),
            ];
        }, ApiScope::cases());

        return Inertia::render('settings/api-tokens/index', [
            'tokens' => $tokens,
            'availableScopes' => $availableScopes,
            'newToken' => session('newToken'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'scopes' => ['array'],
            'scopes.*' => ['string'],
            'expires_in' => ['nullable', 'integer', 'min:1'],
        ]);

        $expiresAt = $request->filled('expires_in')
            ? now()->addDays($request->expires_in)
            : null;

        $token = $request->user()->createToken(
            $request->name,
            $request->scopes ?? [],
            $expiresAt
        );

        // Strip the ID| prefix to hide the database ID from the user (Standard GitHub/Cloudflare style)
        $cleanToken = explode('|', $token->plainTextToken, 2)[1];

        return back()->with('newToken', $cleanToken);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $request->user()->tokens()->where('id', $id)->delete();

        return back();
    }
}
