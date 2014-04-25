var DUET = DUET || {};


//Task Model
DUET.Task = function () {
    this.type = 'task';

    this.rules = {
        task:'required'
        //rules for maximum weight and minimum weight will be set in the getMaximum wieght function after we get the
        //maximum weight from the server
    };

    this.isComplete = false;

    this.weight = parseInt(this.weight, 10);
};

DUET.Task.prototype = new DUET.Model();

DUET.Task.prototype.getFiles = function () {
    var self = this,
        gettingTasks;

    gettingTasks = new DUET.Request({
        url:'tasks/' + self.id + '/get_files',
        success:function (response) {
            self.files = response.data;
        }
    });

    return gettingTasks.isComplete;
};

DUET.Task.prototype.getTimeEntries = function () {
    var self = this,
        gettingTimeEntries;

    gettingTimeEntries = new DUET.Request({
        url:'tasks/' + self.id + '/get_time_entries',
        success:function (response) {
            var timeEntriesCollection = new DUET.Collection({model:'TimeEntry'});
            timeEntriesCollection.load(response.data);
            timeEntriesCollection.sort('startDate', 'desc');

            //we need to keep track of the collection for adding/deleting time entries
            self.timeEntriesCollection = timeEntriesCollection;

            //we need an array for the initial render (Hogan)
            self.timeEntries = timeEntriesCollection.toArray();
        }
    });

    return gettingTimeEntries.isComplete;
};

//todo: I have issues with this entire function, perhaps its just the name, but the model shouldn't be prepping anything for the view
DUET.Task.prototype.prepViewProperties = function () {
    var self = this;

    //isComplete will be a string, turn it into a boolean
    self.isComplete = self.isComplete.length && self.isComplete != '0';
    self.isSection = (typeof self.isSection != 'undefined') && (self.isSection != '0') && (self.isSection != '');

    self.completeClass = self.isComplete ? 'complete' : '';

    self.dueDateHumanized = self.humanizedEndOfDay(self.dueDate);

    self.dueDateText = self.formatDate(self.dueDate, 'MMM DD, YYYY');

    self.completedDateText = self.formatDate(self.completedDate, 'MMM DD, YYYY');

    if (self.statusText)
        self.statusClass = self.statusText.toLowerCase().replace(' ', '-');

    if (parseInt(self.totalTime, 10) != 0)
        self.formattedTotalTime = DUET.Timer.prototype.secondsToFormattedTime(self.totalTime);

    if (self.weight == 0)
        self.weightText = '-';
    else self.weightText = self.weight + '%';
};

DUET.Task.prototype.toggleComplete = function () {
    var isComplete;

    //complete status is currently a string, we need a boolean. String -> Int -> Boolean
    if (typeof this.isComplete != 'boolean') {
        isComplete = parseInt(this.isComplete, 10);
        isComplete = Boolean(isComplete);
    }
    else isComplete = this.isComplete;

    this.isComplete = !isComplete;

    return this.save();
};

DUET.Task.prototype.getMaximumWeight = function () {
    var self = this,
    //can't use the deferred created by the request because it resolves before the success function runs
        isComplete = new $.Deferred();

    //make sure the current weight is set
    self.weight = self.weight || 0;

    new DUET.Request({
        url:'projects/' + self.projectId + '/get_available_task_weight',
        success:function (response) {
            //the maximum weight for a task is the available weight (1 - 99) + this task
            if (response.isValid()) {
                self.maximumWeight = parseInt(response.data, 10) + parseInt(self.weight, 10);
            }

            //set the validation rules for the maximum value
            self.rules.weight = 'max[' + self.maximumWeight + ']';

            isComplete.resolve();
        }
    });

    return isComplete;
};

DUET.Task.prototype.url = function(){

    return 'projects/' + this.projectId + '/tasks/' + this.id;
};

DUET.TasksManager = function () {
    this.type = 'tasks-manager';
};

DUET.TasksManager.prototype = new DUET.Model();

