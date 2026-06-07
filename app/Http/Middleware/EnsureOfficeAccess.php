<?php

namespace App\Http\Middleware;

use App\Enums\OfficeDepartment;
use App\Enums\OfficeRole;
use App\Models\Employee;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOfficeAccess
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated employee is active and optionally
     * belongs to the required department and/or has the minimum role.
     *
     * Usage:
     *   - EnsureOfficeAccess::class                     (any active employee)
     *   - EnsureOfficeAccess::class . ':finance'        (finance department only)
     *   - EnsureOfficeAccess::class . ':,manager'       (any department, manager+)
     *   - EnsureOfficeAccess::class . ':finance,manager' (finance managers+)
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ?string $department = null, ?string $minimumRole = null): Response
    {
        /** @var Employee|null $employee */
        $employee = $request->user('office');

        abort_if(! $employee || ! $employee->is_active, 403);

        if ($department) {
            $requiredDepartment = OfficeDepartment::tryFrom($department);
            abort_if(
                $requiredDepartment === null || (! $employee->isAdministrator() && ! $employee->inDepartment($requiredDepartment)),
                403,
            );
        }

        if ($minimumRole) {
            $requiredRole = OfficeRole::tryFrom($minimumRole);
            abort_if(
                $requiredRole === null || ! $employee->isAtLeast($requiredRole),
                403,
            );
        }

        return $next($request);
    }
}
