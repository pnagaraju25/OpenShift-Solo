var DUET = DUET || {};

//Button Set
DUET.ButtonSetView = function (data) {
    this.template = 'button-set';

    this.initialize(data);
};

DUET.ButtonSetView.prototype = new DUET.View();

DUET.ButtonSetView.prototype.setAction = function (action) {
    var self = this;

    self.$element.on('click', 'li', function () {
        self.setSelected($(this).attr('id'));

        //run the action associated with this button set
        DUET.utils.run.apply(this, [action, this]); //todo:add to base view if this is used often. See usage on DUET.Module
    });
};

DUET.ButtonSetView.prototype.setSelected = function (id) {
    //mark the current button as selected
    this.$element.find('#' + id).addClass('selected').siblings().removeClass('selected');
};

//Panel View
DUET.PanelView = function (options) {
    options = options || {};

    this.template = options.isPrimary ? 'panel' : 'panel-two';

    this.domElements = {
        $scrollable:'.nano',
        $notification:'.notification',
        $title:'.panel-title',
        $inner:'.inner',
        $innerMenu:'.inner-menu',
        $panelInfo:'.panel-info',
        $innerContentWrapper:'.inner-content-wrapper',
        $innerContent:'.inner-content',
        $showMessages:'#show-messages-panel',
        $panelActionsWrapper:'.panel-actions-wrapper',
        $titleWidgetSpace:'.panel-title-widget'
    };

    this.scrollbar = false;

    this.isPrimary = options.isPrimary;

    this.initialize(options);

    //we need to save a reference to the current content, so we can trigger "remove" functionality when it is removed from the dom
    this.innerContent = {};

    this.notificationTimout = false;

    if (!options.isPrimary) {
        this.scrollbar = true;
        this.$element.find('.nano').nanoScroller();
    }
};

DUET.PanelView.prototype = new DUET.View();

DUET.PanelView.prototype.setContent = function (content) {
    //todo: is this used?
    this.$panelActionsWrapper.css('display', 'block');
    this.setInnerContent(content, false);
};

DUET.PanelView.prototype.clearContent = function (view) {
    //clear the secondary inner menu
    this.clearSecondaryMenu();
    this.$innerMenu.css('display', 'none');
    this.$panelActionsWrapper.css('display', 'none');

    this.removeTitleWidget();

    this.$title.html('');

    this.$innerContent.empty();

    if (view)
        view.addTo({
            $anchor:this.$innerContent
        });
};

DUET.PanelView.prototype.setTitleWidget = function (view) {
    this.hasTitleWidget = true;
    view.addTo({$anchor:this.$titleWidgetSpace});
};

DUET.PanelView.prototype.removeTitleWidget = function () {
    if (this.hasTitleWidget === true) {
        this.$titleWidgetSpace.html('');
        this.hasTitleWidget = false;
    }
};

DUET.PanelView.prototype.setInnerContent = function (content, showMenu) {
    var display = showMenu !== false ? 'block' : 'none';

    //clear the secondary inner menu
    this.clearSecondaryMenu();

    //show the inner menu
    this.$innerMenu.css('display', display);

    //set the content
    if (content instanceof DUET.View) {
        content.addTo({
            $anchor:this.$innerContent
        });
    }
    else this.$innerContent.html(content);

    //we need to call resize, otherwise the height might be wrong (if the inner menu was previously showing)
    this.resize();

    this.updateScrollbar();
};

DUET.PanelView.prototype.addContent = function (content) {
    if (content instanceof DUET.View) {
        content.addTo({
            $anchor:this.$innerContentWrapper.find('.inner-content'),
            position:'append'
        });
    }
    else this.$innerContentWrapper.find('.inner-content').append(content);
};

DUET.PanelView.prototype.updateScrollbar = function () {
    this.$scrollable.nanoScroller({scroll:'top'});
};

DUET.PanelView.prototype.addToMainMenu = function ($content, isLeftSide) {
    this.$innerMenu.find('.left-menu').first().append($content);
};

DUET.PanelView.prototype.clearMainMenu = function(){
    this.$innerMenu.find('.left-menu').first().empty();
};

DUET.PanelView.prototype.addToSecondaryMenu = function ($content) {
    var $anchor = this.$innerMenu.find('.secondary-inner-menu');

    if ($content instanceof DUET.View)
        $content.addTo({$anchor:$anchor, position:'append'});
    else $anchor.append($content);

};

DUET.PanelView.prototype.clearSecondaryMenu = function () {
    this.$innerMenu.find('.secondary-inner-menu').html('');
};

DUET.PanelView.prototype.resize = function () {
    var innerMenuHeight = this.$innerMenu.css('display') != 'none' ? this.$innerMenu.outerHeight(true) : 0;

    //todo:where is the 10 on the end from?
    this.$scrollable.height(this.$element.outerHeight(true) - this.$panelInfo.outerHeight(true) - innerMenuHeight - 10);

    this.$scrollable.nanoScroller();
};

DUET.PanelView.prototype.setTitle = function (title) {
    this.$title.html(DUET.utils.html_entity_decode(title));
};

DUET.PanelView.prototype.notify = function (message, timeout) {
    var self = this,
        notificationTimeout;

    //if notification timeout is set to false, then this notifcation will persist
    if (timeout !== false) {
        notificationTimeout = timeout || 3000;
    }

    if (message) {
        this.$notification.text(message);
        this.$notification.show();

        clearTimeout(this.notificationTimeout);

        if (notificationTimeout) {
            this.notificationTimeout = setTimeout(function () {
                self.$notification.fadeOut();
            }, notificationTimeout);
        }
    }
};

DUET.PanelView.prototype.hideNotification = function () {
    this.$notification.css('display', 'none');
};

DUET.PanelView.prototype.bindEvents = function () {
    var self = this;

    this.$notification.on('click', '.close', function () {
        self.hideNotification();
    });

    if (!this.isPrimary) {
        //we're loadig on the dashboard, so let's hide this button initially
        self.$showMessages.css('display', 'none');

        self.$showMessages.on('click', function () {
            if (!DUET.messagesViewInstance.isShowing) {
                self.showMessagesPanel()
            }
            else {
                self.hideMessagesPanel();
            }
        });

        DUET.evtMgr.subscribe('contextChanged contextCleared', function (e, context) {

            if (!context || $.inArray(context.object, ['client', 'user', 'dashboard', 'reporting', 'template']) != -1) {
                self.$showMessages.css('display', 'none');
                DUET.messagesMgr.hideMessages();
                //self.$inner.removeClass('showing-messages');
            }
            else {
                self.$showMessages.css('display', 'inline-block');
                DUET.messagesMgr.showMessages();
            }
        });
    }
};

DUET.PanelView.prototype.showMessagesPanel = function(){
    DUET.messagesMgr.showMessages();
};

DUET.PanelView.prototype.hideMessagesPanel = function(){
    DUET.messagesMgr.hideMessages();
};

//Sidebar View
DUET.SidebarView = function () {
    this.template = 'sidebar';

    this.domElements = {
        $visibleItems:'#sidebar-menu-items',
        $hiddenItems:'#sidebar-menu-overflow',
        $more:'#sidebar-more',
        $notificationSpace:'#notification-space',
        $runningTimerSpace:'#running-timer-space',
        $currentUserSpace:'#current-user-space',
        $globalSearchSpace:'#global-search-space'
    };

    this.tab = false;
    this.$body = $('body');

    this.initialize(null);
};

DUET.SidebarView.prototype = new DUET.View();

DUET.SidebarView.prototype.postInitProcessing = function(){
    var currentUserView = new DUET.CurrentUserView(),
        globalSearchView = new DUET.GlobalSearchView();

    currentUserView.addTo({$anchor:this.$currentUserSpace});
    globalSearchView.addTo({$anchor:this.$globalSearchSpace});

};

DUET.SidebarView.prototype.bindEvents = function () {
    var self = this;

    function setSelected($el) {

        if (!$el.length || $el.is('#sidebar-more'))
            return;

        var tab = $el.attr('id').split('-')[0];

        self.$element.find('li').not($el).removeClass('active');
        $el.addClass('active');

        self.tab = tab;
    }

    this.$element.on('click', 'li', function () {
        setSelected($(this));
    });

    this.$more.on('click', function () {
        var $hiddenItems = self.$visibleItems.find('.hidden').clone().removeClass('hidden');

        self.$hiddenItems.html($hiddenItems);

        self.$hiddenItems.css({
            display:'block',
            width:($hiddenItems.length * 65) + 42,
            top:self.$more.position().top - 20
        });
    });

    this.$hiddenItems.on('mouseleave', function () {
        self.$hiddenItems.fadeOut(200);
    });



    $(window).on('resize.sidebarView', function () {
        self.resize();
    });
};

DUET.SidebarView.prototype.postRenderProcessing = function () {
    var self = this;

    this.margin = parseInt(this.$element.parent().css('margin-top'), 10);
    var itemsToRemove = DUET.modulesToHide;
    $.each(itemsToRemove, function (i, item) {
        self.$element.find('#' + item.toLowerCase() + '-tab').remove();
    });
    this.$items = this.$element.find('#sidebar-menu-items li');
    this.numItems = this.$visibleItems.find('li').length;
    this.resize();


};

DUET.SidebarView.prototype.resize = function () {
    var height, numDisplayedItems;


    height = this.$body.height() - this.margin;

    this.$element.height(height);

    //numDisplayedItems = Math.min(Math.floor((height - 100) / 85), this.numItems);
    numDisplayedItems = 10;

    if (numDisplayedItems >= this.numItems - 1)  //need to subract one because the more button takes up a space
        this.$more.css('display', 'none');
    else this.$more.css('display', 'block');


    this.$items.each(function (index, el) {
        if (index <= numDisplayedItems)
            $(el).removeClass('hidden');
        else $(el).addClass('hidden');
    });
};

DUET.SidebarView.prototype.unloadProcessing = function(){
    $(window).off('resize.secondaryPanelManager');
};

//Messages Panel View
DUET.MessagesPanelView = function (messagesCollection) {
    var self = this;

    this.template = 'messages-panel';

    this.$messagesList = false;

    self.isShowing = false;

    this.messagesCollection = messagesCollection;

    this.domElements = {
        $messagesList:'#messages-list', //todo:css selector?
        $scrollable:'.nano',
        $newMessage:'#new-message',
        $menu:'#messages-panel-menu',
        $hide:'#hide-messages-panel',
        $refresh:'#refresh-messages-panel',
        $sendMessage:'#send-message',
        $sendMessageWrapper:'#message-area-wrapper',
        $entityName:'#discussion-entity-name'
    };


    this.initialize(null);


    this.manage();
};

DUET.MessagesPanelView.prototype = new DUET.View();

DUET.MessagesPanelView.prototype.setHeight = function () {
    this.$scrollable.height(this.$element.outerHeight(true) - this.$newMessage.outerHeight(true) - this.$menu.outerHeight(true));
};

DUET.MessagesPanelView.prototype.bindEvents = function () {
    var self = this;

    self.$element.on('keyup', 'textarea', function (e) {
        var $textarea = $(this);

        if (e.which === 13) {
            self.addMessage($textarea.val());
            $textarea.val('');
        }
    });

    self.$sendMessage.on('click', function () {
        var data = self.editor.getData();

        if(!data.length)
            return;

        self.$newMessage.addClass('sending-message');
        var sendingMessage = self.addMessage(data);

        $.when(sendingMessage).done(function(){
            self.editor.setData('');
            self.$newMessage.removeClass('sending-message');
        });


    });

    self.$refresh.on('click', function () {
        self.load();
    });

    self.$hide.on('click', function () {
        self.hide();
    });

    $(window).on('resize.messagesPanelView', function () {
        self.setHeight();
        self.updateScrollbar();
    });

    DUET.evtMgr.subscribe('contextChanged', function (e, context) {
        self.manage();
    });
};

DUET.MessagesPanelView.prototype.manage = function () {
    var self = this,
        context = DUET.context();

    if (!context)
        return;

    if ($.inArray(context.object, ['client', 'user', 'dashboard']) != -1)
        self.hide();



    //if the context changes and the messages panel is showing, then we should load the messages for the new context
    if (self.isShowing)
    {
        self.setEntityName(context.object);
        self.load();
    }
};

DUET.MessagesPanelView.prototype.setEntityName = function(name){
    this.$entityName.html(ut.lang('entityNames.' + name));
};

DUET.MessagesPanelView.prototype.hide = function () {
    //don't do anything if the messages panel is already hidden
    if(!this.isShowing)
        return false;


    this.isShowing = false;

};

DUET.MessagesPanelView.prototype.show = function () {
    //don't do anything if the messages panel is already showing
    if(this.isShowing)
        return false;

    this.isShowing = true;

    //if the screen was resized when the messages window was hidden, the editor height will have been messed up
    //we need to set it to the correct size here
    //todo:shouldn't be hardcoded
    if (this.editor)
        this.editor.resize(260, 120);

    //reload the messages because the context could have changed since the last time this panel was refreshed,
    //or new messages could have been loaded
    this.load();
};