DUET.Timer = function (task, callback) {
    var self = this, timer;

    //https://gist.github.com/1185904
    function Interval(duration, callback) {
        this.baseline;

        this.run = function () {
            var end, nextTick;

            if (typeof this.baseline == 'undefined') {
                this.baseline = new Date().getTime();
            }
            callback(this);
            end = new Date().getTime();
            this.baseline += duration;

            nextTick = duration - (end - this.baseline);
            if (nextTick < 0) {
                nextTick = 0;
            }
            (function (i) {
                i.timer = setTimeout(function () {
                    i.run(end);
                }, nextTick);
            }(this));
        };

        this.stop = function () {
            clearTimeout(this.timer);
        }
    }

    this.time = this.secondsToTime(0);
    this.elapsed = 0;

    this.start = function () {
        var self = this;

        this.timeEntry = new DUET.TimeEntry();

        this.timeEntry.taskId = task.id;

        timer = new Interval(1000, function () {
            //get time in hh:mm:ss
            self.time = self.secondsToTime(self.elapsed);
            self.elapsed += 1;

            //if the save interval has been met, save the task
            if (self.elapsed % DUET.config.task_timer_save_interval == 0)
                self.timeEntry.save({time:self.elapsed});

            //run the callback
            if (callback && $.isFunction(callback))
                callback();
        });

        timer.run()
    };

    this.stop = function () {
        var self = this;

        timer.stop();
        this.timeEntry.save({time:self.elapsed});
    };

    this.setCallback = function(newCallback){
        callback = newCallback;
    };
};

DUET.Timer.prototype.secondsToTime = function (secs) {
    //http://codeaid.net/javascript/convert-seconds-to-hours-minutes-and-seconds-(javascript)
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h":hours,
        "m":minutes,
        "s":seconds
    };
    return obj;
};

DUET.Timer.prototype.generateTimeText = function (timeObject) {
    var h,
        time = timeObject || this.time;

    function pad(n) {
        return n > 9 ? "" + n : "0" + n;
    }

    //we don't always want to show hours, but we always want to show mins and secs
    h = time.h == 0 ? '' : time.h + ':';

    return h + pad(time.m) + ':' + pad(time.s);
};

DUET.Timer.prototype.generateHumanizedTimeText = function (timeObject) {
    var hoursText, minutesText, secondsText, textArray = [], timeText = '';

    if (timeObject.h !== 0) {
        hoursText = timeObject.h > 1 ? ' hrs' : ' hr';
        textArray.push(timeObject.h + hoursText);
    }

    if (timeObject.m !== 0) {
        minutesText = timeObject.m > 1 ? ' mins' : ' min';
        textArray.push(timeObject.m + minutesText);
    }

    if (timeObject.s !== 0) {
        secondsText = timeObject.s > 1 ? ' secs' : ' sec';
        textArray.push(timeObject.s + secondsText);
    }

    return textArray.join(', ');
};

DUET.Timer.prototype.secondsToFormattedTime = function (secs) {
    var timeObject = DUET.Timer.prototype.secondsToTime(secs);

    return DUET.Timer.prototype.generateHumanizedTimeText(timeObject);
};

DUET.TimeEntry = function () {
    this.type = 'timeEntry';

    this.startDate = moment().unix();

    this.userName = DUET.my.first_name + ' ' + DUET.my.last_name;

    //the time in total seconds
    this.time = 0;

    //the time in hours, minutes, and seconds. Only set if this is a manual time entry
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
};

DUET.TimeEntry.prototype = new DUET.Model();

DUET.TimeEntry.prototype.prepViewProperties = function () {
    this.startDateText = this.formatDate(this.startDate, 'M/D/YY h:mm a');
    this.timeText = DUET.Timer.prototype.secondsToFormattedTime(this.time);
};

DUET.TimeEntry.prototype.timeComponentsToSecs = function () {
    var secs = 0;

    secs = parseInt(this.hours, 10) * 3600;
    secs += parseInt(this.minutes, 10) * 60;
    secs += parseInt(this.seconds);

    this.time = secs;

    return secs;
};

DUET.File = function () {
    this.type = 'file';
};

DUET.File.prototype = new DUET.Model();

DUET.File.prototype.prepViewProperties = function () {
    this.downloadUrl = 'files/download/' + this.id;
    this.formattedUploadDate = this.formattedDueDate = this.formatDate(this.created, 'MMM D, YYYY');
    this.sizeKilobytes = Math.round(this.size / 1024);
};

DUET.File.prototype.getFileUrl = function () {
    var self = this;

    var request = new DUET.Request({
        url:self.downloadUrl,
        success:function (response) {
            if (response.isValid())
                self.url = response.data;
            else self.url = false;
        }
    });

    return request.isComplete;
};

DUET.Project = function () {
    this.type = 'project';

    this.name = '';

    this.client_id = null;

    this.dueDate = 0;
};

