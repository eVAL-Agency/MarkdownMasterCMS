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

namespace MarkdownMaster\Services;

use MarkdownMaster\Events\FileParsedEvent;
use MarkdownMaster\Events\RenderPageViewEvent;

/**
 * Simple hooks system to allow plugins to extend functionality
 *
 * Usage:
 * HookService::Register('hook_name', 'Description of the hook');
 * HookService::Add('hook_name', function($arg1, $arg2) { ... });
 * HookService::Run('hook_name', $arg1, $arg2);
 */
class HookService {

	private static $hooks = [];

	/**
	 * Add a new callback to a given hook
	 *
	 * @deprecated v6.0.0 to be removed v7.0.0
	 *
	 * @param string $hook
	 * @param callable $function
	 *
	 * @return void
	 */
	public static function Add(string $hook, callable $function) {
		// Redirect to the new Event system
		switch($hook) {
			case 'render_page_view':
				RenderPageViewEvent::Subscribe($function);
				break;
			case 'file_parsed':
				FileParsedEvent::Subscribe($function);
				break;
		}
	}

	/**
	 * Run all callbacks for a given hook
	 *
	 * @deprecated v6.0.0 to be removed v7.0.0
	 *
	 * @param string $hook
	 * @param ...$args
	 * @return void
	 */
	public static function Run(string $hook, ...$args): void {
		switch($hook) {
			case 'render_page_view':
				$event = new RenderPageViewEvent(...$args);
				$event->dispatch();
				break;
			case 'file_parsed':
				$event = new FileParsedEvent(...$args);
				$event->dispatch();
				break;
		}
	}

	/**
	 * Register a new hook with a description
	 *
	 * @deprecated v6.0.0 to be removed v7.0.0
	 *
	 * @param string $hook
	 * @param string $description
	 * @return void
	 */
	public static function Register(string $hook, string $description) { }
}
