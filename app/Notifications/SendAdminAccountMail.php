<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendAdminAccountMail extends Notification
{

    protected $name;
    protected $email;
    protected $password;

    /**
     * Create a new notification instance.
     */
    public function __construct($name, $email, $password)
    {
        $this->name = $name;
        $this->email = $email;
        $this->password = $password;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your Account Has Been Created - WMSU DMTS')
            ->greeting('Hello ' . $this->name . ',')
            ->line('Your account has been created for the WMSU Document Management and Tracking System.')
            ->line('You can now log in using the following credentials:')
            ->line('Email: ' . $this->email)
            ->line('Password: ' . $this->password)
            ->line('For security, please change your password after your first login.')
            ->action('Login', url('/login'))
            ->line('Thank you for using our application!');
    }
}
