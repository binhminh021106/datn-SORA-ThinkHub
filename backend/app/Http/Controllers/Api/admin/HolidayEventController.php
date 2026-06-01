<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use App\Models\HolidayEvent;
use Illuminate\Http\Request;

class HolidayEventController extends Controller
{
    public function index()
    {
        $events = HolidayEvent::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $events]);
    }

    public function store(Request $request)
    {
        $this->mergeEventDate($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'event_date' => ['required', 'string', 'max:5', 'regex:/^\d{2}\/\d{2}$/'],
            'target_audience' => 'required|string',
            'email_subject' => 'required|string',
            'email_content' => 'required|string',
            'voucher_code' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $event = HolidayEvent::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Them su kien thanh cong',
            'data' => $event,
        ]);
    }

    public function show($id)
    {
        $event = HolidayEvent::find($id);
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Su kien khong ton tai hoac da bi xoa.',
            ], 404);
        }

        return response()->json(['success' => true, 'data' => $event]);
    }

    public function update(Request $request, $id)
    {
        $event = HolidayEvent::findOrFail($id);
        $this->mergeEventDate($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'event_date' => ['required', 'string', 'max:5', 'regex:/^\d{2}\/\d{2}$/'],
            'target_audience' => 'required|string',
            'email_subject' => 'required|string',
            'email_content' => 'required|string',
            'voucher_code' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $event->update($validated);

        return response()->json(['success' => true, 'message' => 'Cap nhat thanh cong']);
    }

    public function destroy($id)
    {
        $event = HolidayEvent::find($id);
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Su kien khong ton tai hoac da bi xoa.',
            ], 404);
        }

        EmailLog::where('event_type', 'holiday_' . $event->id)->delete();
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xoa su kien va lich su gui lien quan thanh cong',
        ]);
    }

    private function mergeEventDate(Request $request): void
    {
        if (!$request->filled('day') || !$request->filled('month')) {
            return;
        }

        $request->merge([
            'event_date' => str_pad((string) $request->input('day'), 2, '0', STR_PAD_LEFT)
                . '/'
                . str_pad((string) $request->input('month'), 2, '0', STR_PAD_LEFT),
        ]);
    }
}
