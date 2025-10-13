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

/**
 * Simple hooks system to allow plugins to extend functionality
 *
 * Usage:
 * Hooks::Register('hook_name', 'Description of the hook');
 * Hooks::Add('hook_name', function($arg1, $arg2) { ... });
 * Hooks::Run('hook_name', $arg1, $arg2);
 */
class Hooks {

	private static $hooks = [];

	/**
	 * Add a new callback to a given hook
	 *
	 * @param string $hook
	 * @param callable $function
	 * @return void
	 */
	public static function Add(string $hook, callable $function) {
		// Grab the location of the hook, this can be useful for debugging where hooks are added.
		$backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
		$source = substr($backtrace[0]['file'], strlen(Config::GetRootPath()));
		$hooks = &self::$hooks;
		if (!isset($hooks[$hook])) {
			$hooks[$hook] = ['description' => '', 'functions' => []];
		}
		$hooks[$hook]['functions'][] = ['fn' => $function, 'source' => $source];
	}

	/**
	 * Run all callbacks for a given hook
	 *
	 * @param string $hook
	 * @param ...$args
	 * @return void
	 */
	public static function Run(string $hook, ...$args) {
		$hooks = &self::$hooks;
		if (isset($hooks[$hook])) {
			foreach($hooks[$hook]['functions'] as $function) {
				call_user_func_array($function['fn'], $args);
			}
		}
	}

	/**
	 * Register a new hook with a description
	 *
	 * @param string $hook
	 * @param string $description
	 * @return void
	 */
	public static function Register(string $hook, string $description) {
		$hooks = &self::$hooks;
		if (!isset($hooks[$hook])) {
			$hooks[$hook] = ['description' => $description, 'functions' => []];
		}
		else {
			$hooks[$hook]['description'] = $description;
		}
	}

	/**
	 * Get debug information about registered hooks and their callbacks
	 *
	 * Returns:
	 * ```
	 * [
	 *   'hook_name' => [
	 *     'description' => 'Description of the hook',
	 *     'calls' => [
	 *       'path/to/file.php',
	 *       ...
	 *     ]
	 * ],
	 * ```
	 *
	 * @return array
	 */
	public static function GetDebugInfo(): array {
		$debug = [];
		foreach(self::$hooks as $hook => $details) {
			$debug[$hook] = [
				'description' => $details['description'],
				'calls' => [],
			];
			foreach($details['functions'] as $function) {
				$debug[$hook]['calls'][] = $function['source'];
			}
		}

		return $debug;
	}
}