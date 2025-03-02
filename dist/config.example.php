<?php
/**
 * Configuration for server-side backend
 *
 * @version 5.0.0-alpha.1
 * @copyright 2025 eVAL Agency
 * @license MIT
 * @link https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @package MarkdownMasterCMS
 */

return [
	// Set to the fully resolved URL of the site root
	// Include "https://" or "http://" as necessary.
	// Trailing slash is not required here.
	'host' => 'http://localhost',

	// Set to the path to the CMS directory from the site root
	// Include both leading and trailing slashes.
	// eg: if your site is located in public_html/cms, then set this to `/cms/`
	'webpath' => '/',

	// Default view to show for "home".
	// This should be TYPE / SLUG of the page.
	// No leading or trailing slashes.
	'defaultView' => 'pages/home',

	// Set the theme to use for the frontend
	'theme' => 'basic-blog',

	// Set to true to enable DEBUG mode on backend and frontend.
	'debug' => false,

	// Uncomment and configure to enable email sending
	/*
	'email' => [
		'from' => 'contact@yourdomain.tld',
		'fromName' => 'Your Name',
		'dsn' => 'smtp://contact@yourdomain.tld:password@mail.yourdomain.tld',
	],
	*/

	// Uncomment to enable forms
	/*
	'forms' => [
		'contact' => [
			'fields' => [
				'name' => [
					'required' => true
				],
				'email' => [
					'type' => 'email',
					'required' => true
				],
				'message' => [
					'required' => true
				]
			],
			'actions' => [
				[
					'action' => 'email',
					'to' => 'you@yourdomain.tld',
					'subject' => 'New Contact Submission',
					'template' => 'contact',
				],
			],
		],
	],
	*/
];
