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
use MarkdownMaster\Events\RenderPageViewEvent;
use MarkdownMaster\Events\FileParsedEvent;


Model::RegisterModel('Popularity\Models\PopularityViewsModel');
Model::RegisterModel('Popularity\Models\PopularityDailyModel');

RenderPageViewEvent::Subscribe(function(RenderPageViewEvent $event) {
	// Record this page view into the local database
	PopularityService::Record($event->file, $event->request);
});

FileParsedEvent::Subscribe(function(FileParsedEvent $event) {
	$score = PopularityService::GetScoreFor($event->file->shortRel);
	$event->file->setmeta('popularity', $score);
});

CronService::Register('popularity-rollup', 3600, function() { PopularityService::Rollup(); });

Route::RegisterRoute('/popularity.json', 'Popularity\Controllers\PopularityController');