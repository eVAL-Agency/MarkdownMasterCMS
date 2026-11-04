<?php
/**
 * Theme default settings
 */
return [
	// Type of files to support
	'types' => 'wiki',

	// ID of element to attach CMS.js to
	'elementId' => 'cms',

	// Web App Manifest (PWA) defaults, overridden by the root config.php "pwa" block
	'pwa' => [
		'name' => 'My Wiki',
		'short_name' => 'Wiki',
		'display' => 'standalone',
		'theme_color' => '#1c3280',
		'background_color' => '#ffffff',
	],

	'icons' => [
		'icons/icon.svg',
		'icons/icon-192.png',
		'icons/icon-512.png',
		'icons/icon-maskable-512.png',
	],

	'extras' => [],
];
