/**
 * Test suite for Markdown abbreviation support
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


describe('markdown-abbr', () => {
	it('basic', () => {
		let md = `SPEAR EAR test

*[EAR]: Early Access Radio
`,
			html = renderer(md);

		expect(html.trim()).toEqual('<p>SPEAR <abbr title="Early Access Radio">EAR</abbr> test</p>');
	});
});