DUET.MessagesPanelView.prototype.addMessage = function (messageText) {
    var self = this,
        message = this.messagesCollection.add({message:messageText}, true);

    $.when(message.initialSave).done(function(){
        self.createMessageView(message);

        self.updateScrollbar();
    });

    return message.initialSave;

};

DUET.MessagesPanelView.prototype.updateScrollbar = function () {
    //todo: is this necessary - two calls?
    this.$scrollable.nanoScroller();
    this.$scrollable.nanoScroller({scroll:'bottom'});
};

DUET.MessagesPanelView.prototype.createMessageView = function (message) {
    var messageView = new DUET.MessageView(message);
    this.$messagesList.append(messageView.$get());
};

DUET.MessagesPanelView.prototype.load = function () {
    var self = this,
        context = DUET.context();

    if (context) {
        this.messagesCollection = new DUET.Collection({model:'message'});

        this.messagesCollection.on('loaded', function () {
            self.populate();
        });

        this.messagesCollection.load('app/messages/' + context.object + '/' + context.id);
    }
};

DUET.MessagesPanelView.prototype.populate = function () {
    var self = this;

    self.$messagesList.html('');

    $.each(self.messagesCollection.models, function (i, message) {
        self.createMessageView(message);
    });

    self.setHeight();
    this.updateScrollbar();
};

DUET.MessagesPanelView.prototype.postRenderProcessing = function () {
    var self = this;

    function startEditor() {
        //unbind the event that caused this function to fire - the same way the 'once' function would
        DUET.evtMgr.unsubscribe('messages-panel-showing', startEditor);
        self.startEditor();
    }

    if (this.isShowing)
        this.startEditor();
    else {
        DUET.evtMgr.subscribe('messages-panel-showing', startEditor);
    }
};

DUET.MessagesPanelView.prototype.startEditor = function () {
    var ckeditorConfig = {},
        self = this;

    function doStart(){
        var $editor = self.$element.find('textarea');

        //for some reason the editor will sometimes try to start before the textarea is actually available.
        //let's make sure this doesn't happen.
        if($editor.length)
            self.editor = CKEDITOR.replace($editor.get(0), ckeditorConfig);
        else setTimeout(doStart, 100);
    }

    ckeditorConfig.uiColor = '#ffffff';

    ckeditorConfig.toolbar = [
        { name:'basicstyles', items:[ 'Bold', 'Italic', 'Underline', 'Strike'] }
    ];

    //the underline and strikethrough buttons won't appear without this line
    ckeditorConfig.removeButtons = '';

    //prevent the editor from creating <p> tags, which mess up the activity stream
    //The activity stream wraps all messages in <a> tags, which are inline level elements, but <p> is block level
    ckeditorConfig.enterMode = CKEDITOR.ENTER_BR;
    ckeditorConfig.shiftEnterMode = CKEDITOR.ENTER_P;

    //use a div instead of an iframe
    ckeditorConfig.extraPlugins = 'divarea';

    ckeditorConfig.height = 120;

    doStart();
};

DUET.MessagesPanelView.prototype.unloadProcessing = function(){
    if(this.editor)
        this.editor.destroy();

    $(window).off('resize.messagesPanelView');
};

//Message View
DUET.MessageView = function (data) {
    this.template = 'message';



    this.paramsToDecode = ['message'];

    this.initialize(data);

};

DUET.MessageView.prototype = new DUET.View();

DUET.MessageView.prototype.postBuildProcessing = function(){
    this.$element.find('.message-text').html(this.modelParams.message);
};

DUET.MessageView.prototype.postInitProcessing = function () {
    DUET.insertProfileImage(this.$element, this.model);
};

//Item List View for projects
DUET.ProjectListView = function (type, modelOrCollection) {
    var self = this;

    this.template = 'project-' + type + '-list';

    this.type = type;

    if (modelOrCollection)
        this.initialize(modelOrCollection);

    return this;
}; //TODO: the arguments list for all views should be standardized

DUET.ProjectListView.prototype = new DUET.View();

DUET.TaskListView = function (data, project) {
    this.template = 'project-task-list-wrapper';

    this.initialize();

    this.collection = data;

    this.project = project;

    if (DUET.userIsAdmin())
        this.taskListItemsView = new DUET.TaskListItemsView(data, project);
    else this.taskListItemsView = new DUET.TaskListItemsSimpleView(data, project.id);

    this.taskListItemsView.addTo({$anchor:this.$element});
};

DUET.TaskListView.prototype = new DUET.View();

DUET.TaskListView.prototype.postRenderProcessing = function () {
    //clients can't create tasks
    if (DUET.userIsAdmin())
        this.newTaskButton();

    this.initFilter();

    //if we move this into postInitProcessing, it will be removed when the task list is created becasue the task list
    //does not use append as the position argument for View.addTo
    if (!this.collection.models.length)
        this.showMessage(ut.lang('taskList.noTasks'));
};

DUET.TaskListView.prototype.newTaskButton = function () {
    var $button, self = this;

    $button = DUET.templateManager.$get('add-project-list-item', {
        buttonText:ut.ucFirst(ut.lang('entityNames.task')),
        type:'new-entity'
    });

    $button.on('click', function () {
        new DUET.NewTaskView({}, function (taskModel) {
            var $task = DUET.templateManager.$get('project-task-list-item', taskModel);
            //self.collection.add(taskModel);

            //todo:loose coupling, this is very messy
            var listItem = self.taskListItemsView.fluidList.addListItem($task);

            self.taskListItemsView.createTask(listItem, taskModel);
        });
    });

    DUET.panelTwo.panel.addToSecondaryMenu($button);

    this.taskButton = $button;
};

DUET.TaskListView.prototype.initFilter = function () {
    //todo: Loose coupling. This implementation is terrible
    var filter = new DUET.TaskListFilterView(this);

    DUET.panelTwo.panel.addToSecondaryMenu(filter);
    this.filter = filter;
    this.filter.applyDefault();
};

DUET.TaskListView.prototype.redraw = function (collection, filterToApply) {
    var taskCollection = collection || this.collection,
        currentFilters = this.filter.currentFilters(),
        filter = filterToApply || currentFilters.complete,
        ucFirst = DUET.utils.ucFirst;

    this.taskListItemsView.unload();
    this.taskListITemsView = false;
    //this.taskListItemsView = new DUET.TaskListItemsView(taskCollection, this.project);

    if (DUET.userIsAdmin())
        this.taskListItemsView = new DUET.TaskListItemsView(taskCollection, this.project);
    else this.taskListItemsView = new DUET.TaskListItemsSimpleView(taskCollection, this.project.id);

    this.taskListItemsView.addTo({$anchor:this.$element});

    if (filter)
        this.taskListItemsView['show' + ucFirst(filter)](); //todo: this  should reapply the current filter, then we can probably get rid of the clear function on the filter
    else this.taskListItemsView.showIncomplete();

    DUET.panelTwo.panel.updateScrollbar();
};

DUET.TaskListView.prototype.showMessage = function (optionsOrMessage) {
    var options = {},
        $message;

    if (typeof optionsOrMessage == 'string') {
        options.message = optionsOrMessage;
    }
    else $.extend(options, optionsOrMessage);

    if (!options.closeButtonText)
        options.noCloseButtonText = true;

    $message = DUET.templateManager.$get('task-list-message', options);

    this.$element.prepend($message);
};

DUET.TaskListView.prototype.bindEvents = function () {
    var self = this;

    this.$element.on('click', '.search-results-message .close', function () {
        self.redraw();
    });

    this.$element.on('click', '.task-list-message .close', function () {
        $(this).closest('.task-list-message').remove();
    });
};

DUET.TaskListFilterView = function (taskListView) {
    this.needsUnloading();

    this.template = 'task-filter';

    this.domElements = {
        $searchFilter:'.search-filter'
    };

    this.appliedFilters = {};

    this.taskListView = taskListView;

    this.initialize();
};

DUET.TaskListFilterView.prototype = new DUET.View();

DUET.TaskListFilterView.prototype.applyDefault = function(){
    this.appliedFilters = {complete:0};
    this.performFilters();
};

DUET.TaskListFilterView.prototype.bindEvents = function () {
    var self = this,
        ucFirst = DUET.utils.ucFirst;

    this.$element.on('click', function (e) {
        $(this).toggleClass('open');
        e.stopPropagation();
    });

    this.$searchFilter.on('click', function (e) {
        e.stopPropagation();
    });

    this.$searchFilter.on('keyup', 'input', function (e) {
        var $this;

        if (e.which == 13) {
            $this = $(this);
            self.searchList($this.val());
            $this.val('');
            self.$element.find('.selected').removeClass('selected');
        }
    });

    $('html').on('click.task-filter', function () {
        self.$element.removeClass('open');
    });

    this.$element.on('click', 'li', function () {
        var $this, type, value;

        $this = $(this);

        if ($this.hasClass('search-filter'))
            return;

        type = $this.data('filter-type');
        value = ucFirst($this.data('filter-value'));

        $this.toggleClass('selected').siblings('[data-filter-type=' + type + ']').removeClass('selected');

        //keep track of the current filters that have been applied
        self.appliedFilters[type] = value;

        //run the function that performs the actual filter
        self.performFilters();

        if ($this.hasClass('selected'))
            DUET.panelTwo.panel.notify(ut.lang('taskFilter.filterNotification', {filterValue:value}));

        DUET.panelTwo.panel.updateScrollbar();
    });

};

DUET.TaskListFilterView.prototype.unloadProcessing = function () {
    $('html').off('click.task-filter');
};

DUET.TaskListFilterView.prototype.setFilters = function(){
    var self = this, filters = {};

    if(self.appliedFilters.complete){
        var complete = self.appliedFilters.complete;

        if(complete != 'All')
            filters.isComplete = (complete == 'Incomplete') ? 0 : 1;
    }

    //set assigned filter
    //check to see if the assigned filter has been selected
    if(self.appliedFilters.assigned){
        var assigned = self.appliedFilters.assigned;

        //if we're filtering 'my' tasks then we need to add the current user's id, otherwise we need to remove
        if(assigned == 'Mine')
            filters.assignedTo = DUET.my.id;
    }

    return filters;
};

DUET.TaskListFilterView.prototype.performFilters = function(){
    var self = this, filtered, collection;

    filters = this.setFilters();

    filtered = self.taskListView.collection.filter(filters);

    collection = new DUET.Collection({model:'task'});
    collection.load(filtered);

    this.taskListView.redraw(collection);
};

DUET.TaskListFilterView.prototype.searchList = function (searchTerm) {
    var self = this, filtered, collection;

    filtered = self.taskListView.collection.search({task:searchTerm});
    collection = new DUET.Collection({model:'task'});
    collection.load(filtered);

    this.taskListView.redraw(collection, 'incomplete');

    this.taskListView.showMessage({
        message: ut.lang('taskFilter.searchNotification', {searchTerm:searchTerm}),
        closeButtonText:ut.lang('taskFilter.closeSearch'),
        type:'search-results-message'
    });

    this.$element.removeClass('open');
};

DUET.TaskListFilterView.prototype.currentFilters = function () {
    var filters = {};

    this.$element.find('.selected').each(function () {
        var $this = $(this);
        filters[$this.attr('data-filter-type')] = $this.attr('data-filter-value');
    });

    return filters;
};

//Task List Items View
DUET.TaskListItemsView = function (data, project) {

    var tasks;
    //todo:i shouldn't have to pass in the project just to update the progress when a task is completed. Should be a better way
    this.domElements = {
        $completedTasks:'#completed-tasks-list',
        $incompleteTasks:'#incomplete-tasks-list'
    };

    this.fluidList = false;

    this.project = project;

    tasks = this.sortTasks(data);

    this.initialize(tasks);

    this.collection = data;
};

DUET.TaskListItemsView.prototype = new DUET.ProjectListView('task');

DUET.TaskListItemsView.prototype.postRenderProcessing = function () {
    var self = this;
    //todo:there should be some kind of loading animation until this is done.

    this.fluidList = this.initFluidList();
};

DUET.TaskListItemsView.prototype.loadUsers = function (modalForm) {
    var self = this;

    function buildSelect() {
        $.each(self.project.users, function (i, user) {
            modalForm.$element.find('select').append('<option value="' + user.id + '">' + user.name + '</option>');

        });

        modalForm.$element.find('select').select2();
    }

    //if we don't already have the list of users, we need to get it before we populate the select.
    if (!self.project.users) {
        new DUET.Request({
            url:'/projects/' + self.project.id + '/users',
            success:function (response) {
                self.project.users = response.data;
                buildSelect();
            }
        });
    }
    else buildSelect();
};

