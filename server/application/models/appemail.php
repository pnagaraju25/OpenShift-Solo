<?php

class AppEmail extends Email
{
    protected $user;

    function set_recipient($user)
    {
        $this->user = $user;

        if (is_array($user))
            $email = $user['email'];
        else $email = $user->email;

        parent::set_recipient($email);
    }

    function send_forgot_password($user, $params)
    {
        $this->set_recipient($user);
        $this->set_subject('email_subjects.forgot_password');

        $this->generate('forgot-password', $params);
        return $this->send(true);
    }

    function send_changed_password($user)
    {
        $this->set_recipient($user);
        $this->set_subject('email_subjects.changed_password');
        $this->generate('changed-password');
        return $this->send(true);
    }






}