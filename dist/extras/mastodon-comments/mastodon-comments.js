{
	CMS.loadExtra('dompurify');
	CMS.loadExtra('cms-icon');
	if (CMS.config.extra('mastodon-comments', 'styles', true)) {
		// Allow the admin to set 'styles': false to skip loading auto styles
		let style = document.createElement('link');
		style.rel = 'stylesheet';
		style.href = CMS.config.webpath + 'extras/mastodon-comments/mastodon-comments.css';
		document.head.appendChild(style);
	}
}


/**
 * https://carlschwan.eu/2020/12/29/adding-comments-to-your-static-blog-with-mastodon/
 */
class MastodonCommentsElement extends HTMLElement {

	constructor() {
		// Always call super first in constructor
		super();
		this.timeout = null;
		this.username = '';
		this.url = '';
		this.host = CMS.config.extra('mastodon-comments', 'host', null);
		this.dialog = null;
		this.favorites = 0;
		this.replies = 0;
		this.reposts = 0;
	}

	/**
	 * Called when the element is added to the DOM.
	 */
	connectedCallback() {
		this.innerHTML = 'Loading comments...';
		this.timeout = setTimeout(() => {
			this.render();
		}, 1000);
	}

	disconnectedCallback() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	render() {

		if (!this.host) {
			CMS.log.Warn(
				'mastodon-comments',
				"No host configured for mastodon source!\n" +
				"Please ensure the 'host' option is set to the hostname of your mastodon instance\n" +
				"CMS.loadExtra('mastodon-comments', {'host': 'mastodon.myinstance.tld'});"
			);
			this.innerHTML = 'Error loading comments.';
			return;
		}

		if (!this.hasAttribute('post-id')) {
			// Pages must be defined with a fediverse ID to load the comments.
			// This ID is the original post manually done by the author on the fediverse platform.
			CMS.log.Debug('mastodon-comments', 'This page does not have a fediverse ID, so mastodon comments will not be loaded.');
			this.innerHTML = 'Error loading comments.';
			return;
		}


		this.loadPost(this.host, this.getAttribute('post-id'))
			.then(() => {
				this.innerHTML = '';
				this.buildMetrics();
				this.buildDialog();
				this.loadComments(this.host, this.getAttribute('post-id'));
			})
			.catch(e => {
				CMS.log.Error('mastodon-comments', 'Error fetching comments:', e);
				this.innerHTML = 'Error loading comments.';
			});
	}

	/**
	 * Build the icon metrics, (notably replies, reposts, and likes).
	 */
	buildMetrics() {
		let metrics = document.createElement('div');
		metrics.className = 'mastodon-metrics';

		metrics.innerHTML = '<a href="' + this.url + '">' +
			'<span class="replies" title="' + this.replies + ' replies"><i icon="reply" is="cms-icon"></i> ' + this.replies + '</span>' +
			'<span class="boosts" title="' + this.reposts + ' boosts"><i icon="retweet" is="cms-icon"></i> ' + this.reposts + '</span>' +
			'<span class="likes" title="' + this.favorites + ' likes"><i icon="heart" is="cms-icon"></i> ' + this.favorites + '</span>' +
			'</a>';

		this.appendChild(metrics);
	}