DUET.TaskListItemsView.prototype.bindEvents = function () {
    var self = this;

    function goToTask(id) {
        DUET.navigate('projects/' + DUET.context().id + '/tasks/' + id);
    }

    //IMPORTANT: double click handler is defined in the fluid list initialization



    self.$incompleteTasks.on('click', '.delete-task', function () {
        var $this = $(this),
            type = $this.closest('li').hasClass('list-header') ? 'header' : 'task';

        DUET.confirm({
            actionName:ut.lang('taskListItems.deleteTask'),
            message:ut.lang('taskListItems.deleteTaskMessage', {type:type}),
            callback:function () {
                var $listItem = $this.closest('li'),
                    id = $listItem.data('id'),
                    task = new DUET.Task();

                task.id = id;

                task.on('deleted', function () {
                    $listItem.fadeOut(function () {
                        //we need to remove the
                        self.fluidList.removeListItem($listItem);
                        $listItem.remove();
                    });
                });

                task.delete();
            }
        });
    });

    self.$element.on('click', '.view-task', function () {
        self.goToTask($(this).closest('li').data('item'));
    });

    self.$element.on('keyup.tasklistview', function (e) {
        var $this = $(this);

        if (e.which === 27) {
            if (self.fluidList)
                self.fluidList.destroy();
        }
    });

    self.$element.on('click', '.is-task-completed', function (e) {
        var $this = $(this),
            $task = $this.closest('li'),
            task = self.collection.modelsById[$task.data('id')];

        task.toggleComplete();

        self.updateProjectProgress();

        if (task.isComplete) {
            self.markTaskComplete($task, true);
        }
        else {
            $task.fadeOut(400, function () {
                $task.remove();
                self.fluidList.addListItem($task.css('display', 'block'));
            });

        }

        return false;
    });

    self.$completedTasks.on('click', 'li', function (e) {
        if(!$(e.target).is('.is-task-completed'))
            goToTask($(this).closest('li').data('id'));
    });
};

DUET.TaskListItemsView.prototype.updateProjectProgress = function () {
    this.project.calculateProgress(this.collection);
};

DUET.TaskListItemsView.prototype.markTaskComplete = function ($task, animate) {
    var self = this;

    function removeTask() {
        if (self.fluidList)
            self.fluidList.removeListItem($task);

        //the task may have been hidden by the animation, we need to reset it's display property before we add it
        //to the completed tasks list, otherwise it won't show up if we're in the "all tasks" view
        $task.css('display', 'block');

        //move the task to the completed tasks list
        self.$completedTasks.append($task);
    }

    $task.addClass('complete');

    if (animate === true) {
        $task.fadeOut(400, function () {
            removeTask();
        });
    }
    else removeTask();
};

DUET.TaskListItemsView.prototype.goToTask = function (listItem) {

    var self = this;

    //todo: this seems like it should be handled in the fluid list plugin
    function goToTask(listItem) {
        DUET.navigate(listItem.$element.data('task').url());
    }

    //if the list item isn't saved, save it before navigating to the task
    if (!listItem.extraData.id) {
        var deferred = listItem.save();

        $.when(deferred).done(function () {
            goToTask(listItem);
        });
    }
    else if (!listItem.isSection) {
        goToTask(listItem);
    }

};

DUET.TaskListItemsView.prototype.initFluidList = function (indexOfClicked) {
    var self = this,
        decode = DUET.utils.html_entity_decode;

    var tasksManager = new DUET.TasksManager();

    self.$incompleteTasks.fluidList({
        itemTemplate:DUET.templateManager.$get('project-task-list-item').outerHtml(),
        editableSelector:'.task-details',
        currentItemIndex:indexOfClicked,
        orderChangeCallback:function (order, originalOrder) {
            tasksManager.order = order;
            tasksManager.originalOrder = originalOrder;
            tasksManager.projectId = self.project.id;
            tasksManager.save();
        },
        getItemValueCallback:function (value) {
            return decode(value);
        },
        itemImportCallback:function (item, $item) {
            self.initListItem(item, $item.data('id'));
        },
        itemSaveCallback:function (item, oldOrder, newOrder) {
            var id = item.getData('id'),
                context = DUET.context(),
                itemData,
                task,
                deferred,
                isProject = context.object == 'project' || context.object == 'template';

            itemData = {
                task:item.value,
                projectId:isProject ? context.id : null,
                clientId:self.project.clientId,
                isSection:item.isSection,
                oldOrder:oldOrder,
                newOrder:newOrder
            };

            if (typeof id === 'undefined') {
                task = self.createTask(item, itemData);
                deferred = task.initialSave;
            }
            else {
                task = self.collection.get(id);
                deferred = task.save(itemData);
            }

            self.updateProjectProgress();

            return deferred;
        },
        itemDeleteCallback:function (listItem) {
            var task;

            if (task = self.collection.get(listItem.getData('id')))
                self.collection.remove(task, true);

            self.updateProjectProgress();
        },
        doubleClickCallback:function (listItem) {
            self.goToTask(listItem);
        },
        openItemCallback:function (listItem) {
            self.goToTask(listItem);
        }
    });

    return self.$incompleteTasks.data('FluidList');
};

DUET.TaskListItemsView.prototype.initListItem = function (item, id) {
    var self = this,
        task;

    if (id) {
        task = self.collection.modelsById[id];
        item.setData('id', id);
        item.$element.attr('id', id);
        item.$element.attr('data-id', id);

        //todo: i don't think this is used anymore
        item.$element.data('task', task);
    }

    return task;
};

DUET.TaskListItemsView.prototype.createTask = function (listItem, data, callback) {
    var self = this, task;

    if (!(data instanceof DUET.Task))
        task = self.collection.add(data, true);
    else {
        //we already have a task instance so no need to save it to the server again
        task = self.collection.add(data);
    }

    $.when(task.initialSave).done(function (response) {
        if (task.id) {
            self.initListItem(listItem, task.id);
        }
    });

    return task;
};

DUET.TaskListItemsView.prototype.showComplete = function () {
    this.$incompleteTasks.css('display', 'none');
    this.$completedTasks.css('display', 'block');
};

DUET.TaskListItemsView.prototype.showIncomplete = function () {
    this.$incompleteTasks.css('display', 'block');
    this.$completedTasks.css('display', 'none');
};

DUET.TaskListItemsView.prototype.showAll = function () {
    this.$incompleteTasks.css('display', 'block');
    this.$completedTasks.css('display', 'block');
};

DUET.TaskListItemsView.prototype.unloadProcessing = function () {
    //todo: is there unloading logic for fluid list?
};

DUET.TaskListItemsView.prototype.sortTasks = function (tasksCollection) {
    var tasks = {
        complete:[],
        incomplete:[]
    };

    $.each(tasksCollection.models, function (id, task) {
        task.classes = task.isSection === true ? 'list-header' : '';
        if (task.isComplete === true) {
            tasks.complete.push(task);
        }
        else tasks.incomplete.push(task);
    });

    return tasks;
};

DUET.TaskListItemsSimpleView = function (data, projectId) {
    var tasks;

    this.projectId = projectId;

    this.domElements = {
        $completedTasks:'#completed-tasks-list',
        $incompleteTasks:'#incomplete-tasks-list'
    };

    this.paramsToDecode = ['complete:task', 'incomplete:task'];

    tasks = DUET.TaskListItemsView.prototype.sortTasks(data);

    this.initialize(tasks);
};

DUET.TaskListItemsSimpleView.prototype = new DUET.ProjectListView('client-task');

DUET.TaskListItemsSimpleView.prototype.bindEvents = function () {
    var self = this;

    this.$element.on('click', 'li:not(.list-header)', function () {

        DUET.navigate('projects/' + self.projectId + '/task/' + $(this).data('id'));
    });
};

DUET.TaskListItemsSimpleView.prototype.showComplete = DUET.TaskListItemsView.prototype.showComplete;
DUET.TaskListItemsSimpleView.prototype.showIncomplete = DUET.TaskListItemsView.prototype.showIncomplete;
DUET.TaskListItemsSimpleView.prototype.showAll = DUET.TaskListItemsView.prototype.showAll;

DUET.NewTaskView = function (taskModel, callback) {
    var self = this,
        data = taskModel instanceof DUET.Model ? taskModel : {},
        submitAction = typeof callback != 'undefined' ? callback : null,
        context = DUET.context(),
        isProject = context.object == 'project' || context.object == 'template',
        projectId = isProject ? context.id : taskModel.projectId,
        isEdit = taskModel instanceof DUET.Model;

    self.projectId = projectId;

    this.initForm({
        name:'project-task',
        isModal:true,
        title:isEdit ? ut.lang('taskForm.editTask') : ut.lang('taskForm.newTask'),
        data:data,
        submitAction:submitAction
    });

    this.$element.find('[name=due_date_selection]').change(function (event, date) {
        var timestamp = ut.datepicker_to_timestamp($(this).val());
        self.$element.find('[name=due_date]').val(timestamp);
    });

    this.$element.find('[name=project_id]').val(projectId);

    this.loadUsers = self.loadUsers(this);
};

DUET.NewTaskView.prototype = new DUET.FormView();

DUET.NewTaskView.prototype.loadUsers = function (modalForm) {
    var self = this, request;

    function buildSelect() {
        $.each(self.users, function (i, user) {
            modalForm.$element.find('select').append('<option value="' + user.id + '">' + user.name + '</option>');

        });

        modalForm.$element.find('select').select2();
    }

    //if we don't already have the list of users, we need to get it before we populate the select.
    if (!self.users) {
        request = new DUET.Request({
            url:'/projects/' + self.projectId + '/users/admins',
            success:function (response) {
                self.users = response.data;
                buildSelect();
            }
        });
    }
    else buildSelect();

    return request.isComplete;
};

DUET.NewProjectView = function (project, isModal) {


    this.project = project;

    this.type = 'project';



    this.initializeForm(isModal);

};

DUET.NewProjectView.prototype = new DUET.FormView();

DUET.NewProjectView.prototype.initializeForm = function(isModal){
    var self = this, formData, isEdit, isModal, title, langKey;

    formData = this.project ? this.project.modelParams() : false;
    isEdit = this.project instanceof DUET.Model;

    isModal = typeof isModal != 'undefined' ? isModal : true;

    this.typeWord = ut.ucFirst(ut.lang('entityNames.' + this.type));

    //get the title text
    langKey = isEdit ? 'projectForm.editProject' : 'projectForm.newProject';
    title = ut.lang(langKey, {type:this.typeWord});


    this.initForm({
        name:'project',
        isModal:isModal,
        title:title,
        data:formData,
        model:self.project,
        submitAction:function (project) {
            var notification;

            //force the primary list to reset
            DUET.panelOne.reset();

            //if this is a new project, we can just navigate to the project page. If this is an existin, we have
            //to force a reload for the page to refresh.
            if (!isEdit)
                DUET.navigate(self.type + 's/' + project.id);
            else DUET.reload();

            //get the notification text
            langKey = isEdit ? 'projectForm.projectEdited' : 'projectForm.projectCreated';
            notification = ut.lang(langKey, {type:this.typeWord});

            DUET.panelTwo.panel.notify(notification);
        }
    });

    this.$element.find('[name=due_date_selection], [name=start_date_selection]').change(function (event, date) {
        var $this = $(this),
            timestamp = ut.datepicker_to_timestamp($(this).val());

        self.$element.find('[name=' + $this.attr('name').slice(0, -10) + ']').val(timestamp);
    });

    this.loadingClients = self.loadClients(this);

    if (this.project) {
        $.when(this.loadingClients).done(function () {
            self.populateCurrentValues();
        });
    }
    else {
        //this is a new project, let's auto populate the start date with today's date
        var startDate = moment().unix();

        this.$element.find('[name=start_date]').val(startDate);
        this.$element.find('[name=start_date_selection]').data('dateinput').setValue(new Date(DUET.Model.prototype.formatDate(startDate, 'MM/DD/YYYY')));
    }
};

DUET.NewProjectView.prototype.loadClients = function (modalForm) {
    var self = this, request;

    function buildSelect() {
        $.each(self.clients, function (i, client) {
            var $option = $('<option value="' + client.id + '"></option>').text(ut.decode(client.name));
           // client.name = ut.decode(client.name);

            modalForm.$element.find('select').append($option);
        });

        modalForm.$element.find('select').select2();
    }

    var $notification = $('<div class="notification">' + ut.lang('projectForm.loadingClients') + '</div>');
    self.$element.prepend($notification);

    //if we don't already have the list of users, we need to get it before we populate the select.
    if (!self.clients) {
        request = new DUET.Request({
            url:'/clients',
            success:function (response) {
                $notification.fadeOut();
                self.clients = response.data;
                buildSelect();
            }
        });
    }
    else buildSelect();

    return request.isComplete;
};

DUET.NewTemplateView = function(project, isModal){
    this.project = project;

    this.type = 'template';

    this.initializeForm(isModal);

    this.$form.attr('data-model', 'template');
};

DUET.NewTemplateView.prototype = DUET.NewProjectView.prototype;


//File Preview List


DUET.FileListSimpleTilesView = function(filesCollection){
    this.template = 'file-list-simple-tiles';

    var dv = new DocumentViewer(false, {init:false});

    $.each(filesCollection.models, function (i, fileModel) {
        //todo:the type should really be determined on the server, with this as a backup
        //if(!fileModel.type)
        fileModel.type = dv.getDocumentType(fileModel.name);
    });

    this.initialize(filesCollection);

};

DUET.FileListSimpleTilesView.prototype = new DUET.View();

DUET.FileListSimpleTilesView.prototype.bindEvents = function(){
    this.$element.on('click', 'li', function (e) {
        DUET.navigate('projects/' + DUET.context().id + '/files/' + $(this).data('id'));
    });
};


