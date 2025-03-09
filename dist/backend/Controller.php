<?php
/**
 * MarkdownMaster CMS
 *
 * @version dev
 * @copyright 2025 eVAL Agency
 * @license MIT
 * @link https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @package MarkdownMasterCMS
 *
 * The MIT License (MIT)
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

class Controller {
	protected $request;
    protected $params;

	public function __construct(Request $request, $params) {
		$this->request = $request;
        $this->params = $params;
	}

	public function run() {
		switch ($this->request->method) {
			case 'GET':
				return $this->get();
				break;
			case 'POST':
				return $this->post();
				break;
			case 'PUT':
				return $this->put();
				break;
			case 'DELETE':
				return $this->delete();
				break;
			default:
				throw new Exception('Method not allowed', 405);
		}
	}

    /**
     * @throws Exception
     */
    public function get() {
        throw new Exception(get_class($this) . " does not support GET requests", 405);
    }

    /**
     * @throws Exception
     */
    public function post() {
        throw new Exception(get_class($this) . " does not support POST requests", 405);
    }

	/**
	 * @throws Exception
	 */
	public function put() {
		throw new Exception(get_class($this) . " does not support PUT requests", 405);
	}

	/**
	 * @throws Exception
	 */
	public function delete() {
		throw new Exception(get_class($this) . " does not support DELETE requests", 405);
	}

}