DUET.Project.prototype = new DUET.Model();

DUET.Project.prototype.entityUrl = function (entity) {
    //returns url in the format projects/1/tasks
    return 'projects/' + this.id + '/' + entity + 's';
};

DUET.Project.prototype.calculateProgress = function (tasks) {
    //pulled directly from the server side logic. We don't want to have to wait for the server to update the progress
    //so lets calculate it on the client side as well.
    var unweighted_incomplete_tasks = [],
        weighted_incomplete_tasks = [],

        unweighted_completed_tasks = [],
        weighted_completed_tasks = [],

        total_percentage_for_unweighted_tasks = 100,
        total_percentage_for_weighted_tasks = 0,

        total_unweighted_tasks = 0,
        unweighted_task_implied_weight,
        progress_from_unweighted,
        progress_from_weighted,
        progress = 0;

    //sort the tasks into groups
    $.each(tasks.models, function (i, task) {

        if (task.isSection == false) {
            if (task.isComplete) {
                if (task.weight > 0)
                    weighted_completed_tasks.push(task);
                else unweighted_completed_tasks.push(task);
            }
            else {
                if (task.weight > 0)
                    weighted_incomplete_tasks.push(task);
                else unweighted_incomplete_tasks.push(task);
            }
        }
    });

    //figure out how much of the total project progress should be allocated to unweighted tasks
    $.each(weighted_completed_tasks, function (i, task) {
        total_percentage_for_unweighted_tasks -= task.weight;
    });

    $.each(weighted_incomplete_tasks, function (i, task) {
        total_percentage_for_unweighted_tasks -= task.weight;
    });

    //each unweighted task will have an 'implied' weight that is calculated. Determine that value here
    total_unweighted_tasks = unweighted_completed_tasks.length + unweighted_incomplete_tasks.length;
    unweighted_task_implied_weight = total_percentage_for_unweighted_tasks / total_unweighted_tasks;

    //calculate progress
    progress_from_unweighted = 0;
    progress_from_weighted = 0;

    //determine how much of the project is completed by unweighted tasks
    progress_from_unweighted = unweighted_task_implied_weight * unweighted_completed_tasks.length;

    //determine how much of th project is completed by weighted tasks
    $.each(weighted_completed_tasks, function (i, task) {
        progress_from_weighted += task.weight;
    });

    progress = progress_from_unweighted + progress_from_weighted;

    //we want a whole number for progress
    progress = Math.round(progress);

    //this.progress = progress;
    this.set('progress', progress);

    return progress;
};

DUET.Project.prototype.prepViewProperties = function () {
    var progressDifference = this.progress - this.expectedProgress,
    //negative numbers will already have the minus sign, but we need to add the plus sign for positive numbers
        progressDirection = progressDifference < 0 ? '' : '+';

    this.formattedDueDate = this.formatDate(this.dueDate, 'MMM D');

    if (this.statusText){
        this.formattedStatusText = this.formatStatusText(this.statusText);
    }


    this.progressDifference = progressDirection + progressDifference.toString();
};

DUET.Project.prototype.formatStatusText = function(statusText){
    var formattedStatusText;

    //todo:simplify
    formattedStatusText = statusText.replace('-', '_');
    formattedStatusText = DUET.utils.camelCase(formattedStatusText);
    formattedStatusText = ut.lang('projectDetails.' + formattedStatusText);

    return formattedStatusText;
};

DUET.Project.prototype.archive = function () {
    this.isArchived = true;
    return this.save();
};

DUET.Project.prototype.unarchive = function () {
    this.isArchived = false;
    return this.save();
};


DUET.Template = function(){
    this.type = 'template';
};

DUET.Template.prototype = DUET.Project.prototype;

DUET.Template.prototype.createProject = function(){
    var project = new DUET.ProjectFromTemplate();
    project.load(this.modelParams());

    return project;
};

//A dummy model that will allow us to call templates/create_project when the new project (from template) form is submitted
//Without this model, the save request would be sent to temlates/save, which is not what we want.
//
//It may seem like it would be a good idea to populate the form with a project model so that we can call
//projects/save on the server side to create the project, but this is problematic because some values are unique to the
//template, we don't want them saved on the new project. We need to call templates/create_project to process the
//values before the new project is created....
DUET.ProjectFromTemplate = function(){
    this.type = 'project-from-template';

    this.saveUrl = 'template/create_project';
};