DUET.FileListLineItemsView = function (filesCollection) {
    var dv = new DocumentViewer(false, {init:false});

    $.each(filesCollection.models, function (i, fileModel) {
        //todo:the type should really be determined on the server, with this as a backup
        //if(!fileModel.type)
        fileModel.type = dv.getDocumentType(fileModel.name);
    });

    this.initialize(filesCollection);
};

DUET.FileListLineItemsView.prototype = new DUET.ProjectListView('file');

DUET.FileListLineItemsView.prototype.bindEvents = function () {
    this.$element.on('click', 'li', function (e) {
        DUET.navigate('projects/' + DUET.context().id + '/files/' + $(this).data('id'));
    });
};


DUET.FileListView = function (filesCollection) {

    this.filesCollection = filesCollection;
    //we need to create a wrapper element that will be added to the DOM. The real view (created above), will be added
    //to this wrapper
    this.$element = $('<div class="file-list-view-wrapper"></div>');
};

DUET.FileListView.prototype = new DUET.View();

DUET.FileListView.prototype.postRenderProcessing = function () {
    var self = this,
    //used to map the button ids to their corresponding views
        idMap = {
            'line-items-view':'LineItems',
            'tiles-view':'SimpleTiles'
        },
    //used to map the view names to the button ids
        viewNameMap = {
            'LineItems':'line-items-view',
            'SimpleTiles':'tiles-view'
        };


    //set the default file view
    this.generateView(DUET.config.default_file_view);

    if(DUET.userIsAdmin() || DUET.config.allow_client_uploads == true){
        //create the button to add new files
        var button = new DUET.AddFileButton();
        DUET.panelTwo.panel.addToSecondaryMenu(button.$get());
    }


    //create the buttons to switch between tile and list view
    var fileViewType = new DUET.ButtonSetView({
        id:'file-view-type',
        buttons:[
            {buttonId:'line-items-view', buttonText:''},
            {buttonId:'tiles-view', buttonText:''}
        ]
    });

    fileViewType.setAction(function (button) {
        var buttonId = $(button).attr('id'),
            viewType = idMap[buttonId];

        self.generateView(viewType);
    });

    //set the default view as the selected view in the buttonSet we just created
    fileViewType.setSelected(viewNameMap[DUET.config.default_file_view]);

    //render the button set
    DUET.panelTwo.panel.addToSecondaryMenu(fileViewType.$element);

    if (!this.filesCollection.models.length)
        this.$element.append('<div class="no-activity">' + ut.lang('fileList.noFiles') + '</div>');
};

DUET.FileListView.prototype.generateView = function (type) {
    var self = this,
        viewType;

    //this view is just a wrapper for the different file type views
    //let's create the specific type of file view that needs to be loaded
    viewType = type || 'SimpleTiles';

    this.view = new DUET['FileList' + viewType + 'View'](self.filesCollection);

    //once' the wrapper has been added to the DOM, we insert the view into this wrapper
    this.view.addTo({
        $anchor:self.$element
    });
};

//File preview
DUET.FilePreviewView = function (data) {
    var self = this, size, type,
        dv = new DocumentViewer(false, {init:false});

    this.template = 'file-list-preview';

    this.downloadUrl = 'files/download/' + data.id;

    this.url = false;

    this.file = data;

    this.filename = data.name;

    this.fileId = data.id;

    this.initialize(data);

    this.$inner = this.$element.find('.file-dv');

    //we want to add the type ass a class to the preview so let's get it now
    type = dv.getDocumentType(this.filename);

    size = dv.getSize({
        type:type,
        width:258
    });

    this.$inner.css(size).addClass(type);

    this.$inner.data('id', this.fileId);



    //todo:this is downloading the entire file to generate previews.
};

DUET.FilePreviewView.prototype = new DUET.View();

DUET.FilePreviewView.prototype.load = function () {
    var self = this,
        size = {},
        dv, type,
        loading = new $.Deferred();

    function generatePreview() {
        //todo:perhaps the next one shouldn't load until the previous one has finished?
        //todo: IMPORTANT. I don't think i need get contents any more since we know exactly where each file will be
        //we need to pass in the type and extension because we're using a dynamic url that does not include the actual filename
        var loadedDeferred = dv.load(self.file.url, {
            type:type,
            extension:dv.getExtension(self.filename),
            useTextLoaderHelper:false,
            height:size.height,
            width:size.width,
            debug:DUET.config.enable_debugging
        });

        if (type == 'image') {
            //if this is an image, we need to reposition the previews once the image is loaded since there is no way to
            //know the height before hand
            //TODO: Can php send the height?
            $.when(loadedDeferred).done(function () {
                self.$element.find('.preview-placeholder').height(self.$element.find('.file-dv').height());

                DUET.evtMgr.publish('arrangePreviews');
            });
        }

        $.when(loadedDeferred).done(function(){
           // self.$element.find('.loading-message').remove();
        });

        return loadedDeferred;
    }

    dv = self.$element.find('.file-dv').documentViewer({
        path:'client/plugins/document-viewer/',
        autoplay:false,
        scrollbar:false,
        showErrors:false,
        debug:DUET.config.enable_debugging
    });

    //todo:create a wrapper function that returns general types not supported by the document viewer, so that we can set classes for the background images (images seen in tile view and while previews are loading)
    type = dv.getDocumentType(self.filename);

    if(!type){
        loading.reject(ut.lang('fileView.invalidType'));
        return loading;
    }

    self.$element.attr('data-type', type);

    size.width = 258; //TODO: I really don't like explicitly setting sizes here.

    $.when(self.file.getFileUrl()).done(function () {
        //todo:Too many deferreds...How does this relate to the promise in loadNext function?
        var previewPromise = $.when(generatePreview());

        previewPromise.done(function () {
            loading.resolve();
        });

        previewPromise.fail(function () {
            loading.reject();
        });
    });

    return loading;
};

DUET.FilePreviewView.prototype.error = function (errorType) {
    //todo: displaying errors should really be part of the document viewer plugin and error messages are set with config options
    var $error;

    if(!errorType)
        $error = DUET.templateManager.$get('document-viewer-error');
    else $error = DUET.templateManager.$get('document-viewer-unsupported-type');


    this.$element.find('.file-dv').html($error);
};

DUET.FilePreviewView.prototype.bindEvents = function () {
    this.$element.on('click', function (e) {
        if ($(e.target).closest('.file-meta-wrapper').length == 0)
            DUET.navigate('projects/' + DUET.context().id + '/files/' + $(this).find('.file-dv').data('id'));
    });
};

DUET.FileView = function (data) {
    var self = this, dv;

    this.template = 'file';

    this.domElements = {
        $downloadButton:'.download-button',
        $editButton:'.edit-button',
        $deleteButton:'.delete-button',
        $notes:'.notes-content'
    };

    this.initialize(data);

    this.$inner = this.$element.find('.file-dv');

    this.file = data;

    self.needsUnloading();
};

DUET.FileView.prototype = new DUET.View();

DUET.FileView.prototype.postRenderProcessing = function () {

    var self = this, dv, loadedDeferred, type, $anchor, width;

    $anchor = this.$inner;

    width = $anchor.width();

    var options = {
        path:'client/plugins/document-viewer/',
        autoplay:false,
        scrollbar:false,
        showErrors:false,
        setAudioHeight:false,
        width:width,
        debug:DUET.config.enable_debugging
    };


    dv = $anchor.documentViewer(options);

    self.documentViewer = dv;

    //todo:create a wrapper function that returns general types not supported by the document viewer, so that we can set classes for the background images (images seen in tile view and while previews are loading)
    type = dv.getDocumentType(this.file.name);

    $.when(self.file.getFileUrl()).done(function () {

        self.activateDownloadButton();

        loadedDeferred = dv.load(self.file.url, {
            type:type,
            extension:dv.getExtension(self.file.name),
            useTextLoaderHelper:false,
            width:width
        });

        loadedDeferred.fail(function () {
            //todo:i should be able to just pass an error template to the document viewer
            var $error = DUET.templateManager.$get('document-viewer-error');
            self.$element.find('.document-viewer').html($error);
        })
    });
};

DUET.FileView.prototype.bindEvents = function () {
    var self = this;


    //todo:this needs to be throttled. The page will crash if the page is being resized with a drag
    $(window).on('resize.' + self.id, function () {
        self.resize();
    });

    self.$downloadButton.on('click', function () {
        return false;
    });

    self.$editButton.on('click', function (e) {

        var notesForm = new DUET.FormView({
            name:'edit-file-notes',
            title:ut.lang('fileView.editNotes'),
            model:self.file,
            data:self.file.modelParams(),
            isModal:true
        });

        self.file.once('saved', function () {
            self.$notes.text(self.file.notes);
        });

        e.preventDefault();
    });

    self.$deleteButton.on('click', function (e) {
        DUET.confirm({
            actionName:ut.lang('fileView.deleteFile'),
            message:ut.lang('fileView.deleteFileConfirmation'),
            callback:function () {
                var projectId = self.file.projectId,
                    isDeleted = self.file.delete();
                //todo:this isn't going towork, dile.elete does not return a deferred, use file.once
                $.when(isDeleted).done(function () {
                    DUET.navigate('projects/' + projectId + '/files');
                });

                return isDeleted;
            }
        });

        e.preventDefault();
    });

    DUET.evtMgr.subscribe('messages-panel-showing.fileView messages-panel-hidden.fileView', this.resize.bind(this));
};

DUET.FileView.prototype.resize = function(){
    this.$element.find('.file-dv').empty();
    this.postRenderProcessing();
};

DUET.FileView.prototype.activateDownloadButton = function () {
    var self = this;

    self.$downloadButton.off();
    self.$downloadButton.on('click', function (e) {
        self.download();
        e.preventDefault();
    });
};

DUET.FileView.prototype.download = function () {
    var iframe,
        self = this;

    //http://stackoverflow.com/questions/3749231/download-file-using-javascript-jquery
    var hiddenIFrameID = 'hiddenDownloader';
    iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = DUET.options.server + DUET.options.urlPrefix + self.file.downloadUrl + '/do';
};

DUET.FileView.prototype.unloadProcessing = function () {
    //unbind the window resize event
    $(window).off('.' + this.id);

    DUET.evtMgr.unsubscribe('messages-panel-showing.fileView messages-panel-hidden.fileView');
};

DUET.AddFileButton = function (opts) {
    var self = this;

    this.options = opts || {};

    //we can either pass in an existing jquery element for the button or we can create it
    if (!this.options.$element) {
        //the button doesn't exist yet so let's create it
        this.template = this.options.template || 'add-file-button';

        //build the view, passing in the data
        this.initialize({
            buttonText:self.options.buttonText || ut.lang('addFileButton.defaultButtonText'),
            type:'new-entity'
        });
    }
    else {
        //the button does exist, let's use the existing jquery object
        this.$element = this.options.$element;
    }

    this.modalForm = false;

    //holds a list of the successful file uploads
    this.uploadedFiles = [];

    this.initFileUploadScript();
};

DUET.AddFileButton.prototype = new DUET.View();

DUET.AddFileButton.prototype.initFileUploadScript = function () {
    var self = this,
        numFiles = 0,
        numComplete = 0,
        url = this.options.url || 'server/' + DUET.options.urlPrefix + 'files/upload',
        uploadNotification;

    //todo:this should have a max height with a scrollbar just in case the user tries to upload a ton of files? Or should I just limit the number of simulaneous uploads? Yea, a limit, that's better...
    function createFileProgressBar(filename, id) {
        var $progress = DUET.templateManager.$get('file-progress', {
            fileName:filename,
            id:id
        });

        self.modalForm.$element.prepend($progress);

        return $progress;
    }

    this.jqXHR = {};

    this.numFiles = 0;

    this.numComplete = 0;

    function setProgressBar(data, progress){
        data.context.find('.progress').find('span').css(
            'width',
            progress + '%'
        ).find('span').html(progress + '%');
    }
    this.$element.find('#fileupload').fileupload({
        dataType:'json',
        url:url,
        formData:DUET.context(),
        start:function () {
            self.modalForm.$element.addClass('uploading').find('input').remove();
        },
        add:function (e, data) {
            var id = DUET.utils.uniqueId();

            if (self.modalForm == false)
                self.modalForm = self.initModal();

            //create the progress bar, save reference to it
            data.context = createFileProgressBar(data.files[0].name, id);
            data.context.data('id', id);
            self.jqXHR[id] = data.submit();



            self.jqXHR[id].done(function (response) {
                if (response)
                    DUET.evtMgr.publish('addFilePreview', response.data);
            });

            self.numFiles++;
        },
        done:function (e, data) {
            //no need to send an upload notification for a profile pic
            if (!self.options.isProfilePhoto) {
                var fileDetails = {
                    id:data.result.data.id,
                    name:data.result.data.name,
                    project_id:data.result.data.project_id
                };

                self.uploadedFiles.push(fileDetails);
            }

                setProgressBar(data, 100);
                data.context.addClass('complete');
                self.uploadComplete(data);

        },
        progress:function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);

            setProgressBar(data, progress);
        },
        progressall:function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            self.modalForm.modal.setTitle('Uploading (' + progress + '%)');
        }
    });
};

