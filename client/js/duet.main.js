var DUET = DUET || {};

DUET.config = {};

DUET.panelOne = {};

DUET.panelTwo = {};

DUET.sidebar = {};

DUET.layoutMgr = {};

DUET.messagesSidebar = {};    //todo:this may not be used

DUET.options.defaultProjectTab = 'details';

DUET.$appWrapper = false;

//todo:is this used? we have addTo...
DUET.addView = function (options) {

    var view = new DUET[options.view](options.data);

    options.$anchor.append(view.$get());

    if (view.postRenderProcessing)
        view.postRenderProcessing();
};

DUET.ContextManager = function () {
    var context;

    DUET.router.on('all', function () {
        var fragmentParts, modelType, modelId, secondaryModelType, secondaryModelId;

        fragmentParts = DUET.history.fragment.split('/');
        //if this is actually a model, it will be plural, we need to remove the s
        modelType = fragmentParts[0].slice(0, -1);
        modelId = fragmentParts[1];

        //if there is a secondary model, then the secondary model is the context
        //i.w. projects/2/files/4 would yield a context of file, 4
        if (fragmentParts[2] && fragmentParts[3]) {
            secondaryModelType = fragmentParts[2].slice(0, -1);
            secondaryModelId = fragmentParts[3];
            DUET.context(secondaryModelType, secondaryModelId);
        }
        else if (modelId) {
            //there is no secondary model, so the primary model is the context
            DUET.context(modelType, modelId);
        }
        else {
            //the url is in the format '#projects' a list with no specific model id, and therefore no context
        }

    });

    DUET.history.on('beforeRoute', function () {
        DUET.clearContext();
    });
};

/****************************************
 Modules
 ****************************************/
//Base Module
//todo:get rid of this in favor of views
DUET.Module = function () {
    this.cssSelectors = {};

    this.$element = {};

    this.evtMgr = DUET.evtMgr;

};

DUET.Module.prototype.cssSelector = function (selectorName) {
    var self = this;

    if (self.cssSelectors[selectorName])
        return self.cssSelectors[selectorName];
    else return false;
};

DUET.Module.prototype.cssClass = function (selectorName) {
    var self = this;

    if (self.cssSelectors[selectorName])
        return self.cssSelectors[selectorName].substr(1);
    else return false;
};

DUET.Module.prototype.initialize = function () {
    if (this.load)
        this.load();

    if (this.render)
        this.render();
};

DUET.Module.prototype.debugMessage = function () {
    DUET.utils.debugMessage.apply(this);
};

DUET.Module.prototype.run = function (callback) {
    DUET.utils.run.apply(this, arguments);
};

//Layout Module
DUET.LayoutManager = function () {
    var self = this,
        state, sel, c,
        $domWindow, $appWindow, $sidebar, verticalMargin, horizontalMargin, headerHeight;

    //the css selectors used by the layout manager
    this.cssSelectors = {
        sidebar:'#sidebar',
        appWindow:'.window'
    };

    //maintains the state of each of the layout components
    state = {
        sidebarWidth:0 //TODO: used?
    };

    //quick access to the cssSelector and cssClass functions
    sel = self.cssSelector.bind(this);

    init_base_layout();

    //save references to each of the dom elements required to manage the layout
    $domWindow = $(window);
    $appWindow = $(sel('appWindow'));
    $sidebar = $(sel('sidebar'));

    var sidebarWidth = $sidebar.width();

    function initialize() {
        state.sidebarWidth = $sidebar.width();

        verticalMargin = parseInt($appWindow.css('margin-top'), 10) + parseInt($appWindow.css('margin-bottom'), 10);
        headerHeight = $('#header-wrapper').height();
        horizontalMargin = parseInt($appWindow.css('margin-left'), 10) + parseInt($appWindow.css('margin-right'), 10);
        resize();

        $appWindow.animate({'opacity':1});
    }

    function init_base_layout() {
        DUET.$appWrapper = DUET.templateManager.$get('base-layout');
        $('body').append(DUET.$appWrapper);
    }

    function resize() {
        $appWindow.height($domWindow.height() - verticalMargin - headerHeight); //.width($domWindow.width() - sidebarWidth - horizontalMargin);
    }

    function hideMessages() {
        $appWindow.removeClass('messages-open').addClass('messages-closed');
    }

    function showMessages() {
        $appWindow.removeClass('messages-closed').addClass('messages-open');
    }

    //event handlers
    $domWindow.resize(resize);

    initialize();

    return{
        resize:resize,
        hideMessages:hideMessages,
        showMessages:showMessages
    }
};

