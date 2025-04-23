/**
 * Test suite for Markdown paragraph support
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2023 - 2024 Charlie Powell
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import {describe, expect, it, jest, test} from '@jest/globals';
import renderer from '../../src/app/addons/loader-remarkable';


describe('markdown-paragraph', () => {
	it('basic', () => {
		let txt = 'This is a simple paragraph',
			html = renderer(txt);
		expect(html.trim()).toEqual('<p>This is a simple paragraph</p>');
	});
	it('embedded tokens', () => {
		let txt = 'Check out [this thing](https://example.tld) for examples',
			html = renderer(txt);
		expect(html.trim()).toEqual('<p>Check out <a href="https://example.tld">this thing</a> for examples</p>');
	});
	it('extended attributes', () => {
		let txt = 'I should be centered {.center}',
			html = renderer(txt);
		expect(html.trim()).toEqual('<p class="center">I should be centered</p>');
	});
	it('only paragraphs are paragraphs', () => {
		let txt = `# Test Suite

I should be centered {.center}

* key
* blah
`,
			html = renderer(txt);
		expect(html.trim()).toEqual(`<h1 id="test-suite">Test Suite</h1>
<p class="center">I should be centered</p>
<ul>
<li>key</li>
<li>blah</li>
</ul>`);
	});

	/**
	 * Test that short paragraphs with a single element (such as a button), send the extended attributes
	 * to the correct element.
	 */
	it('short snippets with extended attributes', () => {
		let txt = '[this thing](https://example.tld){.purple .large is=cms-button title="Goes somewhere"}',
			html = renderer(txt);
		expect(html.trim()).toEqual('<p><a class="purple large" is="cms-button" title="Goes somewhere" href="https://example.tld">this thing</a></p>');
	});

	/**
	 * Both short snippet xattrs and paragraph xattrs
	 */
	it('short snippets with extended atts and p atts', () => {
		let txt = '[this thing](https://example.tld){.purple .large is=cms-button title="Goes somewhere"} {.center}',
			html = renderer(txt);
		expect(html.trim()).toEqual('<p class="center"><a class="purple large" is="cms-button" title="Goes somewhere" href="https://example.tld">this thing</a></p>');
	});
});