DUET.AddFileButton.prototype.uploadComplete = function () {
    var self = this,
        uploadNotification;

    self.numComplete++;

    function reset() {
        //we need to reload the page otherwise the add file button will not function properly anymore
        DUET.reload();
    }

    function countProperties(obj) {
        var count = 0;

        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                ++count;
        }

        return count;
    }

    if (self.numComplete === self.numFiles) {
        self.modalForm.$element.find('#cancel-all').remove();

        setTimeout(function () {
            self.modalForm.close();

            if (self.options.callback)
                self.options.callback();

            //no need to send an upload notification for a profile pic
            if (!self.options.isProfilePhoto) {
                if(self.uploadedFiles.length){
                    DUET.panelTwo.panel.notify(ut.lang('addFileButton.filesUploadedMessage', {numFiles:self.numFiles}));

                    uploadNotification = new DUET.FileUploadNotification();
                    uploadNotification.load({files:self.uploadedFiles});
                    uploadNotification.save();
                }
            }

            setTimeout(function(){
                reset();
            }, 500);
        }, 1000);
        //todo:there should be a x files uploaded success message (bar notification type?)
    }
};

DUET.AddFileButton.prototype.initModal = function () {
    var self = this;

    function cancel($progressWrapper) {
        var id = $progressWrapper.data('id');

        if (!$progressWrapper.hasClass('complete')) {
            self.jqXHR[id].abort();
            delete self.jqXHR[id];
            $progressWrapper.addClass('cancelled');
            $progressWrapper.find('.status').text(ut.lang('addFileButton.cancelled'));
        }

        self.uploadComplete();
        //todo:notifcation,
    }

    self.modalForm = new DUET.FormView({
        name:'project-file',
        isModal:true,
        title:ut.lang('addFileButton.modalTitle'),
        data:{}
    });

    self.modalForm.$element.find('[name=project_id]').val(DUET.context().id);

    self.modalForm.$element.on('click', '.cancel', function (e) {
        var $progress = $(this).closest('.progress-bar-wrapper');
        cancel($progress);

        e.preventDefault();
    });

    self.modalForm.$element.find('#cancel-all').click(function (e) {

        //todo:there should be an inline confirmation messages. Are you sure?
        $.each(self.modalForm.$element.find('.progress-bar-wrapper'), function (i, progress) {
            cancel($(progress));
        });

        e.preventDefault();
    });

    //we need to get rid of the default submit handler, it's useless here
    self.modalForm.$element.unbind('submit');

    self.modalForm.$element.submit(function (e) {
        return false;
    });

    return self.modalForm;
};

//Task Details View
DUET.TaskView = function (data) {
    var self = this, timer, timerInterval, $time;

    this.template = 'task-details';

    this.domElements = {
        $tabs:'.tabs',
        $tabsContent:'.tabs-content',
        $attachmentTab:'#task-attachment-tab',
        $attachmentCount:'.attachment-count',
        $attachmentList:'.attachment-list',
        $edit:'#task-edit',
        $delete:'#task-delete',
        $addFile:'#task-add-file',
        $isTaskCompleted:'.is-task-completed',
        $changeTaskWeight:'#change-task-weight',
        $startTimer:'#start-timer',
        $stopTimer:'#stop-timer',
        $inactiveTimer:'#inactive-timer',
        $elapsedTime:'#elapsed-time',
        $timeEntries:'#task-time-entries',
        $enterTime:'#enter-time'
    };

    this.paramsToDecode = ['task', 'notes'];



    this.initialize(data);

    this.$element.on('click', 'dd a', function (e) {
        var $this = $(this),
            tab = $this.attr('href');

        $this.parent().addClass('active').siblings().removeClass('active');
        self.$tabsContent.find(tab).addClass('active').siblings().removeClass('active');
        //todo:this needs to update scrollbar because height of content will change
        e.preventDefault();
    });



//todo: this generates way too many ajax requests. At least four
};

DUET.TaskView.prototype = new DUET.View();

DUET.TaskView.prototype.addTimeEntryToList = function (timeEntry) {
    var $newEntry;

    //add the new entry to the list
    timeEntry.prepViewProperties();
    $newEntry = DUET.templateManager.$get('task-time-entry', timeEntry.modelParams());
    this.$timeEntries.removeClass('hidden').find('.header').after($newEntry);

    this.model.timeEntriesCollection.add(timeEntry);
};

DUET.TaskView.prototype.bindEvents = function () {
    var self = this,
        $time;



    function startTimer(){
        DUET.runningTimerView = new DUET.RunningTimerView(self.model);

        DUET.runningTimer = new DUET.Timer(self.model, function () {
            self.updateElapsedTime();
        });

        DUET.runningTimer.start();

       self.startTimerManageViewState();
    }

   // $time = self.$element.find('#elapsed-time');

    this.$startTimer.on('click', function () {
        if(DUET.runningTimer)
            DUET.alert(ut.lang('taskDetails.timerAlreadyRunning'));
        else startTimer();
    });

    this.$stopTimer.on('click', function () {
        DUET.runningTimer.stop();

        self.addTimeEntryToList(DUET.runningTimer.timeEntry);

        DUET.runningTimerView.unload();

        self.stopTimerManageViewState();

        DUET.runningTimerView = null;
        DUET.runningTimer = null;
    });

    this.$enterTime.on('click', function () {
        new DUET.TaskTimeEntryView(self.model.id, self);
    });

    this.$element.on('click', '.time-entry-delete', function () {
        var $timeEntry = $(this).closest('li');

        //todo: this won't work if the initial time entry save hasn't completed
        DUET.confirm({
            actionName: ut.lang('taskDetails.deleteTimeEntryButton'),
            message: ut.lang('taskDetails.deleteTimeEntryConfirmationMessage'),
            callback:function () {
                var id = $timeEntry.data('id'),
                    deletingTimeEntry = self.model.timeEntriesCollection.modelsById[id].destroy();

                $.when(deletingTimeEntry.isComplete).done(function () {
                    $timeEntry.fadeOut(function () {
                        $timeEntry.remove();
                    });
                });

                return deletingTimeEntry.isComplete;
            }
        });
    });

    this.$edit.on('click', function () {
        var formView = new DUET.NewTaskView(self.model);

        $.when(formView.loadUsers).done(function () {
            formView.populateCurrentValues();
        });

        self.model.once('saved', function () {
            DUET.reload();
        });
    });

    this.$delete.on('click', function () {
        DUET.confirm({
            actionName:ut.lang('taskDetails.deleteTaskButton'),
            message:ut.lang('taskDetails.deleteTaskConfirmationMessage'),
            callback:function () {
                var url, deletingTask = self.model.destroy();

                $.when(deletingTask.isComplete).done(function () {
                    if (self.model.projectId)
                        url = 'projects/' + self.model.projectId + '/tasks';
                    else url = 'tasks/x';

                    DUET.navigate(url);
                });

                return deletingTask.isComplete;
            }
        });
    });

    this.$isTaskCompleted.on('click', function () {

        self.model.toggleComplete();

        if (self.model.isComplete) {
            self.$element.addClass('complete');
        }
        else {
            self.$element.removeClass('complete');
        }
    });

    this.$changeTaskWeight.on('click', function () {
        new DUET.TaskWeightView(self.model);
    });


    DUET.evtMgr.subscribe('runningTaskTimerStopped.' + this.id, function(){
        self.stopTimerManageViewState();
        //we only want this to happen once.
        DUET.evtMgr.unsubscribe('runningTaskTimerStopped.' + self.id);
    });
};

DUET.TaskView.prototype.updateElapsedTime = function(){
    var timeText = DUET.runningTimer.generateTimeText();

    this.$elapsedTime.html(timeText);
    DUET.runningTimerView.setTime(timeText);
};

DUET.TaskView.prototype.startTimerManageViewState = function(){
    this.$startTimer.hide();
    this.$stopTimer.show();
    this.$inactiveTimer.hide();
    this.$elapsedTime.show();
};

DUET.TaskView.prototype.stopTimerManageViewState = function(){
    this.$startTimer.show();
    this.$stopTimer.hide();
    this.$inactiveTimer.show();
    this.$elapsedTime.hide();
};

DUET.TaskView.prototype.postInitProcessing = function () {
    var button = new DUET.AddFileButton({
        template:'task-add-file-button',
        buttonText:ut.lang('taskDetails.addFile'),
        callback:function () {
            //reload the page so that the file appears in the attachments list
            DUET.reload();
        }
    });
    this.$addFile.replaceWith(button.$element);
    this.$addFile = button.$element;
};

DUET.TaskView.prototype.postRenderProcessing = function () {
    this.getTaskFiles();
    this.getTimeEntries();

    if(this.isThisTaskTimerRunning())
        this.bindRunningTimer();
};

DUET.TaskView.prototype.isThisTaskTimerRunning = function(){
    return DUET.runningTimer && DUET.runningTimerView && (DUET.runningTimerView.model.id == this.model.id);
};

DUET.TaskView.prototype.bindRunningTimer = function(){
    var self = this;

    DUET.runningTimer.setCallback(function(){
        self.updateElapsedTime();
    });

    this.startTimerManageViewState();

};

DUET.TaskView.prototype.getTaskFiles = function () {
    var self = this,
        $list;

    $.when(self.model.getFiles()).done(function (request) {
        self.$attachmentCount.text(self.model.files.length);

        $list = DUET.templateManager.$get('task-attachment', {files:self.model.files});

        self.$attachmentList.replaceWith($list);
        self.$attachmentList = $list;
    });
};

DUET.TaskView.prototype.getTimeEntries = function () {
    var self = this,
        $list;

    //todo: this could probably be combined into one request (combine with getFiles)
    $.when(self.model.getTimeEntries()).done(function (request) {
        $list = DUET.templateManager.$get('task-time-entries', {timeEntries:self.model.timeEntries});
        self.$timeEntries.html($list);

        if (self.model.timeEntries.length)
            self.$timeEntries.removeClass('hidden');
    });
};

DUET.TaskView.prototype.unloadProcessing = function(){
    DUET.evtMgr.unsubscribe('runningTaskTimerStopped.' + this.id);
};

DUET.TaskWeightView = function (taskModel) {
    var self = this;

    this.domElements = {
        $weight:'.task-maximum-weight'
    };

    this.initForm({
        name:'task-weight',
        title:ut.lang('taskWeightForm.taskWeight'),
        model:taskModel,
        data:taskModel.modelParams(),
        isModal:true,
        submitAction:function () {
            DUET.reload();
        }
    });

    $.when(taskModel.getMaximumWeight()).done(function () {
        self.$weight.html(taskModel.maximumWeight);
        self.$element.find('.notification').fadeOut();
    });
};

DUET.TaskWeightView.prototype = new DUET.FormView();

DUET.TaskWeightView.prototype.processFormValues = function (values) {
    if (!values['weight'])
        values['weight'] = 0;

    return values;
};

DUET.TaskTimeEntryView = function (taskId, taskView) {
    var timeEntry = new DUET.TimeEntry();
    timeEntry.taskId = taskId;

    this.initForm({
        name:'time-entry',
        title:ut.lang('timeEntryForm.title'),
        isModal:true,
        model:timeEntry,
        submitAction:function () {
            timeEntry.timeComponentsToSecs();
            taskView.addTimeEntryToList(timeEntry);
        }
    });
};

DUET.TaskTimeEntryView.prototype = new DUET.FormView();

DUET.ClientDetailsView = function (data) {
    this.template = 'client-details';

    this.domElements = {
        $changePrimaryContact:'#change-primary-contact',
        $addNewUser:'#add-new-user',
        $tabsContent:'.tabs-content'
    };

    this.paramsToDecode = ['address1', 'address2', 'website', 'phone', 'primaryContactName'];

    this.initialize(data);

};

DUET.ClientDetailsView.prototype = new DUET.View();

DUET.ClientDetailsView.prototype.bindEvents = function () {
    var self = this;

    this.$changePrimaryContact.on('click', function () {
        new DUET.ClientPrimaryContactView(self.model);
    });

    this.$addNewUser.on('click', function () {
        new DUET.ClientNewUserView(self.model);
    });

    this.$element.on('click', 'dd a', function (e) {
        var $this = $(this),
            tab = $this.attr('href');

        $this.parent().addClass('active').siblings().removeClass('active');
        self.$tabsContent.find(tab).addClass('active').siblings().removeClass('active');
        //todo:this needs to update scrollbar because height of content will change
        e.preventDefault();
    });

    this.$element.on('click', '.list li', function () {
        var $this = $(this),
            type = $this.data('type'),
            id = $this.data('id');

        DUET.navigate(type + 's/' + id);
    });
};

DUET.ClientDetailsView.prototype.postInitProcessing = function () {
    this.$element.find('.user-image').append('<img src="' + this.model.primaryContactImage + '"/>')
        .parent().attr('href', '#users/' + this.model.primaryContactId);
};

DUET.ClientDetailsView.prototype.postRenderProcessing = function () {
    this.getEntity('projects');
};

DUET.ClientDetailsView.prototype.getEntity = function (type) {
    var self = this,
        $list,
        params = {};

    $.when(this.model.getEntity(type)).done(function () {
      //  params[type] = self.model[type].modelParams();
        var view = new DUET['Client' + ut.ucFirst(type) + 'View'](self.model[type]);
     //   $list = DUET.templateManager.$get('client-' + type, params);
        self.$element.find('#client-' + type + '-tab').html(view.$get());
    });
};

