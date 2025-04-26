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

use Michelf\MarkdownExtra;

/**
 * Extends the MarkdownExtra class to add custom functionality
 */
class MarkdownParser extends MarkdownExtra {
	protected File $sourceFile;

	public function __construct(File $sourceFile) {
		parent::__construct();
		$this->block_gamut['stripScripts'] = 50;
		$this->url_filter_func = [$this, 'processLink'];

		$this->sourceFile = $sourceFile;
	}

	/**
	 * Process a link to check if it points to a Markdown file,
	 * translate it to an HTML link if so.
	 *
	 * @param string $link
	 * @return string
	 */
	public function processLink(string $link): string {
		if (str_starts_with($link, 'http://') || str_starts_with($link, 'https://') || str_starts_with($link, '://')) {
			// If the link is an absolute URL, return it as is
			return $link;
		}

		if (str_ends_with($link, '.md')) {
			// Auto translate Markdown links to HTML links
			$link = substr($link, 0, -3) . '.html';
		}

		// Check if relative links need to be resolved with the FQDN,
		// (useful for syndicating content in external applications)
		if (str_starts_with($link, '/')) {
			// If the link is a relative URL, prepend the host and webpath
			$host = Config::GetHost();
			$webpath = Config::GetWebPath();
			$link = $host . $webpath . substr($link, 1);
		}
		else {
			$link = dirname($this->sourceFile->url) . '/' . $link;
		}

		return $link;
	}

	/**
	 * Simple method to strip script tags from the text
	 *
	 * This is used because content rendered from the backend will be replaced automatically
	 * with content generated from the frontend application, so we don't want to run script tags
	 * twice on a page load.
	 *
	 * @param string $text
	 * @return string
	 */
	public function stripScripts(string $text): string {
		foreach($this->html_hashes as $hash => $html) {
			if (str_starts_with($html, '<script') && str_ends_with($html, '</script>')) {
				// Remove the script tag from the text
				$text = str_replace($hash, '', $text);
			}
		}

		return $text;
	}
}