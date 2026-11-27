
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devis', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->restrictOnDelete();

            $table->foreignId('client_id')
                  ->constrained('clients')
                  ->restrictOnDelete();

            $table->string('numero', 50)->unique();
            $table->date('date');
            $table->decimal('montant', 12, 2);
            $table->string('statut', 30);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devis');
    }
};
