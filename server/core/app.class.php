<?php


class App{
    function load_language(){}

    static function get_config(){}

    static function log($data){
        if(class_exists('ChromePhp')){
            ChromePhp::log($data);
        }
    }

    static function get_latest_version(){
        //todo: this should be in a config file, not in the actual core
        $postUrl = 'http://www.getsoloapp.com/admin/get_latest_version';

        //open connection
        $ch = curl_init();

        //set the url, number of POST vars, POST data
        curl_setopt($ch, CURLOPT_URL, $postUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, array());
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);

        //close connection
        curl_close($ch);

        $response = json_decode($response);

        return $response;
    }
}

