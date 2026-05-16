<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use App\Models\ComboItem;
use App\Http\Requests\AdminStoreComboRequest;
use App\Http\Requests\AdminUpdateComboRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Events\ComboUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminComboController extends Controller
{
    public function index()
    {
        $combos = Combo::withTrashed()
            ->withCount('items')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $combos]);
    }

    public function show($id)
    {
        $combo = Combo::with([
            'items.product:id,name,thumbnail_image,base_price,status',
            'items.variant:id,sku,price,image_url,stock_quantity'
        ])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $combo]);
    }

    public function store(AdminStoreComboRequest $request)
    {
        try {
            DB::beginTransaction();
            $data = $request->validated();

            $file = $request->file('thumbnail_image');
            $fileName = 'combo_' . Str::slug($data['name']) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $data['thumbnail_image'] = $file->storeAs('combos', $fileName, 'public');

            $data['start_date'] = empty($data['start_date']) ? null : $data['start_date'];
            $data['end_date'] = empty($data['end_date']) ? null : $data['end_date'];

            $combo = Combo::create($data);

            foreach ($data['parsed_items'] as $item) {
                ComboItem::create([
                    'combo_id'           => $combo->id,
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?: null,
                    'quantity'           => $item['quantity']
                ]);
            }

            DB::commit();
            event(new ComboUpdated($combo->id, ['action' => 'created']));
            return response()->json(['success' => true, 'message' => 'Tạo Combo thành công!']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    public function update(AdminUpdateComboRequest $request, $id)
    {
        try {
            DB::beginTransaction();
            $combo = Combo::findOrFail($id);
            $data = $request->validated();

            if ($request->hasFile('thumbnail_image')) {
                if ($combo->thumbnail_image && Storage::disk('public')->exists($combo->thumbnail_image)) {
                    Storage::disk('public')->delete($combo->thumbnail_image);
                }
                $file = $request->file('thumbnail_image');
                $fileName = 'combo_' . Str::slug($data['name']) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $data['thumbnail_image'] = $file->storeAs('combos', $fileName, 'public');
            }

            $data['start_date'] = empty($data['start_date']) ? null : $data['start_date'];
            $data['end_date'] = empty($data['end_date']) ? null : $data['end_date'];

            $combo->update($data);

            ComboItem::where('combo_id', $combo->id)->delete();

            foreach ($data['parsed_items'] as $item) {
                ComboItem::create([
                    'combo_id'           => $combo->id,
                    'product_id'         => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'] ?: null,
                    'quantity'           => $item['quantity']
                ]);
            }

            DB::commit();
            event(new ComboUpdated($combo->id, ['action' => 'updated']));
            return response()->json(['success' => true, 'message' => 'Cập nhật Combo thành công!']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:active,hidden']);

        $combo = Combo::findOrFail($id);
        $combo->update(['status' => $request->status]);

        return response()->json(['success' => true, 'message' => 'Cập nhật trạng thái thành công!']);
    }

    public function destroy($id)
    {
        $combo = Combo::findOrFail($id);
        $combo->delete();
        event(new ComboUpdated($combo->id, ['action' => 'deleted']));
        return response()->json(['success' => true, 'message' => 'Đã đưa Combo vào thùng rác.']);
    }

    public function restore($id)
    {
        $combo = Combo::withTrashed()->findOrFail($id);
        $combo->restore();
        event(new ComboUpdated($combo->id, ['action' => 'restored']));
        return response()->json(['success' => true, 'message' => 'Đã khôi phục Combo.']);
    }
}
