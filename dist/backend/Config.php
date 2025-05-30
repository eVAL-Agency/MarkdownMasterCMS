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

class Config {
	private static $_config = null;

	private static function _Get(string $key, $default = null) {
		if (self::$_config === null) {
			if (!file_exists(dirname(__DIR__) . '/config.php')) {
				throw new Exception(
					'Configuration file not found, please copy config.example.php to config.php',
					500
				);
			}

			$config = require dirname(__DIR__) . '/config.php';

			if (!is_array($config)) {
				throw new Exception('Configuration file must return an array', 500);
			}

			// Allow the theme to set defaults
			if (isset($config['theme'])) {
				$themeSettingsFile = dirname(__DIR__) . '/themes/' . $config['theme'] . '/settings.php';
				if (file_exists($themeSettingsFile)) {
					$themeConfig = require dirname(__DIR__) . '/themes/' . $config['theme'] . '/settings.php';
					$config = array_merge($themeConfig, $config);
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
			$config['types'] = array_map('trim', explode(',', $config['types']));

			if (isset($config['debug']) && $config['debug']) {
				error_reporting(E_ALL);
				ini_set('display_errors', 1);
			}

			self::$_config = $config;
		}

		return array_key_exists($key, self::$_config) ? self::$_config[$key] : $default;
	}

	/**
	 * @throws Exception
	 */
	public static function GetHost(): string {
		return self::_Get('host');
	}

	/**
	 * @throws Exception
	 */
	public static function GetWebPath(): string {
		return self::_Get('webpath');
	}

	public static function GetRootPath(): string {
		return self::_Get('rootpath') ?? dirname(__DIR__) . '/';
	}

	/**
	 * @throws Exception
	 */
	public static function GetDefaultView() : string {
		return self::_Get('defaultView');
	}

	/**
	 * @throws Exception
	 */
	public static function GetTypes(): array {
		return self::_Get('types');
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

	public static function GetExtras(): array {
		return self::_Get('extras') ?? [];
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
				foreach($form['fields'] as $fieldName => $field) {
					$formClientConfig[$name]['fields'][$fieldName] = $field;
				}
			}
			$extras['cms-form'] = $formClientConfig;
		}

		$config = [
			'defaultView' => self::GetDefaultView(),
			'elementId' => self::GetElementId(),
			'debug' => self::GetDebug(),
			'webpath' => self::GetWebPath(),
			'layoutDirectory' => self::GetWebPath() . 'themes/' . self::GetTheme() . '/layouts/',
			'extras' => $extras,
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
}