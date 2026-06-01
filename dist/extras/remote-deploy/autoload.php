<?php

use MarkdownMaster\Route;

// Add this extra to the list of include paths to make it available to the backend.
set_include_path(get_include_path() . PATH_SEPARATOR . __DIR__);

// Deployment webhook endpoint for updating the application via a remote push command
Route::RegisterRoute('/deploy', 'RemoteDeploy\\DeployController');
