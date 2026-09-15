<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $content;
    public $subjectText;
    public $customerName; 

    public function __construct($subject, $content, $customerName = 'Quý khách')
    {
        $this->subjectText = $subject;
        $this->content = $content;
        $this->customerName = $customerName;
    }

    public function build()
    {
        return $this->subject($this->subjectText)
                    ->markdown('emails.reply');
    }
}