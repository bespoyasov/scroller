# Scroller.js

Puts blocks in line and adds anchors and a scrollbar.

## Start

Add to `<head>` links to script and styles:

```html
<script src="scroller.js" type="text/javascript"></script>
<link href="scroller.css" rel="stylesheet" /> 
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
		noscrollbar: true, 
		noanchors: true, 
		align: 'left'
	})
</script>
```

## Click on element and callback

Scroller provides click callback on children elements:

```html
<script type="text/javascript">
	const scroller = new Scroller({ 
		el: document.querySelector('.foo'),
		noscrollbar: true, 
		noanchors: true, 
		align: 'left',

		onClick: e => { /* e — click event */ }
	}) 
</script>
```

## Example

Scroller with disabled anchors and left alignment:

```html
<head>
	<script src="scroller.js" type="text/javascript"></script>
	<link href="scroller.css" rel="stylesheet" /> 
</head>
<body>
	<div class="scroller" data-noscrollbar="true" data-leftIfWide="true">
		<img src="example.png" data-anchor="anchor1" />
		<div data-anchor="anchor2"></div>
		<table data-anchor="anchor3"></table>
		<whatever />
	</div>
</body>
```

http://scroller.bespoyasov.ru