DUET.ProjectFromTemplate.prototype = new DUET.Model();


DUET.Message = function () {
    var context = false;

    this.type = 'message';

    this.message = '';

    this.referenceObject = false;

    this.referenceId = false;

    this.is_read = false;

    //reference object, id
    context = DUET.context();
    this.referenceObject = context.object;
    this.referenceId = context.id;

    this.messageUrl = document.URL;
};

DUET.Message.prototype = new DUET.Model();

//todo: why not combine with postLoadProcessing?
DUET.Message.prototype.prepViewProperties = function () {
    var self = this;
    self.dateText = self.humanizedDate(this.createdDate);
    self.formattedDateText = this.formatDate(this.createdDate, 'ddd MMM D, h:mm a');

    //if the user image isn't set, assume the message is being created by the current user
    if (!this.userImage)
        this.userImage = DUET.my.image;
};

DUET.Message.prototype.markRead = function () {
    this.is_read = true;
};

DUET.Client = function () {
    this.type = 'client';

};

DUET.Client.prototype = new DUET.Model();

DUET.Client.prototype.getEntity = function (type) {
    var self = this,
        gettingEntity;

    gettingEntity = new DUET.Request({
        url:'clients/' + self.id + '/get_' + type,
        success:function (response) {

            self[type] = new DUET.Collection({model:type.slice(0, -1)});
            self[type].load(response.data);
        }
    });

    return gettingEntity.isComplete;
};

DUET.Client.prototype.prepViewProperties = function () {
    this.hasPrimaryContact = this.primaryContactId != '0';
    this.noPrimaryContact = !this.hasPrimaryContact;
};

DUET.User = function () {
    this.type = 'user';

    this.rules = {
        first_name:'required',
        last_name:'required',
        email:'required|email'
    };
};

DUET.User.prototype = new DUET.Model();

DUET.User.prototype.prepViewProperties = function(){

    if(this.role == 'admin')
        this.isAdmin = true;

    if(this.role == 'client')
        this.isClient = true;
};

DUET.Admin = function () {
    this.type = 'admin';

    this.saveUrl = 'users/new_admin';
};

DUET.Admin.prototype = new DUET.Model();

DUET.Calendar = function () {
    this.type = 'calendar';
};

DUET.Calendar.prototype = new DUET.Model();

DUET.Calendar.prototype.postLoadProcessing = function () {

    var taskCollection = new DUET.Collection({model:'task'});

    this.taskCollection = taskCollection;

    taskCollection.on('loaded', function () {
        $.each(taskCollection.models, function (i, task) {
            task.title = task.task;
            task.start = task.dueDate;
        });
    });

    taskCollection.load(this.tasks);
};


DUET.ProjectDetails = function () {
    this.type = 'project-details';

    this.loadUrl = 'projectdetails/';
};

DUET.ProjectDetails.prototype = new DUET.Model();

DUET.ProjectDetails.prototype.prepViewProperties = function () {
    this.formattedDueDate = this.formatDate(this.project.due_date, 'MMM D');
    this.formattedStatusText = DUET.Project.prototype.formatStatusText(this.project.status_text);


    if (!this.project.progress)
        this.project.progress = 0;

    if (this.project.status_text == 'not-started')
        this.projectProgress = '-';
    else this.projectProgress = this.project.progress + '%';
};

DUET.TemplateDetails = DUET.ProjectDetails;


DUET.ActivityItem = function () {
    this.type = 'activity-item';
};

DUET.ActivityItem.prototype = new DUET.Model();

DUET.ActivityItem.prototype.prepViewProperties = function () {
    this.formattedDate = this.humanizedDate(this.activityDate);
    this.dateText = this.formatDate(this.activityDate, 'ddd MMM D h:mm a');

    //should the activity text us 'a' or 'an'
    this.article = this.getArticle(this.objectType);

    //need to get the translated object type (i.e. project in spanish if this has been translated to spanish)
    this.objectTypeText = ut.lang('entityNames.' + this.objectType);

    this.hasLinkedObject = typeof this.linkedObjectType != 'undefined' && this.linkedObjectType != '';

    //need to get the translated object type (i.e. project in spanish if this has been translated to spanish)
    if (this.hasLinkedObject)
        this.linkedObjectTypeText = ut.lang('entityNames.' + this.linkedObjectType);

    //should the activity text us 'a' or 'an'
    this.linkedArticle = this.getArticle(this.linkedObjectType);

    if (this.objectType != 'message')
        this.objectLink = this.generateLink(this.projectId, this.objectType, this.objectId);
    else {

        this.objectLink = this.generateLink(this.projectId, this.linkedObjectType, this.linkedObjectId);
    }

    this.linkedObjectLink = this.generateLink(this.projectId, this.linkedObjectType, this.linkedObjectId);

    if (this.userId != 0) {
        this.isUserGenerated = true;
    }
};

