<?php

namespace MarkdownMaster\Services;

use MarkdownMaster\Config;
use MarkdownMaster\Events\RenderPageViewEvent;

class FaviconService {

	/**
	 * Add icon links to the HTML view based on configured icons
	 *
	 * Standard favicons `<link rel="icon".../>` are added when:
	 *
	 * * Icon is an SVG, PNG, GIF, or JPEG/JPG
	 * * Icon is <= 128x128
	 *
	 * Apple favicons `<link rel="apple-touch-icon".../>` are added when:
	 *
	 * * Icon is a PNG
	 * * Icon is exactly 180x180
	 *
	 * @param RenderPageViewEvent $event
	 * @return void
	 */
	public static function InjectFavicon(RenderPageViewEvent $event): void {
		$icons = Config::GetIcons();

		$vectorTypes = [
			'image/svg+xml',
			'image/svg',
		];
		$standardTypes = [
			'image/png',
			'image/gif',
			'image/jpeg',
		];
		$standardSizes = [
			'16x16',
			'32x32',
			'48x48',
			'64x64',
			'128x128',
			'256x256',
		];
		$appleTypes = [
			'image/png',
		];
		$appleSizes = [
			'120x120',
			'180x180',
		];

		foreach($icons as $icon) {
			// Standard icons support vector
			if (in_array($icon['type'], $vectorTypes)) {
				$event->view->addLink([
					'rel' => 'icon',
					'href' => $icon['src'],
					'type' => $icon['type'],
				]);
			}

			// Check for standard icons
			if (in_array($icon['type'], $standardTypes) && in_array($icon['sizes'], $standardSizes)) {
				$event->view->addLink([
					'rel' => 'icon',
					'href' => $icon['src'],
					'type' => $icon['type'],
					'sizes' => $icon['sizes'],
				]);
			}

			// Check for apple touch icons
			if (in_array($icon['type'], $appleTypes) && in_array($icon['sizes'], $appleSizes)) {
				$event->view->addLink([
					'rel' => 'apple-touch-icon',
					'href' => $icon['src'],
					'type' => $icon['type'],
					'sizes' => $icon['sizes'],
				]);
			}
		}
	}
}