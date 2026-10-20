<?php

namespace Popularity\Controllers;

use MarkdownMaster\Controller;
use MarkdownMaster\File;
use MarkdownMaster\FileCollection;
use MarkdownMaster\Views\TextView;
use Popularity\Services\PopularityService;

class PopularityController extends Controller{
	/**
	 * Handle the POST request for popularity tracking.
	 *
	 * Records a page view in the database.
	 *
	 * @return TextView
	 */
	public function post() {
		$ret = new TextView();
		$ret->body = 'OK';

		if ($this->request->isJSON()) {
			$params = $this->request->getBody();
			$t = $params['t'] ?? null;
			$p = $params['p'] ?? null;
			if (!is_scalar($t)) {
				// Ignore invalid requests.
				return $ret;
			}
			if (!is_scalar($p)) {
				// Ignore invalid requests.
				return $ret;
			}

			$p = str_replace('.html', '.md', $p);

			$collection = new FileCollection($t);
			$page = $collection->getByPath($p);

			if (!$page) {
				// Requested page not located in given collection, skip out.
				return $ret;
			}

			PopularityService::Record($page, $this->request);
		}

		return $ret;
	}
}