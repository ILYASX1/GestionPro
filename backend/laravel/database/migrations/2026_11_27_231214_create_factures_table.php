
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->restrictOnDelete();

            $table->foreignId('client_id')
                  ->constrained('clients')
                  ->restrictOnDelete();

            $table->foreignId('devis_id')
                  ->nullable()
                  ->unique()
                  ->constrained('devis')
                  ->restrictOnDelete();

            $table->string('numero', 50)->unique();

            $table->date('date_emission');
            $table->date('date_echeance');
            $table->decimal('montant', 12, 2);
            $table->string('statut', 30);

            // Client information snapshot
            $table->string('client_nom', 100);
            $table->string('client_prenom', 100);
            $table->string('client_entreprise', 150)->nullable();
            $table->string('client_email')->nullable();
            $table->string('client_telephone', 20)->nullable();
            $table->text('client_adresse')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
