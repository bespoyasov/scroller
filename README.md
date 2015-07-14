# Scroller.js

Orders blocks in line and adds anchors and scrollbar.

## Start

Add to `<head>` links to script and styles:

```html
<script src="scroller.js" type="text/javascript"></script>
<link href="scroller.css" rel="stylesheet" /> 
```

## Initialization

You can init script by:

* Wrapping block in container with class `scroller`, and initialization will start autmatically;
* Start like jQuery plugin:

```html
<div class="foo"> <!-- content --> </div>
<script type="text/javascript"> 
	$(function(){
		$('.foo').scroller(); 
	});
</script>
```

## Settings

Scroller knows data-attributes:

`data-noscrollbar="true"` — disable scrollbar;
`data-noanchors="true"` — disable anchors;
`data-leftIfWide="true"` — left content alignment when width of page is bigger than width of content.

You can set this options by manually init:

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

With manually init you can use callback on click on element. Function gets one argument — child node of scroller, inside of which click happened.

E.g. for print index of element:

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