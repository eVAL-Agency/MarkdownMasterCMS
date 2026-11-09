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

function recursiveArrayMerge(array $base, array $overrides): array {
	foreach ($overrides as $key => $value) {
		if (isset($base[$key]) && is_array($base[$key]) && is_array($value)) {
			$base[$key] = recursiveArrayMerge($base[$key], $value);
		} else {
			$base[$key] = $value;
		}
	}

	return $base;
}

class Config {
	private static ?array $_config = null;

	/**
	 * Parse and standardize an array of icons
	 *
	 * @param string $path
	 * @param array $icons
	 * @return array
	 */
	private static function _ParseIcons(string $path, array $icons): array {
		$ret = [];

		foreach($icons as $icon) {
			if (is_scalar($icon)) {
				// Simple string
				$iconData = [
					'src' => $icon,
				];
			}
			else {
				$iconData = $icon;
			}

			if (!isset($iconData['src'])) {
				// Icons need a src
				continue;
			}

			$physicalPath = BASE_DIR . '/' . $path . $iconData['src'];
			// Prefix images with the requested source,
			// this allows a theme to define its icons relative to the theme
			// without needing to include the path to the theme itself.
			// During Load, the theme it was pulled from is prepended as the path.
			$iconData['src'] = $path . $iconData['src'];

			// Require icons to exist
			if (!file_exists($physicalPath)) {
				continue;
			}

			if (!isset($iconData['type'])) {
				$iconData['type'] = mime_content_type($physicalPath);
			}

			if (!(isset($iconData['sizes']) && isset($iconData['width']) && isset($iconData['height']))) {
				// At least one of the dimension keys are missing.
				// SVGs are "any" because they're scalable.
				if (str_contains($iconData['type'], 'image/svg')) {
					$iconData['sizes'] = $iconData['sizes'] ?? 'any';
					$iconData['width'] = $iconData['width'] ?? 0;
					$iconData['height'] = $iconData['height'] ?? 0;
				}
				elseif (function_exists('getimagesize')) {
					// Guess the size from the image data
					$sizes = getimagesize($physicalPath);
					if ($sizes !== false) {
						$iconData['sizes'] = $iconData['sizes'] ?? ($sizes[0] . 'x' . $sizes[1]);
						$iconData['width'] = $sizes[0];
						$iconData['height'] = $sizes[1];
					}
					else {
						$iconData['sizes'] = $iconData['sizes'] ?? 'any';
						$iconData['width'] = 0;
						$iconData['height'] = 0;
					}
				}
			}

			if (!isset($iconData['purpose'])) {
				if (str_contains($iconData['src'], '-maskable')) {
					$iconData['purpose'] = 'maskable';
				}
				elseif (str_contains($iconData['src'], '-monochrome')) {
					$iconData['purpose'] = 'monochrome';
				}
				else {
					$iconData['purpose'] = 'any';
				}
			}

			$ret[] = $iconData;
		}

		return $ret;
	}

