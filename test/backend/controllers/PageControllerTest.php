<?php

use MarkdownMaster\Config;
use MarkdownMaster\Controllers\PageController;
use MarkdownMaster\Request;
use MarkdownMaster\Route;
use MarkdownMaster\Views\HTMLTemplateView;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use PHPUnit\Framework\TestCase;

#[UsesClass(Request::class)]
#[UsesClass(Config::class)]
#[UsesClass(HTMLTemplateView::class)]
#[CoversClass(PageController::class)]
class PageControllerTest extends TestCase {

	public static function setUpBeforeClass(): void {
		// Register the route that matches individual page URLs.
		Route::RegisterRegexRoute('#/tests/.*\.html#', 'MarkdownMaster\Controllers\PageController', 'tests');
	}

	private function _setupRequest(string $uri): Request {
		// Spoof the request for a successful form request
		$request = new Request();
		$request->method = 'GET';
		$request->uri = $uri;
		$request->headers['Content-Type'] = 'text/html';

		// Spoof config (associative types, like production)
		Config::OverrideConfig([
			'types' => ['tests' => ['list' => 'testss', 'single' => 'test', 'sort' => 'title', 'title' => 'Testss']],
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
		$request = $this->_setupRequest('/tests/good_file.html');

		$controller = $request->getController();
		$this->assertInstanceOf(PageController::class, $controller);

		$view = $controller->run();
		$this->assertInstanceOf(HTMLTemplateView::class, $view);
		$rendered = $view->fetch();

		$this->assertStringContainsString('<title>Google Friendly Title &amp; Stuff</title>', $rendered);
		$this->assertStringContainsString('<meta name="author" content="Alice">', $rendered);
		$this->assertStringContainsString('<link rel="canonical" href="http://localhost/tests/good_file.html">', $rendered);
	}

	/**
	 * A draft page must still be loadable directly by URL (preview before
	 * publishing) even though it is hidden from listings.
	 *
	 * @return void
	 */
	public function testGetDraftPageStillAccessible() {
		$request = $this->_setupRequest('/tests/draft_file.html');

		$controller = $request->getController();
		$this->assertInstanceOf(PageController::class, $controller);

		$view = $controller->run();
		$this->assertInstanceOf(HTMLTemplateView::class, $view);
		$this->assertEquals(200, $view->status);
		$rendered = $view->fetch();
		// The draft content renders for direct URL access.
		$this->assertStringContainsString('I should not display', $rendered);
	}

	/**
	 * A future-dated page must still be loadable directly by URL, even
	 * though it is hidden from listings until its date arrives.
	 *
	 * @return void
	 */
	public function testGetFutureDatedPageStillAccessible() {
		$request = $this->_setupRequest('/tests/future_dated.html');

		$controller = $request->getController();
		$this->assertInstanceOf(PageController::class, $controller);

		$view = $controller->run();
		$this->assertInstanceOf(HTMLTemplateView::class, $view);
		$this->assertEquals(200, $view->status);
		$rendered = $view->fetch();
		// The future-dated content renders for direct URL access.
		$this->assertStringContainsString('Future Dated Post', $rendered);
	}
}
