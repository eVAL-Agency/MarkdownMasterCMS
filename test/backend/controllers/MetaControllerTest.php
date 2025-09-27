<?php

namespace backend\controllers;

use MarkdownMaster\Config;
use MarkdownMaster\Controllers\MetaController;
use MarkdownMaster\Request;
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

	/**
	 * Test a successful form submission
	 * @return void
	 */
	public function testGetBasic() {
		// Spoof config
		Config::OverrideConfig([
			'types' => ['tests'],
			'host' => 'http://localhost',
			'webpath' => '/',
			'rootpath' => dirname(__DIR__, 2) . '/assets/',
		]);

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
		Config::OverrideConfig([
			'types' => ['fails'],
			'host' => 'http://localhost',
			'webpath' => '/',
			'rootpath' => dirname(__DIR__, 2) . '/assets/',
		]);

		// Spoof the request for a successful form request
		$request = $this->_setupRequest();

		$controller = $request->getController();

		$view = $controller->run();
		$this->assertInstanceOf(JSONView::class, $view);
		$this->assertIsArray($view->data);
		$this->assertEquals(200, $view->status);
		$this->assertGreaterThan(0, count($view->data['fails']));
	}
}
