<?php

Class UsersController extends Controller{


    function set_profile_image(){
        //doesn't need to be locked down because it operates on the current user
        $user = current_user();
        $user->set_profile_image();
    }

    function forgot_password(){
        //public route
        $user = new User();

        $user->email = Request::clean($_POST['email']);
        $result = $user->forgot_password();

        Response($result);
    }

    function change_password(){
        //does not need to locked down because it operates on the current user
        $user = current_user();
        $result = $user->change_password();

        if ($user->validation_passed())
            Response($result);
        else Response()->error($user->errors());
    }



    function send_password(){
        $user_id = Request::param('id');

        if (!current_user()->is('admin'))
            Response()->not_authorized();

        if(!isset($user_id))
            Response('Invalid user id');

        $user = new User($user_id);

        $result = $user->send_password();

        if ($user->validation_passed())
            Response($result);
        else Response()->error($user->errors());
    }
}

 
