
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->restrictOnDelete();

            $table->string('reference', 50);
            $table->string('nom', 150);
            $table->text('description')->nullable();
            $table->string('marque', 100)->nullable();
            $table->string('processeur', 100)->nullable();
            $table->string('ram', 50)->nullable();
            $table->string('stockage', 100)->nullable();
            $table->string('carte_graphique', 100)->nullable();
            $table->string('taille_ecran', 50)->nullable();
            $table->decimal('prix_unitaire', 12, 2);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'reference']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
