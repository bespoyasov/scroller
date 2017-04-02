# Prokrutchik

Puts blocks in line and adds anchors and a scrollbar. Has no dependencies. IE11+.

If you use React, checkout [Prokrutchik component](https://github.com/bespoyasov/react-scroller)

## Start

With npm:
```
npm i prokrutchik --save
```

Oldschool — add this to `<head>` of your page:

```html
<script src="/path/to/scroller-min.js" type="text/javascript"></script>
<link href="/path/to/styles-min.css" type="text/css" rel="stylesheet" />
```

## Initialization

Initialize it by:

* Wrapping blocks in a container with class `scroller` (initialization will start automatically);
* Manually creating an instance of a class:

```html
<div class="foo">
	<!-- scroller content -->
</div>

<script type="text/javascript"> 
	const scroller = new Scroller({ 
		el: document.querySelector('.foo') 
	})
</script>
```

## Settings

Scroller accepts these data-attributes:

`data-hideScrollbar="true"` — disables scrollbar;

`data-hideAnchors="true"` — disables anchors;

`data-leftAlign="true"` — aligns content to left if scroller width is bigger than its content width;

`data-start="center"` — start position. Accepts `end`, `center`, `start` or number in pixels. By default — `start`;

`data-startAnimation="true"` — enables start animation. By default scroller will scroll to start position immediately.


Scroller elements accept these:

`data-anchor="text"` — item anchor text;

`data-central="true"` — if this element should be in center on screen at start. The priority of this element is higher than priority of `data-start` option. So if you have them both, scroller will scroll to the element with `data-central`.


You can define config object:

```html
<script type="text/javascript">
	const scroller = new Scroller({ 
		el: document.querySelector('.foo'),
		hideScrollbar: true, 
		hideAnchors: true, 
		align: 'left',
		start: 'center'
	})
</script>
```

## API

Scroller provides click callback on children elements:

```html
<script type="text/javascript">
	const scroller = new Scroller({ 
		el: document.querySelector('.foo'),
		hideScrollbar: true, 
		hideAnchors: true, 
		align: 'left',

		onClick: e => { /* e — click event */ }
	}) 
</script>
```

Programatically change scroller's position by calling `scrollTo` method:

```javascript
scroller.scrollTo('start')		// scrolls to first element
scroller.scrollTo('center')		// scrolls to center
scroller.scrollTo('end')		// scrolls to last element
scroller.scrollTo(100)			// scrolls by 100px
```

Update scroller's options by calling `update` method:
```javascript
scroller.update({
	hideScrollbar: false, 
	hideAnchors: false, 
	align: 'center',
	onClick: someFunc
})
```

## Example

Scroller with disabled scrollbar, active anchors and left alignment:

```html
<head>
	<script src="scroller.js" type="text/javascript"></script>
	<link href="scroller.css" rel="stylesheet" /> 
</head>
<body>
	<div class="my-scroller">
		<img src="example.png" data-anchor="anchor1" />
		<div data-anchor="anchor2"></div>
		<table data-anchor="anchor3"></table>
		<whatever />
	</div>

	<script type="text/javascript">
		const myScroller = new Scroller({
			el: document.querySelector('.my-scroller'),
			hideScrollbar: true,
			align: 'left'
		})
	</script>
</body>
```

http://scroller.bespoyasov.ru
