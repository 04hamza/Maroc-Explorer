<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Contact;

class ContactSubmission extends Mailable
{
    use Queueable, SerializesModels;

    public $contact;

    public function __construct(Contact $contact)
    {
        $this->contact = $contact;
    }

    public function build()
    {
        return $this->subject('New Contact Submission')
                    ->view('emails.contact_submission')
                    ->with([
                        'name' => $this->contact->name,
                        'email' => $this->contact->email,
                        'subject' => $this->contact->subject,
                        'form_message' => $this->contact->message, 
                        'consent' => $this->contact->consent ? 'Yes' : 'No',
                    ]);
    }
}