<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$profiles = App\Models\AdminFaceProfile::all();
foreach($profiles as $p1) {
    foreach($profiles as $p2) {
        if ($p1->id >= $p2->id) continue;
        $d1 = $p1->face_descriptors[0];
        $d2 = $p2->face_descriptors[0];
        $sum = 0;
        for($i=0; $i<128; $i++) {
            $diff = ($d1[$i]??0) - ($d2[$i]??0);
            $sum += $diff * $diff;
        }
        echo 'Dist ' . $p1->admin_id . '-' . $p2->admin_id . ': ' . sqrt($sum) . "\n";
    }
}
