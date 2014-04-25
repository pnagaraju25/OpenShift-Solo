<?php

//form
$LANG['form'] = array(
    'submit' => 'Submit',
);

//alert
$LANG['alert'] = array(
    'ok' => 'Ok'
);

//messages panel
$LANG['messagesPanel'] = array(
    'refreshTitle' => 'Refresh Messages',
    'hideTitle' => 'Hide Messages Panel',
    'send' => 'Send',
    'sendingMessage' => 'Sending Message...',
    'discussionFor' => 'Discussion for this '
);

//sidebar
$LANG['sidebar'] = array(
    'dashboard' => 'Dashboard',
    'projects' => 'Projects',
    'clients' => 'Clients',
    'files' => 'Files',
    'tasks' => 'Tasks',
    'projectTemplates' => 'Project Templates',
    'admin' => 'Admin',
    'more' => 'More',
    'templates' => 'Templates'
);


//file list
$LANG['fileList'] = array(
    'title' => 'Title',
    'type' => 'Type',
    'uploadedBy' => 'Uploaded By',
    'date' => 'Date',
    'noFiles' => 'No files uploaded yet'
);

//project task

$LANG['taskDetails'] = array(
    'errorSavingTitle' => 'Error saving task. Click to retry',
    'deleteTitle' => 'Delete Task',
    'editTitle' => 'Edit Task',
    'viewTitle' => 'View Task',
    'delete' => 'Delete',
    'edit' => 'Edit',
    'addFile' => 'Add File',
    'details' => 'Details',
    'timer' => 'Timer',
    'attachments' => 'Attachments',
    'assigned' => 'Assigned',
    'status' => 'Status',
    'dueDate' => 'Due Date',
    'completedDate' => 'Completed Date',
    'totalTime' => 'Total Time',
    'taskWeight' => 'Task Weight',
    'taskWeightTitle' => 'Change task weight',
    'noAttachments' => 'No attachments',
    'inactiveTimer' => 'Not Active',
    'enterTime' => 'Enter Time',
    'startTimer' => 'Start Timer',
    'stopTimer' => 'Stop Timer',
    'timeEntryDate' => 'Start Date',
    'timeEntryUser' => 'User',
    'timeEntryTime' => 'Time',
    'deleteTimeEntryTitle' => 'Delete time entry',
    'timerAlreadyRunning' => 'There is already a timer running. Please stop the running timer before starting a new one',
    'deleteTimeEntryButton' => 'Delete Time Entry',
    'deleteTimeEntryConfirmationMessage' => 'Are you sure you want to delete this time entry? This can not be undone.',
    'deleteTaskButton' => 'Delete Task',
    'deleteTaskConfirmationMessage' => 'Are you sure you want to delete this task? This action can not be undone.'
);

$LANG['timeEntryForm'] = array(
    'title' => 'Enter time',
    'hours' => 'Hours',
    'minutes' => 'Minutes',
    'seconds' => 'Seconds',
    'hoursPlaceholder' => 'hh',
    'minutesPlaceholder' => 'mm',
    'secondsPlaceholder' => 'ss',
);

//file view
$LANG['fileView'] = array(
    'errorLoading' => 'Unable to load preview',
    'unsupportedType' => 'No preview for this file type',
    'loading' => 'Loading Preview...',
    'uploaded' => 'Uploaded',
    'download' => 'Download',
    'notes' => 'Notes',
    'editNotes' => 'Edit Notes',
    'delete' => 'Delete',
    'uploadedDate' => 'Upload Date',
    'uploadedBy' => 'Uploaded By',
    'size' => 'Size',
    'invalidType' => 'Invalid Type',
    'deleteFile' => 'Delete File',
    'deleteFileConfirmation' => 'Are you sure? Once a file is deleted it can not be restored.'
);


