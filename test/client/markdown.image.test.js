/**
 * Test suite for Markdown image support
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

describe('markdown-image', () => {
	it('basic', () => {
		let md = 'Check out ![this thing](https://example.tld/test.png) for examples',
			html = renderer(md);
		expect(html.trim()).toEqual('<p>Check out <img src="https://example.tld/test.png" alt="this thing" /> for examples</p>');
	});
	it('extended attributes', () => {
		let md = 'Check out ![this thing](https://example.tld/test.png){.purple .large is=cms-button title="Goes somewhere"} for examples',
			html = renderer(md);
		expect(html.trim()).toEqual('<p>Check out <img class="purple large" is="cms-button" title="Goes somewhere" src="https://example.tld/test.png" alt="this thing" /> for examples</p>');
	});
});