DUET.LayoutManager.prototype = new DUET.Module();

DUET.MessagesPanelManager = function () {
    function hideMessages() {
        DUET.layoutMgr.hideMessages();
        DUET.messagesViewInstance.hide();
        DUET.evtMgr.publish('messages-panel-hidden');
    }

    function showMessages() {
        DUET.layoutMgr.showMessages();
        DUET.messagesViewInstance.show();
        DUET.evtMgr.publish('messages-panel-showing');
    }

    return{
        hideMessages:hideMessages,
        showMessages:showMessages
    }
};

//TODO: ALl of these are views (button, button set, list) not modules. A module is a collection of views that work together for some purpose

//Button //todo:this should be a veiw
DUET.Button = function (options) {
    this.options = options;

    this.buttonText = options.buttonText; //Make sure there is consistency in there I am setting these values, constructor or load? Perhaps load funciton is replaced entirely by a model?

    this.buttonType = this.options.buttonType || 'flat-button';

    this.buttonId = options.buttonId;

    this.initialize();
}; //TODO: Should I combine button and button set? They are extremely similar in terms of the code that was written

DUET.Button.prototype = new DUET.Module();

DUET.Button.prototype.render = function () {
    var self = this;

    self.$element = DUET.templateManager.$get('button', {
        buttonId:self.buttonId,
        buttonType:self.buttonType,
        buttonText:self.buttonText
    });
};

DUET.Button.prototype.setAction = function (action) {
    var self = this;

    self.$element.click(function () {
        self.run(action, this);
    });

    if (self.options.action)
        this.setAction(self.options.action);
};

/****************************************
 Panel Managers
 ****************************************/
DUET.PanelManager = function () {
    this.anchor = $('.window');

    this.content = $();

    this.actions = [
        {panelAction:'+', actionUrl:'#'}
    ];

    this.panel = {};

    this.cssSelectors = {};
};

DUET.PanelManager.prototype.buildPanel = function () {
    var self = this;

    self.panel = new DUET.PanelView({
        id:self.id,
        isPrimary:self.isPrimary,
        type:self.isPrimary ? '' : 'secondary',
        title:self.title,
        anchor:self.anchor,
        content:self.content, //TODO: Where is this getting set?
        actions:self.actions
    });

    self.panel.$element.appendTo(self.anchor);
};

