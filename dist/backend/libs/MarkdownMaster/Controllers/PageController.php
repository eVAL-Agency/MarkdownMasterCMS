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
use MarkdownMaster\Views\HTMLTemplateView;
use Exception;

/**
 * Controller to display a single page
 *
 * Called from /[TYPE]/[PAGE].html
 */
class PageController extends Controller {
	public function get() {
		if ($this->params === '__DEFAULT__') {
			$default = Config::GetDefaultView();
			$listing = new FileCollection(substr($default, 0, strpos($default, '/')));
			$file = Config::GetWebPath() . $default . '.md';
		}
		else {
			$listing = new FileCollection($this->params);
			$file = str_replace('.html', '.md', $this->request->uri);
		}

		$page = $listing->getByPath($file);
		if (!$page) {
			throw new Exception('Page not found', 404);
		}

		$default_url = Config::GetHost() . Config::GetWebPath() . Config::GetDefaultView() . '.html';

		$view = new HTMLTemplateView();
		$view->seoTitle = $page->getMeta(['seotitle', 'title'], '');
		$view->title = $page->getMeta(['title', 'seotitle'], '');
		$view->description = $page->getMeta(['description', 'excerpt'], '');

		if (strlen($view->description) > 160) {
			// Truncate to the last full word before 157 characters and add ellipsis
			$truncated = substr($view->description, 0, 157);
			$lastSpace = strrpos($truncated, ' ');
			if ($lastSpace !== false) {
				$truncated = substr($truncated, 0, $lastSpace);
			}
			$view->description = $truncated . '...';
		}

		// Google doesn't like non-top-level canonical pages for the site,
		// so remap the canonical default page back to / as opposed to the actual page.
		if ($page->url === $default_url) {
			$view->canonical = Config::GetHost() . Config::GetWebPath();
		}
		else {
			$view->canonical = $page->url;
		}

		// Add og:url for OpenGraph
		$view->meta['og:url'] = $view->canonical;

		// Set the main body content for the view directly based on the page's rendering
		$view->body = (string)$page;

		// Add support for OpenGraph type if specified in the listing config
		$view->meta['og:type'] = Config::GetTypeDetail($listing->type, 'og:type', 'website');

		// Add titles for non-standard bots
		$twitterTitle = $page->getMeta(['twittertitle', 'ogtitle', 'seotitle', 'title'], '');
		if ($twitterTitle) {
			$view->meta['twitter:title'] = $twitterTitle;
		}
		$ogTitle = $page->getMeta(['ogtitle', 'twittertitle', 'seotitle', 'title'], '');
		if ($ogTitle) {
			$view->meta['og:title'] = $ogTitle;
		}

		// Add some advertising/branding for the CMS
		$view->meta['generator'] = 'MarkdownMaster CMS (https://markdownmaster.com)';

		// Make sure non-standard bots parse the description
		if ($view->description) {
			$view->meta['og:description'] = $view->description;
			$view->meta['twitter:description'] = $view->description;
		}

		// Handle the image tag, this is particularly notable as images tend to catch user attention better than just text.
		if ($page->getMeta('image', null)) {
			$imageUrl = '';
			$imageAlt = '';

			$image = $page->getMeta('image');
			if (is_array($image)) {
				if (isset($image['src'])) {
					$imageUrl = $image['src'];
				}
				if (isset($image['alt'])) {
					$imageAlt = $image['alt'];
				}
			}
			else {
				$imageUrl = $image;
			}

			if ($imageUrl) {
				$view->meta['image'] = $imageUrl;
				$view->meta['og:image'] = $imageUrl;
				$view->meta['twitter:image'] = $imageUrl;
				$view->meta['twitter:card'] = 'summary_large_image';

				// Twitter recommends providing image dimensions too, so convert the image URL to a path and check it.
				$imagePath = str_replace(
					Config::GetHost() . Config::GetWebPath(),
					Config::GetRootPath(),
					$imageUrl
				);
				if (file_exists($imagePath) && is_readable($imagePath)) {
					$size = getimagesize($imagePath);
					if ($size) {
						$view->meta['og:image:width'] = $size[0];
						$view->meta['og:image:height'] = $size[1];
						$view->meta['twitter:image:width'] = $size[0];
						$view->meta['twitter:image:height'] = $size[1];
					}
				}
			}

			if ($imageAlt) {
				$view->meta['og:image:alt'] = $imageAlt;
				$view->meta['twitter:image:alt'] = $imageAlt;
			}
		}

		// @todo Add support for video pages if desired.  This would override twitter:card to be "player"
		// and add twitter:player (the URL of the video), twitter:player:width, and twitter:player:height

		// Add author attribution links to the meta data
		if ($page->getMeta('author')) {
			$view->meta['author'] = $page->getMeta('author');

			// Allow the author field to be extrapolated to a number of meta fields.
			// This helps to add additional details about the author to crawlers.
			if (in_array('authors', Config::GetTypes())) {
				$author = (new FileCollection('authors'))
					->getFiles([
						'title' => $view->meta['author'],
						'alias' => $view->meta['author']
					], null, 1, 'OR');

				if (count($author) >= 1) {
					$socials = $author[0]->getMeta('socials', []);
					// Pull the "mastodon" social link if it's available in the author's socials
					if (isset($socials['mastodon']) && filter_var($socials['mastodon'], FILTER_VALIDATE_URL) && str_contains($socials['mastodon'], '/@')) {
						// Convert the link from site/@user to @user@site
						$view->meta['fediverse:creator'] = preg_replace(
							'#https?://(.*?)/@([^/]+)#',
							'@$2@$1',
							$socials['mastodon']
						);
					}

					if (isset($socials['twitter']) && filter_var($socials['twitter'], FILTER_VALIDATE_URL)) {
						$view->meta['twitter:creator'] = str_replace('https://twitter.com/', '@', $socials['twitter']);
					}
					elseif (isset($socials['x']) && filter_var($socials['x'], FILTER_VALIDATE_URL)) {
						$view->meta['twitter:creator'] = str_replace('https://x.com/', '@', $socials['x']);
					}
				}
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