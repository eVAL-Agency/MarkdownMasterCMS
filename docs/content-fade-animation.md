---
title: Content Fade in/out Animation
---

Since MarkdownMaster CMS behaves like an SPA (Single Page Application),
browsing between pages does not require a full page load.

This makes navigation substantially quicker as less content needs to be loaded
from the server and the page state in the client memory doesn't need rebuilt every view.

As a consequence however, this may result in content flickering when switching between
server-generated content and client-generated content.

To minimize this, the original server-generated content can be hidden as soon as Javascript
fires by adding the `cms-preload` class to the content container.
Additionally, `cms-fade-in` and `cms-fade-out` are added to this container for navigation
events to allow CSS to provide clean animations between the application states.


```css
/**
 * MarkdownMaster CMS render transition.
 *
 * While the client side re-fetches and re-renders the page content,
 * the existing static content is dimmed so the swap is perceived
 * as an intentional transition rather than a flash.
 */
.cms-preload {
  opacity: 0;
}

.cms-fade-out {
  transition: opacity 200ms ease;
  opacity: 0;
}

.cms-fade-in {
  animation: cms-fade-in 100ms ease forwards;
}

@keyframes cms-fade-in {
  from {
    opacity: 0.1;
  }
  to {
    opacity: 1;
  }
}

#cms-loading {
  position: fixed;
  top: 50%;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: -10;
  text-align: center;
  transition: opacity 200ms ease;
}
#cms-loading.show {
  opacity: .5;
  z-index: 10;
}

#cms-loading span {
  font-size: 12em;
  display: inline-block;
  animation: spin 3s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .cms-fade-out {
    transition: none;
    opacity: 1;
  }

  .cms-fade-in {
    animation: none;
  }

  #cms-loading {
    transition: none;
  }

  #cms-loading.show {
    opacity: 0;
    z-index: -10;
  }
}
```
