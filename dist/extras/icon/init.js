/**
 * MarkdownMaster CMS
 *
 * The MIT License (MIT)
 * Copyright (c) 2025 eVAL Agency
 * https://github.com/eVAL-Agency/MarkdownMasterCMS
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

/**
 * Simple icon to help with fontawesome's difference between fa and fab.
 *
 */
class IconElement extends HTMLElement {

	constructor() {
		super();

		let icon = this.getAttribute('icon'),
			prefix = '',
			identifier = '',
			loaded = false,
			brands = [
				'42-group', '500px',
				'accessible-icon', 'accusoft', 'address-book', 'adn', 'adversal', 'affiliatetheme', 'airbnb', 'algolia', 'alipay', 'amazon', 'amazon-pay', 'amilia', 'android', 'angellist', 'angrycreative', 'angular', 'app-store', 'app-store-ios', 'apper', 'apple', 'apple-pay', 'artstation', 'asymmetrik', 'atlassian', 'audible', 'autoprefixer', 'avianex', 'aviato', 'aws',
				'bandcamp', 'battle-net', 'behance', 'bilibili', 'bimobject', 'bitbucket', 'bitcoin', 'bity', 'black-tie', 'blackberry', 'blogger', 'blogger-b', 'bluetooth', 'bluetooth-b', 'bootstrap', 'bots', 'btc', 'buffer', 'buromobelexperte', 'buy-n-large', 'buysellads',
				'canadian-maple-leaf', 'cc-amazon-pay', 'cc-amex', 'cc-apple-pay', 'cc-diners-club', 'cc-discover', 'cc-jcb', 'cc-mastercard', 'cc-paypal', 'cc-stripe', 'cc-visa', 'centercode', 'centos', 'chrome', 'chromecast', 'cloudflare', 'cloudscale', 'cloudsmith', 'cloudversify', 'cmplid', 'codepen', 'codiepie', 'confluence', 'connectdevelop', 'contao', 'cotton-bureau', 'cpanel', 'creative-commons', 'creative-commons-by', 'creative-commons-nc', 'creative-commons-nc-eu', 'creative-commons-nc-jp', 'creative-commons-nd', 'creative-commons-pd', 'creative-commons-pd-alt', 'creative-commons-remix', 'creative-commons-sa', 'creative-commons-sampling', 'creative-commons-sampling-plus', 'creative-commons-share', 'creative-commons-zero', 'critical-role', 'css3', 'css3-alt', 'cuttlefish',
				'd-and-d', 'd-and-d-beyond', 'dailymotion', 'dashcube', 'deezer', 'delicious', 'deploydog', 'dev', 'deviantart', 'dhl', 'diaspora', 'digg', 'digital-ocean', 'discord', 'discourse', 'dochub', 'docker', 'draft2digital', 'dribbble', 'dropbox', 'drupal', 'dyalog',
				'earlybirds', 'ebay', 'edge', 'edge-legacy', 'elementor', 'ello', 'ember', 'empire', 'envira', 'erlang', 'ethereum', 'etsy', 'evernote', 'expeditedssl',
				'facebook', 'facebook-f', 'facebook-messenger', 'fantasy-flight-games', 'fedex', 'fedora', 'figma', 'firefox', 'firefox-browser', 'first-order', 'first-order-alt', 'firstdraft', 'flickr', 'flipboard', 'fly', 'font-awesome', 'fonticons', 'fonticons-fi', 'fort-awesome', 'fort-awesome-alt', 'forumbee', 'foursquare', 'free-code-camp', 'freebsd', 'fulcrum',
				'galactic-republic', 'galactic-senate', 'get-pocket', 'gg', 'gg-circle', 'git', 'git-alt', 'github', 'github-alt', 'gitkraken', 'gitlab', 'gitter', 'glide', 'glide-g', 'gofore', 'golang', 'goodreads', 'goodreads-g', 'google', 'google-drive', 'google-pay', 'google-play', 'google-plus', 'google-plus-g', 'google-wallet', '  gratipay', 'grav', 'gripfire', 'grunt', 'guilded', 'gulp',
				'hacker-news', 'hackerrank', 'hashnode', 'hips', 'hire-a-helper', 'hive', 'hooli', 'hornbill', 'hotjar', 'houzz', 'html5', 'hubspot',
				'ideal', 'imdb', 'instagram', 'instalod', 'intercom', 'internet-explorer', 'invision', 'ioxhost', 'itch-io', 'itunes', 'itunes-note',
				'java', 'jedi-order', 'jenkins', 'jira', 'joget', 'joomla', 'js', 'jsfiddle',
				'kaggle', 'keybase', 'keycdn', 'kickstarter', 'kickstarter-k', 'korvue',
				'laravel', 'lastfm', 'leanpub', 'less', 'line', 'linkedin', 'linkedin-in', 'linode', 'linux', 'locust', 'lungs', 'lungs-virus', 'lyft',
				'magento', 'mailchimp', 'mandalorian', 'markdown', 'mastodon', 'maxcdn', 'mdb', 'medapps', 'medium', 'medrt', 'meetup', 'megaport', 'mendeley', 'meta', 'microblog', 'microsoft', 'mix', 'mixcloud', 'mixer', 'mizuni', 'modx', 'monero',
				'napster', 'neos', 'nfc-directional', 'nfc-symbol', 'nimblr', 'node', 'node-js', 'npm', 'ns8', 'nutritionix',
				'octopus-deploy', 'odnoklassniki', 'odysee', 'old-republic', 'opencart', 'openid', 'opera', 'optin-monster', 'orcid', 'osi',
				'padlet', 'page4', 'pagelines', 'palfed', 'patreon', 'paypal', 'perbyte', 'periscope', 'phabricator', 'phoenix-framework', 'phoenix-squadron', 'php', 'pied-piper', 'pied-piper-alt', 'pied-piper-hat', 'pied-piper-pp', 'pinterest', 'pinterest-p', 'pix', 'playstation', 'product-hunt', 'pushed', 'python',
				'qq', 'quinscape', 'quora',
				'r-project', 'raspberry-pi', 'ravelry', 'react', 'reacteurope', 'readme', 'rebel', 'red-river', 'reddit', 'reddit-alien', 'redhat', 'renren', 'replyd', 'researchgate', 'resolving', 'rev', 'rocketchat', 'rockrms', 'rust',
				'safari', 'salesforce', 'sass', 'schlix', 'screenpal', 'scribd', 'searchengin', 'sellcast', 'sellsy', 'servicestack', 'shirtsinbulk', 'shopify', 'shopware', 'simplybuilt', 'sistrix', 'sith', 'sitrox', 'sketch', 'skyatlas', 'skype', 'slack', 'slideshare', 'snapchat', 'soundcloud', 'sourcetree', 'space-awesome', 'speakap', 'speaker-deck', 'spotify', 'square-behance', 'square-dribbble', 'square-facebook', 'square-font-awesome', 'square-font-awesome-stroke', 'square-git', 'square-github', 'square-gitlab', 'square-google-plus', 'square-hacker-news', 'square-instagram', 'square-js', 'square-lastfm', 'square-odnoklassniki', 'square-pied-piper', 'square-pinterest', 'square-reddit', 'square-snapchat', 'square-steam', 'square-tumblr', 'square-twitter', 'square-viadeo', 'square-vimeo', 'square-whatsapp', 'square-xing', 'square-youtube', 'squarespace', 'stack-exchange', 'stack-overflow', 'stackpath', 'staylinked', 'steam', 'steam-symbol', 'sticker-mule', 'strava', 'stripe', 'stripe-s', 'stubber', 'studiovinari', 'stumbleupon', 'stumbleupon-circle', 'superpowers', 'supple', 'suse', 'swift', 'symfony',
				'teamspeak', 'telegram', 'tencent-weibo', 'the-red-yeti', 'themeco', 'themeisle', 'think-peaks', 'tiktok', 'trade-federation', 'trello', 'tumblr', 'twitch', 'twitter', 'typo3',
				'uber', 'ubuntu', 'uikit', 'umbraco', 'uncharted', 'uniregistry', 'unity', 'unsplash', 'untappd', 'ups', 'usb', 'usps', 'ussunnah',
				'vaadin', 'viacoin', 'viadeo', 'viber', 'vimeo', 'vimeo-v', 'vine', 'vk', 'vnv', 'vuejs',
				'watchman-monitoring', 'waze', 'weebly', 'weibo', 'weixin', 'whatsapp', 'whmcs', 'wikipedia-w', 'windows', 'wirsindhandwerk', 'wix', 'wizards-of-the-coast', 'wodu', 'wolf-pack-battalion', 'wordpress', 'wordpress-simple', 'wpbeginner', 'wpexplorer', 'wpforms', 'wpressr',
				'xbox', 'xing',
				'y-combinator', 'yahoo', 'yammer', 'yandex', 'yandex-international', 'yarn', 'yelp', 'yoast', 'youtube',
				'zhihu' ];

		if (brands.indexOf(icon) !== -1) {
			identifier = 'fab';
			prefix = 'fa-';
		} else {
			identifier = 'fa';
			prefix = 'fa-';
		}

		// Check if fontawesome needs to be loaded.
		document.querySelectorAll('link').forEach(el => {
			if (el.href.indexOf('fontawesome.') !== -1) {
				loaded = true;
				return false;
			}
		});

		if (!loaded) {
			let link = document.createElement('link');
			link.href = '/extras/fontawesome/css/fontawesome.min.css';
			link.rel = 'stylesheet';
			document.head.appendChild(link);
		}

		if (identifier) {
			this.classList.add(identifier);
		}

		this.classList.add(prefix + icon);
	}
}

customElements.define('icon', IconElement, {extends: 'i'});
