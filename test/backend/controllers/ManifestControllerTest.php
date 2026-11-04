<?php

namespace backend\controllers;

use MarkdownMaster\Config;
use MarkdownMaster\Controllers\ManifestController;
use MarkdownMaster\Request;
use MarkdownMaster\Route;
use MarkdownMaster\Views\JSONView;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use PHPUnit\Framework\TestCase;

#[UsesClass(Request::class)]
#[UsesClass(Config::class)]
#[UsesClass(JSONView::class)]
#[CoversClass(ManifestController::class)]
class ManifestControllerTest extends TestCase {

	/**
	 * Spoof a GET request for the manifest.  The uri must include the site
	 * webpath prefix, mirroring how Request::getController() strips it.
	 *
	 * @param string $uri Request URI (with the webpath prefix)
	 * @return Request
	 */
	private function _setupRequest(string $uri = '/manifest.json'): Request {
		$request = new Request();
		$request->method = 'GET';
		$request->uri = $uri;
		$request->headers['Content-Type'] = 'application/json';

		return $request;
	}

	public static function setUpBeforeClass(): void {
		// Register the route that /manifest.json resolves to.
		Route::RegisterRoute('/manifest.json', 'MarkdownMaster\Controllers\ManifestController');
	}

	/**
	 * Spoof a fully-configured config, including a root "pwa" block.
	 *
	 * In production, config.php and the theme settings.php are merged (root wins).
	 * OverrideConfig bypasses that merge, so this represents the final merged state
	 * that the controller sees.
	 *
	 * @param array|null $pwa Optional root "pwa" block (simulates config.php override)
	 */
	private static function _spoofConfig(?array $pwa = null): void {
		$spoof = [
			'host'     => 'http://localhost',
			'webpath'  => '/',
			'rootpath' => dirname(__DIR__, 2) . '/assets/',
			'theme'    => 'basic-blog',
			// Types aren't needed for the manifest, but provide a dummy so the
			// config is well-formed in case any helper touches it.
			'types'    => ['tests'],
		];
		if ($pwa !== null) {
			$spoof['pwa'] = $pwa;
		}
		Config::OverrideConfig($spoof);
	}

	/**
	 * A root "pwa" block fully overrides the theme's values.
	 */
	public function testGetRootPwaOverridesTheme(): void {
		self::_spoofConfig([
			'name'             => 'My Custom Site',
			'short_name'       => 'MySite',
			'display'          => 'browse',
			'start_url'        => '/custom/',
			'theme_color'      => '#ff0000',
			'background_color' => '#111111',
		]);

		$request = $this->_setupRequest();
		$controller = $request->getController();
		$this->assertInstanceOf(ManifestController::class, $controller);

		$view = $controller->run();
		$this->assertInstanceOf(JSONView::class, $view);
		$this->assertSame('application/manifest+json', $view->contentType);
		$this->assertEquals(200, $view->status);

		$data = $view->data;
		$this->assertSame('My Custom Site', $data['name']);
		$this->assertSame('MySite', $data['short_name']);
		$this->assertSame('browse', $data['display']);
		$this->assertSame('/custom/', $data['start_url']);
		$this->assertSame('#ff0000', $data['theme_color']);
		$this->assertSame('#111111', $data['background_color']);
		$this->assertCount(3, $data['icons']);
	}

	/**
	 * With no "pwa" block at all, sensible defaults are used.
	 *
	 * Simulates a deployment where neither the theme nor the root config sets PWA.
	 */
	public function testGetFallbackDefaults(): void {
		self::_spoofConfig(null);

		$request = $this->_setupRequest();
		$controller = $request->getController();
		$view = $controller->run();

		$data = $view->data;
		$this->assertSame('MarkdownMasterCMS Website', $data['name']);
		$this->assertSame('MarkdownMasterCMS', $data['short_name']);
		$this->assertSame('standalone', $data['display']);
		// start_url defaults to webpath (which is "/" here)
		$this->assertSame('/', $data['start_url']);
		$this->assertSame('#1e3a5d', $data['theme_color']);
		$this->assertSame('#ffffff', $data['background_color']);
	}

	/**
	 * A partial "pwa" block only overrides the keys it sets; the rest use defaults.
	 */
	public function testGetPartialPwaOverridesOnlySetKeys(): void {
		self::_spoofConfig([
			'theme_color' => '#00aa00',
			'short_name'  => 'Partial',
		]);

		$request = $this->_setupRequest();
		$controller = $request->getController();
		$view = $controller->run();
		$data = $view->data;

		// Overridden
		$this->assertSame('#00aa00', $data['theme_color']);
		$this->assertSame('Partial', $data['short_name']);
		// Unset keys fall back to defaults
		$this->assertSame('MarkdownMasterCMS Website', $data['name']);
		$this->assertSame('standalone', $data['display']);
		$this->assertSame('#ffffff', $data['background_color']);
	}

	/**
	 * Icons are resolved against the active theme's directory and the site webpath.
	 */
	public function testGetIconsReferenceThemeAndWebpath(): void {
		// Simulate a subdirectory deployment to exercise webpath.
		$spoof = [
			'host'     => 'http://localhost',
			'webpath'  => '/blog/',
			'rootpath' => dirname(__DIR__, 2) . '/assets/',
			'theme'    => 'basic-blog',
			'types'    => ['tests'],
			'pwa'      => ['name' => 'x'],
		];
		Config::OverrideConfig($spoof);

		// webpath is "/blog/", so the request URI must include that prefix
		$request = $this->_setupRequest('/blog/manifest.json');
		$controller = $request->getController();
		$view = $controller->run();
		$data = $view->data;

		$base = '/blog/themes/basic-blog/icons/';
		$expected = [
			$base . 'icon-192.png',
			$base . 'icon-512.png',
			$base . 'icon-maskable-512.png',
		];

		$sources = array_column($data['icons'], 'src');
		$this->assertEquals($expected, $sources);

		// Verify sizes and purposes.
		$bySize = [];
		foreach ($data['icons'] as $icon) {
			$bySize[$icon['sizes']][] = $icon;
		}
		$this->assertCount(1, $bySize['192x192']);
		$this->assertSame('image/png', $bySize['192x192'][0]['type']);
		$this->assertSame('any', $bySize['192x192'][0]['purpose']);

		$this->assertCount(2, $bySize['512x512']);
		// One of the 512 icons must be maskable.
		$hasMaskable = in_array('maskable', array_column($bySize['512x512'], 'purpose'), true);
		$this->assertTrue($hasMaskable, 'Expected a maskable 512 icon');
	}

	/**
	 * An empty theme falls back to "default" for icon paths (never an empty segment).
	 */
	public function testGetEmptyThemeFallbackForIcons(): void {
		$spoof = [
			'host'     => 'http://localhost',
			'webpath'  => '/',
			'rootpath' => dirname(__DIR__, 2) . '/assets/',
			'theme'    => '',
			'types'    => ['tests'],
		];
		Config::OverrideConfig($spoof);

		$request = $this->_setupRequest();
		$controller = $request->getController();
		$view = $controller->run();
		$data = $view->data;

		$src = $data['icons'][0]['src'];
		$this->assertSame('/themes/default/icons/icon-192.png', $src);
		// No double-slash (empty theme segment) in any icon path.
		foreach ($data['icons'] as $icon) {
			$this->assertStringDoesNotContainString('//', $icon['src']);
		}
	}
}
