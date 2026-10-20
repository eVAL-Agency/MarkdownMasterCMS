/**
 * Test suite for Markdown tasklist support
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


describe('markdown-tasklist', () => {
	it('basic', () => {
		let txt = `
* [ ] Incomplete Task
* [x] Completed Task
`,
			expected = `<ul>
<li>⬜ Incomplete Task</li>
<li>✅ Completed Task</li>
</ul>`,
			html = renderer(txt);
		expect(html.trim()).toEqual(expected);
	});
});