//Primary Panel
DUET.PrimaryPanelManager = function () {
    var self = this;

    this.id = 'panel-one';

    this.isPrimary = true;

    this.isHidden = false;

    this.anchor = $('.window');

    this.content = $();

    this.$action = false;

    this.panel = {};

    this.model = '';

    this.title = '';

    this.collection = {};

    this.firstItem = {};

    this.maps = {
        task:{
            title:'task',
            meta1:'notes'
        },
        project:{
            title:'name',
            meta1:'clientName',
            meta2:'dueDateHumanized'
        },
        template:{
            title:'name',
            meta1:'clientName',
            meta2:'dueDateHumanized'
        },
        client:{
            title:'name',
            meta1:'email'
        },
        user:{
            title:'name',
            meta1:'email'
        },
        file:{
            title:'name'
        }
    };

    this.list = {};

    this.actions = [
        {panelAction:'+', actionUrl:'#'}
    ];

    this.filters = {
        project:[
            {name:ut.lang('filters.inProgress'), value:0, param:'isArchived'},
            {name:ut.lang('filters.archived'), value:1, param:'isArchived'},
            {name:ut.lang('filters.all'), value:'*', param:'isArchived', isDefault:true}
        ],
    };

    function showHidePanelAction() {

        if (self.model == 'client' || self.model == 'project' || self.model == 'template') {
            self.$action.css('display', 'block');
        }
        else self.$action.css('display', 'none');
    }

    function draw(collection, map, selectedId) {
        //remove the previous list view if it exists
        if (self.listView)
            self.listView.unload();

        self.panel.notify('loading', false);

        collection.on('loaded', function () {
            self.listView = new DUET.ListView(collection, map, selectedId);

            self.panel.hideNotification();

            self.listView.addTo({
                $anchor:self.panel.$element,
                position:'append'
            });
        });
    }

    function processFiltered(filtered) {
        var collection;

        collection = new DUET.Collection({model:self.model});

        self.filtered = collection;

        draw(collection, self.maps[self.model]);

        collection.load(filtered);
    }

    function initFilter() {
        var filters, defaultFilter;

        if (self.panelFilter)
            self.panelFilter.unload();

        if (!self.filters[self.model])
            return;

        filters = self.filters[self.model];

        self.panelFilter = new DUET.PanelFilterView({
            collection:self.collection,
            filters:filters
        });

        self.panelFilter.addTo({$anchor:self.$panelFilterWrapper});

        self.panelFilter.on('filterApplied', function (e, filtered) {
            processFiltered(filtered);
        });
    }

    function initSort() {

        if (self.panelSort)
            self.panelSort.unload();

        if (self.model != 'project')
            return false;

        self.panelSort = new DUET.PanelSortView();
        self.panelSort.addTo({$anchor:self.$panelSortWrapper});

        self.panelSort.on('sorted', function (e, order) {
            var collectionToSort,
                collection,
                sortOrder = order == 'descending' ? 'desc' : 'asc';

            if (self.filtered)
                collectionToSort = self.filtered;
            else collectionToSort = self.collection;

            collectionToSort.sort('createdDate', sortOrder);

            collection = new DUET.Collection({model:self.model});

            draw(collection, self.maps[self.model]);

            collection.load(collectionToSort.models);
        });
    }

    this.setContent = function (model, selectedId) {
        var panelLoaded = new $.Deferred(),
            loadingView = new DUET.PanelLoadingView();

        if (this.isHidden)
            this.show();

        //x is a special id that the app will use to indicate that the list needs to be updated regardless of whether
        //the model changed (i.e. when deleting items from the list)
        if (!this.model || this.model !== model || selectedId == 'x') {
            this.model = model;

            self.panel.setTitle(ut.lang('sidebar.' + model + 's')); //DUET.utils.ucFirst(model) + 's');

            self.collection = new DUET.Collection({model:model});

            initFilter();
            initSort();

            self.collection.on('loaded', function () { //TODO: Is this redundant? I'm checking whether the collection is loaded in the list object

                self.firstItem = self.collection.getFirst();
                panelLoaded.resolve();
            });

            //self.firstItem = self.collection.getFirst();
            showHidePanelAction();

            //remove the previous list view if it exists
            if (self.listView)
                self.listView.unload();

            self.panel.notify('loading', false);

            self.collection.on('loaded', function () {
                self.listView = new DUET.ListView(self.collection, self.maps[model], selectedId);

                self.panel.hideNotification();

                self.listView.addTo({
                    $anchor:self.panel.$element,
                    position:'append'
                });
            });

            self.collection.load();
        }
        else {

            //the model hasn't changed so no need to update the list, but we still want to change the selected item
            self.listView.setSelected(selectedId);
            panelLoaded.resolve();
        }

        return panelLoaded;
    };

    //useful if we want to force the list to reload (i.e. when we've just added a new item to the list
    this.reset = function () {
        this.model = false;
    };

    this.buildPanel();

    //todo: i can use the view domElements function?
    this.$listWrapper = this.panel.$element.find('.list-wrapper');

    this.$panelFilterWrapper = this.panel.$element.find('.panel-filter-wrapper');

    this.$panelSortWrapper = this.panel.$element.find('.panel-sort-wrapper');

    this.$action = this.panel.$element.find('.panel-action');

    this.$action.click(function () {
        new DUET['New' + DUET.utils.ucFirst(self.model) + 'View']();
    });

    this.hide = function () {
        self.isHidden = true;
        self.panel.$element.closest('.window').addClass('one-panel');
    };

    this.show = function () {
        self.isHidden = false;
        self.panel.$element.closest('.window').removeClass('one-panel');
    };
};

