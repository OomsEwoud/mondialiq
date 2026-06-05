<?php

namespace App\Http\Controllers\Feedback;

use App\Http\Controllers\Controller;
use App\Http\Requests\Feedback\StoreFeedbackRequest;
use App\Models\FeedbackMessage;
use Illuminate\Http\RedirectResponse;

class StoreFeedbackController extends Controller
{
    public function __invoke(StoreFeedbackRequest $request): RedirectResponse
    {
        FeedbackMessage::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return back();
    }
}
