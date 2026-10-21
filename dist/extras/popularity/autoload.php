<?php

set_include_path(get_include_path() . PATH_SEPARATOR . __DIR__);

use MarkdownMaster\Services\CronService;
use MarkdownMaster\File;
use MarkdownMaster\View;
use MarkdownMaster\Request;
use MarkdownMaster\Services\HookService;
use MarkdownMaster\Model;
use MarkdownMaster\Route;
use Popularity\Services\PopularityService;


Model::RegisterModel('Popularity\Models\PopularityViewsModel');
Model::RegisterModel('Popularity\Models\PopularityDailyModel');

HookService::Add('render_page_view', function(File $file, View $view, Request $request) {
	// Record this page view into the local database
	PopularityService::Record($file, $request);
});

HookService::Add('file_parsed', function(File $file) {
	$score = PopularityService::GetScoreFor($file->rel);
	$file->setmeta('popularity', $score);
});

CronService::Register('popularity-rollup', 3600, function() { PopularityService::Rollup(); });

Route::RegisterRoute('/popularity.json', 'Popularity\Controllers\PopularityController');