	/**
	 * Build the dialog for linking to the user's own Mastodon instance for adding a comment.
	 */
	buildDialog() {
		this.dialog = document.createElement('dialog');

		let header = document.createElement('p'),
			intro = document.createElement('p'),
			help = document.createElement('p'),
			inputContainer = document.createElement('div'),
			input = document.createElement('input'),
			button = document.createElement('button'),
			signup = document.createElement('p'),
			openerContainer = document.createElement('div'),
			opener = document.createElement('button');

		header.className = 'header-text';
		header.innerHTML = 'Add a comment on the Fediverse';

		intro.innerHTML = 'With an account on the Fediverse or Mastodon, you can add a comment by replying to the original post. ' +
			'<strong>Where is your account hosted?</strong>';

		help.className = 'help-text';
		help.innerHTML = "Tip: That's the website where you signed up. " +
			"If you don't remember, look for the welcome e-mail in your inbox. " +
			"You can also enter your full username! (e.g. @Mastodon@mastodon.social)";

		signup.innerHTML = 'New to Mastodon? <a href="https://' + this.host + '/auth/sign_up" target="_blank">Create account</a>';

		input.value = window.localStorage.getItem('mastodon-instance') || '';
		input.placeholder = 'Domain of your home server, e.g. mastodon.social';
		input.autocomplete = 'off';
		input.autocapitalize = 'off';
		input.spellcheck = 'false';
		input.addEventListener('keyup', evt => {
			if (evt.key === 'Enter') {
				// If the user presses enter, submit the form
				button.click();
			}
		});

		button.innerHTML = 'Next &raquo;';
		button.addEventListener('click', (event) => {
			//event.preventDefault();

			let target = input.value.trim();
			if (target === '') {
				alert('Please enter your Mastodon instance or username.');
				return;
			}

			if (target[0] === '@') {
				// Strip the @ off the start of the username
				target = target.substring(1);
			}

			if (target.includes('@')) {
				// Strip just the domain off the user tag
				target = target.split('@')[1];
			}

			// Save the input value to local storage
			window.localStorage.setItem('mastodon-instance', target);

			if (!target.includes('://')) {
				target = 'https://' + target;
			}

			// Append the post information
			target += '/@' + this.username + '@' + this.host + '/' + this.getAttribute('post-id');

			window.open(target, '_blank', 'noopener');
			this.dialog.close();
		});

		openerContainer.className = 'mastodon-add-comment';

		opener.innerHTML = 'Add Comment';
		opener.addEventListener('click', () => {
			this.dialog.showModal();
		});

		inputContainer.className = 'server-input';
		inputContainer.appendChild(input);
		inputContainer.appendChild(button);

		openerContainer.appendChild(opener);

		this.dialog.modal = true;
		this.dialog.className = 'mastodon-post-dialog';
		this.dialog.appendChild(header);
		this.dialog.appendChild(intro);
		this.dialog.appendChild(inputContainer);
		this.dialog.appendChild(help);
		this.dialog.appendChild(signup);

		this.appendChild(this.dialog);
		this.appendChild(openerContainer);
	}

	/**
	 * Load the linked post data along with the OP, number of reposts, etc.
	 * @param host {string}
	 * @param post {string}
	 * @returns {Promise<void>}
	 */
	async loadPost(host, post) {
		return fetch('https://' + host + '/api/v1/statuses/' + post)
			.then(response => response.json())
			.then(data => {
				this.username = data.account.acct;
				this.url = data.url;
				this.favorites = data.favourites_count;
				this.reposts = data.reblogs_count;
				this.replies = data.replies_count;
			});
	}