DUET.PrimaryPanelManager.prototype = new DUET.PanelManager();

//Secondary Panel
DUET.SecondaryPanelManager = function () {
    var self = this, sel, c;

    this.isPrimary = false;

    this.id = 'panel-two';

    this.title = '';

    this.anchor = $('.window');

    this.content = $();

    this.$actions = false;

    this.$actionsWrapper = false;

    this.panel = {};

    //this panel may be based on a specific item(i.e. a project)
    this.item = {};

    this.itemCategories = {};

    this.messagesButton = {};

    this.loadingView = new DUET.PanelLoadingView();

    this.noSelectionView = new DUET.NoSelectionView();

    this.setContent = function ($content) {
        self.panel.setContent($content);
    };

    this.setInnerContent = function ($content) {
        self.panel.setInnerContent($content);
    };

    this.setTitle = function (title) {
        self.panel.$title.text(DUET.utils.html_entity_decode(title));
    };

    //todo:consider using DUET.context instead of storing reference to the model
    this.setModel = function (model) {
        var rebuildCategories;

        if (typeof model != 'undefined') {
            if (!self.model) {
                rebuildCategories = true;
            }
            else {
                rebuildCategories = (typeof self.model !== 'undefined') && (self.model.type != model.type);
            }

        }

        self.model = model;

        if (rebuildCategories)
            buildProjectItemCategories();

        self.setActions();
    };

    this.setTitleWidget = function (view) {
        self.panel.setTitleWidget(view);
    };

    this.removeTitleWidget = function () {
        self.panel.removeTitleWidget();
    };

    this.destroy = function () {
        $(window).off('resize.secondaryPanelManager');
    };

    this.setActions = function () {
        //todo:clean this up. Perhaps an addAction function
        if (self.model && self.model.type == 'project') {
            self.actions = [
                {panelAction:ut.lang('panelActions.edit'), actionUrl:'#', id:'edit-panel-entity'}
            ];

            if (self.model.isArchived == 0)
                self.actions.push({panelAction:ut.lang('panelActions.archive'), actionUrl:'#', id:'archive-panel-entity'});
            else self.actions.push({panelAction:ut.lang('panelActions.moveToInProgress'), actionUrl:'#', id:'unarchive-panel-entity'});

            self.actions.push({panelAction:ut.lang('panelActions.delete'), actionUrl:'#', class:'danger', id:'delete-panel-entity'});

        }
        else if (self.model && $.inArray(self.model.type, ['client', 'user']) !== -1) {
            self.actions = [
                {panelAction:ut.lang('panelActions.edit'), actionUrl:'#', id:'edit-panel-entity'},
                {panelAction:ut.lang('panelActions.delete'), actionUrl:'#', class:'danger', id:'delete-panel-entity'}
            ];
        }
        else if (self.model && self.model.type == 'template') {
            self.actions = [

                {panelAction:ut.lang('panelActions.newProjectFromTemplate'), actionUrl:'#', class:"go", id:'new-project-from-template'},
                {panelAction:ut.lang('panelActions.edit'), actionUrl:'#', id:'edit-panel-entity'},
                {panelAction:ut.lang('panelActions.delete'), actionUrl:'#', class:'danger', id:'delete-panel-entity'}

            ];
        }
        else {
            self.actions = [];
        }

        var $actions = DUET.templateManager.$get('panel-actions', {actions:self.actions});

        self.$actions.html($actions);
    };

    //Not using the SecondaryPanelManager.prototype because there should only be one SecondaryPanelManger
    function initialize() {
        var projectItemCategories, messagesButton;

        self.buildPanel();

        buildProjectItemCategories();
        self.panel.addToMainMenu(self.itemCategories.$element, true);

        //initially, there will be nothing selected
        self.panel.clearContent(self.noSelectionView);

        self.panel.resize();
    }

    function buildProjectItemCategories() {

        var buttons, projectItemCategories;

        buttons = [
            {buttonId:'project-details', buttonText:ut.lang('projectTabs.details')},
            {buttonId:'project-calendar', buttonText:ut.lang('projectTabs.calendar')},
            {buttonId:'project-tasks', buttonText:ut.lang('projectTabs.tasks')},
            {buttonId:'project-files', buttonText:ut.lang('projectTabs.files')},
            {buttonId:'project-notes', buttonText:ut.lang('projectTabs.notes')}
        ];

        var buttonsToRemove = DUET.modulesToHide;

        if (self.model && self.model.type == 'template') {
            buttonsToRemove = buttonsToRemove.concat(['Calendar', 'Invoices']);
        }

        buttons = buttons.filter(function (value) {
            //$.inArray(value.buttonText, buttonsToRemove);
            return $.inArray(value.buttonText, buttonsToRemove) == -1;
        });

        projectItemCategories = new DUET.ButtonSetView({
            buttons:buttons
        });

        projectItemCategories.setAction(function (button) {
            var type = $(button).attr('id').substr(8);
            DUET.navigate(self.model.type + 's/' + self.item.id + '/' + type);
        });

        self.panel.clearMainMenu();
        self.panel.addToMainMenu(projectItemCategories.$element);

        self.itemCategories = projectItemCategories;

        return projectItemCategories;
    }

    $(window).on('resize.secondaryPanelManager', function () {
        self.panel.resize();
    });

    DUET.evtMgr.subscribe('contextChanged', function () {
        self.setContent(self.loadingView.$get());
    });

    DUET.evtMgr.subscribe('contextCleared', function () {
        self.panel.clearContent(self.noSelectionView);
    });

    DUET.evtMgr.subscribe('setSecondaryContent', function (e, contentDetails) {
        var view = new DUET[contentDetails.view](contentDetails.data);

        self.setInnerContent(view.$get());
    });

    DUET.evtMgr.subscribe('secondaryContentUpdated', function () {
        self.panel.resize();
    });

    initialize();

    this.$actions = this.panel.$element.find('.panel-actions');

    //todo: this needs to be tied to setActions
    this.panel.$element.on('click', '#edit-panel-entity', function () {
        new DUET['New' + DUET.utils.ucFirst(self.model.type) + 'View'](self.model);
    });

    this.panel.$element.on('click', '#delete-panel-entity', function () {
        var type = self.model.type;

        DUET['Delete' + DUET.utils.ucFirst(type) + 'View'](self.model);
    });

    this.panel.$element.on('click', '#new-project-from-template', function () {
        new DUET.NewProjectFromTemplateView(self.model);
    });

    this.panel.$element.on('click', '#archive-panel-entity', function () {
        DUET['Archive' + DUET.utils.ucFirst(self.model.type) + 'View'](self.model);
    });

    this.panel.$element.on('click', '#unarchive-panel-entity', function () {
        DUET['Unarchive' + DUET.utils.ucFirst(self.model.type) + 'View'](self.model);
    });
};

