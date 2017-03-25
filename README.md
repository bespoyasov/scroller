# Scroller.js

Puts blocks in line and adds anchors and a scrollbar. Has no dependencies. Works in IE10+.

## Start

Add to `<head>` links to script and styles:

```html
<script src="scroller-min.js" type="text/javascript"></script>
<!-- 14 KB -->
<link href="scroller-min.css" rel="stylesheet" />
<!-- 3 KB -->
```

## Initialization

You can initialize script by:

* Wrapping blocks in a container with class `scroller`, scroller will initialize automatically;
* Creating an instance of a class:

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

Scroller data-attributes:

`data-noscrollbar="true"` — disables scrollbar;

`data-noanchors="true"` — disables anchors;

`data-leftalign="true"` — aligns content to left if width of scroller is bigger than width of content in it;

`data-anchor="text"` — anchor text of item, acquires to children of scroller.

To set these options manually initialize them:

```html
<script type="text/javascript">
	const scroller = new Scroller({ 
		el: document.querySelector('.foo'),
		noScrollbar: true, 
		noAnchors: true, 
		align: 'left'
	})
</script>
```

## API

Scroller provides click callback on children elements:

```html
<script type="text/javascript">
	const scroller = new Scroller({ 
		el: document.querySelector('.foo'),
		noScrollbar: true, 
		noAnchors: true, 
		align: 'left',

		onClick: e => { /* e — click event */ }
	}) 
</script>
```

Also you can programatically change scroller position by calling `scrollTo` method:

```javascript
	scroller.scrollTo('start')		// scrolls to first element
	scroller.scrollTo('center')		// scrolls to center
	scroller.scrollTo('end')			// scrolls to last element
	scroller.scrollTo(100)				// scrolls by 100px
	scroller.scrollTo(100, 2000) 	// scrolls by 100px in 2000 ms
```

## Example

Scroller with disabled scrollbar, active anchors and left alignment:

```html
<head>
	<script src="scroller.js" type="text/javascript"></script>
	<link href="scroller.css" rel="stylesheet" /> 
</head>
<body>
	<div class="your-scroller">
		<img src="example.png" data-anchor="anchor1" />
		<div data-anchor="anchor2"></div>
		<table data-anchor="anchor3"></table>
		<whatever />
	</div>

	<script type="text/javascript">
		const myScroller = new Scroller({
			el: document.querySelector('.your-scroller'),
			noScrollbar: true,
			align: 'left'
		})
	</script>
</body>
```

http://scroller.bespoyasov.ru