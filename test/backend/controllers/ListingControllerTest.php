<?php

use MarkdownMaster\Config;
use MarkdownMaster\Controllers\ListingController;
use MarkdownMaster\Request;
use MarkdownMaster\Route;
use MarkdownMaster\Views\HTMLTemplateView;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use PHPUnit\Framework\TestCase;

#[UsesClass(Request::class)]
#[UsesClass(Config::class)]
#[UsesClass(HTMLTemplateView::class)]
#[CoversClass(ListingController::class)]
class ListingControllerTest extends TestCase {

	public static function setUpBeforeClass(): void {
		// Register the route that matches a listing page URL.
		Route::RegisterRoute('/tests.html', 'MarkdownMaster\Controllers\ListingController', 'tests');
	}

	private function _setupRequest(): Request {
		$request = new Request();
		$request->method = 'GET';
		$request->uri = '/tests.html';
		$request->headers['Content-Type'] = 'text/html';

		// Spoof config (associative types, like production)
		Config::OverrideConfig([
			'types'  => ['tests' => ['list' => 'testss', 'single' => 'test', 'sort' => 'title', 'title' => 'Testss']],
			'host'   => 'http://localhost',
			'webpath' => '/',
			'rootpath' => dirname(__DIR__, 2) . '/assets/',
			'theme'  => 'test',
		]);

		return $request;
	}

	/**
	 * The listing page shows published pages but hides drafts and
	 * future-dated pages.
	 *
	 * @return void
	 */
	public function testGetHidesUnpublished() {
		$request = $this->_setupRequest();

		$controller = $request->getController();
		$this->assertInstanceOf(ListingController::class, $controller);

		$view = $controller->run();
		$this->assertInstanceOf(HTMLTemplateView::class, $view);
		$rendered = $view->fetch();

		// A published page appears in the listing.
		$this->assertStringContainsString('Testing Bug Features', $rendered);

		// Draft and future-dated pages do not.
		$this->assertStringDoesNotContainString('I should not display', $rendered);
		$this->assertStringDoesNotContainString('Future Dated Post', $rendered);
	}
}