DUET.ClientProjectsView = function(projectsCollection){
    this.template = 'client-projects';

    this.paramsToDecode = ['projects:name'];

    this.initialize(projectsCollection);
};

DUET.ClientProjectsView.prototype = new DUET.View();

DUET.UserDetailsView = function (data) {
    this.template = 'user-details';

    this.domElements = {
        $changePhoto:'#change-photo',
        $image:'.user-image-inner',
        $changePassword:'#change-password-button',
        $sendPassword:'#send-password'
    };

    this.paramsToDecode = ['firstName', 'lastName', 'email', 'address1', 'address2', 'clientName'];

    this.initialize(data);
};

DUET.UserDetailsView.prototype = new DUET.View();

DUET.UserDetailsView.prototype.bindEvents = function () {
    var self = this;

    new DUET.AddFileButton({
        isProfilePhoto:true,
        $element:this.$element,
        url:'server/' + DUET.options.urlPrefix + 'users/set_profile_image',
        callback:function () {
            DUET.reload()
        }
    });

    this.$changePassword.on('click', function () {
        new DUET.ChangePasswordView();
    });

    this.$sendPassword.on('click', function(){
        new DUET.SendPasswordView(self.model);
    });
};

DUET.UserDetailsView.prototype.postInitProcessing = function () {
    if (this.model.profileImage && this.model.profileImage.length) {
        this.$image.html('<img src="' + this.model.profileImage + '"/>');
    }
};

DUET.UserDetailsView.prototype.userBasedProcessing = function (user) {
    //the change password and change change photo buttons should only appear if you are viewing your own profile
    if (user.id != this.model.id) {
        this.$changePhoto.remove();
        this.$changePassword.remove();
    }
    else{
        this.$sendPassword.remove();
    }
};

DUET.LoginView = function (data) {
    this.template = 'login';

    if (data)
        data['company'] = DUET.companyName;
    else data = {company:DUET.companyName};


    this.domElements = {
        $window:'.login-window',
        $status:'#login-status'
    };

    this.initialize(data);
};

DUET.LoginView.prototype = new DUET.View();

DUET.LoginView.prototype.bindEvents = function () {
    var self = this;

    this.$element.on('submit', 'form', function (e) {
        var form = $(this);

        //clear any status messages that already existed
        self.$status.html('');

        new DUET.Request({
            url:'app/login',
            data:form.serialize(),
            success:function (response) {
                //     debugger;
                if (response.auth === 'successful_login') {
                    self.$element.remove();
                    //DUET.navigate('dashboard');
                }
            }
        });

        e.preventDefault();
    });
};

DUET.LoginView.prototype.unsuccessfulLogin = function (response) {
    $('#login-status').html(DUET.error(response.lang.incorrectLogin));
};

DUET.LoginView.prototype.postRenderProcessing = function () {
    this.$window.animate({opacity:1}, 'fast');
};

DUET.DropdownView = function (data, options) {
    this.options = options || {};

    if (this.options.$element)
        this.$element = this.options.$element;

    this.initialize();

    this.$dropdown = this.$element.find('.dropdown-menu');
};

DUET.DropdownView.prototype = new DUET.View();

DUET.DropdownView.prototype.bindEvents = function () {
    var self = this;

    //todo:delete if not using, getBounds too
    function positionWithinBounds() {
        if (!self.options.$within)
            return;

        var dropdownBounds = getBounds(self.$dropdown),
            withinBounds = getBounds(self.options.$within),
            offset = self.$element.offset(),
            difference;

        //adjust the right side if necessary
        difference = dropdownBounds.topRight[0] - withinBounds.topRight[0] + 10;

        if (difference > 0)
            self.$dropdown.css({left:-difference});

    }

    function getBounds($element) {
        var offset = $element.offset(),
            height = $element.height(),
            width = $element.width(),
            bounds = {};

        bounds.topLeft = [offset.left, offset.top];
        bounds.topRight = [offset.left + width, offset.top];
        bounds.bottomLeft = [offset.left, offset.top + height];
        bounds.bottomRight = [offset.left + width, offset.top + height];

        return bounds;
    }

    this.$element.click(function () {
        self.$element.toggleClass('open');
    });
};

DUET.CalendarView = function (data) {

    this.template = 'calendar';

    this.fullCalendar = {};

    this.headerView = false;

    this.initialize(data);
};

DUET.CalendarView.prototype = new DUET.View();

DUET.CalendarView.prototype.postRenderProcessing = function () {
    var self = this,
        currentPopupView;

    self.headerView = new DUET.CalendarHeaderView(this.$element, self.model.taskCollection);
    DUET.panelTwo.panel.addToSecondaryMenu(self.headerView.$get());

    this.$element.fullCalendar({
        header:false,
        monthNames:self.prepMonthNames(),
        dayNamesShort:self.prepDayNames(),
        firstDay:DUET.config.calendarFirstDay,
        events:self.model.taskCollection.modelParams(),
        eventRender:function (event, element, view) {
            return new DUET.CalendarEventItemView(event).$element;
        },
        viewDisplay:function (view) {
            var titleParts = view.title.split(' '), title;

            if (titleParts[titleParts.length - 1] == new Date().getFullYear()) {
                titleParts.pop();
                title = titleParts.join(' ');
            }
            else title = view.title;

            title = DUET.utils.trim(title, ',');
            self.headerView.setTitle(title);
        },
        eventClick:function (event, a, b) {
            //we only want one of these popup views open at a time, so get rid of the provious one if it exists
            if (currentPopupView)
                currentPopupView.unload();

            var context = DUET.context();

            //todo: Find a way to move this to the bind events function
            event.url = '#' + context.object + 's/' + context.id + '/tasks/' + event.id;
            currentPopupView = new DUET.CalendarEventPopupView(event);
            currentPopupView.needsUnloading();
            currentPopupView.addTo({
                $anchor:self.$element.closest('.inner-left'),
                position:'append'
            });
        }
    });

};

DUET.CalendarView.prototype.prepMonthNames = function () {
    var names = ut.lang('calendar.monthNames').split(',');
    $.each(names, function (i, name) {
        names[i] = $.trim(name);
    });

    return names;
};
DUET.CalendarView.prototype.prepDayNames = function () {
    var names = ut.lang('calendar.dayNames').split(',');
    $.each(names, function (i, name) {
        names[i] = $.trim(name);
    });

    return names;
};

DUET.CalendarHeaderView = function (fullCalendar, collection) {
    this.needsUnloading();

    this.template = 'calendar-header';

    this.$calendar = fullCalendar;

    this.taskCollection = collection;

    this.domElements = {
        $next:'.next-date',
        $today:'.today-date',
        $prev:'.prev-date',
        $name:'.date-name',
        $view:'#calendar-view-selector',
        $filters:'.task-filter',
        $myTasks:'#filter-my-tasks',
        $allTasks:'#filter-all-tasks'
    };

    this.initialize();
};

DUET.CalendarHeaderView.prototype = new DUET.View();

DUET.CalendarHeaderView.prototype.bindEvents = function () {
    var self = this;

    function reRender(collection) {
        self.$calendar.fullCalendar('removeEvents');
        self.$calendar.fullCalendar('addEventSource', collection.modelParams());
    }

    this.$next.on('click', function () {
        self.$calendar.fullCalendar('next');
    });

    this.$prev.on('click', function () {
        self.$calendar.fullCalendar('prev');
    });

    this.$today.on('click', function () {
        self.$calendar.fullCalendar('today');
    });

    this.$view.on('change', function () {
        self.$calendar.fullCalendar('changeView', $(this).val());
    });

    this.$myTasks.on('click', function () {
        var collection, filtered;

        filtered = self.taskCollection.filter({assignedTo:DUET.my.id});
        collection = new DUET.Collection({model:'task'});
        collection.load(filtered);

        reRender(collection);
    });

    this.$allTasks.on('click', function () {
        reRender(self.taskCollection);
    });

    this.$filters.on('click', function (e) {
        $(this).toggleClass('open');
        e.stopPropagation();
    });

    $('html').on('click.task-filter', function () {
        self.$element.removeClass('open');
    });

    this.$filters.on('click', 'li', function () {
        $(this).toggleClass('selected').siblings().removeClass('selected');
    });

};

DUET.CalendarHeaderView.prototype.setTitle = function (title) {
    this.$name.html(title);
};

DUET.CalendarHeaderView.prototype.unloadProcessing = function () {
    $('html').off('click.task-filter');
};

DUET.CalendarEventItemView = function (event) {
    this.template = 'calendar-event-item';

    this.initialize(event);
};

DUET.CalendarEventItemView.prototype = new DUET.View();

DUET.CalendarEventItemView.bindEvents = function () {
    //todo:should bind a single event at the calendar level rather than on each element
};

DUET.CalendarEventPopupView = function (event) {
    this.template = 'calendar-item-popup';

    this.initialize(event);
};

DUET.CalendarEventPopupView.prototype = new DUET.View();

DUET.CalendarEventPopupView.prototype.bindEvents = function () {
    var self = this;

    this.$element.on('click', '.close', function () {
        self.unload();
    });
};

DUET.CalendarEventPopupView.prototype.postRenderProcessing = function () {
    var self = this,
        $viewport = this.$element.closest('.viewport');

    function bounds($element) {
        var bounds = {},
            offset = $element.offset(),
            height, width;

        height = $element.height();
        width = $element.width();

        bounds.top = offset.top;
        bounds.bottom = offset.top + height;
        bounds.left = offset.left;
        bounds.right = offset.left + width;

        return bounds;
    }

    function withinBounds($element, containerBounds) {
        var elementBounds = bounds($element),
            isOutside = false,
            sidesThatAreOutside = {};

        if (elementBounds.top < containerBounds.top) {
            isOutside = true;
            sidesThatAreOutside.top = Math.abs(elementBounds.top - containerBounds.top);
        }

        if (elementBounds.left < containerBounds.left) {
            isOutside = true;
            sidesThatAreOutside.left = Math.abs(elementBounds.left - containerBounds.left);
        }

        if (elementBounds.bottom > containerBounds.bottom) {
            isOutside = true;
            sidesThatAreOutside.bottom = Math.abs(elementBounds.bottom - containerBounds.bottom);
        }

        if (elementBounds.right > containerBounds.right) {
            isOutside = true;
            sidesThatAreOutside.right = Math.abs(elementBounds.right - containerBounds.right);
        }

        if (isOutside)
            return sidesThatAreOutside;
        else return true;

    }

    function positionWithin($element, $container) {
        var containerBounds = bounds($container),
            isWithin = withinBounds($element, containerBounds),
            position = $element.position();

        if (isWithin !== true) {
            $.each(isWithin, function (outsideThisSide, amountOutside) {

                if (outsideThisSide == 'top')
                    $element.css('top', amountOutside + $container.offset().top);
                else if (outsideThisSide == 'left')
                    $element.css('left', amountOutside);
                else if (outsideThisSide == 'bottom')
                    $element.css('top', -amountOutside);
                else if (outsideThisSide == 'right')
                    $element.css('left', -amountOutside);
            });
        }
    }
};

DUET.ProjectProgressTitleWidgetView = function (data) {
    this.template = 'project-progress-title-widget';

    this.domElements = {
        $progress:'span'
    };

    this.initialize(data);

    this.$element.data('progress-widget', this);
};

DUET.ProjectProgressTitleWidgetView.prototype = new DUET.View();

DUET.ProjectProgressTitleWidgetView.prototype.bindEvents = function () {
    var self = this;

    //todo:this is a hack. Need to rework the title widget functionality
    if (this.model) {
        this.model.on('changed', function () {
            self.setProgress(self.model.progress);
        });
    }
};

DUET.ProjectProgressTitleWidgetView.prototype.setProgress = function (progress) {
    this.$progress.text(progress);
};

DUET.CurrentUserView = function(){
    this.template = 'current-user';

    this.initialize({userName:DUET.my.first_name});

    this.$element.find('.user-image').append('<img src="' + DUET.my.image + '"/>');
};

DUET.CurrentUserView.prototype = new DUET.View();

DUET.GlobalSearchView = function(){
    this.template = 'global-search-input';

    this.domElements = {
        $search:'#global-search'
    };

    this.initialize();
};

DUET.GlobalSearchView.prototype = new DUET.View();

DUET.GlobalSearchView.prototype.bindEvents = function(){
    var self = this;

    this.$search.on('keyup', function (e) {
        var query;

        if (e.which == 13) {
            query = $(this).val();

            if (query.length) {
                //we need to force a reload if the current search is the same as the previous search
                if (DUET.history.fragment != 'search/' + query)
                    DUET.navigate('search/' + query);
                else DUET.reload();
            }

            self.$search.val('');
        }

        e.preventDefault();
    });
};

DUET.ProjectDetailsView = function (details) {
    this.template = 'project-details';

    this.domElements = {
        $activityStream:'.activity-stream'
    };

    this.paramsToDecode = ['project.client_name'];

    this.initialize(details);
};

DUET.ProjectDetailsView.prototype = new DUET.View();

