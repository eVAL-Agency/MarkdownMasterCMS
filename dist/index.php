<?php
/**
 * Entry point for backend application
 *
 * @version dev
 * @copyright 2025 eVAL Agency
 * @license MIT
 * @link https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @package MarkdownMasterCMS
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2025 eVAL Agency
 * https://github.com/eVAL-Agency/MarkdownMasterCMS
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

define('BASE_DIR', __DIR__);

spl_autoload_register(function($class) {
	try{
		require_once(str_replace('\\', '/', $class) . '.php');
	}
	catch (Error $e) {
		return false;
	}
});

set_include_path(get_include_path() . PATH_SEPARATOR . __DIR__ . '/backend/libs');

use MarkdownMaster\Config;
use MarkdownMaster\Request;
use MarkdownMaster\Hooks;


// As of 5.1, allow plugins to load server-side code to provide additional functionality
foreach(array_keys(Config::GetExtras()) as $extra) {
	if (file_exists('extras/' . $extra . '/autoload.php')) {
		require_once('extras/' . $extra . '/autoload.php');
	}
}

// Hooks are supported as of 5.1
Hooks::Register('render_page_view', 'Modify the page view before rendering, provides the arguments File and HTMLTemplateView.');


$request = new Request();

try {
	// Get the requested controller
	$controller = $request->getController();

	// Run the application
	$view = $controller->run();

	// Display the view
	$view->render();
}
catch (Exception $e) {
	$request->replyError($e->getMessage(), $e->getCode(), $e->getTraceAsString());
}
catch (Error $e) {
	$request->replyError($e->getMessage(), 500, $e->getTraceAsString());
}
