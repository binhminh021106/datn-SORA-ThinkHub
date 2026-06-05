<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$request = Illuminate\Http\Request::create('/api/broadcasting/auth', 'POST', ['channel_name' => 'private-admin.chat', 'socket_id' => '1234.5678']);
$request->headers->set('Authorization', 'Bearer 288|x7SDeqoHdShsmhZWvHUrVxr3w3KouRjY9OiINKJ7ff9570ea');
$response = app()->handle($request);
echo $response->getStatusCode() . "\n";
echo $response->getContent();
