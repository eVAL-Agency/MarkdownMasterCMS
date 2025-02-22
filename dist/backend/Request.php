<?php
/**
 * MarkdownMaster CMS
 *
 * @version 5.0.0-alpha.1
 * @copyright 2025 eVAL Agency
 * @license MIT
 * @link https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @package MarkdownMasterCMS
 *
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


use JetBrains\PhpStorm\NoReturn;

class Request {
	public string $method;
	public string $uri;
	public array $params;
	public array $headers;
	protected $body;

	public function __construct() {
		$this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
		$this->uri = $_SERVER['REQUEST_URI'] ?? '';
		if (strpos($this->uri, '?') !== false) {
			$this->uri = substr($this->uri, 0, strpos($this->uri, '?'));
		}
		$this->params = $_REQUEST;
		$this->headers = getallheaders();
	}

	/**
	 * Send a response back to the user agent with an error message and HTTP response code
	 *
	 * @param string $message
	 * @param int $code
	 * @return void
	 */
	#[NoReturn]
	public function replyError(string $message, int $code = 500): void {
		http_response_code($code);

		if ($this->prefersJSON()) {
			header('Content-Type: application/json');
			echo json_encode(['error' => $message]);
		} elseif ($this->prefersXML()) {
			header('Content-Type: application/xml');
			echo '<?xml version="1.0" encoding="UTF-8"?>';
			echo '<error>' . $message . '</error>';
		} elseif ($this->prefersHTML()) {
			header('Content-Type: text/html');
			echo '<h1>Error ' . $code . '</h1>';
			echo '<p>' . $message . '</p>';
		} else {
			header('Content-Type: text/plain');
			echo $message;
		}
		die();
	}

	/**
	 * Get the controller for the current request
	 *
	 * @return Controller|null
	 */
	public function getController(): ?Controller {
		$routes = require __DIR__ . '/routes.php';
		$webPath = Config::GetWebPath();
		$checkUri = '/' . substr($this->uri, strlen($webPath));

		foreach ($routes as $route) {
			if (
				isset($route['regex']) &&
				$route['regex'] === true &&
				preg_match($route['uri'], $checkUri)
			) {
				require_once('backend/controllers/' . $route['file']);
				return new $route['class']($this, $route['params']);
			}
			elseif ($route['uri'] === $checkUri) {
				require_once('backend/controllers/' . $route['file']);
				return new $route['class']($this, $route['params']);
			}
		}

		$this->replyError('No route found for /' . substr($this->uri, strlen($webPath)), 404);
	}

	/**
	 * Get a header value from the request
	 *
	 * @param string $key
	 * @return string|null
	 */
	public function getHeader(string $key): ?string {
		return $this->headers[$key] ?? null;
	}

	/**
	 * Check if the request accepts a certain content type
	 *
	 * @param string $type
	 * @return bool
	 */
	public function accepts(string $type): bool {
		$accept = $this->getHeader('Accept');
		return str_contains($accept, $type) || str_contains($accept, '*/*');
	}

	/**
	 * Check if the request accepts JSON
	 *
	 * @return bool
	 */
	public function acceptsJSON(): bool {
		return $this->accepts('application/json');
	}

	/**
	 * Check if the request accepts XML
	 *
	 * @return bool
	 */
	public function acceptsXML(): bool {
		return $this->accepts('application/xml');
	}

	/**
	 * Check if the request accepts HTML
	 *
	 * @return bool
	 */
	public function acceptsHTML(): bool {
		return $this->accepts('text/html');
	}

	/**
	 * Check if the request prefers a certain content type
	 *
	 * @param string $type
	 * @return bool
	 */
	public function prefers(string $type): bool {
		$accept = $this->getHeader('Accept');
		$contentType = $this->getHeader('Content-Type');

		if ($accept == '*/*') {
			// No content type preferred, try the filename to match the type
			$ext = pathinfo($this->uri, PATHINFO_EXTENSION);
			$map = [
				'json' => 'application/json',
				'xml' => 'application/xml',
				'html' => 'text/html',
			];
			if (isset($map[$ext])) {
				return $map[$ext] === $type;
			}

			// No content type specified, assume the client prefers whatever they sent originally.
			return str_contains($contentType, $type);
		} elseif (str_contains($accept, ',')) {
			// Accept is an array of items, check the first one
			$accept = explode(',', $accept);
			return str_contains($accept[0], $type);
		} else {
			// Accept is a single item
			return str_contains($accept, $type);
		}
	}

	/**
	 * Check if the request prefers JSON
	 *
	 * @return bool
	 */
	public function prefersJSON(): bool {
		return $this->prefers('application/json');
	}

	/**
	 * Check if the request prefers XML
	 *
	 * @return bool
	 */
	public function prefersXML(): bool {
		return $this->prefers('application/xml');
	}

	/**
	 * Check if the request prefers HTML
	 *
	 * @return bool
	 */
	public function prefersHTML(): bool {
		return $this->prefers('text/html');
	}

	/**
	 * Check if the request is JSON
	 *
	 * @return bool
	 */
	public function isJSON(): bool {
		$contentType = $this->getHeader('Content-Type');
		return str_contains($contentType, 'application/json');
	}

	/**
	 * Get the request body
	 *
	 * @return mixed
	 */
	public function getBody(): mixed {
		if ($this->body === null) {
			$this->body = file_get_contents('php://input');

			if ($this->isJSON()) {
				$this->body = json_decode($this->body, true);
			}
		}
		return $this->body;
	}

	public function getIP(): string {
		return $_SERVER['REMOTE_ADDR'] ?? '';
	}

	public function getUserAgent(): string {
		return $_SERVER['HTTP_USER_AGENT'] ?? '';
	}

	/**
	 * Override the body with some content, useful for tests
	 *
	 * @param mixed $body
	 * @return void
	 */
	public function overrideBody(mixed $body): void {
		$this->body = $body;
	}
}