	/**
	 * Load the configuration file
	 *
	 * @return void
	 * @throws Exception
	 */
	private static function _Load() {
		if (!file_exists(BASE_DIR . '/config.php')) {
			throw new Exception(
				'Configuration file not found, please copy config.example.php to config.php',
				500
			);
		}

		$config = require BASE_DIR . '/config.php';

		if (!is_array($config)) {
			throw new Exception('Configuration file must return an array', 500);
		}

		if (isset($config['icons'])) {
			// Load icons from the root location
			$config['icons'] = self::_ParseIcons('', $config['icons']);
		}

		// Allow the theme to set defaults
		if (isset($config['theme'])) {
			$themeSettingsFile = BASE_DIR . '/themes/' . $config['theme'] . '/settings.php';
			if (file_exists($themeSettingsFile)) {
				$themeConfig = require BASE_DIR . '/themes/' . $config['theme'] . '/settings.php';

				if (isset($themeConfig['icons'])) {
					if (isset($config['icons'])) {
						// Icons from the environment configuration takes presedence for icons
						unset($themeConfig['icons']);
					}
					else {
						$themeConfig['icons'] = self::_ParseIcons(
							'themes/' . $config['theme'] . '/',
							$themeConfig['icons']
						);
					}
				}
				$config = recursiveArrayMerge($themeConfig, $config);
			}
		}

		if (!isset($config['host']) || $config['host'] === '') {
			throw new Exception('Configuration setting "host" is required', 500);
		}
		if (!isset($config['webpath']) || $config['webpath'] === '') {
			throw new Exception('Configuration setting "webpath" is required', 500);
		}
		if (!isset($config['defaultView']) || $config['defaultView'] === '') {
			throw new Exception('Configuration setting "defaultView" is required', 500);
		}
		if (!isset($config['types']) || $config['types'] === '') {
			throw new Exception('Configuration setting "types" is required', 500);
		}

		if (strpos($config['host'], '://') === -1) {
			// Convenience fix; prepend https by default
			$config['host'] = 'https://' . $config['host'];
		}

		if (!str_starts_with($config['webpath'], '/')) {
			// Convenience fix; prepend / by default
			$config['webpath'] = '/' . $config['webpath'];
		}
		if (!str_ends_with($config['webpath'], '/')) {
			// Convenience fix; append / by default
			$config['webpath'] = $config['webpath'] . '/';
		}

		// This key should be an array.
		// This allows them be defined as a single string.
		if (is_scalar($config['types'])) {
			$config['types'] = array_map('trim', explode(',', $config['types']));
		}

		if (array_is_list($config['types'])) {
			// Convert to associative array with defaults
			$types = [];
			foreach ($config['types'] as $type) {
				$types[$type] = [
					'list' => $type . 's',
					'single' => rtrim($type, 's'),
					'sort' => 'title',
					'title' => ucfirst($type) . 's',
				];
			}
			$config['types'] = $types;
		}

		if (isset($config['debug']) && $config['debug']) {
			error_reporting(E_ALL);
			ini_set('display_errors', 1);
		}

		self::$_config = $config;

		// Post Operations
		// Any operation that relies on Config being set, (now that the config is stored)

		// Resolve the paths for icons to their actual web path
		if (isset(self::$_config['icons'])) {
			$webPath = Config::GetWebPath();
			$icons = self::$_config['icons'];
			// Ensure all the icon src attributes are prefixed
			$icons = array_map(
				function ($icon) use ($webPath) {
					if (!str_starts_with($icon['src'], '/')) {
						$icon['src'] = $webPath . $icon['src'];
					}
					return $icon;
				},
				$icons
			);

			self::$_config['icons'] = $icons;
		}
	}

	private static function _Get(string $key, $default = null) {
		if (self::$_config === null) {
			self::_Load();
		}

		return array_key_exists($key, self::$_config) ? self::$_config[$key] : $default;
	}

	/**
	 * Get the host URL of the site
	 *
	 * Returns the full URL including protocol, without a trailing slash.
	 *
	 * Example: https://www.yourdomain.tld
	 *
	 * @return string
	 * @throws Exception
	 */
	public static function GetHost(): string {
		return self::_Get('host');
	}

	/**
	 * Get the web path to the CMS installation
	 *
	 * Returns the path with leading and trailing slashes.
	 *
	 * Example: /cms.js/dist/ or just / (for top-level sites)
	 *
	 * @return string
	 * @throws Exception
	 */
	public static function GetWebPath(): string {
		return self::_Get('webpath');
	}

	/**
	 * Get the root filesystem path to the CMS installation
	 *
	 * Example: /var/www/cms.js/
	 *
	 * @return string
	 * @throws Exception
	 */
	public static function GetRootPath(): string {
		return self::_Get('rootpath') ?? BASE_DIR . '/';
	}

	/**
	 * Get the default view to load when no specific page is requested (without any suffixes)
	 *
	 * Example: pages/home or wiki/home
	 *
	 * @return string
	 * @throws Exception
	 */
	public static function GetDefaultView(): string {
		return self::_Get('defaultView', 'home');
	}

