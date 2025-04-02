<?php

// Set the paths to point to dist
set_include_path(get_include_path() . PATH_SEPARATOR . realpath(__DIR__ . '/../../dist'));

// Include the app files, (bypasses the index handler)
require_once('backend/vendor/autoload.php');
require_once('backend/View.php');
require_once('backend/Request.php');
require_once('backend/Config.php');
require_once('backend/Controller.php');
require_once('backend/controllers/PageController.php');
require_once('backend/controllers/SitemapController.php');
require_once('backend/controllers/MetaController.php');
require_once('backend/controllers/FormController.php');
require_once('backend/controllers/MetaController.php');
require_once('backend/controllers/ListingController.php');
require_once('backend/libs/MarkdownMaster/File.php');

