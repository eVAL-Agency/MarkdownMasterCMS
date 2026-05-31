<?php
/**
 * MarkdownMaster CMS
 *
 * @version dev
 * @copyright 2026 eVAL Agency
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
 * Route handler for MarkdownMaster - Allows loading of dynamic routes
 */
class Route {
	private static array $_Routes = [];

	/**
	 * Get all routes that are currently registered
	 *
	 * Mostly for debugging
	 *
	 * Each route contains 'uri', 'class', and 'params'.
	 *
	 * @return array
	 */
	public static function GetRoutes(): array {
		return Route::$_Routes;
	}

	/**
	 * Register a new route
	 *
	 * ## Examples:
	 *
	 * **Register a simple route**
	 *
	 * ```php
	 * // Register "/form" to load the FormController
	 * Route::RegisterRoute('/form', 'MarkdownMaster\\Controllers\\FormController');
	 * ```
	 *
	 * **Register a simple route with extension**
	 *
	 * ```php
	 * // Register a view type for the listing
	 * $type = 'some-type';
	 * Route::RegisterRoute("/$type.html", 'MarkdownMaster\\Controllers\\ListingController', $type);
	 * ```
	 *
	 * @param string $uri               URL fragment to match exactly
	 * @param string $controller        Fully qualified class name of controller to load
	 * @param array|string|null $params Parameters to pass to the controller
	 * @return void
	 */
	public static function RegisterRoute(string $uri, string $controller, array|null|string $params = null): void {
		Route::$_Routes[] = [
			'uri' => $uri,
			'class' => $controller,
			'params' => $params
		];
	}

	/**
	 * Register a new route using a regex
	 *
	 * This is useful for dynamic routes and individual pages
	 *
	 * ## Examples:
	 *
	 * ```php
	 * // Route for the individual page
	 * // Matches "/some-type/*.html" and passes "some-type" as the parameter to the controller
	 * $type = 'some-type';
	 * Route::RegisterRegexRoute("#/$type/.*\.html#", 'MarkdownMaster\\Controllers\\PageController', $type);
	 * ```
	 *
	 * @param string $regex
	 * @param string $controller
	 * @param array|string|null $params
	 * @return void
	 */
	public static function RegisterRegexRoute(string $regex, string $controller, array|null|string $params = null): void {
		Route::$_Routes[] = [
			'regex' => true,
			'uri' => $regex,
			'class' => $controller,
			'params' => $params
		];
	}

	/**
	 * Resolve a route based on the given URI
	 * Returns null if no route is found
	 *
	 * If found, the returned array contains 'class' and 'params'.
	 *
	 * @param string $uri The URL fragment to match
	 * @return array|null
	 */
	public static function ResolveRoute(string $uri): ?array {
		foreach (Route::$_Routes as $route) {
			if (
				isset($route['regex']) &&
				$route['regex'] === true &&
				preg_match($route['uri'], $uri)
			) {
				return $route;
			}
			elseif ($route['uri'] === $uri) {
				return $route;
			}
		}

		return null;
	}
}
