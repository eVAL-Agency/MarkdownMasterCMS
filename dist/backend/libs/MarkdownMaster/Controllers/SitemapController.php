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

namespace MarkdownMaster\Controllers;

use MarkdownMaster\Config;
use MarkdownMaster\Controller;
use MarkdownMaster\FileCollection;
use MarkdownMaster\Views\XMLView;

/**
 * Controller to generate a sitemap
 *
 * Called from /sitemap.xml
 */
class SitemapController extends Controller {
	public function get() {
		$view = new XMLView();
		$view->root = 'urlset';
		$view->data['@xmlns'] = 'http://www.sitemaps.org/schemas/sitemap/0.9';
		$view->data['@xmlns:xhtml'] = 'http://www.w3.org/1999/xhtml';
		$view->data['@xmlns:xsi'] = 'http://www.w3.org/2001/XMLSchema-instance';
		$view->data['@xsi:schemaLocation'] = 'http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd';
		$view->data['url'] = [];

		$types = Config::GetTypes();
		foreach ($types as $type) {
			$collection = new FileCollection($type);
			foreach ($collection->files as $file) {
				if (!$file->getMeta('draft', false)) {
					$view->data['url'][] = ['loc' => $file->url];
				}
			}
		}

		return $view;
	}
}