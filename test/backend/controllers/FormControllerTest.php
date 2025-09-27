<?php

use MarkdownMaster\Config;
use MarkdownMaster\Controllers\FormController;
use MarkdownMaster\Request;
use MarkdownMaster\Views\JSONView;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use PHPUnit\Framework\TestCase;

#[UsesClass(Request::class)]
#[UsesClass(Config::class)]
#[UsesClass(JSONView::class)]
#[CoversClass(FormController::class)]
class FormControllerTest extends TestCase {
	private function _setupRequest(array $formData): Request {
		// Spoof the request for a successful form request
		$request = new Request();
		$request->method = 'POST';
		$request->uri = '/form';
		$request->headers['Content-Type'] = 'application/json';
		$request->overrideBody($formData);

		// Spoof config
		Config::OverrideConfig([
			'types' => ['test'],
			'webpath' => '/',
			'forms' => [
				'test' => [
					'fields' => [
						'name' => [
							'required' => true,
						],
						'email' => [
							'type' => 'email',
							'required' => true,
						],
					],
					'actions' => [
						[
							'action' => 'test',
						]
					]
				]
			]
		]);

		return $request;
	}

	/**
	 * Test a successful form submission
	 * @return void
	 */
	public function testPost() {
		// Spoof the request for a successful form request
		$request = $this->_setupRequest([
			'form' => 'test',
			'name' => 'John Doe',
			'email' => 'test@evalagency.com',
		]);

		$controller = $request->getController();
		$this->assertInstanceOf(FormController::class, $controller);

		$view = $controller->run();
		$this->assertInstanceOf(JSONView::class, $view);
		$this->assertIsArray($view->data);
		$this->assertArrayHasKey('success', $view->data);
		$this->assertArrayHasKey('form', $view->data);
		$this->assertEquals('test', $view->data['form']['form']);
		$this->assertEquals('John Doe', $view->data['form']['name']);
		$this->assertEquals('test@evalagency.com', $view->data['form']['email']);
	}

	/**
	 * Test a form submission with an invalid email address
	 *
	 * @return void
	 */
	public function testPostNotAnEmail() {
		// Spoof the request for a successful form request
		$request = $this->_setupRequest([
			'form' => 'test',
			'name' => 'John Doe',
			'email' => 'not-a-valid-email',
		]);

		$controller = $request->getController();

		$view = $controller->run();
		$this->assertInstanceOf(JSONView::class, $view);
		$this->assertIsArray($view->data);
		$this->assertEquals(400, $view->status);
		$this->assertArrayHasKey('email', $view->data['errors']);
	}
}
