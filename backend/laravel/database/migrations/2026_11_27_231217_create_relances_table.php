
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('relances', function (Blueprint $table) {
            $table->id();

            $table->foreignId('facture_id')
                  ->constrained('factures')
                  ->restrictOnDelete();

            $table->date('date_relance');
            $table->string('statut', 30);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relances');
    }
};
