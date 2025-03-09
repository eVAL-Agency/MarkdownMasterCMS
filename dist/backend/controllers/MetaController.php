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
require_once('backend/views/JSONView.php');

use MarkdownMaster\FileCollection;

/**
 * Controller for meta data in files
 *
 * Hooks into meta.json
 */
class MetaController extends Controller {
	/**
	 * @return JSONView
	 */
	public function get() {
		$view = new JSONView();

		$types = Config::GetTypes();
		foreach($types as $type) {
			$collection = new FileCollection($type);
            $view->data[$type] = [];
			foreach($collection->files as $file) {
				if (!$file->getMeta('draft', false)) {
					$view->data[$type][] = [
						'url' => $file->url,
						'path' => $file->rel,
						'meta' => $file->getMetas(),
						'timestamp' => $file->getTimestamp(),
					];
				}
			}
		}

		return $view;
	}
}