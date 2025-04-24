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
	public function __construct() {
		parent::__construct();
		$this->block_gamut['stripScripts'] = 50;
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