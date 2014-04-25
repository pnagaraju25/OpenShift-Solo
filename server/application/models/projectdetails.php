<?php

class ProjectDetails extends Model{
    public $activity;
    public $project;
    public $task_counts;


    function get($project_id = null){
        //there's nothing to do if we don't have a project id
        if($project_id == null)
            return false;

        $activity = new Activity();
        $activity = $activity->get('WHERE project_id = ' . $project_id);

        $this->project = new Project($project_id);;

        $task_counts = $this->project->get_task_counts();


        $this->project->update_status($task_counts);

        $project_details = array(
            'project' => $this->project->to_array(),
            'activity' => $activity,
            'task_counts' => $task_counts
        );

        return $project_details;
    }

    //project details is a collection of other models. There is nothing to save, so let's prevent the base model save
    //from being called accidentally
    function save(){}

}