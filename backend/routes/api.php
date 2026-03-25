<?php

use GuzzleHttp\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    CiChangeLogController,
    CiRelationshipController,
    CloudServiceController,
    DashboardController,
    DatabaseController,
    EndpointController,
    NetworkDeviceController,
    ServerController,
    SoftwareController
};

// ─── Authentication ───────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // Protected auth routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);

    });
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {return $request->user();})->middleware('auth:sanctum');

    Route::get('/dashboard', [DashboardController::class, 'index']);

    //CI Resources routes
        /*$ciResources = ['servers', 'network-devices', 'endpoints', 'software', 'cloud-services', 'databases'];
        $controllers = [
            'servers' => ServerController::class,
            'network-devices' => NetworkDeviceController::class,
            'endpoints' => EndpointController::class,
            'software' => SoftwareController::class,
            'cloud-services' => CloudServiceController::class,
            'databases' => DatabaseController::class,
        ];


        foreach ($controllers as $uri => $ctrl) {
            Route::apiResource($uri, $ctrl);
            Route::post("/{$uri}/{id}/restore", [$ctrl, 'restore']);
            Route::delete("/{$uri}/{id}/force", [$ctrl, 'forceDelete']);
        }

        //relationships and change logs
        Route::apiResource('ci-relationships', CiRelationshipController::class);
        Route::get('/change-logs', [CiChangeLogController::class, 'index']);*/
        
    // Servers
    Route::apiResource('servers', ServerController::class);
    Route::post('/servers/{ciId}/restore', [ServerController::class, 'restore']);
    Route::delete('/servers/{ciId}/force', [ServerController::class, 'forceDelete']);

    // Network Devices
    Route::apiResource('network-devices', NetworkDeviceController::class);
    Route::post('/network-devices/{ciId}/restore', [NetworkDeviceController::class, 'restore']);
    Route::delete('/network-devices/{ciId}/force', [NetworkDeviceController::class, 'forceDelete']);

    // Endpoints
    Route::apiResource('endpoints', EndpointController::class);
    Route::post('/endpoints/{ciId}/restore', [EndpointController::class, 'restore']);
    Route::delete('/endpoints/{ciId}/force', [EndpointController::class, 'forceDelete']);

    // Software
    Route::apiResource('software', SoftwareController::class);
    Route::post('/software/{ciId}/restore', [SoftwareController::class, 'restore']);
    Route::delete('/software/{ciId}/force', [SoftwareController::class, 'forceDelete']);

    // Cloud Services
    Route::apiResource('cloud-services', CloudServiceController::class);
    Route::post('/cloud-services/{ciId}/restore', [CloudServiceController::class, 'restore']);
    Route::delete('/cloud-services/{ciId}/force', [CloudServiceController::class, 'forceDelete']);

    // Databases
    Route::apiResource('databases', DatabaseController::class);
    Route::post('/databases/{ciId}/restore', [DatabaseController::class, 'restore']);
    Route::delete('/databases/{ciId}/force', [DatabaseController::class, 'forceDelete']);

    // CI Relationships
    Route::apiResource('ci-relationships', CiRelationshipController::class);
    Route::post('/ci-relationships/{relationshipId}/restore', [CiRelationshipController::class, 'restore']);
    Route::delete('/ci-relationships/{relationshipId}/force', [CiRelationshipController::class, 'forceDelete']);

    // Change Logs
    Route::get('/change-logs', [CiChangeLogController::class, 'index']);
    Route::post('/change-logs', [CiChangeLogController::class, 'store']);
    Route::get('/change-logs/{ciChangeLog}', [CiChangeLogController::class, 'show']);

});