//client details
$LANG['clientDetails'] = array(
    'title' => 'Client Details',
    'primaryContactTitle' => 'Primary Contact',
    'primaryContactNotSet' => 'Primary Contact',
    'changePrimaryContact' => 'Change primary contact',
    'addNewUser' => 'Add new user',
    'projectsTab' => 'Projects',
    'usersTab' => 'Users',
    'noProjects' => 'No projects',
    'noUsers' => 'No users',
    'projectName' => 'Name',
    'projectDueDate' => 'Due Date',
    'projectStatus' => 'Status',
    'userName' => 'Name',
    'userEmail' => 'Email',
    'choosePrimaryContactPlaceholder' => 'Choose primary contact (required)',
    'firstName' => 'First Name',
    'lastName' => 'Last Name',
    'emailAddress' => 'Email Address',
    'address1' => 'Address Line 1',
    'address2' => 'Address Line 2',
    'phone' => 'Phone',
    'addAdditionalDetails' => 'add additional details',
    'hideAdditionalDetails' => 'hide additional details',
    'newUserFormTitle' => 'New User',
    'userCreatedMessage' => 'User created'
);

//client form
$LANG['clientForm'] = array(
    'name' => 'Name (required)',
    'primaryContact' => 'Primary Contact',
    'contactFirstName' => 'First Name (required)',
    'contactLastName' => 'Last Name (required)',
    'contactEmail' => 'Email Address (required)',
    'addAdditionalDetails' => 'add additional details',
    'hideAdditionalDetails' => 'hide additional details',
    'address1' => 'Address Line 1',
    'address2' => 'Address Line 2',
    'phone' => 'Phone',
    'website' => 'Website',
    'newClient' => 'New Client',
    'editClient' => 'Edit Client'
);

//client primary contact view
$LANG['clientPrimaryContact'] = array(
    'primaryContact' => 'Primary Contact'
);

//user details
$LANG['userDetails'] = array(
    'organization' => 'Organization',
    'userIsAdmin' => 'This user is an admin',
    'userDetailsTitle' => 'User Details',
    'changePhoto' => 'Change Photo',
    'changePassword' => 'Change Password',
    'sendPassword' => 'Send user password'
);

//login form
$LANG['loginForm'] = array(
    'instructions' => 'Please log in to access your account',
    'emailPlaceholder' => 'Email Address',
    'passwordPlaceholder' => 'Password',
    'forgotPassword' => 'Forgot Password?',
    'login' => 'Login',
    'incorrectLogin' => 'Incorrect email or password',
    'inactivityLogout' => 'You have been logged out due to inactivity'
);

//project form
$LANG['projectForm'] = array(
    'name' => 'Project Name (required)',
    'chooseClient' => 'Choose a Client (required)',
    'startDate' => 'Start Date',
    'dueDate' => 'Due Date',
    'newProject' => 'New :type',
    'editProject' => 'Edit :type',
    'projectCreated' => ':type created',
    'projectEdited' => ':type edited',
    'loadingClients' => 'Loading client list. Please wait'
);

//task form
$LANG['taskForm'] = array(
    'task' => 'Task (required)',
    'notes' => 'Notes',
    'assignedTo' => 'Assigned To',
    'dueDate' => 'Due Date',
    'newTask' => 'New Task',
    'editTask' => 'Edit Task'
);

//task weight form
$LANG['taskWeightForm'] = array(
    'pleaseWait' => 'Please wait. Loading the maximum weight for this task.',
    'enterValue' => 'Please enter a value between 1 and',
    'calculatedAutomatically' => '. If you would like the weight to be calculated automatically, leave this field blank.',
    'taskWeight' => 'Task Weight',
);

//project file form
$LANG['projectFileForm'] = array(
    'cancel' => 'Cancel All',
);

//file progress
$LANG['fileProgress'] = array(
    'cancel' => 'Cancel',
    'status' => 'Complete',
);

//add project list item
$LANG['addProjectListItem'] = array(
    'title' => 'Add New',
);

//add file button
$LANG['addFileButton'] = array(
    'title' => 'Add New',
    'defaultButtonText' => 'File',
    'filesUploadedMessage' => ':numFiles files uploaded',
    'cancelled' => 'Cancelled',
    'modalTitle' => 'New File',
);

