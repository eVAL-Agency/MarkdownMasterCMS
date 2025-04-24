/**
 * MarkdownMaster CMS
 *
 * The MIT License (MIT)
 * Copyright (c) 2025 eVAL Agency
 * https://github.com/cdp1337/markdownmaster
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
	CHAR
} from './remarkable.utils';


export default (remarkable) => {

	/**
	 * Add a ruleset for "tasklist" to parse a task snippet, ([ ] or [x])
	 */
	remarkable.inline.ruler.push('tasklist', state => {
		let start = state.pos;

		if (
			state.src.charCodeAt(start) === CHAR.OPNBRACKET &&
			(state.src.charCodeAt(start + 1) === CHAR.x || state.src.charCodeAt(start + 1) === CHAR.SPACE) &&
			state.src.charCodeAt(start + 2) === CHAR.CLSBRACKET
		) {
			// Look for [x] or [ ] from the marker position.
			state.pos += 3;
			state.push({
				type: 'tasklist',
				completed: state.src.charCodeAt(start + 1) === CHAR.x,
				level: state.level
			});

			return true;
		}

		return false;
	});

	/**
	 * Handle rendering of a task item
	 * @param tokens
	 * @param idx
	 * @returns {string}
	 */
	remarkable.renderer.rules['tasklist'] = (tokens, idx) => {
		let checked = '✅',
			unchecked = '⬜';

		if (typeof window.CMS !== 'undefined') {
			// Allow the CMS to define the tasklist icons
			checked = window.CMS.config.tasklistChecked;
			unchecked = window.CMS.config.tasklistUnchecked;
		}

		// Special options
		if (checked === 'input') {
			checked = '<input type="checkbox" checked disabled>';
		}
		else if(checked === null) {
			checked = '[x]';
		}

		if (unchecked === 'input') {
			unchecked = '<input type="checkbox" disabled>';
		}
		else if(unchecked === null) {
			unchecked = '[ ]';
		}

		return tokens[idx].completed ? checked : unchecked;
	};
};
