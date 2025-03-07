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

namespace MarkdownMaster;

use Config;
use Spatie\YamlFrontMatter\YamlFrontMatter;

class File {
	/** @var string Full web URL of directory */
	public string $path;
	/** @var string Full filesystem path of file */
	public string $file;
	/** @var string Full web URL of file */
	public string $url;
	/** @var string Relative path to markdown file */
	public string $rel;
	protected array $meta;
	protected ?string $content = null;

	public function __construct(string $path) {
		$this->file = $path;
		$pDir = Config::GetRootPath();
		$path = substr($path, strlen($pDir) + 1);
		$this->rel = Config::GetWebPath() . $path;
		$this->url = Config::GetHost() . Config::GetWebPath() . substr($path, 0, -3) . '.html';
		$this->path = Config::GetHost() . Config::GetWebPath() . dirname($path) . '/';
	}

	public function getMeta(string|array $key, $default = null): mixed {
		if ($this->content === null) {
			$this->_parse();
		}

		if (is_array($key)) {
			// Lookup multiple keys and return the first one found
			foreach ($key as $item) {
				if (isset($this->meta[$item])) {
					return $this->meta[$item];
				}
			}
			return $default;
		}
		else {
			// Lookup a single key
			return $this->meta[$key] ?? $default;
		}
	}

	public function getMetas(): array {
		if ($this->content === null) {
			$this->_parse();
		}

		return $this->meta;
	}

	/**
	 * Get this file as its full HTML version
	 *
	 * @return string
	 */
	public function __toString(): string {
		if ($this->content === null) {
			$this->_parse();
		}

		$parser = new \Michelf\MarkdownExtra();
		return $parser->transform($this->content);
	}

	/**
	 * Get this file as a listing item representation
	 *
	 * @return string
	 */
	public function getListing(): string {
		$title = $this->getMeta(['title', 'seotitle'], basename($this->file));
		$excerpt = $this->getMeta(['excerpt', 'description'], '');
		$image = $this->getMeta('image', null);

		$html = '<article>' .
			'<h2><a href="' . $this->url . '">' . $title . '</a></h2>' .
			'<p>' . $excerpt . '</p>';

		if ($image !== null && is_array($image) && isset($image['src'])) {
			$html .= '<img src="' . $image['src'] . '" alt="' . $image['alt'] . '"/>';
		}
		$html .= '</article>';

		return $html;
	}

	public function getTimestamp(): int {
		return filemtime($this->file);
	}

	private function _generateExcerpt() {
		$text = '';
		$lines = explode("\n", $this->content);
		foreach($lines as $line) {
			$line = trim($line);
			if (empty($line) && $text != '') {
				// Stop after the first paragraph
				break;
			}

			if (str_starts_with($line, '#')) {
				// Skip headings
				continue;
			}

			// Strip {...} HTML attributes from text
			$line = preg_replace('/\{.*?\}/', '', $line);
			// Strip ![...](...) images from text
			$line = preg_replace('/!\[.*?\]\(.*?\)/', '', $line);
			// Drop the link portion from links
			$line = preg_replace('/\[(.*?)\]\(.*?\)/', '$1', $line);
			// Drop italic and bold formatting
			$line = preg_replace('/\*|_/', '', $line);

			$text .= $line . ' ';
			if (strlen($text) > 300) {
				break;
			}
		}

		return $text;
	}

	private function _parse() {
		$contents = file_get_contents($this->file);
		if (str_starts_with($contents, '---')) {
			$parsed = YamlFrontMatter::parseFile($this->file);
			$meta = $parsed->matter();
			$this->content = $parsed->body();
		}
		else {
			$meta = [];
			$this->content = $contents;
		}


		foreach($meta as $item => $value) {
			if (is_array($value) && isset($value['href'])) {
				// Ensure href links are fully resolved
				if (
					!str_contains($value['href'], '://') &&
					!str_starts_with($value['href'], '/')
				) {
					$meta['item']['href'] = $this->path . $value['href'];
				}
			}

			if (is_array($value) && isset($value['src'])) {
				// Ensure href links are fully resolved
				if (
					!str_contains($value['src'], '://') &&
					!str_starts_with($value['src'], '/')
				) {
					$meta[$item]['src'] = $this->path . $value['src'];
				}

				if (!isset($value['alt'])) {
					$meta[$item]['alt'] = basename($value['src']);
				}
			}
		}

		if (!isset($meta['date'])) {
			if (preg_match('#(\d{4})[/-](\d{2})[/-](\d{2})#', $this->file, $matches)) {
				$meta['date'] = $matches[1] . '-' . $matches[2] . '-' . $matches[3];
			}
			else {
				$meta['date'] = date('Y-m-d', filemtime($this->file));
			}
		}
        elseif (is_int($meta['date'])) {
            // YAML parser may convert the date to an int.
            $meta['date'] = date('Y-m-d', $meta['date']);
        }

		if (!isset($meta['draft'])) {
			$meta['draft'] = false;
		}

		if (!isset($meta['excerpt'])) {
			$meta['excerpt'] = $this->_generateExcerpt();
		}

		$this->meta = $meta;
	}
}