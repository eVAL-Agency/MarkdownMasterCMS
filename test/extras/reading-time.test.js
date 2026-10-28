/**
 * Test suite for the cms-reading-time extra
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import { describe, expect, it, jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';


const pluginSource = readFileSync(
	'dist/extras/cms-reading-time/cms-reading-time.js',
	'utf8'
);

function wordParagraph(count) {
	const words = [];
	for (let i = 0; i < count; i++) {
		words.push('word' + i);
	}
	return '<p>' + words.join(' ') + '</p>';
}

/**
 * Set up a JSDOM window with a mocked CMS and load the reading time plugin.
 *
 * @param {Object} [options]
 * @param {Object} [options.currentPage] The current page (a File-like or collection-like object)
 * @returns {Object}
 */
function setup(options = {}) {
	const dom = new JSDOM('<html><body></body></html>');
	const win = dom.window;
	const doc = win.document;

	let mockFile = {
		permalink: '/test/article.html',
		body: '<p></p>',
		bodyLoaded: true,
		parseBody: jest.fn(),
	};

	let mockCollection = {
		getFileByPermalink: jest.fn(),
	};

	let cms = {
		log: {
			Warn: jest.fn(),
		},
		getCollection: jest.fn(),
		getPathsFromURL: jest.fn(),
		currentPage: null,
	};

	// The current page, if provided, should be a File-like object (has permalink)
	if (options.currentPage !== null) {
		cms.currentPage = options.currentPage;
	}

	win.CMS = cms;

	// Load the plugin source in a scope where the window globals are available.
	// JSDOM's window.eval runs in an isolated scope without the window's global
	// properties, so inject the relevant globals (document, window, customElements,
	// HTMLElement) as parameters.
	const fn = new Function(
		'document', 'window', 'customElements', 'HTMLElement',
		pluginSource
	);
	fn(doc, win, win.customElements, win.HTMLElement);

	return {
		win,
		doc,
		cms,
		mockFile,
		mockCollection,
	};
}

/**
 * Flush any pending microtasks / promises so async renders complete.
 *
 * @param {number} [times=2]
 */
async function flush(times = 2) {
	for (let i = 0; i < times; i++) {
		await new Promise((resolve) => {
			setTimeout(resolve, 0);
		});
	}
}