	/**
	 * Get the type of content supported by the current theme
	 *
	 * Returns the key names only
	 *
	 * Example: ['pages', 'posts', 'landings']
	 *
	 * @return string[]
	 * @throws Exception
	 */
	public static function GetTypes(): array {
		return array_keys(self::_Get('types'));
	}

	/**
	 * Get the full type configuration supported by the current theme
	 *
	 * @return array
	 * @throws Exception
	 */
	public static function GetTypesFull(): array {
		return self::_Get('types');
	}

	/**
	 * Get a specific detail about a type of content
	 *
	 * @param string $type   Type of content to lookup
	 * @param string $key    Detail key to lookup
	 * @param mixed $default Default value to return if not found
	 * @return mixed|null
	 * @throws Exception
	 */
	public static function GetTypeDetail(string $type, string $key, $default = null): mixed {
		$types = self::_Get('types');
		if (!isset($types[$type])) {
			return $default;
		}
		if (!isset($types[$type][$key])) {
			return $default;
		}

		return $types[$type][$key];
	}

	/**
	 * Get the email configuration
	 *
	 * @return array ['from' => string, 'fromName' => string, 'dsn' => string]
	 * @throws Exception
	 */
	public static function GetEmail(): array {
		$emailConfig = self::_Get('email');
		if (!$emailConfig) {
			throw new Exception('No email configuration found', 500);
		}
		if (!is_array($emailConfig)) {
			throw new Exception('Email configuration must be an array', 500);
		}
		if (!isset($emailConfig['from'])) {
			throw new Exception('Email configuration missing required key: from', 500);
		}
		if (!isset($emailConfig['fromName'])) {
			throw new Exception('Email configuration missing required key: fromName', 500);
		}
		if (!isset($emailConfig['dsn'])) {
			throw new Exception('Email configuration missing required key: dsn', 500);
		}

		return $emailConfig;
	}

	/**
	 * @throws Exception
	 */
	public static function GetForm($formName): array {
		$forms = self::_Get('forms');

		if (!$forms) {
			throw new Exception('No forms found in configuration', 500);
		}
		if (!isset($forms[$formName])) {
			throw new Exception('Form not found in configuration', 500);
		}

		return $forms[$formName];
	}

	public static function GetForms(): array {
		return self::_Get('forms') ?? [];
	}

	public static function GetDebug(): bool {
		return self::_Get('debug') ?? false;
	}

	public static function GetTheme(): string {
		return self::_Get('theme') ?? '';
	}

	public static function IsReady(): bool {
		return self::$_config !== null;
	}

	public static function GetElementId(): string {
		return self::_Get('elementId') ?? 'cms';
	}

	/**
	 * Get the service worker full path or true for the default worker.
	 * If False or an empty string is returned, that triggers the service worker to be disabled.
	 *
	 * @return string|bool
	 */
	public static function GetServiceWorker(): string|bool {
		// @todo Switch to True by default once tested
		return self::_Get('serviceWorker') ?? false;
	}

	/**
	 * Check if service worker support is enabled
	 *
	 * Returns true if the service worker is set to True (default worker)
	 * or a non-empty string (custom worker).
	 *
	 * @return bool
	 */
	public static function IsServiceWorkerEnabled(): bool {
		$sw = Config::GetServiceWorker();
		return ($sw === true || (is_scalar($sw) && strlen($sw) > 1));
	}

	public static function GetExtras(): array {
		return self::_Get('extras') ?? [];
	}

	/**
	 * Get the database path for the popularity feature
	 *
	 * @return string
	 */
	public static function GetDatabasePath(): string {
		return self::GetSetting('database', 'path') ?? self::GetRootPath() . 'data/cms.sqlite';
	}

