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

	'extras' => [
		'cms-search' => [],
		'cms-icon' => [],
		'cms-button' => [],
		'external-links' => [],
	],
];
