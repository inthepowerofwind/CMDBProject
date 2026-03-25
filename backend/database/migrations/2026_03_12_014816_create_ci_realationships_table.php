<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ci_relationships', function (Blueprint $table) {
            $table->id();
            $table->string('relationship_id', 50)->unique();
            $table->string('source_ci_id', 50);
            $table->string('source_ci_name');
<<<<<<< HEAD
            // $table->string('source_ci_table');
            $table->string('relationship_type');
            $table->string('target_ci_id', 50);
            $table->string('target_ci_name');
            // $table->string('target_ci_table');
=======
            $table->string('relationship_type');
            $table->string('target_ci_id', 50);
            $table->string('target_ci_name');
>>>>>>> ed2f79f317ec69106cca1897d5609e6b57114ab8
            $table->text('description')->nullable();
            $table->text('criticality')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ci_relationships');
    }
};