	/**
	 * Get a setting from a block
	 *
	 * @param string $block Block name (e.g. 'popularity', 'webcron')
	 * @param string $key Key to lookup
	 * @param mixed $default Default value if not found
	 * @return mixed
	 */
	public static function GetSetting(string $block, string $key, $default = null): mixed {
		$config = self::_Get($block);
		if (!$config || !is_array($config)) {
			return $default;
		}
		return $config[$key] ?? $default;
	}

	public static function GetExtraParameter(string $extra, string $key, $default = null): mixed {
		$extras = self::GetExtras();
		if (!isset($extras[$extra]) || !is_array($extras[$extra])) {
			return $default;
		}
		if (!isset($extras[$extra][$key])) {
			return $default;
		}

		return $extras[$extra][$key];
	}

	/**
	 * Get the configuration for client setup
	 *
	 * Mimics config.js to let the owner not have to worry about two config files.
	 *
	 * @return string
	 */
	public static function GetClientConfig(): string {
		$extras = Config::GetExtras();

		// Transpose form configuration into the client
		$forms = Config::GetForms();
		if (count($forms)) {
			$formClientConfig = [];
			foreach ($forms as $name => $form) {
				$formClientConfig[$name] = [
					'fields' => [],
				];
				foreach ($form['fields'] as $fieldName => $field) {
					$fieldType = $field['type'] ?? 'text';
					if ($fieldType === 'honeypot') {
						$field['type'] = 'text';
					}
					$formClientConfig[$name]['fields'][$fieldName] = $field;
				}
			}
			$extras['cms-form'] = $formClientConfig;
		}

		// Only include extras which include a javascript file in their root directory.
		// This allows for server-side only plugins, (just like there are client-side only plugins).
		foreach ($extras as $extraName => $extraConfig) {
			if (!file_exists(BASE_DIR . "/extras/$extraName/$extraName.js")) {
				unset($extras[$extraName]);
			}
		}

		$config = [
			'defaultView' => self::GetDefaultView(),
			'elementId' => self::GetElementId(),
			'debug' => self::GetDebug(),
			'version' => self::GetVersion(),
			'webpath' => self::GetWebPath(),
			'layoutDirectory' => self::GetWebPath() . 'themes/' . self::GetTheme() . '/layouts/',
			'extras' => $extras,
			'serviceWorker' => self::GetServiceWorker(),
		];

		// Additional / extra options not usually present
		if (($val = Config::_Get('tasklistChecked', '__DEFAULT__')) !== '__DEFAULT__') {
			$config['tasklistChecked'] = $val;
		}

		if (($val = Config::_Get('tasklistUnchecked', '__DEFAULT__')) !== '__DEFAULT__') {
			$config['tasklistUnchecked'] = $val;
		}

		return json_encode($config);
	}

	/**
	 * Override system configuration, useful in tests
	 * @param array $config
	 * @return void
	 */
	public static function OverrideConfig(array $config) {
		self::$_config = $config;
	}

	/**
	 * Get the assets version, controls cache-busting version strings
	 *
	 * NOT the actual version of the application!
	 *
	 * @return string
	 */
	public static function GetVersion(): string {
		return (string)self::_Get('version', 1);
	}

	/**
	 * Get a list of icons defined for this application
	 *
	 * Each icon will contain:
	 *
	 * * src
	 * * sizes
	 * * purpose
	 * * type
	 *
	 * For example:
	 *
	 * ```json
	 * [
	 *   {
	 *     'src': '/themes/yourtheme/icons/icon.svg',
	 *     'type': 'image/svg+xml',
	 *     'sizes': 'any',
	 *     'purpose': 'any',
	 *     'width': 0,
	 *     'height': 0,
	 *   },
	 *   {
	 *     'src': '/themes/yourtheme/icons/icon.png',
	 *     'type': 'image/png',
	 *     'sizes': '192x192',
	 *     'purpose': 'any',
	 *     'width': 192,
	 *     'height': 192,
	 *   },
	 * ]
	 * ```
	 *
	 * @return array
	 */
	public static function GetIcons(): array {
		return self::_Get('icons', []);
	}
}