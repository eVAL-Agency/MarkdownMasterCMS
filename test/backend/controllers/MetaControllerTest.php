<?php

namespace backend\controllers;

use MarkdownMaster\Config;
use MarkdownMaster\Controllers\MetaController;
use MarkdownMaster\Request;
use MarkdownMaster\Route;
use MarkdownMaster\Views\JSONView;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use PHPUnit\Framework\TestCase;

#[UsesClass(Request::class)]
#[UsesClass(Config::class)]
#[UsesClass(JSONView::class)]
#[CoversClass(MetaController::class)]
class MetaControllerTest extends TestCase {

	private function _setupRequest(): Request {
		// Spoof the request for a successful form request
		$request = new Request();
		$request->method = 'GET';
		$request->uri = '/meta.json';
		$request->headers['Content-Type'] = 'application/json';

		return $request;
	}

	public static function setUpBeforeClass(): void {
		// Register the route that /meta.json resolves to.
		Route::RegisterRoute('/meta.json', 'MarkdownMaster\Controllers\MetaController');
	}

	private static function _spoofConfig(array $types): void {
		// types is an associative array keyed by type (like production); a bare
		// list would make Config::GetTypes() return the list indexes ([0]) and
		// break File construction.
		$spoof = [
			'host'     => 'http://localhost',
			'webpath'  => '/',
			'rootpath' => dirname(__DIR__, 2) . '/assets/',
		];
		foreach ($types as $type => $detail) {
			if (is_string($type)) {
				$detail = ['list' => $type . 's', 'single' => rtrim($type, 's'), 'sort' => 'title', 'title' => ucfirst($type) . 's'];
			}
			$spoof['types'][$type] = $detail;
		}
		Config::OverrideConfig($spoof);
	}

	/**
	 * Test a successful form submission
	 * @return void
	 */
	public function testGetBasic() {
		// Spoof config
		self::_spoofConfig(['tests']);

		// Spoof the request for a successful form request
		$request = $this->_setupRequest();

		$controller = $request->getController();
		$this->assertInstanceOf(MetaController::class, $controller);

		$view = $controller->run();
		$this->assertInstanceOf(JSONView::class, $view);
		$this->assertIsArray($view->data);
		$this->assertEquals(200, $view->status);
		$this->assertGreaterThan(0, count($view->data['tests']));
	}

	/**
	 * Test a form submission with an invalid email address
	 *
	 * @return void
	 */
	public function testGetFails() {
		// Spoof config
		self::_spoofConfig(['fails']);

		// Spoof the request for a successful form request
		$request = $this->_setupRequest();

		$controller = $request->getController();

		$view = $controller->run();
		$this->assertInstanceOf(JSONView::class, $view);
		$this->assertIsArray($view->data);
		$this->assertEquals(200, $view->status);
		$this->assertGreaterThan(0, count($view->data['fails']));
	}

	/**
	 * Draft and future-dated pages must not leak into meta.json.
	 *
	 * @return void
	 */
	public function testGetExcludesUnpublished() {
		self::_spoofConfig(['tests']);

		$request = $this->_setupRequest();
		$controller = $request->getController();
		$view = $controller->run();

		$urls = [];
		foreach ($view->data['tests'] as $entry) {
			$urls[] = $entry['url'];
		}

		// A published page is still present.
		$this->assertStringContainsString('tests/good_file.html', implode("\n", $urls));

		// Draft (draft always wins) and future-dated pages are excluded.
		$this->assertStringDoesNotContainString('draft_file.html', implode("\n", $urls));
		$this->assertStringDoesNotContainString('draft_past.html', implode("\n", $urls));
		$this->assertStringDoesNotContainString('future_dated.html', implode("\n", $urls));
	}
}
