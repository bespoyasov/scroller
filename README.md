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

* Wrapping blocks in a container with class `scroller`, and initialization will start automatically;
* Initializing it like a jQuery plugin:

```html
<div class="foo"> <!-- content --> </div>
<script type="text/javascript"> 
	$(function(){
		$('.foo').scroller(); 
	});
</script>
```

## Settings

Scroller understands data-attributes:

`data-noscrollbar="true"` — disable scrollbar;

`data-noanchors="true"` — disable anchors;

`data-leftIfWide="true"` — left content alignment when the width of the page is bigger than width of the content.

To set these options manually initialize them:

```html
<script type="text/javascript">
	$(function(){ 
		$('.foo').scroller({
			'noscrollbar': true, 
			'noanchors': true, 
			'leftIfWide': true
		}); 
	});
</script>
```

## Click on element and callback

With manually init you can use a callback on click on an element. The argument of function is a child node, where click happened.

E.g. for print index of an element:

```html
<script type="text/javascript">
	$(function(){ 
		$('.foobar').scroller({
			'onclick' : function($element) { console.log($element.index()) } 
		});
	}); 
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
		<!-- Images, tables, text, blocks --> 
	</div>
</body>
```