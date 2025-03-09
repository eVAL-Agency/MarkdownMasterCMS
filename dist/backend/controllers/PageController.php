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

require_once('backend/libs/MarkdownMaster/FileCollection.php');
require_once('backend/views/HTMLTemplateView.php');

/**
 * Controller to display a single page
 *
 * Called from /[TYPE]/[PAGE].html
 */
class PageController extends Controller {
	public function get() {
		if ($this->params === '__DEFAULT__') {
			$default = Config::GetDefaultView();
			$listing = new \MarkdownMaster\FileCollection(substr($default, 0, strpos($default, '/')));
			$file = Config::GetWebPath() . $default . '.md';
		}
		else {
			$listing = new \MarkdownMaster\FileCollection($this->params);
			$file = str_replace('.html', '.md', $_SERVER['REDIRECT_URL']);
		}

		$page = $listing->getByPath($file);
		if (!$page) {
			throw new Exception('Page not found', 404);
		}

		$view = new HTMLTemplateView();
		$view->seoTitle = $page->getMeta(['seotitle', 'title'], '');
		$view->title = $page->getMeta(['title', 'seotitle'], '');
		$view->description = $page->getMeta(['description', 'excerpt'], '');
		$view->canonical = $page->url;
		$view->body = (string)$page;
		if ($page->getMeta('image', null)) {
			$image = $page->getMeta('image');
			if (is_array($image) && isset($image['src'])) {
				$view->meta['image'] = $image['src'];
			}
			else {
				$view->meta['image'] = $image;
			}
		}

		// Generate body classes, to mimic the frontend CMS
		$view->classes = [
			'page-' . $listing->type . '-single',
			'page-' . str_replace('/', '-', substr($file, strlen(Config::GetWebPath()), -3))
		];

		return $view;
	}
}