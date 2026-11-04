<?php

namespace MarkdownMaster\Events;

use MarkdownMaster\Event;
use MarkdownMaster\File;
use MarkdownMaster\Request;
use MarkdownMaster\Views\HTMLTemplateView;

/**
 * Called during Page rendering of HTML to allow manipulation of the response or view
 */
final class RenderPageViewEvent extends Event {

	public function __construct(
		public readonly File $file,
		public readonly HTMLTemplateView $view,
		public readonly Request $request,
	) {}

}
