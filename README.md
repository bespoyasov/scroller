# Scroller

Fast, light-weight (4KB gzip), and dependency-free content scroller.

https://user-images.githubusercontent.com/9102374/170833443-b9428466-a9fd-48e5-b18b-4c4089137dd5.mp4

## Installation

Install Scroller with npm:

```shell
npm i prokrutchik
```

Add the scripts and styles to your project:

```js
import { Scroller } from "prokrutchik";
import "prokrutchik/styles.css";
```

Or add them directly to the HTML file:

```html
<script src="/path/to/prokrutchik/browser.js"></script>
<link href="/path/to/prokrutchik/styles.css" rel="stylesheet" />
```

## Initialization

By default, Scroller provides auto initialization for all the `.scroller` elements on the page:

```html
<ul class="scroller">
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>
```

You can also initialize the instance manually:

```html
<ul class="foo">
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>

<script type="module">
  import { Scroller } from "prokrutchik";

  const instance = new Scroller({
    element: document.querySelector(".foo"),
  });
</script>
```

## Configuration

You can configure Scroller via `data-` attributes in HTML:

- `data-navigation`, shows/hides the navigation buttons, `"visible" | "hidden"`;
- `data-scrollbar`, shows/hides the scrollbar under the content, `"visible" | "hidden"`;
- `data-align`, specifies how to align the content if it fits the screen, `"start" | "center" | "end"`;
- `data-start-position`, initial position of the content, `number of px | "start" | "center" | "end"`;
- `data-start-duration`, starting animation duration, `number of milliseconds`.

Scroller items can be configured with:

- `data-anchor`, label of the item in the navigation, `string`;
- `data-focused`, if defined, Scroller will scroll to this item at the start.

### Using JavaScript

You can also configure Scroller using the config object:

```js
const scroller = new Scroller({
  element: document.querySelector(".foo"),

  // Show/hide the scrollbar, "visible" | "hidden":
  scrollbar: "hidden",

  // Show/hide the navigation, "visible" | "hidden":
  navigation: "hidden",

  // How to align content if it fits the screen, "start" | "center" | "end":
  align: "center",

  // Initial scroller content position, "start" | "center" | "end" | number of px:
  startPosition: "center",

  // Starting animation duration, number of milliseconds:
  startDuration: 500,
});
```

## Public API

Scroller provides API for changing current position, handling item clicks, and dynamically updating the config.

### Position Change

For position change, use the `scrollTo` method:

```js
// Scrolls to the beginning of the content
scroller.scrollTo("start");

// Scrolls to the center of the content:
scroller.scrollTo("center");

// Scrolls to the end of the content:
scroller.scrollTo("end");

// Scrolls to 100px from the start of the content:
scroller.scrollTo(100);

// Second optional parameter specifies
// the animation duration in milliseconds.
// Scrolls to center in 500 ms:
scroller.scrollTo("center", 500);
```

## Item Click Callback

For handling clicks on items, specify the `onItemClick` handler in the config:

```js
const scroller = new Scroller({
  element: document.querySelector(".foo"),
  onItemClick: (event) => {
    /* The `event` argument here is `TouchEvent` or `MouseEvent` depending on the user device. */
  },
});
```

## Config Updates

For configuration updates, use the `update` method:

```js
scroller.update({
  scrollbar: "hidden",
  navigation: "hidden",
  align: "center",
  onItemClick: someFunc,
});
```

## Examples

Scroller with disabled scrollbar, active navigation, and start alignment, configured via HTML data-attributes:

```html
<head>
  <link href="/path/to/prokrutchik/styles.css" rel="stylesheet" />
  <script src="/path/to/prokrutchik/browser.js" defer></script>
</head>

<body>
  <ul class="scroller" data-scrollbar="hidden" data-align="start">
    <img src="example.png" data-anchor="anchor1" />
    <div data-anchor="anchor2"></div>
    <table data-anchor="anchor3"></table>
    <!-- ... -->
  </div>
</body>
```

Scroller with the same settings configured via config object:

```js
import { Scroller } from "prokrutchik";
import "prokrutchik/styles.css";

const myScroller = new Scroller({
  el: document.querySelector(".foo"),
  scrollbar: "hidden",
  align: "start",
});
```

## React Wrapper

For using Scroller with React, check out [React-Scroller](https://github.com/bespoyasov/react-scroller) package.
