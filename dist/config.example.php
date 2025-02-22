<?php
/**
 * Example configuration for server-side backend
 *
 * @version 5.0.0-alpha.1
 * @copyright 2025 eVAL Agency
 * @license MIT
 * @link https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @package MarkdownMasterCMS
 */

return [
	'host' => 'http://localhost',
	'webpath' => '/',
	'defaultView' => 'landings/home',
	'types' => 'pages, casestudies, landings',
	'debug' => true,

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
