# `react-load-visible`

### Intro

This library provides a wrapper for [@loadable/component](https://github.com/gregberge/loadable-components), utilizing the [`IntersectionObserver` API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to automatically load component code once the component's "visible". By default, this means once any part of the component has entered the browser's viewport.

It builds upon the great work already done in [`react-loadable-visibility`](https://github.com/stratiformltd/react-loadable-visibility), which is an awesome project but seems to be no longer maintained. Further, it is lacking in a few areas that this library attempts to improve. Specifically, at the time of writing, they differ in the following main ways:

- The original library [does not expose `@loadable/component`'s `load` function](https://github.com/stratiformltd/react-loadable-visibility/issues/40). This library does.
- The original library does not provide a way to configure the instantiated `IntersectionObserver` with your own options (i.e. `root`, `rootMargin`, `threshold`). This library does via exposing an extra function, `initObserver`.
- The original library applies all props passed to the deferred component to the wrapping `div`, which [results in a slew of React console warnings](https://github.com/stratiformltd/react-loadable-visibility/issues/35). This library does not apply these props to the wrapper.
- The original library [does not provide a way to apply styles specifically to the wrapper](https://github.com/stratiformltd/react-loadable-visibility/issues/21) beyond a `style` or `className` prop, which also gets applied to the deferred component when loaded. This library does via a `wrapperCss` prop.
- The original library was written to accommodate both `@loadable/component` and [`react-loadable`](https://github.com/jamiebuilds/react-loadable); however, `react-loadable` has been deprecated. This library **only supports `@loadable/component`**.
- The original library was written in JavaScript. This library is written in TypeScript.

For a super basic demo, you can check out this [Stackblitz](https://stackblitz.com/edit/vitejs-vite-lbnqf4?file=src/App.tsx)!

### Getting started

First, install the necessary packages:

```bash
npm i react-load-visible @loadable/component
# or...
yarn add react-load-visible @loadable/component
```

Then, for the default behavior, import the default export and use it just as you would `@loadable/component`:

```tsx
import loadable from 'react-load-visible'
// Example loading component that is rendered while the component's code loads.
import Loading from './Loading';

const Component = loadable(() => import('./Component'), { fallback: <Loading /> })

// Then, somewhere down in your JSX...
// Its code will only be loaded once triggered by the `IntersectionObserver`.
<Component />
```

Note, you could also apply the fallback to the component itself via a `fallback` prop:

```tsx
import loadable from 'react-load-visible'
// Example loading component that is rendered while the component's code loads.
import Loading from './Loading';

const Component = loadable(() => import('./Component'))

// Then, somewhere down in your JSX...
// Its code will only be loaded once triggered by the `IntersectionObserver`.
<Component fallback={<Loading />} />
```

If you want to enable (pre)loading, for example on button click, that could look like:

```tsx
import loadable from 'react-load-visible'
const Component = loadable(() => import('./Component'))

// Then, somewhere down in your JSX...
// Alternatively, could be `Component.preload()`.
<button onClick={() => Component.load()}>Edit User</button>
```

In general, the loading function and the returned component's API is identical to that of `@loadable/component`'s. So see their (great) docs for everything you can do!

### Customizing

You may wish to have full control over the instantiated `IntersectionObserver`'s configuration. You can override the defaults by importing the named export `initObserver` and calling it with your desired config:

```tsx
import { initObserver } from 'react-load-visible'

initObserver({ rootMargin: '500px' })
```

Note that only a single observer is set up for all deferred components and subsequent calls to `initObserver` will **not** result in separate instances being created.

On the styling side of things, if you want to apply styles specifically to the wrapper component, you can do so by passing a `wrapperCss` prop, containing an object of your styles, to the deferred component:

```tsx
<Component wrapperCss={{ minWidth: '200px', minHeight: '200px' }} />
```

Note that the wrapper component is only used for the `IntersectionObserver` and is completely removed once the deferred component's code loads.

### What about SSR?

In the case of the code running in an environment that does not provide `IntersectionObserver`, such as on the server or in an older browser, the library simply returns the result of `@loadable/component`'s `loadable` call, completely foregoing any `IntersectionObserver` related logic.

Note however that you will need to [configure `@loadable/component` itself correctly to enable SSR](https://loadable-components.com/docs/server-side-rendering/).

### Contributing

If you come across any problems or areas of improvement, please don't hesitate to let me know! Feel free to open an issue or submit a PR.

### License
Licensed under the MIT License, Copyright © 2022-present tmns.

See LICENSE for more information.
