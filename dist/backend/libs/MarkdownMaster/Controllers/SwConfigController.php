<?php

namespace MarkdownMaster\Controllers;

use MarkdownMaster\Config;
use MarkdownMaster\Controller;
use MarkdownMaster\Views\JSONView;

class SwConfigController extends Controller {
	/**
	 * Get the configuration for the service worker, as a JSON structure
	 *
	 * @return JSONView
	 */
	public function get() {
		$view = new JSONView();

		$icons = Config::GetIcons();
		$offlineFiles = [
			Config::GetWebPath() . 'manifest.json',
		];

		// The offline.html template (if it exists) should be cached for offline use
		if (file_exists(Config::GetRootPath() . 'themes/' . Config::GetTheme() . '/layouts/offline.html')) {
			$offlineFiles[] = Config::GetWebPath() . 'themes/' . Config::GetTheme() . '/layouts/offline.html';
		}

		// Core icons get cached
		foreach($icons as $icon) {
			$offlineFiles[] = $icon['src'];
		}

		// Pull the various data needed by the service worker
		$view->data = [
			// Name of the theme enabled
			'theme' => Config::GetTheme(),
			// Fully resolved webpath to the site, usually '/', but could be '/mysite/path/', etc.
			'webpath' => Config::GetWebPath(),
			// Full path to the theme layouts
			'layoutDirectory' => Config::GetWebPath() . 'themes/' . Config::GetTheme() . '/layouts/',
			// Hash of the configuration state; used to know if the state needs refreshed
			'configHash' => md5(Config::GetClientConfig()),
			// How long (in seconds) between service worker configuration checks
			'configCheckInterval' => Config::GetDebug() ? 5 : 600,
			// A list of files to cache offline
			'offlineFiles' => $offlineFiles,
		];

		return $view;
	}
}