var DUET = DUET || {};


DUET.routes = {
    routes:{
        'projects/:id/:entityType':'projectEntityList',
        'projects/:id/:entityType/:entityId':'projectEntity',
        'projects/:id':'projectEntityList',
        'projects':'projectEntityList',
        'templates/:id/:entityType':'templateEntityList',
        'templates/:id/:entityType/:entityId':'templateEntity',
        'templates/:id':'templateEntityList',
        'templates':'templateEntityList',
        'tasks/:id':'task',
        'tasks':'task',
        'clients/:id':'client',
        'clients':'client',
        'files':'file',
        'files/:id':'file',
        'login':'login',
        'logout':'logout',
        'dashboard':'dashboard',
        'profile':'myProfile',
        'search/:query':'search',
        'forgot_password':'forgotPassword',
        'admin':'admin',
        '':'dashboard'
    },
    projectEntityList:function (projectId, entityType, projectType) {
        var args, panelLoaded, params;

        projectType = projectType || 'project';

        panelLoaded = DUET.routeHelpers.initPrimaryPanel(projectType, projectId);
        args = arguments;

        $.when(panelLoaded).done(function () {
            params = DUET.routeHelpers.initSecondaryPanel(args);

            if(params.project){
                DUET.panelTwo.setTitle(params.project.name);
                DUET.panelTwo.setModel(params.project);
            }

            function collectionHandler() {
                var collection, view;

                collection = new DUET.Collection({
                    model:params.activeModelSingular,
                    url:params.project.entityUrl(params.activeModelSingular)
                });

                //todo: maybe some kind of loading text while the collection is loading for slow connections
                //TODO:clicking on any of these list items reloads the entire page. not cool
                collection.on('loaded', function () {
                    view = new DUET[DUET.utils.ucFirst(params.activeModelSingular) + 'ListView'](collection, params.project);
                    DUET.routeHelpers.panelTwoHandler(params, view);
                });

                collection.load();
            }

            function modelHandler() {
                var modelName, model, viewNamePrefix, view;

                modelName = params.activeModelName;
                if(DUET[modelName]){
                    model = new DUET[modelName];
                }
                else {
                    modelName = ut.ucFirst(projectType) + params.activeModelName;
                    model = new DUET[modelName];
                }

                model.on('loaded', function () {
                    viewNamePrefix = DUET.utils.ucFirst(params.activeModelName);

                    if(DUET[viewNamePrefix + 'View'])
                        view = new DUET[viewNamePrefix + 'View'](model);
                    else view = new DUET['Project' + viewNamePrefix + 'View'](model);

                    DUET.routeHelpers.panelTwoHandler(params, view);
                });

                model.load(projectId);
            }

            if (params.activeModel != 'calendar' && params.activeModel != 'details' && params.activeModel != 'notes') {
                collectionHandler();
            }
            else {
                modelHandler();
            }
        });

        DUET.evtMgr.publish('messagesContextChanged');
    },
    projectEntity:function (projectId, entityType, entityId, projectType) {
        var args, panelLoaded, params;

        projectType = projectType || 'project';

        panelLoaded = DUET.routeHelpers.initPrimaryPanel(projectType, projectId);
        args = arguments;

        $.when(panelLoaded).done(function () {
            params = DUET.routeHelpers.initSecondaryPanel(args);
            DUET.panelTwo.setModel(params.project);

            var activeModelUppercase = DUET.utils.ucFirst(params.activeModelSingular);
            var model = new DUET[activeModelUppercase];

            model.on('loaded', function () {
               // DUET.context(params.activeModelSingular, model.id);
                var view = new DUET[activeModelUppercase + 'View'](model);
                DUET.panelTwo.setInnerContent(view);
                DUET.panelTwo.itemCategories.setSelected('project-' + params.activeModel);
            });

            model.load(params.activeModelId);
        });

        DUET.evtMgr.publish('messagesContextChanged');

    },
    templateEntityList:function(projectId, entityType){
        DUET.routes.projectEntityList(projectId, entityType, 'template');
    },
    templateEntity:function(projectId, entityType, entityId){
        DUET.routes.projectEntity(projectId, entityType, entityId, 'template');
    },

    task:function (id) {
        var task, view, taskData;
//todo:base model route?
        DUET.baseModelRoute('task', id);
    },
    client:function (id) {
        DUET.baseModelRoute('client', id);
    },
    user:function (id) {
        DUET.baseModelRoute('user', id);
    },
    file:function (id) {
        DUET.baseModelRoute('file', id);
    },
    dashboard:function () {
        var dashboardView,
            dashboard = new DUET.Dashboard();

        //DUET.context('dashboard', 1);

        //todo:this route is getting called before the initialization has completed, causing this if statement to be required. This shouldn't be necessary.
        if(DUET.initComplete == true){
            DUET.panelTwo.setTitle(ut.lang('sidebar.dashboard'));
            DUET.panelTwo.setModel(dashboard);

            DUET.panelOne.hide();

            DUET.panelTwo.setContent(DUET.panelTwo.loadingView.$get());
        }

        dashboard.on('loaded', function(){
            dashboardView = new DUET.DashboardView(dashboard);

            DUET.panelTwo.setContent(dashboardView);
        });
        dashboard.load(1);
    },
    login:function () {
        DUET.stop();
    },
    logout:function(){
        new DUET.Request({
            url:'app/logout',
            success:function(){
                 window.location = '#login';
            }
        });
    },
    myProfile:function(){
        DUET.routes.user(DUET.my.id);
        DUET.panelOne.hide();
    },
    search:function (query) {
        var searchModel = new DUET.Search();


        //DUET.context('search', 1);
        DUET.panelTwo.setTitle('Search results for \'' + query + '\''); //todo:lang file
        DUET.panelTwo.setModel(searchModel);
        DUET.panelTwo.removeTitleWidget();

        DUET.panelOne.hide();

        searchModel.on('loaded', function () {
            var searchResultsView = new DUET.SearchResultsView(searchModel);

            DUET.panelTwo.setContent(searchResultsView);
        });

        searchModel.load(query);
    },
    forgotPassword:function(){
        var forgotPasswordView = new DUET.ForgotPasswordView();
        forgotPasswordView.addTo({$anchor:$('body')});
    },
    admin:function(){
        if(!DUET.userIsAdmin())
            return false;

        var adminView = new DUET.AdminView();

        //DUET.context('admin-settings', 1);
        DUET.panelTwo.setTitle('Admin Settings'); //todo:lang file
        DUET.panelTwo.setModel(); //todo:lang file

        DUET.panelOne.hide();

        DUET.panelTwo.setContent(adminView);
    }

};



