<?php

namespace MarkdownMaster\Events;

use MarkdownMaster\Event;
use MarkdownMaster\File;

/**
 * Called during parsing of a Markdown File to allow manipulation of the File and its meta
 */
final class FileParsedEvent extends Event {

	public function __construct(
		public readonly File $file
	) {}

}
