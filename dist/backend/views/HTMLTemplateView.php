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

class HTMLTemplateView extends View {
    public string $title = '';
    public string $description = '';
    public string $body = '';
    public string $canonical = '';
    public array $meta = [];
	public array $classes = [];

    public function render() {
		$templateFile = 'themes/' . Config::GetTheme() . '/index.html';
		if (!file_exists($templateFile)) {
			throw new Exception('No theme index template found', 500);
		}

		$contents = file_get_contents($templateFile);
		// Do a basic find/replace for common variables
		$replacements = [
			'{{theme_dir}}' => Config::GetWebPath() . 'themes/' . Config::GetTheme() . '/',
			'{{webpath}}' => Config::GetWebPath(),
			'{{year}}' => date('Y'),
		];
		$contents = str_replace(array_keys($replacements), array_values($replacements), $contents);

		libxml_use_internal_errors(true);
		$dom = new DOMDocument();
		$dom->loadHTML($contents);
		$xpath = new DOMXPath($dom);

		if (count($this->classes)) {
			$tag = $xpath->query('/html/body')->item(0);
			$tag->setAttribute('class', implode(' ', $this->classes));
		}

		if ($this->title) {
			$xpath->query('//title')->item(0)->nodeValue = $this->title;
		}
		if ($this->description) {
			$tag = $xpath->query('/html/head/meta[@name="description"]');
			if ($tag->length == 0) {
				$tag = $dom->createElement('meta');
				$tag->setAttribute('name', 'description');
				$tag->setAttribute('content', $this->description);
				$xpath->query('/html/head')->item(0)->appendChild($tag);
			}
			else {
				$tag->item(0)->setAttribute('content', $this->description);
			}
		}
		if ($this->canonical) {
			$tag = $xpath->query('/html/head/link[@rel="canonical"]');
			if ($tag->length == 0) {
				$tag = $dom->createElement('link');
				$tag->setAttribute('rel', 'canonical');
				$tag->setAttribute('href', $this->canonical);
				$xpath->query('/html/head')->item(0)->appendChild($tag);
			}
			else {
				$tag->item(0)->setAttribute('href', $this->canonical);
			}
		}

		foreach ($this->meta as $key => $value) {
			$tag = $xpath->query('/html/head/meta[@name="' . $key . '"]');
			if ($tag->length == 0) {
				$tag = $dom->createElement('meta');
				$tag->setAttribute('name', $key);
				$tag->setAttribute('content', $value);
				$xpath->query('/html/head')->item(0)->appendChild($tag);
			}
			else {
				$tag->item(0)->setAttribute('content', $value);
			}
		}

		// Append the id="cms" tag with the body
		$tag = $xpath->query('//div[@id="cms"]');
		if ($tag->length == 0) {
			$tag = $dom->createElement('div');
			$tag->setAttribute('id', 'cms');
			$xpath->query('/html/body')->item(0)->appendChild($tag);
		}

		$fragment = new DOMDocument();
		// Note that we must encode it correctly or strange characters may appear.
		//$fragment->loadHTML( mb_convert_encoding( '<div>' . $this->body . '</div>', 'HTML-ENTITIES', 'UTF-8') );
		$fragment->loadHTML( '<div>' . $this->body . '</div>');
		$fragment = $dom->importNode( $fragment->documentElement, true );
		$body = $fragment->getElementsByTagName('body')->item(0);
		$tag->item(0)->appendChild($body->childNodes[0]);

        header('Content-Type: text/html');
        echo $dom->saveHTML();
    }
}