//calendar header
$LANG['calendarHeader'] = array(
    'filter' => 'Filter',
    'myTasks' => 'My Tasks',
    'allTasks' => 'All Tasks',
    'today' => 'Today',
    'month' => 'Month',
    'week' => 'Week',
    'day' => 'Day',
);

//calendar item popup
$LANG['calendarItemPopup'] = array(
    'goToTask' => 'Go to task',
);

//confirm box
$LANG['confirmBox'] = array(
    'defaultActionName' => 'Yes',
    'defaultMessage' => 'Are you sure? This action can not be undone',
    'cancel' => 'Cancel',
);

//project progress title widget
$LANG['projectProgressTitleWidget'] = array(
    'title' => 'Project progress',
);

//credit card payment
$LANG['creditCardPayment'] = array(
    'billingInfo' => 'Billing Info',
    'pleaseEnterDetails' => 'Please enter your payment details below',
    'firstName' => 'First Name',
    'lastName' => 'Last Name',
    'creditCardNumber' => 'Credit Card Number',
    'expirationDate' => 'Expiration Date',
    'month' => 'Month',
    'year' => 'Year',
    'cvc' => 'CVC',
    'dueDate' => 'Due Date',
    'status' => 'Status',
    'balance' => 'Balance',
    'pleaseWait' => 'Please wait...',
    'paymentProcessing' => 'Your payment is being processed',
    'jan' => 'January',
    'feb' => 'February',
    'mar' => 'March',
    'apr' => 'April',
    'may' => 'May',
    'jun' => 'June',
    'jul' => 'July',
    'aug' => 'August',
    'sept' => 'September',
    'oct' => 'October',
    'nov' => 'November',
    'dec' => 'December',
    'paymentSuccessful' => 'Payment successful'
);


//project details
$LANG['projectDetails'] = array(
    'projectActivity' => 'Project Activity',
    'client' => 'Client',
    'expectedProgress' => 'Expected progress',
    'dueDate' => 'Due Date',
    'openTasks' => 'Open Tasks',
    'totalTasks' => 'Total Tasks',
    'overdue' => 'Overdue',
    'notStarted' => 'Not started',
    'behindSchedule' => 'Behind schedule',
    'atRisk' => 'At risk',
    'onSchedule' => 'On schedule',
    'complete' => 'Complete'
);

//delete project
$LANG['deleteProject'] = array(
    'title' => 'Delete Project',
    'message' => 'Are you sure you want to delete :name?',
    'button' => 'Delete project',
    'secondaryTitle' => 'Delete Project - Confirmation',
    'secondaryMessage' => 'This will also delete all files and tasks in ":name". Are you sure you would like to delete this project?',
    'secondaryButton' => 'Yes, delete this project',
    'inProgress' => 'Deleting project'
);

//archive project
$LANG['archiveProject'] = array(
    'title' => '-Archive Project',
    'message' => 'Are you sure you want to archive :name? This will remove it from the active projects list',
    'button' => 'Archive project',
    'inProgress' => 'Archiving project'
);

//move project to in progress
$LANG['unarchiveProject'] = array(
    'title' => 'Move Project to In Progress',
    'message' => 'Are you sure you want to move :name to In Progress?',
    'button' => 'Move to In Progress',
    'inProgress' => 'Archiving project'
);

//delete template
$LANG['deleteTemplate'] = array(
    'title' => 'Delete Template',
    'message' => 'Are you sure you want to delete :name?',
    'button' => 'Delete template',
    'secondaryTitle' => 'Delete Template - Confirmation',
    'secondaryMessage' => 'This will also delete all files and tasks in ":name". Are you sure you would like to delete this template?',
    'secondaryButton' => 'Yes, delete this template',
    'inProgress' => 'Deleting template'
);

//delete client
$LANG['deleteClient'] = array(
    'title' => 'Delete Client',
    'message' => 'Are you sure you want to delete :name?',
    'button' => 'Delete client',
    'secondaryTitle' => 'Delete Client - Confirmation',
    'secondaryMessage' => 'This will also delete all projects associated with ":name". Are you sure you would like to delete this client?',
    'secondaryButton' => 'Yes, delete this client',
    'inProgress' => 'Deleting client'
);

