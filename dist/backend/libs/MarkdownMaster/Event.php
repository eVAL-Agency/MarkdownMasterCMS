<?php

namespace MarkdownMaster;

use MarkdownMaster\Events\RenderPageViewEvent;
use Throwable;

abstract class Event {
	/**
	 * Single registry keyed by concrete event class name.
	 */
	protected static array $Handlers = [];

	/**
	 * Attach a handler. Callable receives a single instance of *this* event.
	 *   RenderPageViewEvent::subscribe(function (RenderPageViewEvent $e) { ... });
	 *
	 * @param callable $handler
	 */
	public static function Subscribe(callable $handler): void {
		// Grab the location of the hook, this can be useful for debugging where hooks are added.
		$backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
		$source = substr($backtrace[0]['file'], strlen(Config::GetRootPath()));
		$key = static::class;

		static::$Handlers[$key] = static::$Handlers[$key] ?? [];
		static::$Handlers[$key][] = [
			'fn' => $handler,
			'source' => $source,
		];
	}

	/**
	 * Dispatch a given event to notify any registered handlers
	 *
	 *   $event = new RenderPageViewEvent($file, $view, $request);
	 *   $event->dispatch();
	 */
	public function dispatch(): void {
		$key = static::class;

		foreach (static::$Handlers[$key] ?? [] as $handler) {
			try {
				$handler['fn']($this);
			} catch (Throwable $e) {
				error_log(sprintf(
					'Event [%s] handler failed: %s',
					static::class,
					$e->getMessage(),
				));
			}
		}
	}

	public static function AttachDebugInformation(RenderPageViewEvent $event): void {
		foreach(static::$Handlers as $key => $handlers) {
			$calls = array_map(function($h) { return $h['source']; }, $handlers);
			$keyName = str_replace('\\', '.', $key);

			$event->view->footScripts[] = 'console.debug("Backend Events (' . $keyName . '):", ' . json_encode($calls) . ');';
		}
	}
}