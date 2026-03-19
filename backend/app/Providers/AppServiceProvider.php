<?php

namespace App\Providers;

use App\Models\{CloudService, CmdbDatabase, Endpoint, Server, NetworkDevice, Software};
use App\Observers\CiObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Server::observe(CiObserver::class);
        NetworkDevice::observe(CiObserver::class);
        Endpoint::observe(CiObserver::class);
        Software::observe(CiObserver::class);
        CloudService::observe(CiObserver::class);
        CmdbDatabase::observe(CiObserver::class);
    }
}