//delete user
$LANG['deleteUser'] = array(
    'title' => 'Delete User',
    'message' => 'Are you sure you want to delete :firstName :lastName?',
    'button' => 'Delete user',
    'secondaryTitle' => 'Delete User - Confirmation',
    'secondaryMessage' => 'This will prevent the user from logging in. Are you sure you would like to delete this user?',
    'secondaryButton' => 'Yes, delete this user',
    'inProgress' => 'Deleting user'
);

//header
$LANG['header'] = array(
    'greeting' => 'Hi,',
    'search' => 'search',
    'logout' => 'Logout',
);

//task filter
$LANG['taskFilter'] = array(
    'filter' => 'Filter',
    'incomplete' => 'Incomplete',
    'complete' => 'Complete',
    'all' => 'All',
    'myTasks' => 'My Tasks',
    'allTasks' => 'All Tasks',
    'search' => 'search',
    'filterNotification' => 'Showing :filterValue',
    'searchNotification' => 'Search results for: :searchTerm',
    'closeSearch' => 'clear'
);

$LANG['taskList'] = array(
    'noTasks' => 'There are no tasks for this project. Start typing below to add one...'
);

$LANG['taskListItems'] = array(
    'deleteTask' => 'Delete Task',
    'deleteTaskMessage' => 'Are you sure you want to delete this :type? This can not be undone.'
);


//dashboard
$LANG['dashboard'] = array(
    'projects' => 'Projects',
    'addProject' => 'Project',
    'activity' => 'Activity Stream',
);

//dashboard project tiles
$LANG['dashboardProjectTiles'] = array(
    'progress' => 'Progress',
    'expectedProgress' => 'Expected Progress',
    'dueDate' => 'Due Date',
);

//dashboard project list
$LANG['dashboardProjectList'] = array(
    'dueDate' => 'Due Date',
);

//project notes
$LANG['projectNotes'] = array(
    'editNotes' => 'Edit Notes',
    'noNotes' => 'No notes for this project',
    'doneEditing' => 'Done Editing',
    'saving' => 'Saving Notes'
);

//global search
$LANG['globalSearch'] = array(
    'filter' => 'Filter',
    'all' => 'All',
    'projects' => 'Projects',
    'tasks' => 'Tasks',
    'files' => 'Files',
    'messages' => 'Messages',
    'projectsTitle' => 'Projects',
    'projectName' => 'Name',
    'projectDueDate' => 'Due Date',
    'projectStatus' => 'Status',
    'tasksTitle' => 'Tasks',
    'taskName' => 'Task',
    'taskProject' => 'Project',
    'taskDueDate' => 'Due Date',
    'taskStatus' => 'Status',
    'clientsTitle' => 'Clients',
    'clientName' => 'Name',
    'filesTitle' => 'Files',
    'fileName' => 'Name',
    'fileType' => 'Type',
    'fileProject' => 'Project',
    'usersTitle' => 'Users',
    'userName' => 'Name',
    'userEmail' => 'Email',
    'messagesTitle' => 'Messages',
    'resultsMessage' => 'Showing :type'
);

//global search no results
$LANG['globalSearchNoResults'] = array(
    'noMatching' => 'No matching',
    'pluralizeType' => 's',
);

//forgot password
$LANG['forgotPassword'] = array(
    'forgotPassword' => 'Forgot Password',
    'instructions' => 'Please enter the email address you use to log into the system.',
    'checkEmail' => 'Please check your email for instructions on accessing the system. Thank you.',
);

//change password
$LANG['changePassword'] = array(
    'currentPassword' => 'Current Password',
    'newPassword' => 'New Password',
    'confirmNewPassword' => 'Confirm New Password',
    'title' => 'Change Password',
    'passwordChanged' => 'Password changed',
    'passwordSent' => 'The new password has been sent'
);

