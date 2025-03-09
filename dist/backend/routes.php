<?php
/**
 * MarkdownMaster CMS
 *
 * @version dev
 * @copyright 2025 eVAL Agency
 * @license MIT
 * @link https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @package MarkdownMasterCMS
 *
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * All routes for the backend application
 */
$routes = [
	// Default index page; re-routes to the defaultView internally
	// and returns that content along with the resolved canonical URL.
	[
		'uri' => '/',
		'file' => 'PageController.php',
		'class' => 'PageController',
		'params' => '__DEFAULT__',
	],
	// Sitemap route
	[
		'uri' => '/sitemap.xml',
		'file' => 'SitemapController.php',
		'class' => 'SitemapController',
        'params' => null,
	],
	// Meta content route, provides information about pages
	[
		'uri' => '/meta.json',
		'file' => 'MetaController.php',
		'class' => 'MetaController',
        'params' => null,
	],
	// Form submission route, handles all forms
	[
		'uri' => '/form',
		'file' => 'FormController.php',
		'class' => 'FormController',
		'params' => null,
	]
];

// Add any routes for each content type configured
$types = Config::GetTypes();
foreach($types as $type) {
	// Route for the listing page
	$routes[] = [
		'uri' => '/' . $type . '.html',
		'file' => 'ListingController.php',
		'class' => 'ListingController',
		'params' => $type
	];

	// Route for the individual page
	$routes[] = [
		'uri' => '#/' . $type . '/.*\.html#',
		'regex' => true,
		'file' => 'PageController.php',
		'class' => 'PageController',
		'params' => $type
	];
}

return $routes;
