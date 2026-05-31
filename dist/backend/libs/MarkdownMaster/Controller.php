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

namespace MarkdownMaster;

use Exception;
use MarkdownMaster\Views\HTMLTemplateView;
use MarkdownMaster\Views\JSONView;
use MarkdownMaster\Views\TextView;
use MarkdownMaster\Views\XMLView;


class Controller {
	protected $request;
	protected $params;

	/**
	 * Create the instance of this Controller request
	 *
	 * Passes the original request along with any parameters set by the route configuration
	 *
	 * @param Request $request
	 * @param $params
	 */
	public function __construct(Request $request, $params) {
		$this->request = $request;
		$this->params = $params;
	}

	/**
	 * Execute the appropriate method based on the request type
	 *
	 * @return View
	 * @throws Exception
	 */
	public function run(): View {
		$view = match ($this->request->method) {
			'GET' => $this->get(),
			'POST' => $this->post(),
			'PUT' => $this->put(),
			'DELETE' => $this->delete(),
			default => throw new Exception('Method not allowed', 405),
		};

		if ($view instanceof View) {
			// Fully polished View returned by the Controller; we can return this directly.
			return $view;
		}
		else {
			// Controller returned a string, that's not recommended though allowed for simple APIs.
			// We have to guess what the View should be.
			if ($this->request->prefersHTML()) {
				$newView = new HTMLTemplateView();
				$newView->body = is_scalar($view) ? $view : print_r($view, true);
				return $newView;
			}
			elseif ($this->request->prefersJSON()) {
				$newView = new JSONView();
				$newView->data = $view;
				return $newView;
			}
			elseif ($this->request->prefersXML()) {
				$newView = new XMLView();
				$newView->data = is_scalar($view) ? ['message' => $view] : $view;
				return $newView;
			}
			else {
				$newView = new TextView();
				$newView->body = is_scalar($view) ? $view : print_r($view, true);
				return $newView;
			}
		}
	}

	/**
	 * Perform a GET request to this controller
	 *
	 * @throws Exception
	 */
	public function get() {
		throw new Exception(get_class($this) . " does not support GET requests", 405);
	}

	/**
	 * Perform a POST request to this controller
	 *
	 * @throws Exception
	 */
	public function post() {
		throw new Exception(get_class($this) . " does not support POST requests", 405);
	}

	/**
	 * Perform a PUT request to this controller
	 *
	 * @throws Exception
	 */
	public function put() {
		throw new Exception(get_class($this) . " does not support PUT requests", 405);
	}

	/**
	 * Perform a DELETE request to this controller
	 *
	 * @throws Exception
	 */
	public function delete() {
		throw new Exception(get_class($this) . " does not support DELETE requests", 405);
	}

}