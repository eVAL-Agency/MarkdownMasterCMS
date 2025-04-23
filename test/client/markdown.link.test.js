/**
 * Test suite for Markdown link support
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

describe('markdown-link', () => {
	it('basic', () => {
		let md = 'Check out [this thing](https://example.tld) for examples',
			html = renderer(md);
		expect(html.trim()).toEqual('<p>Check out <a href="https://example.tld">this thing</a> for examples</p>');
	});
	it('extended attributes', () => {
		let md = 'Check out [this thing](https://example.tld){.purple .large is=cms-button title="Goes somewhere"} for examples',
			html = renderer(md);
		expect(html.trim()).toEqual('<p>Check out <a class="purple large" is="cms-button" title="Goes somewhere" href="https://example.tld">this thing</a> for examples</p>');
	});
});
