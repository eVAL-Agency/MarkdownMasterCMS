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

namespace MarkdownMaster\Controllers;

use Exception;
use MarkdownMaster\Model;
use MarkdownMaster\Views\TextView;
use MarkdownMaster\Config;
use MarkdownMaster\Controller;

/**
 * Handle installation of the simple database
 */
class InstallController extends Controller {
	private function _log(string $message, TextView $view) {
		if (Config::GetDebug()) {
			$view->body .= $message . PHP_EOL;
		}
	}

	private function _errorLog(string $message, TextView $view) {
		if (Config::GetDebug()) {
			$view->body .= $message . PHP_EOL;
		}
		else {
			$view->body = 'FAIL';
		}
		error_log($message);
	}

	public function get() {
		$view = new TextView();
		$path = Config::GetDatabasePath();

		if (!$path) {
			// Database path not configured, nothing to install.
			$this->_errorLog("Database path not configured, skipping database initialization.", $view);
			return $view;
		}

		try {
			$dir = dirname($path);

			if (!is_dir($dir)) {
				$this->_log("Creating database directory: $dir", $view);
				mkdir($dir, 0755, true);
			}
			if (!file_exists($path)) {
				$this->_log("Creating database file: $path", $view);
				touch($path);
			}
		} catch (Exception $e) {
			$this->_errorLog("Failed to create database directory: " . $e->getMessage(), $view);
			return $view;
		}

		$db = Model::Db();
		if (!$db) {
			$this->_errorLog("Failed to initialize database!  Skipping install procedure", $view);
			return $view;
		}

		foreach (Model::GetRegisteredModels() as $modelClass) {
			try {
				$modelClass::SyncTable();
				$this->_log("Synchronized database table: " . $modelClass, $view);
			} catch (Exception $e) {
				$this->_errorLog("Failed to initialize database: " . $e->getMessage(), $view);
				return $view;
			}
		}

		$view->body .= 'OK';
		return $view;
	}
}