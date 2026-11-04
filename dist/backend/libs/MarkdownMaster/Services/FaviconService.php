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

		$standardTypes = [
			'image/svg+xml',
			'image/svg',
			'image/png',
			'image/gif',
			'image/jpeg',
		];
		$appleTypes = [
			'image/png',
		];

		foreach($icons as $icon) {
			// Check for standard icons
			if (in_array($icon['type'], $standardTypes) && $icon['width'] <= 128 && $icon['height'] <= 128) {
				if ($icon['sizes'] === 'any') {
					$event->view->addLink([
						'rel' => 'icon',
						'href' => $icon['src'],
						'type' => $icon['type'],
					]);
				}
				else {
					$event->view->addLink([
						'rel' => 'icon',
						'href' => $icon['src'],
						'type' => $icon['type'],
						'sizes' => $icon['sizes'],
					]);
				}
			}

			if (in_array($icon['type'], $appleTypes) && $icon['width'] == 180 && $icon['height'] == 180) {
				$event->view->addLink([
					'rel' => 'apple-touch-icon',
					'href' => $icon['src'],
					'type' => $icon['type'],
					'sizes' => '180x180',
				]);
			}
		}
	}
}