//send password
$LANG['sendPassword'] = array(
    'instructions' => 'This will reset the user\'s password and send a new one to their email address.',
    'submit' => 'Send New Password',
    'cancel' => 'Cancel',
    'title' => 'Send Password',
    'passwordSent' => 'Password sent'
);

//activity list
$LANG['activityList'] = array(
    'showAll' => 'Show All',
    'noActivity' => 'No activity yet'
);

//admin settings
$LANG['adminSettings'] = array(
    'softwareVersion' => 'Software Version',
    'createNewAdmin' => 'Create New Admin',
    'buildLanguageFile' => 'Build Template File',
    'adminsSection' => 'Admins',
    'templatesSection' => 'Templates',
    'templatesSectionInstructions' => 'Rebuild the template files. Useful when you have changed the language files or the contents of the all-templates.mustache. You should read the Templates and Language Files sections in the documentation before using this functionality.',
    'buildingTemplates' => 'Please Wait. Building templates'
);


//panel loading
$LANG['panelLoading'] = array(
    'loading' => 'Loading...',
);

//panel no selection
$LANG['panelNoSelection'] = array(
    'makeSelection' => 'Please make a selection',
);

//new admin
$LANG['adminForm'] = array(
    'title' => 'New Admin',
    'adminCreated' => 'Admin created'
);

//new project from template
$LANG['newProjectFromTemplateForm'] = array(
    'title' => 'New Project'
);


//cs validation
$LANG['csValidation'] = array(
    'default' => 'Please correct this value',
    'email' => 'Please enter a valid email address',
    'url' => 'Please enter a valid url',
    'number' => 'Please enter a numeric value',
    'radio' => 'Please select an option',
    'max' => 'Please enter a value larger than $1',
    'min' => 'Please enter a value of at least $1',
    'required' => 'Please complete this mandatory field',
    'pattern' => ''
);

//datepicker
//http://jquerytools.org/demos/dateinput/localize.html
$LANG['datepicker'] = array(
    'months' => 'January,February,March,April,May,June,July,August,September,October,November,December',
    'shortMonths' => 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
    'days' => 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
    'shortDays' => 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'
);

//moment
//http://momentjs.com/docs/#/i18n/changing-language/
$LANG['moment'] = array(
    'months' => array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
    'monthsShort' => array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'),
    'weekdays' => array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    'weekdaysShort' => array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    'weekdaysMin' => array('Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa',),
    'longDateFormat' => array('LT' => 'h:mm A', 'L' => 'MM/DD/YYYY', 'LL' => 'MMMM D YYYY', 'LLL' => 'MMMM D YYYY LT', 'LLLL' => 'dddd, MMMM D YYYY LT'),
    'calendar' => array('sameDay' => '[Today at] LT', 'nextDay' => '[Tomorrow at] LT', 'nextWeek' => 'dddd [at] LT', 'lastDay' => '[Yesterday at] LT', 'lastWeek' => '[Last] dddd [at] LT', 'sameElse' => 'L'),
    'relativeTime' => array('future' => 'in %s', 'past' => '%s ago', 's' => 'a few seconds', 'm' => 'a minute', 'mm' => '%d minutes', 'h' => 'an hour', 'hh' => '%d hours', 'd' => 'a day', 'dd' => '%d days', 'M' => 'a month', 'MM' => '%d months', 'y' => 'a year', 'yy' => '%d years'),
    'week' => array('dow' => 0, 'doy' => 6)
);

$LANG['email_subjects'] = array(
    'default' => get_config('company.name') . ' sent you a message',
    'new_account' => "Your new account with " . get_config('company.name'),
    'forgot_password' => "Your temporary password",
    'changed_password' => "Your password has been changed",
    'client_payment' => "Online Payment",
    'admin_payment' => "A payment has been received",
    'message' => "A message has been posted on a project",
    'uploaded_file' => "A file has been uploaded to a project",
    'task_assignment' => "A task has been assigned to you",
    'admin_send_password' => 'Your account login information'
);