describe('cms-reading-time', () => {
	it('element is defined after plugin loads', () => {
		let ctx = setup({});
		expect(ctx.win.customElements.get('cms-reading-time')).toBeDefined();
	});

	it('renders reading time for the current page (single view)', async () => {
		// 400 words / 200 wpm = 2 minutes
		let file = {
			permalink: '/test/article.html',
			body: wordParagraph(400),
			bodyLoaded: true,
			parseBody: jest.fn().mockResolvedValue(wordParagraph(400)),
		};

		let ctx = setup({
			currentPage: file,
		});

		let el = ctx.doc.createElement('cms-reading-time');
		ctx.doc.body.appendChild(el);
		await flush();

		let text = el.textContent.trim();
		expect(text).toBe('2 min read');
		expect(el.getAttribute('aria-label')).toBe('Estimated reading time: 2 minutes');
	});

	it('renders nothing for an empty body', async () => {
		let file = {
			permalink: '/test/article.html',
			body: '',
			bodyLoaded: true,
			parseBody: jest.fn().mockResolvedValue(''),
		};

		let ctx = setup({
			currentPage: file,
		});

		let el = ctx.doc.createElement('cms-reading-time');
		ctx.doc.body.appendChild(el);
		await flush();

		expect(el.textContent.trim()).toBe('');
	});

	it('renders nothing when there is no content source (list view, no file attr)', async () => {
		// A collection has no permalink, so the fallback is not a File
		let collection = {
			type: 'posts',
			totalPages: 1,
			// No permalink property
		};

		let ctx = setup({
			currentPage: collection,
		});

		let el = ctx.doc.createElement('cms-reading-time');
		ctx.doc.body.appendChild(el);
		await flush();

		expect(el.textContent.trim()).toBe('');
	});

	it('resolves a file via type and file attributes', async () => {
		let file = {
			permalink: '/test/article.html',
			body: wordParagraph(300),
			bodyLoaded: true,
			parseBody: jest.fn().mockResolvedValue(wordParagraph(300)),
		};

		let ctx = setup({});
		ctx.cms.getCollection.mockReturnValue({
			getFileByPermalink: jest.fn().mockReturnValue(file),
		});
		ctx.cms.getPathsFromURL.mockReturnValue(['test', 'article.html']);
		ctx.cms.currentPage = null;

		let el = ctx.doc.createElement('cms-reading-time');
		el.setAttribute('type', 'test');
		el.setAttribute('file', '/test/article.html');
		ctx.doc.body.appendChild(el);
		await flush();

		// 300 words / 200 = 1.5 -> round -> 2 min
		expect(el.textContent.trim()).toBe('2 min read');
	});

	it('derives the collection type from the file path when type is omitted', async () => {
		let file = {
			permalink: '/blog/post.html',
			body: wordParagraph(200),
			bodyLoaded: true,
			parseBody: jest.fn().mockResolvedValue(wordParagraph(200)),
		};

		let ctx = setup({});
		ctx.cms.getPathsFromURL.mockImplementation(() => ['blog', 'post.html']);
		ctx.cms.getCollection.mockReturnValue({
			getFileByPermalink: jest.fn().mockReturnValue(file),
		});
		ctx.cms.currentPage = null;

		let el = ctx.doc.createElement('cms-reading-time');
		el.setAttribute('file', '/blog/post.html');
		ctx.doc.body.appendChild(el);
		await flush();

		// 200 words / 200 = 1 min
		expect(el.textContent.trim()).toBe('1 min read');
		// type was derived to 'blog'
		expect(ctx.cms.getCollection).toHaveBeenCalledWith('blog');
	});

	it('resolves a file from a collection that is not found (type attr)', async () => {
		let ctx = setup({});
		ctx.cms.getCollection.mockReturnValue(null);
		ctx.cms.currentPage = null;

		let el = ctx.doc.createElement('cms-reading-time');
		el.setAttribute('type', 'missing');
		el.setAttribute('file', '/missing/page.html');
		ctx.doc.body.appendChild(el);
		await flush();

		expect(el.textContent.trim()).toBe('');
	});

	it('displays the word count when words attribute is set', async () => {
		let file = {
			permalink: '/test/article.html',
			body: wordParagraph(250),
			bodyLoaded: true,
			parseBody: jest.fn().mockResolvedValue(wordParagraph(250)),
		};

		let ctx = setup({ currentPage: file });

		let el = ctx.doc.createElement('cms-reading-time');
		el.setAttribute('words', 'true');
		ctx.doc.body.appendChild(el);
		await flush();

		// 250 words / 200 = 1.25 -> 1 min
		expect(el.textContent.trim()).toBe('250 words \u00B7 1 min read');
	});

	it('hides short content when hide-short is set', async () => {
		// 50 words / 200 = 0.25 min (< 1) -> hidden
		let file = {
			permalink: '/test/article.html',
			body: wordParagraph(50),
			bodyLoaded: true,
			parseBody: jest.fn().mockResolvedValue(wordParagraph(50)),
		};

		let ctx = setup({ currentPage: file });

		let el = ctx.doc.createElement('cms-reading-time');
		el.setAttribute('hide-short', 'true');
		ctx.doc.body.appendChild(el);
		await flush();

		expect(el.textContent.trim()).toBe('');
	});

	it('does not hide short content when hide-short is not set', async () => {
		let file = {
			permalink: '/test/article.html',
			body: wordParagraph(50),
			bodyLoaded: true,
			parseBody: jest.fn().mockResolvedValue(wordParagraph(50)),
		};

		let ctx = setup({ currentPage: file });

		let el = ctx.doc.createElement('cms-reading-time');
		ctx.doc.body.appendChild(el);
		await flush();

		// 50 words / 200 = 0.25 -> max(1, 0) -> 1 min (still shown)
		expect(el.textContent.trim()).toBe('1 min read');
	});

	it('respects the speed attribute', async () => {
		let file = {
			permalink: '/test/article.html',
			body: wordParagraph(400),
			bodyLoaded: true,
			parseBody: jest.fn().mockResolvedValue(wordParagraph(400)),
		};

		let ctx = setup({ currentPage: file });

		let el = ctx.doc.createElement('cms-reading-time');
		// 400 words / 800 wpm = 0.5 -> 1 min
		el.setAttribute('speed', '800');
		ctx.doc.body.appendChild(el);
		await flush();
		expect(el.textContent.trim()).toBe('1 min read');

		// Reset for a higher count with a slower speed
		el.setAttribute('speed', '100');
		ctx.doc.body.appendChild(el);
		await flush();
		// 400 words / 100 = 4 min
		expect(el.textContent.trim()).toBe('4 min read');
	});

	it('excludes code blocks and scripts from the word count', async () => {
		let body =
			'<p>one two three four five six seven eight nine ten</p>' +
			'<pre><code>console.log("this code is not counted")</code></pre>' +
			'<script>var ignored = "not counted either";</script>';

		let file = {
			permalink: '/test/article.html',
			body: body,
			bodyLoaded: true,
			// parseBody strips scripts, but our mock keeps the raw body; the
			// plugin strips non-prose nodes itself.
			parseBody: jest.fn().mockResolvedValue(body),
		};

		let ctx = setup({ currentPage: file });

		let el = ctx.doc.createElement('cms-reading-time');
		ctx.doc.body.appendChild(el);
		await flush();

		// Only the 10 prose words should be counted -> 10/200 -> 1 min
		expect(el.textContent.trim()).toBe('1 min read');
	});

	it('calls parseBody to load content on demand', async () => {
		let parseSpy = jest.fn().mockResolvedValue(wordParagraph(200));
		let file = {
			permalink: '/test/article.html',
			body: null,
			bodyLoaded: false,
			parseBody: parseSpy,
		};

		let ctx = setup({ currentPage: file });

		let el = ctx.doc.createElement('cms-reading-time');
		ctx.doc.body.appendChild(el);
		await flush();

		expect(parseSpy).toHaveBeenCalledTimes(1);
	});

	it('leaves the element empty and logs a warning when parseBody rejects', async () => {
		let file = {
			permalink: '/test/article.html',
			body: null,
			bodyLoaded: false,
			parseBody: jest.fn().mockRejectedValue(new Error('network failure')),
		};

		let ctx = setup({ currentPage: file });

		let el = ctx.doc.createElement('cms-reading-time');
		ctx.doc.body.appendChild(el);
		await flush();

		expect(el.textContent.trim()).toBe('');
		expect(ctx.cms.log.Warn).toHaveBeenCalled();
	});
});