//common functions used throughout the routes
DUET.routeHelpers = {
    initPrimaryPanel:function (projectType, projectId) {
        //projectType = project or template
//        if(projectId)
//            DUET.context(projectType, projectId);
//        else DUET.clearContext();

        return DUET.panelOne.setContent(projectType, projectId);
    },
    initSecondaryPanel:function (params) {
        var collection, view, activeModel, activeModelSingular, activeModelName, project, params, projectId, activeModelId;

        //secondary panel
        projectId = params[0];
        activeModel = params[1] || DUET.options.defaultProjectTab;
        activeModelName = DUET.utils.ucFirst(activeModel);
        activeModelId = params[2];
        activeModelSingular = DUET.utils.trim(activeModel, 's');

        project = projectId ? DUET.panelOne.collection.get(projectId) : false;

        DUET.panelTwo.item = project; //TODO: store the item in state instead?

        return{
            activeModel:activeModel,
            activeModelName:activeModelName,
            activeModelId:activeModelId,
            activeModelSingular:activeModelSingular,
            project:project
        };
    },
    collectionHandler:function () {
    },
    panelTwoHandler:function (params, view) {
        var context;

        DUET.panelTwo.itemCategories.setSelected('project-' + params.activeModel);
        DUET.panelTwo.setInnerContent(view); //TODO: Think about having a DUET.setContent('panelTwo', view.get()), basically an app level set content function?

        context = DUET.context();

        if (context && (context.object == 'project')) {
            var progressWidget = new DUET.ProjectProgressTitleWidgetView(params.project);
            DUET.panelTwo.setTitleWidget(progressWidget);
        }
    }
};

DUET.baseModelRoute = function (modelType, id) {
    var model, view, modelData, modelTypeU = DUET.utils.ucFirst(modelType);

    function getTitle(){
        var type = model.type,
            title = '';

        switch(type){
            case 'project':
            case 'client':
            case 'file':
                title = model.name;
                break;
            case 'task':
                title = 'Task: ' + model.task.substr(0, 10) + '...';
                break;
            case 'user':
                title = model.firstName + ' ' + model.lastName;
                break;
            case 'dashboard':
                title = 'Dashboard';
                break;
        }

        return title;
    }

    //primary panel
    var panelLoaded = DUET.panelOne.setContent(modelType, id);

    $.when(panelLoaded).done(function () {
        modelData = id || DUET.panelOne.firstItem;

        //secondary panel
        model = new DUET[modelTypeU];

        model.on('loaded', function () {
          //  DUET.context(modelType, model.id);
            if(DUET[modelTypeU + 'DetailsView'])
                view = new DUET[modelTypeU + 'DetailsView'](model);
            else view = new DUET[modelTypeU + 'View'](model);

            DUET.panelTwo.removeTitleWidget();
            DUET.panelTwo.setTitle(getTitle());
            DUET.panelTwo.setContent(view);
            DUET.panelTwo.setModel(model);
        });

        model.load(modelData);

        DUET.evtMgr.publish('messagesContextChanged');
    });
};