DUET.SecondaryPanelManager.prototype = new DUET.PanelManager();

DUET.initModulesToHide = function () {
    var modulesToHide = DUET.config.modules_to_hide.split(',');
    $.each(modulesToHide, function (i, moduleName) {
        modulesToHide[i] = $.trim(moduleName);
    });

    DUET.modulesToHide = modulesToHide;
};

DUET.buildLayout = function () {
    DUET.layoutMgr = new DUET.LayoutManager();
    DUET.panelOne = new DUET.PrimaryPanelManager();
    DUET.panelTwo = new DUET.SecondaryPanelManager();
    DUET.messagesMgr = new DUET.MessagesPanelManager();

    DUET.sidebarViewInstance = new DUET.SidebarView();
    DUET.sidebarViewInstance.addTo({$anchor:$('#sidebar'), position:'append'});

//    DUET.headerViewInstance = new DUET.HeaderView();
//    DUET.headerViewInstance.addTo({$anchor:$('#header-container')});

    DUET.messagesViewInstance = new DUET.MessagesPanelView();
    DUET.messagesViewInstance.addTo({$anchor:$('.inner-right'), position:'append'});

    new DUET.DisplayUpgradeBanner();

    DUET.initComplete = true;

};

DUET.initViewCommonParams = function () {
    DUET.viewCommonParams = {
        currencySymbol:DUET.config.currency_symbol
    };
};

