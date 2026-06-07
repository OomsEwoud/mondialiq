<?php

namespace App\Http\Controllers\Feedback;

use App\Http\Controllers\Controller;
use App\Http\Requests\Feedback\StoreFeedbackRequest;
use App\Models\FeedbackMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class StoreFeedbackController extends Controller
{
    private const ATBOUND_FORM_URL = 'https://atbound.com/api/forms/mijn-formulier/submit';

    private const ATBOUND_SITE = '2b1b0060-1422-4874-865b-50155b3e8b37';

    public function __invoke(StoreFeedbackRequest $request): RedirectResponse
    {
        FeedbackMessage::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        $this->submitToAtbound($request);

        return back();
    }

    private function submitToAtbound(StoreFeedbackRequest $request): void
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post(self::ATBOUND_FORM_URL, [
                'site' => self::ATBOUND_SITE,
                'visitor_token' => $request->cookie('_atb_v') ?? '',
                'fields' => [
                    'email' => $request->user()->email,
                    'naam' => $request->user()->name,
                    'bericht' => $request->validated('subject')."\n\n".$request->validated('message'),
                ],
                'consent' => true,
            ]);

            if (! $response->successful()) {
                Log::error('Atbound external form submit failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (Throwable $e) {
            Log::error('Atbound external form submit exception', [
                'message' => $e->getMessage(),
            ]);
        }
    }
}
