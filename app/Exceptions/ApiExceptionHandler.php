<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Exceptions\MissingAbilityException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ApiExceptionHandler
{
    public function handle(Throwable $e, Request $request)
    {
        $statusCode = 500;
        $message = $e->getMessage() ?: 'Internal Server Error';
        $errors = null;

        if ($e instanceof HttpExceptionInterface) {
            $statusCode = $e->getStatusCode();
        }

        if ($e instanceof AuthenticationException) {
            $statusCode = 401;
            $message = 'Unauthenticated.';
        } elseif ($e instanceof AccessDeniedHttpException && $e->getPrevious() instanceof MissingAbilityException) {
            $statusCode = 403;
            $message = 'Forbidden.';
        } elseif ($e instanceof ModelNotFoundException) {
            $statusCode = 404;
            $message = 'Resource not found.';
        } elseif ($e instanceof ValidationException) {
            $statusCode = 422;
            $message = 'Validation failed.';
            $errors = $e->errors();
        } elseif ($statusCode === 404 && empty($e->getMessage())) {
            $message = 'Not Found.';
        } elseif ($statusCode === 405) {
            $message = 'Method Not Allowed.';
        } elseif ($statusCode === 429) {
            $message = 'Too Many Requests.';
        }

        if ($statusCode >= 500 && ! config('app.debug')) {
            $message = 'Internal Server Error';
        }

        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }
}
