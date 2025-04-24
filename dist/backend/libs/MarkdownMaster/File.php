<?php
/**
 * MarkdownMaster CMS
 *
 * @version dev
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

require_once('backend/libs/MarkdownMaster/MarkdownParser.php');

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

	/**
	 * Construct a new File to refer to a markdown page
	 *
	 * @param string $path Full filesystem path to file
	 * @throws \Exception
	 */
	public function __construct(string $path) {
		$real_path = realpath($path);
		if (!$real_path) {
			throw new \Exception('File not found: ' . print_r(['path' => $path], true));
		}
		$pDir = Config::GetRootPath();
		if (!str_starts_with($real_path, $pDir)) {
			// Require any file to be contained within the site root path
			throw new \Exception(
				'Invalid file path, does not start with root path: ' .
				print_r(['root' => $pDir, 'path' => $real_path], true)
			);
		}
		$relative_path = substr($real_path, strlen($pDir));
		$type = null;
		foreach(Config::GetTypes() as $t) {
			if (str_starts_with($relative_path, $t)) {
				$type = $t;
				break;
			}
		}
		if ($type === null) {
			// Require any file to be contained within a known type
			throw new \Exception(
				'Invalid file path, does not start with a known type: ' .
				print_r(['path' => $path], true)
			);
		}

		$this->file = $real_path;
		$this->rel = Config::GetWebPath() . $relative_path;
		$this->url = Config::GetHost() . Config::GetWebPath() . substr($relative_path, 0, -3) . '.html';
		$this->path = Config::GetHost() . Config::GetWebPath() . dirname($relative_path) . '/';
	}

	/**
	 * Get the match weight for this file based on a given search string
	 *
	 * Returns 0 - 1, where 0 is no match and 1 is a full match.
	 *
	 * @param string $pattern
	 * @return float
	 */
	public function getMatch(string $pattern): float {
		$weight = 0.0;
		$this->_ensureParsed();

		// Check for full matches first
		if (str_contains(strtolower(str_replace(['-', '/', '_'], ' ', $this->rel)), $pattern)) {
			$weight += 10;
		}

		if (str_contains(strtolower($this->getMeta('title', '')), $pattern)) {
			$weight += 5;
		}

		if (str_contains(strtolower($this->getMeta(['description', 'excerpt'], '')), $pattern)) {
			$weight += 2;
		}

		if (str_contains(strtolower($this->content), $pattern)) {
			$weight += 2;
		}

		// Check for partial matches
		$keywords = explode(' ', $pattern);
		foreach ($keywords as $keyword) {
			if (str_contains(strtolower(str_replace(['-', '/', '_'], ' ', $this->rel)), $keyword)) {
				$weight += (1 / count($keywords));
			}

			if (str_contains(strtolower($this->getMeta('title', '')), $keyword)) {
				$weight += (1 / count($keywords));
			}

			if (str_contains(strtolower($this->getMeta(['description', 'excerpt'], '')), $keyword)) {
				$weight += (1 / count($keywords));
			}

			if (str_contains(strtolower($this->content), $keyword)) {
				$weight += (1 / count($keywords));
			}
		}

		// Total weight of matches, (assuming a keyword matches URL, title, description, and content), is 23.
		return $weight / 23;
	}

	/**
	 * Get a meta value
	 *
	 * If multiple keys are applicable for the requested value,
	 * requesting an array of keys will return the first located one or
	 * DEFAULT if not found.
	 *
	 * @param string|array $key
	 * @param mixed|null $default=null
	 * @return mixed
	 */
	public function getMeta(string|array $key, mixed $default = null): mixed {
		$this->_ensureParsed();

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

	/**
	 * Get all meta keys / values as an associative array
	 *
	 * @return array
	 */
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
		$this->_ensureParsed();

		$parser = new MarkdownParser();
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

	/**
	 * Get the last modified timestamp of this file
	 *
	 * @return int
	 */
	public function getTimestamp(): int {
		return filemtime($this->file);
	}

	/**
	 * Ensure the file has been parsed
	 *
	 * @return void
	 */
	private function _ensureParsed() {
		if ($this->content === null) {
			$this->_parse();
		}
	}

	/**
	 * Generate an excerpt from the content
	 *
	 * @return string
	 */
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

			if (str_starts_with($line, '* ') || str_starts_with($line, '- ')) {
				// Skip listings
				continue;
			}

			if (preg_match('/^[\d]+\./', $line)) {
				// Skip numbered lists
				continue;
			}

			if (trim($line) === '---') {
				// Skip HRs
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

			if ($line) {
				$text .= $line . ' ';
			}

			if (strlen($text) > 300) {
				break;
			}
		}

		return trim($text);
	}

	/**
	 * Parse the file for frontmatter and content
	 *
	 * @return void
	 */
	private function _parse() {
		$contents = file_get_contents($this->file);
		if (str_starts_with($contents, '---')) {
			// Frontmatter requires the first line of the file to be a frontmatter termination string, by default "---".
			try {
				$parsed = YamlFrontMatter::parse($contents);
				$meta = $parsed->matter();
				$this->content = $parsed->body();
			}
			catch(\Error $e) {
				// If the file is not valid YAML, then assume it does not contain any frontmatter.
				$meta = [];
				$this->content = (Config::GetDebug() ? $e->getMessage() . "\n\n" : '') . $contents;
			}
			catch(\Exception $e) {
				// If the file is not valid YAML, then assume it does not contain any frontmatter.
				$meta = [];
				$this->content = (Config::GetDebug() ? $e->getMessage() . "\n\n" : '') . $contents;
			}
		}
		else {
			// If the first line is NOT this termination string, then this file is assumed to not contain any.
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
				// Ensure src image links are fully resolved
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
			// Ensure at least some date is available
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
			// Files are NOT draft by default
			$meta['draft'] = false;
		}

		if (!isset($meta['excerpt'])) {
			// Ensure each file has an excerpt available
			$meta['excerpt'] = $this->_generateExcerpt();
		}

		if (!isset($meta['title'])) {
			// Ensure each file has a title available
			$meta['title'] = ucwords(str_replace('_', ' ', basename($this->file, '.md')));
		}

		$this->meta = $meta;
	}
}