# I’m learning Web Components

This is a playground.

I’m using one of my projects ([canistop.net](https://canistop.net/)) as real-worls situation to apply some learning.

**I’m just starting, so this repo is obviously a mess.**

## Ideas

Toy around Web Components and see what could be a good custom element for _Can I Stop_.

For example:
- being able to navigate between older and newer versions of a browser easily (this feature doesn’t exist on the main website, yet), with left/right (previous/next) arrows button;
- use CSS container queries to provide multiple “layouts” out of the box;
- show a nice small icon of the shown browser, and more modern styles in general;
- have a clear open styles API that make sense (this is a good exercise);
- ship it as a package, and also allow to be used by directly importing the module from `canistop.net`, maybe like:
    - `<script type="module" src="https://canistop.net/….js">`
    - `import canistopComponent from 'https://canistop.net/….js'`
- consider how to test WCs (preferably using Playwright if it’s a possible good idea).

As the main project would hugely benefit from a revamp of the data handling to be able to provide queries for browser versions **ranges** (and not only single browser version), the web component will remain limited in utility. (I have no time for that revamp these days.)

## Current usage

See `index.html`.

```html
<canistop-something
    browser="ie-11"
    regions="alt-ww,be,fr,jp"
    network-cache="false"
    refresh-label="fetch again"
>
    some slot that is not very interesting
</canistop-something>
```

(Yes, the component name is temporary.)

- `browser`: browser name and version, as shown in canistop.net URL bar;
- `regions` (default: all regions): coma-separated regions codes, as shown in canistop.net;
- `network-cache` (default: `true`): when true, always bypass browser network cache (using [`cache: 'reload'`](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache#value));
- `refresh-label` (default: “fetch again”): the label of the “refresh” button.

## Resources

- [Web Components & Stencil.js - Build Custom HTML Elements](https://www.udemy.com/course/web-components-stenciljs-build-custom-html-elements/): a course by Maximilian Schwarzmüller
- A shitton of tabs I have open:
 - https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_templates_and_slots
 - https://web.dev/declarative-shadow-dom/
 - https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
 - https://developer.mozilla.org/en-US/docs/Web/CSS/::slotted
 - https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#libraries
 - https://developer.mozilla.org/en-US/docs/Web/Web_Components
 - https://web.dev/custom-elements-v1/
 - https://web.dev/shadowdom-v1/