DUET.ActivityItem.prototype.generateLink = function (projectId, objectType, objectId) {
    if (objectType == 'project')
        return '#' + objectType + 's/' + objectId;
    else return  '#projects/' + projectId + '/' + objectType + '/' + objectId;
};

DUET.ActivityItem.prototype.generateMessageLink = function (projectId, objectType, objectId) {
    return  '#projects/' + projectId + '/' + objectType + '/' + objectId;
};

DUET.ActivityItem.prototype.getArticle = function (objectType) {
    //determine whether to use 'a' or 'an'. This isn't 100% acurate because the rule is to an for a vowel sound, but we're
    //checking against actual vowels. (i.e. it's possible to get a vowel sound even if the first letter isn't a vowel
    //e.g. 'hour'
    return $.inArray(objectType[0], ['a', 'e', 'i', 'o', 'u']) == -1 ? ut.lang('articles.a') : ut.lang('articles.an');
};

DUET.Dashboard = function () {
    this.type = 'dashboard';
};

DUET.Dashboard.prototype = new DUET.Model();

DUET.Dashboard.prototype.postLoadProcessing = function () {
    var self = this,
        projects;

    projects = new DUET.Collection({model:'project'});

    projects.on('loaded', function () {
        self.projects = projects.models;
    });

    projects.load(self.projects);
};

DUET.ProjectNotes = function () {
    this.type = 'project-notes';
};

DUET.ProjectNotes.prototype = new DUET.Model();

DUET.TemplateNotes = DUET.ProjectNotes;

DUET.Search = function () {
    this.type = 'search';

    this.loadUrl = 'search/get/';
};

DUET.Search.prototype = new DUET.Model();

DUET.Search.prototype.postLoadProcessing = function () {
    if (this.projects.length) {
        this.initSearchEntity('project');
    }

    if (this.tasks.length) {
        this.initSearchEntity('task');
    }

    if (this.files.length) {
        this.initSearchEntity('file');
    }

    if (this.clients.length) {
        this.initSearchEntity('client');
    }

    if (this.messages.length) {
        this.initSearchEntity('message');
    }
};

DUET.Search.prototype.initSearchEntity = function (entityType) {
    //this.hasMessages = true;
    this['has' + DUET.utils.ucFirst(entityType) + 's'] = true;

    //this.messagesCollection = new DUET.Collection({model:'message'});
    this[entityType + 'sCollection'] = new DUET.Collection({model:entityType});

    //this.messagesCollection.load(this.messages);
    this[entityType + 'sCollection'].load(this[entityType + 's']);

    //this.messages = this.messagesCollection.modelParams();
    this[entityType + 's'] = this[entityType + 'sCollection'].modelParams();
};

DUET.Search.prototype.getEntityUrl = function (entityType, id) {
    var url = '', projectId, message;

    if ($.inArray(entityType, ['task', 'file']) !== -1) {
        projectId = this[entityType + 'sCollection'].modelsById[id].projectId;
        url = 'projects/' + projectId + '/' + entityType + 's/' + id;
    }
    else if (entityType == 'message') {
        message = this.messagesCollection.modelsById[id];
        url = message.referenceObject + 's/' + message.referenceId;
    }
    else url = entityType + 's/' + id;

    return url;
};


DUET.ForgotPassword = function () {
    this.type = 'forgot-password';

    this.saveUrl = 'user/forgot_password';
};

DUET.ForgotPassword.prototype = new DUET.Model();

DUET.ChangePassword = function () {
    this.type = 'change-password';

    this.saveUrl = 'user/change_password';
};

DUET.ChangePassword.prototype = new DUET.Model();

DUET.FileUploadNotification = function () {
    this.type = 'file-upload-notification';

    this.saveUrl = 'file/upload_notification';
};

DUET.FileUploadNotification.prototype = new DUET.Model();




DUET.SendPassword = function(){
    this.type = 'send-password';

    this.saveUrl = 'users/send_password' ;
};

DUET.SendPassword.prototype = new DUET.Model();



