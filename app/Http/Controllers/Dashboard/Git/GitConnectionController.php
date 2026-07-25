<?php

namespace App\Http\Controllers\Dashboard\Git;

use App\Http\Controllers\Controller;
use App\Models\GitConnection;
use App\Services\Git\GitHubService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GitConnectionController extends Controller
{
    /**
     * Fetch repositories for a specific connection.
     */
    public function repositories(Request $request, string $currentTeam, GitConnection $connection, GitHubService $gitHubService): JsonResponse
    {
        $team = $request->user()->currentTeam;
        if ($connection->team_id !== $team->id) {
            abort(403);
        }

        $repositories = $gitHubService->getRepositories($connection);

        return response()->json([
            'repositories' => $repositories,
        ]);
    }

    /**
     * Fetch branches for a specific repository.
     */
    public function branches(Request $request, string $currentTeam, GitConnection $connection, GitHubService $gitHubService): JsonResponse
    {
        $team = $request->user()->currentTeam;
        if ($connection->team_id !== $team->id) {
            abort(403);
        }

        $repositoryName = $request->query('repository');
        if (! $repositoryName) {
            return response()->json(['branches' => []]);
        }

        $branches = $gitHubService->getBranches($connection, $repositoryName);

        return response()->json([
            'branches' => $branches,
        ]);
    }
}
