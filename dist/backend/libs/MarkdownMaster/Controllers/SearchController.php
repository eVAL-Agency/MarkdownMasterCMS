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

use MarkdownMaster\Controller;
use MarkdownMaster\Views\JSONView;
use MarkdownMaster\FileCollection;

class SearchController extends Controller {
	/**
	 * GET operation to /search.json to return server-side provided
	 * results for a given search term.
	 *
	 * Server-side check is used by default because it can scan through all
	 * files in the CMS quicker than the client can.
	 *
	 * Populates the data array of the return with the following:
	 *
	 * * `file` - relative URL to the markdown file
	 * * `match` - 0 to 1 for the score of the match
	 *
	 * Results are returned in the order of best match
	 *
	 * @return JSONView
	 */
	public function get() {
		$view = new JSONView();

		if (isset($_GET['q']) && isset($_GET['t'])) {
			$q = strtolower(preg_replace('/[^a-zA-Z ]/', '', $_GET['q']));
			$collection = new FileCollection($_GET['t']);
			$results = [];
			foreach ($collection->files as $file) {
				if (!$file->checkIsPublished()) {
					continue;
				}
				$match = $file->getMatch($q);
				if ($match > 0) {
					$results[] = ['match' => $match, 'file' => $file->rel];
				}
			}

			// Sort results
			usort($results, function ($a, $b) {
				return $a['match'] - $b['match'];
			});

			$view->data = $results;
		}
		else {
			$view->data = [];
		}

		return $view;
	}
}