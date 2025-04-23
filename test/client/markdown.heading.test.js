/**
 * Test suite for Markdown heading support
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


describe('markdown-heading', () => {
	it('basic', () => {
		let md = `# Primary Heading

## secondary'

### h3 something

#### 4th detail block
`,
			html = renderer(md);

		expect(html.trim()).toEqual(`<h1 id="primary-heading">Primary Heading</h1>
<h2 id="secondary">secondary’</h2>
<h3 id="h3-something">h3 something</h3>
<h4 id="id-4th-detail-block">4th detail block</h4>`);
	});
});