$LANG['activity'] = array(

    'created' => 'created',
    'deleted' => 'deleted',
    'updated' => 'updated',
    'uploaded' => 'uploaded',
    'posted' => 'posted',
    'completed' => 'completed',
    'reassigned' => 'reassigned',
    'due_date_updated_details' => 'The due date on :projectName has been :differenceDirection by :differenceInDays :daysText',
    'status_change' => 'Status change on',
    'status_change_details' => 'The status on :projectName changed to :projectStatus',
    'assignment_details' => 'Assigned to :assignedToFirstName :assignedToLastName'

);

$LANG['errors'] = array(
    'saving_primary_contact' => 'Error saving primary contact',
    'payment_invalid_amount' => 'Invalid payment amount',
    'payment_invalid' => 'Invalid Payment',
    'stripe_invalid_token' => 'Invalid Token',
    'stripe_error_charging_card' => 'There was an error charging the card',
    'stripe_invalid_request' => 'Invalid request',
    'stripe_unable_to_connect' => 'Unable to connect',
    'stripe_general' => 'There was an error. Please contact an admin',
    'task_invalid_project' => 'Invalid project id',
    'user_email_address_exists' => 'A user with this email address already exists',
    'user_passwords_dont_match' => 'New password values do not match',
    'user_error_changing_password' => 'There was an error changing your password',
    'file_error_downloading' => 'There was an error downloading the file'
);


$LANG['project'] = array(
    'increased' => 'increased',
    'decreased' => 'decreased',
    'days' => 'days',
    'day' => 'day'
);

$LANG['task'] = array(
    'overdue' => 'Overdue',
    'atRisk' => 'At Risk',
    'onSchedule' => 'On Schedule'
);

//todo:combine with client side validation, there should only be one place for validator error messages
$LANG['validation'] = array(
    'required' => 'This field is required',
    'min_length' => 'This field must meet the minimum length',
    'max_length' => 'This field must meet the maximum length',
    'exact_length' => 'This field must be a valid length',
    'valid_email' => 'Please enter a valid email address',
    'valid_url' => 'Please enter a valid url',
    'numeric' => 'Please enter a valid numeric value',
    'alpha' => 'Please enter a valid alpha value',
    'alpha_numeric' => 'Please enter a valid alpha numeric value',
    'valid_date' => 'Please enter a valid date in the format mm/dd/yyyy',
    'valid_state' => 'Please enter a valid US state',
    'valid_zip' => 'Please enter a valid US zip code',
    'valid_phone' => 'Please enter a valid 10 digit phone number',
    'matches' => 'The values do not match',
    'min' => 'Please enter a value within the allowed range',
    'max' => 'Please enter a value within the allowed range',
    'strong_password' => 'Please enter a password that contains at least one uppercase letter, one lowercase letter, and a number'
);

$LANG['projectTabs'] = array(
    'details' => 'Details',
    'calendar' => 'Calendar',
    'tasks' => 'Tasks',
    'files' => 'Files',
    'notes' => 'Notes'
);

$LANG['entityNames'] = array(
    'project' => 'project',
    'task' => 'task',
    'file' => 'file',
    'message' => 'message',
    'client' => 'client',
    'payment' => 'payment',
    'template' => 'template'
);

$LANG['articles'] = array(
    'a' => 'a',
    'an' => 'an'
);

$LANG['panelActions'] = array(
    'edit' => 'Edit',
    'delete' => 'Delete',
    'archive' => 'Archive',
    'moveToInProgress' => 'Move to In Progress',
    'newProjectFromTemplate' => 'New Project From Template'
);


$LANG['filters'] = array(
    'inProgress' => 'In Progress',
    'archived' => 'Archived',
    'all' => 'All',
    'paid' => 'Paid',
    'overdue' => 'Overdue'
);

$LANG['calendar'] = array(
    'monthNames' => 'January, February, March, April, May, June, July, August, September, October, November, December',
    'dayNames' => 'Sun, Mon, Tue, Wed, Thu, Fri, Sat'
);

