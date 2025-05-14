<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Contact;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactSubmission;
use Illuminate\Support\Facades\Log;
use App\Mail\ContactReply;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        Log::info('Contact form submission:', $request->all());
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|in:General Inquiry,Support,Feedback,Partnership,Other',
            'message' => 'required|string|min:10',
            'consent' => 'required|boolean',
            'honeypot' => 'nullable|string|max:0', 
            'recaptcha_token' => 'nullable|string', 
        ]);

        // Check honeypot
        if (!empty($request->honeypot)) {
            Log::warning('Honeypot field filled, possible bot submission');
            return response()->json([
                'message' => 'Invalid submission',
            ], 422);
        }

        Log::info('Honeypot check passed, processing submission');

        $contact = Contact::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'consent' => $validated['consent'],
        ]);
        Mail::to('aitboubkerhamza18@gmail.com')->send(new ContactSubmission($contact));
        return response()->json([
            'message' => 'Contact submission successful',
            'data' => $contact,
        ], 201);
    }
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');
            $query = Contact::query();

            if ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            }

            $contacts = $query->paginate(10);

            Log::info('Contacts fetched', [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'total' => $contacts->total(),
                'items' => $contacts->items(),
            ]);

            return response()->json([
                'data' => $contacts->items(),
                'meta' => [
                    'current_page' => $contacts->currentPage(),
                    'last_page' => $contacts->lastPage(),
                    'total' => $contacts->total(),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching contacts', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to fetch contacts'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $contact = Contact::findOrFail($id);
            $contact->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting contact', [
                'id' => $id,
                'message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Failed to delete contact'], 500);
        }
    }
    public function reply(Request $request, $id)
    {
        try {
            $request->validate([
                'message' => 'required|string',
                'email' => 'required|email',
            ]);

            $contact = Contact::findOrFail($id);

            if ($contact->email !== $request->email) {
                return response()->json(['error' => 'Invalid email'], 400);
            }

            Mail::to($contact->email)->send(new ContactReply($request->message));

            Log::info('Reply sent', [
                'contact_id' => $id,
                'email' => $contact->email,
                'message' => $request->message,
            ]);

            return response()->json(['message' => 'Reply sent successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error sending reply', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Failed to send reply'], 500);
        }
    }
}