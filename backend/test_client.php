<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$request = Illuminate\Http\Request::create('/api/client/messages', 'GET');
$request->headers->set('Authorization', 'Bearer 289|ZpIC0OeMTEKKv7PQbvajDBFIRX5skAvJMJZ3wEFCc3cde434');
$response = app()->handle($request);
echo $response->getStatusCode() . "\n";
echo $response->getContent();