	async loadComments(host, post) {
		return fetch('https://' + host + '/api/v1/statuses/' + post + '/context')
			.then(response => response.json())
			.then(data => {
				let descendants = data['descendants'],
					container = document.createElement('section');

				container.id = 'comments';

				if (
					descendants &&
					Array.isArray(descendants) &&
					descendants.length > 0
				) {
					descendants.forEach(status => {
						if( status.account.display_name.length > 0 ) {
							status.account.display_name = this.escapeHtml(status.account.display_name);
							status.account.display_name = this.emojify(status.account.display_name, status.account.emojis);
						} else {
							status.account.display_name = status.account.username;
						};

						let instance = "";
						if( status.account.acct.includes("@") ) {
							instance = status.account.acct.split("@")[1];
						} else {
							instance = host;
						}

						const isReply = status.in_reply_to_id !== post;

						let op = false;
						if( status.account.acct == this.username ) {
							op = true;
						}

						status.content = this.emojify(status.content, status.emojis);

						let avatarSource = document.createElement("source");
						avatarSource.setAttribute("srcset", this.escapeHtml(status.account.avatar));
						avatarSource.setAttribute("media", "(prefers-reduced-motion: no-preference)");

						let avatarImg = document.createElement("img");
						avatarImg.className = "avatar";
						avatarImg.setAttribute("src", this.escapeHtml(status.account.avatar_static));
						avatarImg.setAttribute("alt", `@${ status.account.username }@${ instance } avatar`);

						let avatarPicture = document.createElement("picture");
						avatarPicture.appendChild(avatarSource);
						avatarPicture.appendChild(avatarImg);

						let avatar = document.createElement("a");
						avatar.className = "avatar-link";
						avatar.setAttribute("href", status.account.url);
						avatar.setAttribute("rel", "external nofollow");
						avatar.setAttribute("title", `View profile at @${ status.account.username }@${ instance }`);
						avatar.appendChild(avatarPicture);

						let instanceBadge = document.createElement("a");
						instanceBadge.className = "instance";
						instanceBadge.setAttribute("href", status.account.url);
						instanceBadge.setAttribute("title", `@${ status.account.username }@${ instance }`);
						instanceBadge.setAttribute("rel", "external nofollow");
						instanceBadge.textContent = instance;

						let display = document.createElement("span");
						display.className = "display";
						display.setAttribute("itemprop", "author");
						display.setAttribute("itemtype", "http://schema.org/Person");
						display.innerHTML = status.account.display_name;

						let header = document.createElement("header");
						header.className = "author";
						header.appendChild(display);
						header.appendChild(instanceBadge);

						let permalink = document.createElement("a");
						permalink.setAttribute("href", status.url);
						permalink.setAttribute("itemprop", "url");
						permalink.setAttribute("title", `View comment at ${ instance }`);
						permalink.setAttribute("rel", "external nofollow");
						permalink.textContent = new Date( status.created_at ).toLocaleString('en-US', {
							dateStyle: "long",
							timeStyle: "short",
						});

						let timestamp = document.createElement("time");
						timestamp.setAttribute("datetime", status.created_at);
						timestamp.appendChild(permalink);

						let main = document.createElement("main");
						main.setAttribute("itemprop", "text");
						main.innerHTML = status.content;

						let interactions = document.createElement("footer");
						if(status.favourites_count > 0) {
							let faves = document.createElement("a");
							faves.className = "faves";
							faves.setAttribute("href", `${ status.url }/favourites`);
							faves.setAttribute("title", `Favorites from ${ instance }`);
							faves.textContent = status.favourites_count;

							interactions.appendChild(faves);
						}

						let comment = document.createElement("article");
						comment.id = `comment-${ status.id }`;
						comment.className = isReply ? "comment comment-reply" : "comment";
						comment.setAttribute("itemprop", "comment");
						comment.setAttribute("itemtype", "http://schema.org/Comment");
						comment.appendChild(avatar);
						comment.appendChild(header);
						comment.appendChild(timestamp);
						comment.appendChild(main);
						comment.appendChild(interactions);

						if(op === true) {
							comment.classList.add("op");

							avatar.classList.add("op");
							avatar.setAttribute(
								"title",
								"Blog post author; " + avatar.getAttribute("title")
							);

							instanceBadge.classList.add("op");
							instanceBadge.setAttribute(
								"title",
								"Blog post author: " + instanceBadge.getAttribute("title")
							);
						}

						container.innerHTML += DOMPurify.sanitize(comment.outerHTML);
					});
				}
				else {
					// No comments added yet
					let noComments = document.createElement('p');
					noComments.className = 'no-comments';
					noComments.innerHTML = 'No comments yet. Be the first to add one!';
					container.appendChild(noComments);
				}

				this.appendChild(container);
			});
	}

	escapeHtml(unsafe) {
		return unsafe
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	emojify(input, emojis) {
		let output = input;

		emojis.forEach(emoji => {
			let picture = document.createElement("picture");

			let source = document.createElement("source");
			source.setAttribute("srcset", this.escapeHtml(emoji.url));
			source.setAttribute("media", "(prefers-reduced-motion: no-preference)");

			let img = document.createElement("img");
			img.className = "emoji";
			img.setAttribute("src", this.escapeHtml(emoji.static_url));
			img.setAttribute("alt", `:${ emoji.shortcode }:`);
			img.setAttribute("title", `:${ emoji.shortcode }:`);
			img.setAttribute("width", "20");
			img.setAttribute("height", "20");

			picture.appendChild(source);
			picture.appendChild(img);

			output = output.replace(`:${ emoji.shortcode }:`, picture.outerHTML);
		});

		return output;
	}


}

customElements.define('mastodon-comments', MastodonCommentsElement);