DUET.ProjectDetailsView.prototype.postInitProcessing = function () {
    var self = this,
        activityView;

    if (this.model.activity.length)
        this.$activityStream.html('');

    activityView = new DUET.ActivityListView(self.model.activity);

    activityView.on('resized', function () {
        DUET.panelTwo.panel.updateScrollbar();
    });

    self.$activityStream.append(activityView.$element);
};

DUET.ActivityListView = function (activity) {
    var activityCollection;

    this.template = 'activity-list';

    this.domElements = {
        $showAll:'.activity-show-all'
    };

    if (!(activity instanceof DUET.Collection)) {
        activityCollection = new DUET.Collection({model:'ActivityItem'});
        activityCollection.load(activity);
    }
    else activityCollection = activity;

    this.paramsToDecode = ['activityItems:linkedObjectTitle,objectTitle'];

    this.activityCollection = activityCollection;

    this.initialize(activityCollection);
};

DUET.ActivityListView.prototype = new DUET.View();

DUET.ActivityListView.prototype.postInitProcessing = function () {
    var self = this;

    if (!this.activityCollection.models.length) {
        this.$showAll.replaceWith('<div class="no-activity">' + ut.lang('activityList.noActivity') + '</div>');
    }
    this.$element.find('li:lt(10)').removeClass('hidden');

    //TODO: I would like to do this in the templates, but it will attempt to load images that don't exist src ={{var}}
    this.$element.find('li').each(function () {
        var $this = $(this),
            id = $this.data('id'),
            activityItem = self.activityCollection.modelsById[id];

        DUET.insertProfileImage($this, activityItem);
    });
};

DUET.ActivityListView.prototype.bindEvents = function () {
    var self = this;

    self.$showAll.on('click', function () {
        self.$showAll.text('loading...');
        self.$element.find('li:gt(10)').removeClass('hidden');

        self.$showAll.remove();
        self.publish('resized');
    });

};

DUET.DashboardView = function (dashboardModel) {
    this.template = 'dashboard';

    this.domElements = {
        $activityList:'.activity-stream',
        $projectList:'.project-list',
        $viewType:'#dashboard-project-view-type',
        $newProject:'.add-list-item',
        $filterWrapper:'#dashboard-filter-wrapper',
        $sortWrapper:'#dashboard-sort-wrapper'
    };

    this.initialize(dashboardModel)
};

DUET.DashboardView.prototype = new DUET.View();

DUET.DashboardView.prototype.bindEvents = function () {
    var self = this,
    //used to map the button ids to their corresponding views
        idMap = {
            'line-items-view':'LineItems',
            'tiles-view':'Tiles'
        };

    this.$element.on('click', '.project-widget', function () {
        DUET.navigate('projects/' + $(this).data('id'));
    });

    this.$viewType.on('click', 'li', function () {
        var $this = $(this), view;

        $this.addClass('selected').siblings().removeClass('selected');
        self.generateView(idMap[$this.attr('id')]);
    });

    this.$newProject.on('click', function () {
        new DUET.NewProjectView();
    });
};

DUET.DashboardView.prototype.generateView = function (viewName, projects) {
    //add the project list
    var self = this, view, projectsCollection;

    projectsCollection = projects || self.model.projects

    this.displayedProjects = projectsCollection;

    viewName = viewName || 'Tiles';

    this.viewName = viewName;

    view = new DUET['DashboardProjects' + viewName + 'View']({projects:projectsCollection});

    //once' the wrapper has been added to the DOM, we insert the view into this wrapper
    view.addTo({
        $anchor:self.$projectList
    });
};

DUET.DashboardView.prototype.postInitProcessing = function () {
    var self = this,
        activityView,
    //used to map the view names to the button ids
        viewNameMap = {
            'LineItems':'line-items-view',
            'Tiles':'tiles-view'
        },
        collection;

    //set the default file view
    this.generateView(DUET.config.default_dashboard_projects_view);

    //todo:use the button set for this
    this.$viewType.find('#' + viewNameMap[DUET.config.default_dashboard_projects_view]).addClass('selected');

    //add the activity list
    activityView = new DUET.ActivityListView(self.model.activity);

    activityView.on('resized', function () {
        DUET.panelTwo.panel.updateScrollbar();
    });

    self.$activityList.append(activityView.$element);

    //init dashboard filter
    collection = new DUET.Collection({model:'project'});
    collection.load(self.model.projects);

    self.panelFilter = new DUET.PanelFilterView({
        collection:collection,
        filters:DUET.panelOne.filters.project
    });

    self.panelFilter.addTo({$anchor:self.$filterWrapper});

    self.panelFilter.on('filterApplied', function (e, filtered) {
        self.generateView(self.viewName, filtered);
    });

    //init panel sort
    self.panelSort = new DUET.PanelSortView();
    self.panelSort.addTo({$anchor:self.$sortWrapper});

    self.panelSort.on('sorted', function (e, order) {
        var collection,
            sortOrder = order == 'descending' ? 'desc' : 'asc';

        collection = new DUET.Collection({model:'project'});

        collection.on('loaded', function(){
            collection.sort('createdDate', sortOrder);
            self.generateView(self.viewName, collection.models);
        });

        collection.load(self.displayedProjects);
    });
};



DUET.DashboardProjectsTilesView = function (data) {
    this.template = 'dashboard-projects-tile-list';

    this.initialize(data);
};

DUET.DashboardProjectsTilesView.prototype = new DUET.View();

DUET.DashboardProjectsLineItemsView = function (data) {
    this.template = 'dashboard-projects-list';

    this.initialize(data);
};

DUET.DashboardProjectsLineItemsView.prototype = new DUET.View();

DUET.NotesView = function (notesModel) {
    this.needsUnloading();

    this.template = 'project-notes';

    this.domElements = {
        $notes:'#notes-content',
        $noNotes:'.no-activity'
    };

    this.initialize(notesModel);
};

DUET.NotesView.prototype = new DUET.View();

DUET.NotesView.prototype.postRenderProcessing = function () {
    this.manageNoNotesText();

    if (this.model.notes.length)
        this.$notes.html(this.model.notes);

    if (DUET.userIsAdmin())
        DUET.panelTwo.panel.addToSecondaryMenu(this.enableEditorButton());
};

DUET.NotesView.prototype.enableEditorButton = function () {
    var self = this, $button;

    $button = DUET.templateManager.$get('edit-notes-button', {
        buttonText:ut.lang('projectNotes.editNotes')
    });

    $button.on('click', function () {
        self.startEditor();
        $button.replaceWith(self.disableEditorButton());
    });

    return $button;
};

DUET.NotesView.prototype.disableEditorButton = function () {
    var self = this, $button;

    $button = DUET.templateManager.$get('edit-notes-button', {
        buttonText: ut.lang('projectNotes.doneEditing')
    });

    $button.on('click', function () {
        self.model.notes = $.trim(self.editor.getData());

        DUET.panelTwo.panel.notify(ut.lang('projectNotes.saving'), false);

        self.model.once('saved', function () {
            self.editor.destroy();
            $button.replaceWith(self.enableEditorButton());
            DUET.panelTwo.panel.$notification.fadeOut();
        });
        self.model.save();

        self.manageNoNotesText();

    });

    return $button;
};

