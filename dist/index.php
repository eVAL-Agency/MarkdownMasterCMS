<?php
/**
 * Entry point for backend application
 *
 * @version 5.0.0-alpha.1
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

require_once('backend/vendor/autoload.php');
require_once('backend/View.php');
require_once('backend/Request.php');
require_once('backend/Config.php');
require_once('backend/Controller.php');

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