DUET.loadConfig = function () {
    var configRequest;

    //load the client side config options
    configRequest = new DUET.Request({
        url:'app/config',
        success:function (response) {
            if (response.isValid()) {
                DUET.config = response.data;
                DUET.initViewCommonParams();
            }
        }
    });

    return configRequest;
};

DUET.loadLanguage = function () {
    var langRequest;

    //load the client side config options
    langRequest = new DUET.Request({
        url:'app/language',
        success:function (response) {
            if (response.isValid()) {
                DUET.language = response.data;
            }
        }
    });

    return langRequest;
};

DUET.checkForUpdates = function (force) {
    var lastUpdateCheck = 'duet_last_update_check_date',
        updateAvailable = 'duet_update_available',
        updateDismissed = 'duet_update_notification_dismissed';

    //todo: all the logic is on the client side because the version number isn't currently stored anywhere on the server side. We nee to move the version to the server and then move this logic as well
    function supports_html5_storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    function isPositiveInteger(x) {
        // http://stackoverflow.com/a/1019526/11236
        return /^\d+$/.test(x);
    }

    //  0 if they're identical
    //  negative if v1 < v2
    //  positive if v1 > v2
    //  Nan if they in the wrong format
    //  assert(version_number_compare("1.7.1", "1.6.10") > 0);
    //  assert(version_number_compare("1.7.1", "1.7.10") < 0);
    // modified version taken from http://stackoverflow.com/a/6832721/11236

    function compareVersionNumbers(v1, v2) {
        if (!v1 || !v2)
            return 0;

        var v1parts = v1.split('.');
        var v2parts = v2.split('.');

        // First, validate both numbers are true version numbers
        function validateParts(parts) {
            for (var i = 0; i < parts.length; ++i) {
                if (!isPositiveInteger(parts[i])) {
                    return false;
                }
            }
            return true;
        }

        if (!validateParts(v1parts) || !validateParts(v2parts)) {
            return NaN;
        }

        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return 1;
            }

            if (parseInt(v1parts[i], 10) === parseInt(v2parts[i], 10)) {
                continue;
            }
            if (parseInt(v1parts[i], 10) > parseInt(v2parts[i], 10)) {
                return 1;
            }
            return -1;
        }

        if (v1parts.length != v2parts.length) {
            return -1;
        }

        return 0;
    }

    function generateNotification() {
        var updateUrl = 'http://www.getsoloapp.com/latest',
            html = '<div class="header-notification">An update is available. ' +
                '<a href="' + updateUrl + '" target="_blank">View details</a>' +
                '<span class="close" title="close">x</span></div>',
            $notification = $(html);

        $notification.on('click', '.close', function () {
            $notification.fadeOut(function () {
                $notification.remove();
                localStorage[updateDismissed] = 1;
            });
        });

        return $notification;
    }

    function displayNotification() {
        DUET.sidebarViewInstance.$notificationSpace.append(generateNotification());
        localStorage[updateAvailable] = 1;
        localStorage[updateDismissed] = 0;
    }

    function doCheckForUpdate() {
        new DUET.Request({
            url:'versions/get_latest',
            success:function (response) {
                if (compareVersionNumbers(response.data.version, DUET.version) > 0) {
                    displayNotification();
                }
                else {
                    localStorage[updateAvailable] = 0;
                    localStorage[updateDismissed] = 0;
                }

            }
        });

        localStorage[lastUpdateCheck] = new Date().getTime();
    }

    if (supports_html5_storage()) {
        var lastUpdateCheckDate = localStorage[lastUpdateCheck],
            checkForUpdate = false;

        if (lastUpdateCheckDate) {
            var differenceInDays = (new Date().getTime() - lastUpdateCheckDate) / 86400000;

            if (differenceInDays > 3)
                checkForUpdate = true;

        }
        else checkForUpdate = true;

    }

    //this will check for an update every three days. If an update is available, the notification will display until it
    //is dismissed.
    if (checkForUpdate || force === true) {
        doCheckForUpdate();
    }
    else if (localStorage[updateAvailable] == 1 && localStorage[updateDismissed] != 1) {
        displayNotification();
    }

};

