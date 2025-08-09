<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;

#[UsesClass(Request::class)]
#[UsesClass(Config::class)]
#[UsesClass(HTMLTemplateView::class)]
#[CoversClass(PageController::class)]
class PageControllerTest extends TestCase {
	private function _setupRequest(): Request {
		// Spoof the request for a successful form request
		$request = new Request();
		$request->method = 'GET';
		$request->uri = '/tests/good_file.html';
		$request->headers['Content-Type'] = 'text/html';

		// Spoof config
		Config::OverrideConfig([
			'types' => ['tests'],
			'host' => 'http://localhost',
			'webpath' => '/',
			'rootpath' => dirname(__DIR__, 2) . '/assets/',
			'theme' => 'test',
		]);

		return $request;
	}

	/**
	 * Test a standard page load
	 * @return void
	 */
	public function testGet() {
		// Spoof the request for a successful form request
		$request = $this->_setupRequest();

		$controller = $request->getController();
		$this->assertInstanceOf(PageController::class, $controller);

		$view = $controller->run();
		$this->assertInstanceOf(HTMLTemplateView::class, $view);
		$rendered = $view->fetch();

		$this->assertStringContainsString('<title>Google Friendly Title &amp; Stuff</title>', $rendered);
		$this->assertStringContainsString('<meta name="author" content="Alice">', $rendered);
		$this->assertStringContainsString('<link rel="canonical" href="http://localhost/tests/good_file.html">', $rendered);

	}
}
