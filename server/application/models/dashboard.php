<?php

class Dashboard extends Model
{
    protected $projects;
    protected $activity;

    function get($criteria = null){
        $user = current_user();
        $projects = new Project();
        $activity = new Activity();

        $this->projects = $projects->get();
        $this->activity = $activity->get();
    }

}