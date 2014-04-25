<?php


class Calendar extends Model{
    public $tasks;
    public $project_id;
    public $project;


    function get($project_id = null)
    {
        //there's nothing to do if we don't have a project id
        if ($project_id == null)
            return false;

        $this->project = new Project($project_id);

        //todo:this should not get section headers
        $this->tasks = $this->project->get_tasks('incomplete');
    }


}
 
