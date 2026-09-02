<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ColorDictionary;

class ColorDictionarySeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            ['name' => 'Đỏ', 'color_code' => '#cc1e2e'],
            ['name' => 'Đỏ đô', 'color_code' => '#8b0000'],
            ['name' => 'Đỏ mận', 'color_code' => '#800000'],
            ['name' => 'Đỏ tươi', 'color_code' => '#ff0000'],
            ['name' => 'Ruby', 'color_code' => '#e0115f'],
            ['name' => 'Xanh', 'color_code' => '#2e5b9f'],
            ['name' => 'Xanh dương', 'color_code' => '#007bff'],
            ['name' => 'Xanh biển', 'color_code' => '#1e90ff'],
            ['name' => 'Xanh ngọc', 'color_code' => '#009981'],
            ['name' => 'Xanh lá', 'color_code' => '#28a745'],
            ['name' => 'Xanh lục', 'color_code' => '#228b22'],
            ['name' => 'Emerald', 'color_code' => '#50c878'],
            ['name' => 'Vàng', 'color_code' => '#e7ce7d'],
            ['name' => 'Vàng 18k', 'color_code' => '#d4af37'],
            ['name' => 'Vàng 24k', 'color_code' => '#ffd700'],
            ['name' => 'Vàng chanh', 'color_code' => '#fada5e'],
            ['name' => 'Vàng kem', 'color_code' => '#fdfd96'],
            ['name' => 'Trắng', 'color_code' => '#ffffff'],
            ['name' => 'Vàng trắng', 'color_code' => '#f4f4f4'],
            ['name' => 'Bạch kim', 'color_code' => '#e5e4e2'],
            ['name' => 'Bạc', 'color_code' => '#c0c0c0'],
            ['name' => 'Trong suốt', 'color_code' => '#f0f8ff'],
            ['name' => 'Đen', 'color_code' => '#2c2c2c'],
            ['name' => 'Xám', 'color_code' => '#808080'],
            ['name' => 'Ghi', 'color_code' => '#808080'],
            ['name' => 'Hồng', 'color_code' => '#f4a4b4'],
            ['name' => 'Vàng hồng', 'color_code' => '#b76e79'],
            ['name' => 'Rose gold', 'color_code' => '#b76e79'],
            ['name' => 'Tím', 'color_code' => '#800080'],
            ['name' => 'Thạch anh tím', 'color_code' => '#9966cc'],
            ['name' => 'Nâu', 'color_code' => '#8b4513'],
            ['name' => 'Cam', 'color_code' => '#fd7e14'],
            ['name' => 'Xanh rêu', 'color_code' => '#8F9779'],
            ['name' => 'Xám bạc', 'color_code' => '#8F9779'],
            ['name' => 'Xanh rêu', 'color_code' => '#8F9779'],
        ];

        foreach ($colors as $color) {
            $slug = \Illuminate\Support\Str::slug($color['name'], ' ');
            $normalizedName = str_replace('-', ' ', $slug);

            ColorDictionary::firstOrCreate(
                ['normalized_name' => $normalizedName],
                [
                    'name' => $color['name'],
                    'color_code' => $color['color_code']
                ]
            );
        }
    }
}
