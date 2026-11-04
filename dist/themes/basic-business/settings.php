<?php
/**
 * Theme default settings
 */
return [
	// Type of files to support
	'types' => [
		'pages' => [
			'list' => 'pages',
			'single' => 'page',
			'sort' => 'title',
			'title' => 'Pages'
		],
	],

	// ID of element to attach CMS.js to
	'elementId' => 'cms',

	// Web App Manifest (PWA) defaults, overridden by the root config.php "pwa" block
	'pwa' => [
		'name' => 'My Business',
		'short_name' => 'BusinessCo',
		'display' => 'standalone',
		'theme_color' => '#094493',
		'background_color' => '#ffffff',
	],

	'icons' => [
		'icons/icon.svg',
		'icons/icon-192.png',
		'icons/icon-512.png',
		'icons/icon-maskable-512.png',
	],

	'extras' => [
		'cms-search' => [],
		'cms-icon' => [],
	],
];
