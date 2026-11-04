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
		'posts' => [
			'list' => 'posts',
			'single' => 'post',
			'sort' => 'datetime-r',
			'title' => 'Posts',
			'og:type' => 'article',
		],
		'authors' => [
			'list' => 'authors',
			'single' => 'author',
			'sort' => 'title',
			'title' => 'Author Pages',
			'og:type' => 'profile',
		],
	],

	// ID of element to attach CMS.js to
	'elementId' => 'cms',

	// Web App Manifest (PWA) defaults, overridden by the root config.php "pwa" block
	'pwa' => [
		'name' => 'MarkdownMasterCMS Website',
		'short_name' => 'MarkdownMasterCMS',
		'display' => 'standalone',
		'theme_color' => '#3f70b3',
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
		'cms-button' => [],
		'external-links' => [],
		'cms-reading-time' => [],
	],
];
