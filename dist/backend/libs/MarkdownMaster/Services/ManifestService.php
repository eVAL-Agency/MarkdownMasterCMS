<?php

namespace MarkdownMaster\Services;

use MarkdownMaster\Config;
use MarkdownMaster\Events\RenderPageViewEvent;

class ManifestService {
	/**
	 * Add `<link rel="manifest".../>` and `<meta name="theme-color".../>` into HTML page
	 *
	 * @param RenderPageViewEvent $event
	 * @return void
	 * @throws \Exception
	 */
	public static function InjectManifestLinks(RenderPageViewEvent $event): void {
		$webRoot = Config::GetWebPath();
		$themeColor = Config::GetSetting('pwa', 'theme_color', '#1e3a5d');

		$event->view->addLink([
			'rel' => 'manifest',
			'href' => $webRoot . 'manifest.json',
		]);

		$event->view->meta['theme-color'] = $themeColor;
	}
}
