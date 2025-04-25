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
require_once('backend/views/XMLView.php');

use Ramsey\Uuid\Uuid;

/**
 * Controller to handle listing files in a given type
 */
class RssController extends Controller {
	public function get() {
		$listing = new \MarkdownMaster\FileCollection($this->params);

		// Use the default page view for the basis of the site data
		$default = Config::GetDefaultView();
		$defaultListing = new \MarkdownMaster\FileCollection(substr($default, 0, strpos($default, '/')));
		$file = Config::GetWebPath() . $default . '.md';
		$page = $defaultListing->getByPath($file);

		if (in_array('authors', Config::GetTypes())) {
			$authorListing = new \MarkdownMaster\FileCollection('authors');
		}
		else {
			$authorListing = null;
		}

		$view = new XMLView();
		$view->root = 'rss';
		$view->data = [
			'@version' => '2.0',
			'@xmlns:content' => 'http://purl.org/rss/1.0/modules/content/',
			'@xmlns:media' => 'http://search.yahoo.com/mrss/',
			'channel' => [
				'title' => $page->getMeta(['title', 'seotitle'], ''),
				'link' => Config::GetHost() . Config::GetWebPath(),
				'description' => $page->getMeta(['description', 'excerpt'], ''),
				'generator' => 'MarkdownMaster CMS',
				'item' => [],
			]
		];

		// Add search input
		$view->data['textInput'] = [
			'title' => 'Search',
			'name' => 's',
			'link' => Config::GetHost() . Config::GetWebPath() . $listing->type . '.html',
		];

		foreach ($listing->getFiles([], 'date DESC', 50) as $file) {
			if (!$file->getMeta('draft', false)) {
				$definition =  [
					'title' => $file->getMeta(['title', 'seotitle'], ''),
					'link' => $file->url,
					'guid' => [
						'@isPermaLink' => 'false',
						'#' => (string)Uuid::uuid3(Uuid::NAMESPACE_URL, $file->url),
					],
					'description' => $file->getMeta(['excerpt', 'description'], ''),
					'content:encoded' => (string)$file,
					'pubDate' => $file->getMeta('date', date('r')),
					'enclosure' => [],
				];

				if ($file->getMeta('image')) {
					$image = $file->getMeta('image');
					if (is_array($image) && isset($image['src']) && str_starts_with($image['src'], Config::GetHost())) {
						// Remap this URL to a physical file so we can grab the filesize
						$imageFile = Config::GetRootPath() . substr($image['src'], strlen(Config::GetHost() . Config::GetWebPath()));
						if (file_exists($imageFile)) {
							$definition['content:encoded'] = '<img src="' . $image['src'] . '" alt="' . $image['alt'] . '" />' . $definition['content:encoded'];
							$definition['media:content'] = [
								'@url' => $image['src'],
								'@medium' => 'image',
								'@type' => mime_content_type($imageFile),
							];
						}
					}
				}

				if ($file->getMeta('tags')) {
					$definition['category'] = $file->getMeta('tags');
				}

				if ($authorListing && $file->getMeta('author')) {
					// One or the other search, (alias or name), should work to retrieve the author.
					$author = $authorListing->getFiles(['alias' => $file->getMeta('author')], null, 1) +
						$authorListing->getFiles(['title' => $file->getMeta('author')], null, 1);
					if (count($author) >= 1) {
						$definition['author'] = $author[0]->getMeta(['title', 'seotitle'], '');
					}
				}
				$view->data['channel']['item'][] = $definition;
			}
		}

		return $view;
	}
}
