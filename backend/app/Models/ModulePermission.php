<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModulePermission extends Model
{
    protected $table = 'module_permissions';
    
    public $timestamps = false; 

    protected $fillable = [
        'module_name',
        'module_code',
        'required_level',
    ];
}