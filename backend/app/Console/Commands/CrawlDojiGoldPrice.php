<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use DOMDocument;
use DOMXPath;

class CrawlDojiGoldPrice extends Command
{
    protected $signature = 'sora:crawl-gold';

    protected $description = 'Điệp viên ngầm cào giá vàng từ trang chủ DOJI mỗi 5 phút';

    public function handle()
    {
        $this->info('Bắt đầu lấy dữ liệu từ Chợ Giá...');

        try {
            $response = Http::timeout(15)->get('https://chogia.vn/gia-vang/');

            if (!$response->successful()) {
                $this->error('Kết nối thất bại. Mã lỗi: ' . $response->status());
                return;
            }

            $html = $response->body();

            $dom = new DOMDocument();
            @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
            $xpath = new DOMXPath($dom);

            // Tìm bảng giá vàng
            $rows = $xpath->query('//table[contains(@class, "tbl_style_embed")]/tbody/tr');
            
            $goldPrices = [];

            foreach ($rows as $row) {
                $cols = $xpath->query('td', $row);
                if ($cols->length >= 3) {
                    $name = trim(strip_tags($cols->item(0)->textContent));
                    
                    // Lấy giá trị chuỗi (vd: "144.500")
                    $buyRaw = trim($cols->item(1)->textContent);
                    $sellRaw = trim($cols->item(2)->textContent);

                    // Lọc bỏ các dấu chấm, phẩy
                    $buyClean = floatval(str_replace(['.', ','], '', $buyRaw));
                    $sellClean = floatval(str_replace(['.', ','], '', $sellRaw));

                    // Giá trên Chợ Giá là Nghìn VNĐ / Lượng (vd: 144500)
                    // Hoặc có thể là Triệu VNĐ (144.500) - str_replace sẽ biến nó thành 144500
                    // Frontend hiển thị Nghìn VNĐ / Chỉ
                    // Công thức quy đổi: 144500 / 10 = 14450 (14,450 Nghìn VNĐ / Chỉ)
                    $buyPrice = $buyClean / 10;
                    $sellPrice = $sellClean / 10;

                    if ($name && $buyPrice > 0 && $sellPrice > 0) {
                        $goldPrices[] = [
                            'name' => $name,
                            'buy' => number_format($buyPrice, 0, '.', ','),
                            'sell' => number_format($sellPrice, 0, '.', ','),
                        ];
                    }
                }
            }

            if (count($goldPrices) > 0) {
                Cache::put('sora_gold_prices', $goldPrices, 300);
                Cache::put('sora_gold_last_updated', now()->format('H:i d/m/Y'), 300);

                $this->info('Thành công! Đã lấy được ' . count($goldPrices) . ' mã vàng từ Chợ Giá.');
            } else {
                $this->warn('Không tìm thấy dữ liệu giá vàng!');
            }

        } catch (\Exception $e) {
            $this->error('Lỗi kĩ thuật: ' . $e->getMessage());
        }
    }
}