DUET.NotesView.prototype.startEditor = function () {
    var ckeditorConfig = {};

    if (this.editor)
        this.editor.destroy();

    ckeditorConfig.uiColor = '#ffffff';

    ckeditorConfig.toolbar = [
        { name:'basicstyles', items:[ 'Bold', 'Italic', 'Underline', 'Strike', '-', 'Font', 'FontSize', '-', 'TextColor', 'BGColor' ] },
        { name:'paragraph', items:[ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent',
            '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
        { name:'links', items:[ 'Link', 'Unlink', 'Anchor' ] }
    ];

    //todo:add autogrow
    ckeditorConfig.extraPlugins = 'divarea';

    ckeditorConfig.removeButtons = '';

    ckeditorConfig.height = '300px';
    ckeditorConfig.resize_minHeight = 300;


    CKEDITOR.on('instanceReady', function(e){
        e.editor.resize('100%', 300);
    });
    this.editor = CKEDITOR.replace(this.$notes.get(0), ckeditorConfig);



    this.manageNoNotesText(true);
};

DUET.NotesView.prototype.unloadProcessing = function(){
    if(this.editor)
        this.editor.destroy();
};

DUET.NotesView.prototype.manageNoNotesText = function (startingEditor) {
    //if the editor is showing (or we're about to start it), there is no reason to show the text saying there are no
    //notes
    if (startingEditor == true || this.model.notes.length)
        this.$noNotes.css('display', 'none');
    else {
        this.$noNotes.css('display', 'block');
    }
};

DUET.NewClientView = function (client) {
    var isEdit = client instanceof DUET.Model,
        data = client || {},
        title = ut.lang('clientForm.' + (isEdit ? 'editClient' : 'newClient'));

    this.domElements = {
        $showDetails:'#show-form-details',
        $hideDetails:'#hide-form-details'
    };

    this.initForm({
        name:isEdit ? 'client-edit' : 'client',
        isModal:true,
        title: title,
        data:data,
        submitAction:function (client) {
             DUET.panelOne.reset();

            if(isEdit)
                DUET.reload();
            else DUET.navigate('clients/' + client.id);
        }
    });

    this.populateCurrentValues();
};

DUET.NewClientView.prototype = new DUET.FormView();

DUET.NewClientView.prototype.bindEvents = function () {
    var self = this;

    DUET.FormView.prototype.bindEvents.apply(this);

    this.$showDetails.on('click', function () {
        self.$element.addClass('showing-details');
    });

    this.$hideDetails.on('click', function () {
        self.$element.removeClass('showing-details');
    });
};

DUET.NewUserView = function (user) {
    //todo:where is this view used?
    var isEdit = user instanceof DUET.Model,
        data = user || {};

    this.domElements = {
        $showDetails:'#show-form-details',
        $hideDetails:'#hide-form-details'
    };

    this.initForm({
        name:'user-edit',
        isModal:true,
        title:isEdit ? 'Edit Client' : 'New-- Client', //todo:lang
        data:data,
        submitAction:function (user) {
            DUET.reload();

            //todo:should be taken care of by routing or reload function
            DUET.panelTwo.setContent('client', 'x');
        }
    });

    this.populateCurrentValues();
};

DUET.NewUserView.prototype = new DUET.FormView();

DUET.NewUserView.prototype.bindEvents = DUET.NewClientView.prototype.bindEvents;

DUET.ArchiveProjectView = function (project) {
    //double confirm the deletion of projects
    DUET.confirm({
        title:ut.lang('archiveProject.title'),
        message:ut.lang('archiveProject.message', {name:project.name}),
        actionName:ut.lang('archiveProject.button'),
        callback:function () {
            DUET.panelTwo.panel.notify(ut.lang('archiveProject.inProgress'), false);
            $.when(project.archive()).done(function () {
                DUET.panelTwo.panel.$notification.fadeOut();
                DUET.navigate('projects/x');
            });
        }
    });
};

DUET.UnarchiveProjectView = function (project) {
    //double confirm the deletion of projects
    DUET.confirm({
        title:ut.lang('unarchiveProject.title'),
        message:ut.lang('unarchiveProject.message'),
        actionName:ut.lang('unarchiveProject.button'),
        callback:function () {
            DUET.panelTwo.panel.notify(ut.lang('unarchiveProject.inProgress'), false);
            $.when(project.unarchive()).done(function () {
                DUET.panelTwo.panel.$notification.fadeOut();
                DUET.navigate('projects/x');
            });
        }
    });
};

DUET.DeleteProjectView = function (project) {
    //double confirm the deletion of projects
    DUET.confirm({
        title:ut.lang('deleteProject.title'),
        message:ut.lang('deleteProject.message', {name:project.name}),
        actionName:ut.lang('deleteProject.button'),
        callback:function () {
            DUET.confirm({
                title:ut.lang('deleteProject.secondaryTitlte'),
                message:ut.lang('deleteProject.secondaryMessage', {name:project.name}),
                actionName:ut.lang('deleteProject.secondaryButton'),
                callback:function () {
                    DUET.panelTwo.panel.notify(ut.lang('deleteProject.inProgress'), false);
                    $.when(project.destroy()).done(function () {
                        DUET.panelTwo.panel.$notification.fadeOut();
                        DUET.navigate('projects/x');
                    });
                }
            });
        }
    });
};

DUET.DeleteTemplateView = function (project) {
    //double confirm the deletion of projects
    DUET.confirm({
        title:ut.lang('deleteTemplate.title'),
        message:ut.lang('deleteTemplate.message', {name:project.name}),
        actionName:ut.lang('deleteTemplate.button'),
        callback:function () {
            DUET.confirm({
                title:ut.lang('deleteTemplate.secondaryTitle'),
                message:ut.lang('deleteTemplate.secondaryMessage', {name:project.name}),
                actionName:ut.lang('deleteTemplate.secondaryButton'),
                callback:function () {
                    DUET.panelTwo.panel.notify(ut.lang('deleteTemplate.inProgress'), false);
                    $.when(project.destroy()).done(function () {
                        DUET.panelTwo.panel.$notification.fadeOut();
                        DUET.navigate('templates/x');
                    });
                }
            });
        }
    });
};

DUET.DeleteClientView = function (client) {
    //double confirm the deletion of projects
    DUET.confirm({
        title:ut.lang('deleteClient.title'),
        message:ut.lang('deleteClient.message', {name:client.name}),
        actionName:ut.lang('deleteClient.button'),
        callback:function () {
            DUET.confirm({
                title:ut.lang('deleteClient.secondaryTitle'),
                message:ut.lang('deleteClient.secondaryMessage', {name:client.name}),
                actionName:ut.lang('deleteClient.secondaryButton'),

                callback:function () {
                    DUET.panelTwo.panel.notify(ut.lang('deleteClient.inProgress'), false);
                    $.when(client.destroy()).done(function () {
                        DUET.panelTwo.panel.$notification.fadeOut();
                        DUET.panelTwo.panel.clearContent();
                        DUET.navigate('clients/x');
                    });
                }
            });
        }
    });
};

DUET.SearchResultsView = function (data) {
    this.template = 'global-search';

    this.needsUnloading();

    this.domElements = {
        $filter:'.filter-dropdown',
        $noResults:'#no-results-wrapper'
    };

    this.paramsToDecode = ['messages:message', 'tasks:task,projectName', 'projects:name', 'files:name,projectName'];

    this.initialize(data);
};

DUET.SearchResultsView.prototype = new DUET.View();

DUET.SearchResultsView.prototype.bindEvents = function () {
    var self = this;

    this.$element.on('click', '.list li', function () {
        var $this = $(this),
            id = $this.data('id'),
            type = $this.data('type'),
            projectId;

        DUET.navigate(self.model.getEntityUrl(type, id));
    });

    //todo:this (filter functionality) needs to be a separate view, it's used 3 times
    self.$filter.on('click', function (e) {
        self.$filter.addClass('open');
        e.stopPropagation();
    });

    self.$filter.on('click', 'li', function () {
        var $this = $(this);

        $this.addClass('selected').siblings().removeClass('selected');
        self.filter($this.data('filter-value'));

    });

    $('html').on('click.search-filter', function () {
        self.$filter.removeClass('open');
    });
};

DUET.SearchResultsView.prototype.filter = function (type) {
    var filterType;

    if (type != 'all') {
        var $typeResults = this.$element.find('#search-' + type + '-results');


        if ($typeResults.length)
            $typeResults.css('display', 'block').siblings().css('display', 'none');
        else this.noResults(type);

        filterType = type + 's';

    }
    else {
        this.$element.find('.search-entity').css('display', 'block');
        filterType = 'all';
    }

    DUET.panelTwo.panel.notify(ut.lang('globalSearch.resultsMessage', {type:filterType}));
};

DUET.SearchResultsView.prototype.noResults = function (type) {
    var $message = DUET.templateManager.$get('no-search-results', {type:type});

    this.$noResults.html($message).css('display', 'block');

    //hide any search entities that might be showing
    this.$noResults.siblings().css('display', 'none');
};

DUET.SearchResultsView.prototype.unloadProcessing = function () {
    $('html').off('click.search-filter');
};

DUET.ForgotPasswordView = function () {
    var self = this;

    this.needsUnloading();

    this.initForm({
        name:'forgot-password',
        submitAction:function () {
            self.$element.addClass('submitted');
        }
    });
};

DUET.ForgotPasswordView.prototype = new DUET.FormView();

DUET.ChangePasswordView = function () {
    this.initForm({
        name:'change-password',
        title:ut.lang('changePassword.title'),
        isModal:true,
        submitAction:function () {
            DUET.panelTwo.panel.notify(ut.lang('changePassword.passwordChanged'));
        }
    });
};

DUET.ChangePasswordView.prototype = new DUET.FormView();

DUET.SendPasswordView = function (user) {
    this.initForm({
        name:'send-password',
        title:ut.lang('sendPassword.title'),
        isModal:true,
        data:{userId:user.id},
        submitAction:function () {
            DUET.panelTwo.panel.notify(ut.lang('changePassword.passwordSent'));
        }
    });
};

DUET.SendPasswordView.prototype = new DUET.FormView();

DUET.AdminView = function () {
    this.template = 'admin-settings';

    this.domElements = {
        $newAdmin:'#new-admin-button',
        $buildLanguage:'#build-language-button',
        $checkForUpdate:'#check-for-update'
    };

    this.initialize({version:DUET.version});
};

DUET.AdminView.prototype = new DUET.View();

DUET.AdminView.prototype.bindEvents = function () {
    var alert;

    this.$newAdmin.on('click', function () {
        new DUET.NewAdminView();
    });

    this.$buildLanguage.on('click', function(){


        alert = DUET.alert(ut.lang('adminSettings.buildingTemplates'), false);

        new DUET.Request({
            url:'language/rebuild/en',
            success:function(response){

                if(response.isValid())
                {
                    location.reload(true);
                }
                else{

                    alert.close();
                    if(response.data.template)
                        DUET.alert(response.data.template[0]);

                }
            }
        });
    });

    this.$checkForUpdate.on('click', function () {
        DUET.checkForUpdates(true);
    });
};








//List
DUET.ListView = function (data, map, selectedId) {

    var self = this, listClass;

    this.map = map;

    this.selectedId = selectedId;

    this.template = 'list';

    this.modelType = DUET.utils.lcFirst(data.model);

    if ($.inArray(this.modelType, ['project', 'task']) == -1) {
        listClass = 'no-status';
    }

    data.models = $.map(data.models, function (item, key) {
        var mappedItem = {};

        $.extend(mappedItem, item.modelParams());

        if(self.map){
            $.each(self.map, function (key, value) {
                if (item[value])
                    mappedItem[key] = item[value];
            });
        }
        else DUET.utils.debugMessage('List View: no map found for ' + item.type);


        mappedItem.id = item.id;
        mappedItem.statusText = item.statusText;

        return mappedItem;
    });

    this.paramsToDecode = ['listItems:title,meta1,meta2'];

    this.initialize({listItems:data.models, listClass:listClass});

    self.collection = data;

};

DUET.ListView.prototype = new DUET.View();

DUET.ListView.prototype.postRenderProcessing = function () {
    if (this.selectedId)
        this.setSelected(this.selectedId);

    this.$element.nanoScroller();
};

DUET.ListView.prototype.bindEvents = function () {
    var self = this;

    self.$element.on('click', 'li', function () {
        DUET.navigate(self.modelType + 's/' + $(this).data('id'));
    });

    $(window).on('resize.listview', function () {
        self.$element.nanoScroller();
    });
};

DUET.ListView.prototype.unloadProcessing = function () {
    $(window).off('resize.listview');
};

DUET.ListView.prototype.setSelected = function (idOrItem) {
    var self = this, $listItem;

    if (idOrItem instanceof jQuery)
        $listItem = idOrItem;
    else $listItem = self.$element.find('[data-id=' + idOrItem + ']');
    //TODO: I'm going to need to make sure the selected item is in view and if not, scroll

    self.$element.find('.selected').removeClass('selected');
    $listItem.addClass('selected');
};

DUET.PanelLoadingView = function () {
    this.template = 'panel-loading';

    this.initialize();
};

DUET.PanelLoadingView.prototype = new DUET.View();

DUET.NoSelectionView = function () {
    this.template = 'panel-no-selection';

    this.initialize();
};

DUET.NoSelectionView.prototype = new DUET.View();

DUET.RunningTimerView = function(taskModel){
    //todo: when we leave a task and navigate back, then click the timer tab, the timer should sync with the running timer view
    this.template = 'running-timer';

    this.domElements = {
        $elapsed:'.timer-elapsed',
        $stop:'.timer-stop'
    };

    this.initialize(taskModel);

    this.addTo({
        $anchor:DUET.sidebarViewInstance.$runningTimerSpace
    });
};

DUET.RunningTimerView.prototype = new DUET.View();

DUET.RunningTimerView.prototype.setTime = function(time){
    this.$elapsed.html(time);
};

DUET.RunningTimerView.prototype.bindEvents = function(){
    var self = this;

    this.$element.on('click', function(){
        DUET.navigate(self.model.url());
    });

    this.$stop.on('click', function(e){
        DUET.runningTimer.stop();

        DUET.runningTimer = null;
        DUET.runningTimerView = null;


        self.blink(self.$elapsed, 3, function () {
            self.$element.fadeOut(400, function () {
                self.unload();
            });
        });

        DUET.evtMgr.publish('runningTaskTimerStopped');

    });
};

DUET.RunningTimerView.prototype.blink = function($el, times, callback){
        var self = this;

        //hide the el
        $el.css('opacity', 0);

        //wait 300 ms then show the el
        setTimeout(function(){
            $el.css('opacity', 1);

            //if we're still blinking wait 300ms before hiding the el again
            if(times > 0){
                setTimeout(function(){
                    self.blink($el, times - 1, callback);
                }, 300);
            }
            else setTimeout(callback, 300);
        }, 300);

    //callback();
};

DUET.NewProjectFromTemplateView = function(templateModel){
    this.initForm({
        name:'new-project-from-template',
        isModal:true,
        title:ut.lang('newProjectFromTemplateForm.title'),
        data:templateModel.createProject(),
        submitAction:function (project) {

        }
    });
};

DUET.NewProjectFromTemplateView.prototype = new DUET.FormView();

DUET.NewProjectFromTemplateView.prototype.postInitProcessing = function(){
    var self = this,
        form = new DUET.NewProjectView(this.model, false);
    this.$element.find('#template-project-form').append(form.$element);
form.model.on('saved', function(e, response){
    //todo:huge hack, getting errors on ckeditor and with primary list loading if I remove this.
    setTimeout(function(){
        DUET.navigate('projects/' + response.data);
        self.close();
    }, 1000);

});


};



DUET.PanelFilterView = function (data) {
    this.template = 'panel-filter';

    this.domElements = {
        $selectedFilterName:'.selected-filter-name'
    };

    data.selected = this.getDefaultFilter(data.filters).name;

    this.collectionToFilter = data.collection;

    this.initialize(data);
};

DUET.PanelFilterView.prototype = new DUET.View();

DUET.PanelFilterView.prototype.getDefaultFilter = function(filters){

        var defaultFilter = '';

        $.each(filters, function (i, filter) {
            if (filter.isDefault && filter.isDefault === true) {
                defaultFilter = filter;
                return false;
            }
        });

        return defaultFilter;

};

DUET.PanelFilterView.prototype.filter = function(filterParam, filterValue){
    var filter = {}, filtered;

    filter[filterParam] = filterValue;

     return this.collectionToFilter.filter(filter);
};

DUET.PanelFilterView.prototype.bindEvents = function () {
    var self = this;

    this.$element.on('click', function (e) {
        self.$element.addClass('active');
        e.stopPropagation();
    });

    this.$element.on('click', 'li', function (e) {
        var $this = $(this), filtered;
        $this.addClass('selected').siblings().removeClass('selected');

        //hide the filter dropdowm
        self.$element.removeClass('active');

        //update the filter dropdown text
        self.$selectedFilterName.text($this.text());

        filtered = self.filter($this.data('param'), $this.data('value'))

        self.publish('filterApplied', filtered);

        //id we don't stop propagation, the $element level click handler will add the active class, keeping the filter
        //visible
        e.stopPropagation();
    });
    $('html').on('click.panel-filter-' + self.id, function () {
        self.$element.removeClass('active');
    });

};

DUET.PanelFilterView.prototype.unloadProcessing = function () {
    $('html').off('click.panel-filter-' + +this.id);
};

DUET.PanelSortView = function(){
    this.template = 'panel-sort';



    this.initialize();
};

DUET.PanelSortView.prototype = new DUET.View();

DUET.PanelSortView.prototype.bindEvents = function(){
    var self = this, order;

    this.$element.on('click', function(){

        if(self.order == 'descending')
            self.order = 'ascending';
        else self.order = 'descending';

        self.$element.removeClass('ascending descending').addClass(self.order);

        self.publish('sorted', self.order);


    });
};

DUET.DisplayUpgradeBanner = function () {
    var self = this;

    function doInit(){
        self.template = 'upgrade-banner';

        self.domElements = {
            $close:'.close',
            $button:'.button'
        };

        self.initialize({text:'Upgrade to Duet for Invoicing, Payments, Client Logins, and Team Functionality.'});

        self.addTo({$anchor:DUET.sidebarViewInstance.$runningTimerSpace});
    }


    if($.inArray(new Date().getUTCDate(), [8, 21]) != -1)
        doInit();

};

DUET.DisplayUpgradeBanner.prototype = new DUET.View();

DUET.DisplayUpgradeBanner.prototype.bindEvents = function(){
    var self = this;

    this.$close.on('click', function(e){
        self.unload();

        e.stopPropagation();
    });

    this.$button.on('click', function(){
        window.location = 'http://www.duetapp.com'
    });
};

DUET.insertProfileImage = function ($element, model) {
    if (model && model.userImage && model.userImage.length) {
        $element.find('.user-image').append('<img src="' + model.userImage + '"/>')
            .attr('href', '#users/' + model.userId);
    }
};



//TODO: this shouldn't be here...
$(function () {
    DUET.start();
});