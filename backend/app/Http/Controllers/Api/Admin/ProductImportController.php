<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Spatie\SimpleExcel\SimpleExcelReader;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Events\ProductUpdated;
use OpenSpout\Common\Entity\Style\Style;
use OpenSpout\Common\Entity\Style\Color;
use OpenSpout\Common\Entity\Style\Border;
use OpenSpout\Common\Entity\Style\BorderPart;

use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Writer\XLSX\Options;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Common\Entity\Cell;

class ProductImportController extends Controller
{
    /**
     * Tải file Excel mẫu
     */
    public function downloadTemplate()
    {
        $fileName = 'Product_Import_Template.xlsx';
        $path = storage_path('app/public/' . $fileName);

        $options = new Options();
        // Set độ rộng cột cho đẹp
        $options->setColumnWidthForRange(18, 1, 10);
        $options->setColumnWidth(25, 1); // Cột Tên SP
        $options->setColumnWidth(25, 11); // Cột Thuộc tính 1
        $options->setColumnWidth(25, 12); // Cột Thuộc tính 2

        $writer = new Writer($options);
        $writer->openToFile($path);

        // Tạo style cho viền (Border)
        $border = new Border(
            new BorderPart(Border::BOTTOM, Color::BLACK, Border::WIDTH_THIN, Border::STYLE_SOLID),
            new BorderPart(Border::TOP, Color::BLACK, Border::WIDTH_THIN, Border::STYLE_SOLID),
            new BorderPart(Border::LEFT, Color::BLACK, Border::WIDTH_THIN, Border::STYLE_SOLID),
            new BorderPart(Border::RIGHT, Color::BLACK, Border::WIDTH_THIN, Border::STYLE_SOLID)
        );

        // Style cho Header (Tiêu đề)
        $headerStyle = (new Style())
            ->setFontBold()
            ->setFontSize(11)
            ->setFontColor(Color::WHITE)
            ->setBackgroundColor('009981') // Màu xanh SORA
            ->setShouldWrapText(true)
            ->setBorder($border);

        // Style cho Data (Dữ liệu)
        $rowStyle = (new Style())
            ->setShouldWrapText(true)
            ->setBorder($border);

        // Header chuẩn
        $headerRow = Row::fromValues([
            'Tên Sản Phẩm (*)', 
            'Danh Mục (*)', 
            'Tên Thương Hiệu', 
            'Slug (Để trống sẽ tự tạo)', 
            'Giá Sàn (*)', 
            'Link Ảnh Đại Diện', 
            'SKU (Để trống sẽ tự tạo)', 
            'Giá Biến Thể (*)', 
            'Tồn Kho (*)', 
            'Link Ảnh Biến Thể', 
            'Thuộc Tính 1 (Tên:Giá trị)',
            'Thuộc Tính 2 (Tùy chọn)'
        ], $headerStyle);
        $writer->addRow($headerRow);

        // Thêm dòng 1 (Sản phẩm gốc + Biến thể 1)
        $row1 = Row::fromValues([
            'Nhẫn Kim Cương Nam K18', 
            'Nhẫn Nam', 
            'SORA', 
            '', // Bỏ trống slug để auto-generate
            '5000000', 
            '', // Ảnh đại diện
            '', // Bỏ trống SKU để auto-generate
            '5200000', 
            '100', 
            '', 
            'Chất Liệu:Vàng 18K',
            'Kích Thước:Ni 10'
        ], $rowStyle);
        $writer->addRow($row1);
        
        // Thêm dòng 2 (Chỉ có biến thể 1)
        $row2 = Row::fromValues([
            '', // Để trống tên sản phẩm sẽ tự động gộp vào sản phẩm phía trên
            '', 
            '', 
            '', 
            '', 
            '', 
            '', // Bỏ trống SKU
            '5500000', 
            '50', 
            '', 
            'Chất Liệu:Vàng trắng',
            'Kích Thước:Ni 12'
        ], $rowStyle);
        $writer->addRow($row2);

        // Thêm dòng 3 (Biến thể 2 với nhiều thuộc tính hơn)
        $row3 = Row::fromValues([
            '', 
            '', 
            '', 
            '', 
            '', 
            '', 
            '', // Bỏ trống SKU
            '5800000', 
            '20', 
            '', 
            'Chất Liệu:Vàng hồng', 
            'Kích Thước:Ni 12, Đính Đá:Sapphire' // Cột 2 có thể chứa nhiều giá trị cách nhau bằng dấu phẩy
        ], $rowStyle);
        $writer->addRow($row3);

        $writer->close();

        return response()->download($path, $fileName)->deleteFileAfterSend(true);
    }

