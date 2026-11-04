<?php
/**
 * MarkdownMaster CMS
 *
 * @version dev
 * @copyright 2025-2026 eVAL Agency
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
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * WITH THE SOFTWARE.
 */

namespace MarkdownMaster\Controllers;

use MarkdownMaster\Config;
use MarkdownMaster\Controller;
use MarkdownMaster\Views\JSONView;

/**
 * Controller for the Web App Manifest
 *
 * Serves the PWA manifest at /manifest.json.  Values are read from the
 * "pwa" block of the configuration, where theme defaults (in
 * themes/<theme>/settings.php) are overridden by the root config.php.
 */
class ManifestController extends Controller {
	/**
	 * Get the Web App Manifest as a JSON structure
	 *
	 * @return JSONView
	 */
	public function get(): JSONView {
		$view = new JSONView();
		$view->contentType = 'application/manifest+json';

		$webpath = Config::GetWebPath();

		// Icon paths are absolute-from-origin, resolved relative to the manifest URL.
		$icons = Config::GetIcons();

		$view->data = [
			'name' => Config::GetSetting('pwa', 'name', 'MarkdownMasterCMS Website'),
			'short_name' => Config::GetSetting('pwa', 'short_name', 'MarkdownMasterCMS'),
			'display' => Config::GetSetting('pwa', 'display', 'standalone'),
			'start_url' => $webpath . Config::GetDefaultView() . '.html',
			'theme_color' => Config::GetSetting('pwa', 'theme_color', '#1e3a5d'),
			'background_color' => Config::GetSetting('pwa', 'background_color', '#ffffff'),
			'icons' => $icons,
		];

		return $view;
	}
}
