
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devis_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('devis_id')
                  ->constrained('devis')
                  ->restrictOnDelete();

            $table->foreignId('produit_id')
                  ->nullable()
                  ->constrained('produits')
                  ->nullOnDelete();

            $table->string('nom', 150);
            $table->string('reference', 50)->nullable();
            $table->string('marque', 100)->nullable();
            $table->string('processeur', 100)->nullable();
            $table->string('ram', 50)->nullable();
            $table->string('stockage', 100)->nullable();
            $table->string('carte_graphique', 100)->nullable();
            $table->string('taille_ecran', 50)->nullable();

            $table->decimal('prix_catalogue', 12, 2);
            $table->decimal('prix_unitaire', 12, 2);
            $table->integer('quantite');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devis_details');
    }
};