DUET.start = function (newLogin) {
    var self = this,
        continueStart = false,
        loginCheckRequest, appStarted = $.Deferred();

    function doStart() {
        loginCheckRequest = DUET.Request({
            url:'app/logged_in',
            success:function (response) {
                if (response.auth != 'not_logged_in')
                    continueStart = true;
            }
        });

        $.when(loginCheckRequest.isComplete).done(function () {
            if (continueStart) {
                DUET.applyLocalization();

                DUET.initModulesToHide();

                DUET.buildLayout();

                DUET.contextMgr = new DUET.ContextManager();

                //we need to manually call the resize function once the main components have been built
                DUET.layoutMgr.resize();

                appStarted.resolve();

                if (!DUET.history || !DUET.history.started)
                    DUET.history.start();

                if (DUET.userIsAdmin())
                    DUET.checkForUpdates();

                //todo: i probably should't show the screen until after the layout manager is finished loading?
            }
            else if (DUET.isPublicRoute()) {
                if (!DUET.history || !DUET.history.started)
                    DUET.history.start();

            }
        });
    }

    //we can't do anything without the router, so lets make sure it's initialized
    if (!DUET.router) {
        //start the history and the app router
        DUET.history = new DUET.History();
        DUET.router = new DUET.Router(DUET.routes);
    }

    DUET.templateManager = new DUET.TemplateManager();

    $.when(DUET.templateManager.loadingTemplatesPromise).done(function () {
        $.when(DUET.loadConfig().isComplete).done(function () {
            $.when(DUET.loadLanguage().isComplete).done(function () {
                doStart();
            });
        });
    });
//    $.when(DUET.templateManager.loadingTemplatesPromise, DUET.loadConfig(), DUET.loadLanguage()).done(function() { //TODO: I should have some kind of global on function
//
//    });

    return appStarted;
};

DUET.stop = function (message) {
    if (!DUET.history || !DUET.history.started)
        DUET.history.start();

    if (DUET.sidebarViewInstance)
        DUET.sidebarViewInstance.unload();

    if (DUET.headerViewInstance)
        DUET.headerViewInstance.unload();

    if (DUET.messagesViewInstance)
        DUET.messagesViewInstance.unload();

    if (DUET.$appWrapper)
        DUET.$appWrapper.remove();

    //todo:this should stop history or the router or both
    if (!$('.login-window').length) {
        DUET.addView({
            view:'LoginView',
            data:{message:message},
            $anchor:$('body')
        }); //todo: replace with the view.addTo funciton
    }
};

DUET.error = function (message) {
    var error = DUET.templateManager.$get('error');
    return error.prepend(message);
};

DUET.notice = function (message) {
    var error = DUET.templateManager.$get('notice');
    return error.prepend(message);
};