    /**
     * Import dữ liệu từ file Excel
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:5120'
        ], [
            'file.required' => 'Vui lòng chọn file Excel.',
            'file.mimes' => 'File phải có định dạng .xlsx, .xls hoặc .csv.',
            'file.max' => 'Dung lượng file không được vượt quá 5MB.'
        ]);

        $file = $request->file('file');
        
        try {
            DB::beginTransaction();

            $rows = SimpleExcelReader::create($file->getRealPath(), $file->getClientOriginalExtension())->getRows();

            if ($rows->isEmpty()) {
                throw new \Exception("File Excel trống, không có dữ liệu.");
            }

            $currentProduct = null;
            $successCount = 0;
            $variantCount = 0;
            $errors = [];

            foreach ($rows as $index => $row) {
                $rowNumber = $index + 2; // +2 vì index bắt đầu từ 0 và dòng 1 là header

                try {
                    $productName = trim($row['Tên Sản Phẩm (*)'] ?? '');
                    
                    // NẾU CÓ TÊN SẢN PHẨM -> TẠO SẢN PHẨM MỚI
                    if (!empty($productName)) {
                        $categoryName = trim($row['Danh Mục (*)'] ?? $row['Tên Danh Mục (*)'] ?? '');
                        if (empty($categoryName)) throw new \Exception("Dòng {$rowNumber}: Thiếu Tên Danh Mục.");
                        
                        $basePrice = trim($row['Giá Sàn (*)'] ?? '');
                        if ($basePrice === '' || !is_numeric($basePrice)) throw new \Exception("Dòng {$rowNumber}: Giá sàn không hợp lệ.");

                        // Xử lý Danh Mục
                        $category = Category::where('name', $categoryName)->first();
                        if (!$category) {
                            $category = Category::create([
                                'name' => $categoryName,
                                'slug' => Str::slug($categoryName) . '-' . strtolower(Str::random(4)),
                                'status' => 'active',
                                'attributes_schema' => []
                            ]);
                        }

                        // Xử lý Thương Hiệu
                        $brandId = null;
                        $brandName = trim($row['Tên Thương Hiệu'] ?? '');
                        if (!empty($brandName)) {
                            $brand = Brand::firstOrCreate(
                                ['name' => $brandName],
                                ['slug' => Str::slug($brandName), 'status' => 'active']
                            );
                            $brandId = $brand->id;
                        }

                        // Xử lý Slug
                        $slug = trim($row['Slug (Để trống sẽ tự tạo)'] ?? $row['Slug'] ?? '');
                        if (empty($slug)) {
                            $baseSlug = Str::slug($productName);
                            if (!empty($brandName)) {
                                $baseSlug .= '-' . Str::slug($brandName);
                            }
                            $slug = $baseSlug . '-' . strtolower(Str::random(5));
                        }
                        
                        // Đảm bảo slug unique
                        $originalSlug = $slug;
                        $counter = 1;
                        while (Product::where('slug', $slug)->exists()) {
                            $slug = $originalSlug . '-' . $counter;
                            $counter++;
                        }

                        // URL Ảnh
                        $thumbnailUrl = trim($row['Link Ảnh Đại Diện'] ?? '');
                        // (Ở phiên bản nâng cao, ta có thể Http::get($thumbnailUrl) để lưu file về máy)

                        $currentProduct = Product::create([
                            'category_id' => $category->id,
                            'brand_id' => $brandId,
                            'name' => $productName,
                            'slug' => $slug,
                            'base_price' => $basePrice,
                            'status' => 'draft',
                            'thumbnail_image' => $thumbnailUrl ?: 'products/defaults/placeholder.png', 
                        ]);
                        
                        $successCount++;
                    }

                    // TẠO BIẾN THỂ (Bất kể có Tên SP hay không, miễn là có Product hiện tại)
                    if (!$currentProduct) {
                        throw new \Exception("Dòng {$rowNumber}: Không xác định được sản phẩm gốc (Tên Sản Phẩm đang trống).");
                    }

                    $sku = trim($row['SKU (Để trống sẽ tự tạo)'] ?? $row['SKU Biến Thể (*)'] ?? '');
                    if (empty($sku)) {
                        $prefix = $currentProduct->slug ? strtoupper(str_replace('-', '', substr($currentProduct->slug, 0, 4))) : 'SKU';
                        $randomCode = rand(1000, 9999);
                        $variantIndex = ProductVariant::where('product_id', $currentProduct->id)->count() + 1;
                        $sku = "{$prefix}{$randomCode}-V{$variantIndex}";
                    }

                    // Đảm bảo SKU unique
                    $originalSku = $sku;
                    $counter = 1;
                    while (ProductVariant::where('sku', $sku)->exists()) {
                        $sku = $originalSku . '-' . $counter;
                        $counter++;
                    }

                    $variantPrice = trim($row['Giá Biến Thể (*)'] ?? '');
                    if ($variantPrice === '' || !is_numeric($variantPrice)) throw new \Exception("Dòng {$rowNumber}: Giá biến thể không hợp lệ.");

                    $stock = trim($row['Tồn Kho (*)'] ?? '');
                    if ($stock === '' || !is_numeric($stock)) $stock = 0;

                    $variantImageUrl = trim($row['Link Ảnh Biến Thể'] ?? '');

                    $isDefault = ($currentProduct->variants()->count() === 0) ? 1 : 0;

                    $variant = ProductVariant::create([
                        'product_id' => $currentProduct->id,
                        'sku' => $sku,
                        'price' => $variantPrice,
                        'stock_quantity' => $stock,
                        'is_default' => $isDefault,
                        'image_url' => $variantImageUrl,
                    ]);

                    // Xử lý thuộc tính tự động cho TẤT CẢ các cột bắt đầu bằng "Thuộc Tính"
                    $syncAttrIds = [];
                    foreach ($row as $headerName => $cellValue) {
                        if (Str::startsWith(trim($headerName), 'Thuộc Tính') && !empty(trim($cellValue))) {
                            $attrPairs = explode(',', $cellValue); // Vẫn hỗ trợ dấu phẩy trong 1 cột
                            foreach ($attrPairs as $pair) {
                                $parts = explode(':', $pair);
                                if (count($parts) === 2) {
                                    $attrName = trim($parts[0]);
                                    $attrVal = trim($parts[1]);

                                    $attributeObj = Attribute::firstOrCreate(['name' => $attrName]);
                                    $valueObj = AttributeValue::firstOrCreate([
                                        'attribute_id' => $attributeObj->id,
                                        'value' => $attrVal
                                    ]);

                                    $syncAttrIds[] = $valueObj->id;

                                    // Cập nhật attributes_schema cho Category để Frontend nhận diện được cột
                                    $schema = is_string($category->attributes_schema) ? json_decode($category->attributes_schema, true) : ($category->attributes_schema ?? []);
                                    if (!is_array($schema)) $schema = [];
                                    if (!in_array($attrName, $schema)) {
                                        $schema[] = $attrName;
                                        $category->attributes_schema = $schema;
                                        $category->save();
                                    }
                                }
                            }
                        }
                    }
                    
                    if (!empty($syncAttrIds)) {
                        $variant->attributeValues()->sync($syncAttrIds);
                    }

                    $variantCount++;

                } catch (\Exception $e) {
                    $errors[] = $e->getMessage();
                }
            }

            if (!empty($errors)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Import thất bại. Vui lòng sửa các lỗi sau:',
                    'errors' => $errors
                ], 422);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Import thành công {$successCount} sản phẩm và {$variantCount} biến thể."
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }
}
