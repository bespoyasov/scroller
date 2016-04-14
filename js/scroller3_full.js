(function($) {
	$.fn.scroller = function(options){
	
	
		// ! settings
		var settings = $.extend({
      'noscrollbar' : false,
      'noanchors'   : false,
      'leftIfWide'  : false,
      'borderLines' : true,
      'onclick'     : null
    }, options);
		
		
		// ! functional
		return this.each(function(){
		
			// the class names we`re gonna use
			var 
				scrNm = 'ab_scroller',
				initNm = 'scroller',
				itmNm = 'ab_scrollerItem',
				barNm = 'ab_scrollbar',
				sldNm = 'ab_scrollSlider',
				awrpNm = 'ab_wrapper',
				awrNm = 'ab_anchors',
				ancNm = 'ab_anchs',
				barwNm = 'ab_barWrap',
				rotNm = 'ab_scroller-root',
				drgblNm = 'ab_draggable',
				atrbNm = 'data-anchor',
				targetBlankNm = 'ab_scrollerHiddenLinkTargetBlank',
				lftBrdrLnNm = 'ab_scroller-leftLine',
				rghtBrdrLnNm = 'ab_scroller-rightLine',
					
				noselect = 'ab_noselect',
				veryWideClassName = 'ab_veryWide',
				conf_noanchorsClsNm = 'scroller-noanchors',
					
				conf_noscrollbar = 'data-noscrollbar',
				conf_noanchors = 'data-noanchors',
				conf_auto = 'data-autorotate',
				conf_loop = 'data-loop',
				conf_leftIfWide = 'data-leftIfWide',
				conf_borderLines = 'data-borderLines',
				
				initAttr = 'data-state',
				initState = 'inited';
			
			// for no upyachka
			$(this).wrap('<div class="'+rotNm+'"></div>');

			
			// ! init
			function initScroller($scroller) {
			var 
				// if less it will be no inertia
				minDistance = 40,
				
				// flags
				movable = false,
				allow = false,
				contextMenuFLAG = false,
				veryWideFLAG = false,
				tagetBlankFLAG = true,
				touchFLAG = 'ontouchstart' in document.documentElement,
				
				$wrap = $scroller,
				$el,
				
				xDrag, xDrop, elDrag, xpDrag, tDrag, tDrop, cDrop,
				difference,
				time_tick = [],
				x_tick = [],
				c_tick = [],
				
				sldDelta, sldRgtBrdr, beginWidth,
				sldTDown, sldTMvbl, sldTDrop, sldDifference, sldScorp,
				anchsAllowFLAG = true,
				
				// for comparing deltas in axes
				hStart, hStop, axisesFLAG = false, vector = [],
						
				// standard time & timedivider
				timeInt = 1,
				timeDiff = 500,
				
				// autoplay: removed in 2.7.5
				autoInterval = 2500,
				autoTime = 1.5,
				
				// borderLines 
				borderLinesTime = 200,
				blDifference = 5;
			 
			
				$scroller.addClass(scrNm).attr(initAttr,initState);
			
				// upyachka
				function unwrapThis() {
					if ($wrap.parents('.'+rotNm).size() != 0) {$wrap.unwrap();}
				};
				
				function clearSelection() {
				  if (window.getSelection) {window.getSelection().removeAllRanges();} 
				  else {document.selection.empty();}
				};   
				
				// autowrapping //
				function checkClasses() {
					$wrap.children().each(function(){
						$(this).addClass(itmNm);
					});
				};
				checkClasses();
				
				function wrapItems() {
					$wrap.find('.'+itmNm).wrapAll('<div class="'+drgblNm+'"></div>');
					$el = $wrap.find('.'+drgblNm);
					$wrap.find('.'+drgblNm).wrap('<div class="'+awrpNm+'"></div>');
				};
				wrapItems();
				
				
				
				// borderLines 
				function addBorderLines() {
					var stl = '';
					if (!touchFLAG) {stl = 'display:none';}
					$wrap.append('<div style="'+stl+'" class='+lftBrdrLnNm+'></div><div class="'+rghtBrdrLnNm+'"></div>');
				};
				
				function hideBorderLines() {
					if (veryWideFLAG) {
						$wrap.find('.'+lftBrdrLnNm).hide();
						$wrap.find('.'+rghtBrdrLnNm).hide();
					}
				};
				function showBorderLines() {
					if (!veryWideFLAG) {
						if (parseInt($el.css('left')) != 0) {$wrap.find('.'+lftBrdrLnNm).show();}
						$wrap.find('.'+rghtBrdrLnNm).show();
					}
				};
				
				function hideLeftBorderLine(delay) {
					if (!touchFLAG) {
						$wrap.find('.'+lftBrdrLnNm).delay(delay).fadeOut(borderLinesTime);
					}	
				};
				function showLeftBorderLine(delay) {
					if (!touchFLAG) {
						$wrap.find('.'+lftBrdrLnNm).delay(delay).fadeIn(borderLinesTime);
					}	
				};
				function hideRightBorderLine(delay) {
					if (!touchFLAG) {
						$wrap.find('.'+rghtBrdrLnNm).delay(delay).fadeOut(borderLinesTime);
					}	
				};
				function showRightBorderLine(delay) {
					if (!touchFLAG) {
						$wrap.find('.'+rghtBrdrLnNm).delay(delay).fadeIn(borderLinesTime);
					}	
				};
				
				function checkBorderLines(difference, delay) {
					if (!touchFLAG) {
						if (difference >= lftBrdr-blDifference) {hideLeftBorderLine(delay);}
						else {showLeftBorderLine(delay);}
						if (difference <= rgtBrdr+blDifference) {hideRightBorderLine(delay);}
						else {showRightBorderLine(delay);}
					}	
				};
				
				
				// form here
				/*if (settings['borderLines'] !== false && $wrap.attr(conf_borderLines) !== 'false') {
					addBorderLines();
				}	*/
				
				
				var wdtOfWrap = 0;
				var hgtOfWrap = 0;
				
				
				// calculating the width //
				function calcWdtOfWrap() {
					wdtOfWrap = 0;
					$el.find('.'+itmNm).each(function(){
						wdtOfWrap += $(this).outerWidth(true);
					});
					$el.width(wdtOfWrap+1);
				};
				calcWdtOfWrap();
				//$(window).load(function(){wdtOfWrap=0;calcWdtOfWrap();});
				
				// left — moving on the lenta
				// margin-left — amortizations on resize with overwidth
				function chkWdtOfVsbl() {
					var wdtOfVsbl = $wrap.width();
					if (wdtOfVsbl >= wdtOfWrap) {
						veryWideFLAG = true;
						$wrap
							.addClass(veryWideClassName)
							.find('.'+barNm+', .'+awrNm)
							.hide();
						var half = (wdtOfVsbl - wdtOfWrap) / 2;
						if ($wrap.attr(conf_leftIfWide) !== 'true' && settings['leftIfWide'] !== true) {$el.css({'left':'0','margin-left':half+'px'});	}
						else {$el.css({'margin-left':'0', 'right':'auto', 'left':'0'});}
						hideBorderLines();
						// turn off autoplay
						//$el.closest('.'+scrNm).attr(conf_auto,'false');
					}
					else {
						veryWideFLAG = false;
						$wrap.removeClass(veryWideClassName);
						$el.css({'margin-left':'0'});
						if (checkBarExist()) {$wrap.find('.'+barNm).show();}
						if (checkAnchorsExist()) {$wrap.find('.'+barNm+', .'+awrNm).show();}
						showBorderLines();
						// increase autoplay interval, if only the one block is overflowing
						//if (wdtOfWrap - wdtOfVsbl <= $el.find('.'+itmNm+':last').width()) {autoInterval *= 2;}
					}
				};
				
				// to here
				if (settings['borderLines'] !== false && $wrap.attr(conf_borderLines) !== 'false') {
					addBorderLines();
				}	
				
				
				// height calculations //
				function calcHgtOfWrap() {
					$el.find('.'+itmNm).each(function(){
						var cur = $(this).outerHeight();
						if (cur >= hgtOfWrap) {hgtOfWrap = cur;}
					});
					$el.height(hgtOfWrap).parent().height(hgtOfWrap);
					$wrap.height(hgtOfWrap);
					unwrapThis();
				};
				calcHgtOfWrap();
				$(window).load(function(){calcHgtOfWrap();});  // on load too
				    
				
				// borders of viscosity
				var lftBrdr = 0, rgtBrdr = $el.parent().width() - $el.width() + 1; 
				
				
				// click prevent, unselect, need?, overwidth
				function preventClick(event) {
					event.preventDefault();
				};
				
				function removeNoSelectClass() {
					$('html').removeClass(noselect);
				};
				
				function checkBarExist() {
					if ($wrap.attr(conf_noscrollbar) == 'true' || settings['noscrollbar'] == true) {return false;}
					else {return true;}
				};
				function checkAnchorsExist() {
					if ($wrap.attr(conf_noanchors) == 'true' || settings['noanchors'] == true) {return false;}
					else {return true;}
				};
				
				function isVeryWide(el) {
					if (el.hasClass(veryWideClassName)) {return true;}
					else {return false;}
				};
				
				
				
				
				// ! scrollbar //
				function createScrollBar() {
					$wrap.append('<div class="'+barwNm+'"><div class="'+barNm+'"><siv class="'+sldNm+'"></div></div></div>');
					if ($wrap.attr(conf_noscrollbar) == 'true' || settings['noscrollbar'] == true) {$wrap.find('.'+barwNm).hide();}	
				};
				
				// width of bar
				function calcWdtOfSld() {
					$wrap.find('.'+barNm).width(
						$wrap.find('.'+awrpNm).width()
						- parseInt($wrap.find('.'+barwNm).css('margin-left')) 
						- parseInt($wrap.find('.'+barwNm).css('margin-right'))
					);
					var wdtOfBarw = $wrap.find('.'+barNm).width();
					var wdtOfSld = Math.ceil(wdtOfBarw*$wrap.find('.'+awrpNm).width()/$el.width());
					sldRgtBrdr = Math.ceil(wdtOfBarw - wdtOfSld);
					sldDelta = $wrap.find('.'+barNm).width() / $el.width();
					$wrap.find('.'+sldNm).width(wdtOfSld);
					beginWidth = wdtOfSld;
				};
				
				// on resize
				function defineRightPosition() {
					var coefficient = parseInt($el.css('left'))*(-sldDelta);
					$bar.css({'left': coefficient});
				};
				
				// ! anchors //
				var anchors = [], anc_coords = [], screen_anc_coords = [];
				
				function createAnchorField() {
				if ($wrap.attr(conf_noanchors) !== 'true' && settings['noanchors'] !== true) {
					$wrap.find('.'+awrNm).detach();
					$wrap.append('<div class="'+awrNm+'"></div>');
					}
				};
				
				function recalculateAnchsMargin() {
					$wrap.find('.'+ancNm).each(function(){
						var number = parseInt($(this).attr('class').substr($(this).attr('class').search('-')+1, 10));
						$(this).css('left',anc_coords[number]*sldDelta+'px');
					});
					setAnchorWidth();
					setAncNmHeight();
				};
				
				function setAnchorWidth() {
					var anchorCount = $wrap.find('['+atrbNm+']').size();
					var anchorWidth = ($wrap.find('.'+awrNm).width()/anchorCount) - 3;
					$wrap.find('.'+ancNm).width(anchorWidth);
				};
				
				// give the height of anchors to it`s parent
				function setAncNmHeight() {
					var maxH = 0;
					$wrap.find('.'+ancNm).each(function(){
						var newH = $(this).height() + 3;
						if (newH > maxH) {maxH = newH}
					});
					$wrap.find('.'+awrNm).height(maxH);
				};
				
				// if no full anchors, hide 
				function checkIfZeroAnchs() {
					var count = $wrap.find('['+atrbNm+']').size();
					if (count === 0) {$wrap.attr(conf_noanchors,'true').addClass(conf_noanchorsClsNm).find('.'+awrNm).detach();}
				};
				
				// full the arrays, create the elements
				function anchorsF() {
					createAnchorField();
					
					$el.find('['+atrbNm+']').each(function(){
					anchors.push($(this).attr(atrbNm));
					var cord = $(this).offset().left - $el.offset().left;
					anc_coords.push(cord);
					screen_anc_coords.push((cord*sldDelta).toFixed(0));
					$wrap.find('.'+awrNm).append('<a style="left:'+(cord*sldDelta).toFixed(0)+'px;" class="'+ancNm+' '+ancNm+'-'+(anchors.length-1)+'" title="'+$(this).attr(atrbNm)+'"><span>'+$(this).attr(atrbNm)+'</span></a>');
					});
					anc_coords[0] = 0;
					setAnchorWidth();
					setAncNmHeight();
				};
				
				//$(window).load(function(){calcHgtOfWrap();wdtOfWrap = 0;calcWdtOfWrap();});
				createScrollBar();
				calcWdtOfSld();
				anchorsF();
				chkWdtOfVsbl();
				checkIfZeroAnchs();
				
				
				var $bar = $wrap.find('.'+sldNm);
				var elemsArray = $wrap.find('*');
				
				
				// ! anchor click //
				  $wrap.find('.'+ancNm).click(function (){
				  	if (!anchsAllowFLAG) {return;}
				    /*removeAutoRotate($el);*/
				    jTweener.removeTween(elemsArray);
						var number = parseInt($(this).attr('class').substr($(this).attr('class').search('-')+1, 10));
						var coord = -1*anc_coords[number];
						var barcoord = anc_coords[number]*sldDelta;
						if (coord > rgtBrdr) {
							jTweener.addTween($el, {left:coord+'px', time: timeInt, transition:'easeoutexpo'});
							jTweener.addTween($bar, {left:barcoord+'px', time: timeInt, transition:'easeoutexpo'});
							checkBorderLines(coord, (timeInt+100));
						}
						else {
							jTweener.addTween($el, {left:rgtBrdr, time: timeInt, transition:'easeoutexpo'});
							jTweener.addTween($bar, {left:sldRgtBrdr, time: timeInt, transition:'easeoutexpo'});
							checkBorderLines(rgtBrdr, (timeInt+100));
						}
					});
				
				    
				// only the God knows, how it works
					function isIE() {
						var myNav = navigator.userAgent.toLowerCase();
						return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
					}
				
				  var devDown = 'mousedown', devMove = 'mousemove', devUp = 'mouseup';
				    if ('ontouchstart' in document) {isTouch=true;
				    	devDown = 'touchstart'; devMove = 'touchmove'; devUp = 'touchend';
				    }
				    else if (window.navigator.msPointerEnabled && isIE() !== 10 && isIE() !== 8) {isTouch=true;
							devDown = 'pointerdown'; devMove = 'pointermove'; devUp = 'pointerup';
				    }
				    
				    
				  $el.find('a').click(function(event){
					  preventClick(event);
				  });
				
				// not to click after cancel context menu    
				  $el.on('contextmenu', function(e){
					  contextMenuFLAG = true;
				  });
				  
				
				/* promo edition 
					function startSlideToEnd() {
						jTweener.addTween($el, {left: rgtBrdr, time:1.5, transition: 'easeoutexpo', onComplete:function(){hideRightBorderLine(0)}});
						jTweener.addTween($bar, {left: sldRgtBrdr, time:1.5, transition: 'easeoutexpo'});
					};
					
					$(window).load(function(){
						$scroller.animate({'opacity':'1'}, 500);
						startSlideToEnd();
					});

					
					var toggleAnimTime = 200, toggleAllowFLAG = true;

					function changeToggleFlag() {
						toggleAllowFLAG = false;
						setTimeout(function(){toggleAllowFLAG = true;}, 600);
					};
					
					function toggleProperties(elem) {
						var forWhat = elem.attr('data-for');
						changeToggleFlag();
						if (elem.is(':checked')) {
							elem.prop("checked", false);
						}
						else {
							elem.prop("checked", true);
						}
						if (elem.attr('data-checked') == 'yep') {
							elem.attr('data-checked','nope');
							switch (forWhat) {
								case 'scrollbar'  : 
									$wrap.find('.'+barwNm).fadeOut(toggleAnimTime);
									setTimeout(function(){$('html').addClass('ab_h-scr');}, toggleAnimTime);
									jTweener.addTween($wrap.find('.'+awrNm), {delay:0.2, time:0.5, bottom:'-56px'});
									if ($('[data-for="anchors"]').attr('data-checked') == 'yep') {
										jTweener.addTween($('.content'), {delay:0.2, time:0.5, marginTop:'0px', paddingTop:'10px', transition:'easeoutexpo'});
									}
									else {
										jTweener.addTween($('.content'), {delay:0.2, time:0.5, marginTop:'-50px', transition:'easeoutexpo'});
									}
									break;
								case 'anchors'    : 
									$wrap.find('.'+awrNm).fadeOut(toggleAnimTime); 
									setTimeout(function(){$('html').addClass('ab_h-anc');}, toggleAnimTime);
									if ($('[data-for="scrollbar"]').attr('data-checked') == 'yep') {
										jTweener.addTween($('.content'), {delay:0.2, time:0.5, marginTop:'0px', paddingTop:'10px', transition:'easeoutexpo'});
									}	
									else {
										jTweener.addTween($('.content'), {delay:0.2, time:0.5, marginTop:'-50px', paddingTop:'10px', transition:'easeoutexpo'});
									}
									break;
							}
						}
						else {
							elem.attr('data-checked','yep');
							switch (forWhat) {
								case 'scrollbar'  : 
									$wrap.find('.'+barwNm).delay(200).fadeIn(toggleAnimTime);
									setTimeout(function(){$('html').removeClass('ab_h-scr');}, toggleAnimTime);
									jTweener.addTween($wrap.find('.'+awrNm), {time:0.5, bottom:'-116px'});
									if ($('[data-for="anchors"]').attr('data-checked') == 'yep') {
										jTweener.addTween($('.content'), {time:0.5, marginTop:'0px', paddingTop:'80px', transition:'easeoutexpo'});
									}
									else {
										jTweener.addTween($('.content'), {time:0.5, marginTop:'0px', transition:'easeoutexpo'});
									}
									break;
								case 'anchors'    : 
									$('html').removeClass('ab_h-anc');
									anchorsF();
									defineRightPosition();
									$wrap.find('.'+awrNm).css({'opacity':'0'}).animate({'opacity':'1'}, toggleAnimTime);
									
									if ($('[data-for="scrollbar"]').attr('data-checked') == 'yep') {
										jTweener.addTween($('.content'), {time:0.5, paddingTop:'80px', transition:'easeoutexpo'});
									}	
									else {
										jTweener.addTween($('.content'), {time:0.5, marginTop:'-50px', paddingTop:'80px', transition:'easeoutexpo'});
									}
									break;
							}
						}
					};
					
					$('header .label').on('click', function(e){
						if ($(e.target).is('input')) {e.preventDefault();e.stopPropagation(); return false;}
						if (toggleAllowFLAG) {toggleProperties($(this).find('input'));}
					});

				/* promo edition ends */
				    
					
				/* ====================== */
				//  ! click on lenta      //     
				/* ====================== */ 
				  $el.on(devDown, function(event){
				// overwidth?
				   	if (!veryWideFLAG && !event.metaKey) {
				    
				    /*removeAutoRotate($el);*/
						vector = [];
				    $('html').addClass(noselect);
				    clearSelection();
				    $el.addClass('grabbing');
					  jTweener.removeTween(elemsArray); 					
					  tDrag = event.timeStamp;
					  elDrag = parseInt($el.css('left'));
					  
					  if (devDown == 'pointerdown') {
							xpDrag = event.originalEvent.pageX;
							xDrag = (event.originalEvent.pageX) - elDrag;
							hStart = event.originalEvent.pageY;
					  }
					  else if (devDown !== 'touchstart' && devDown !== 'pointerstart') {
					    xDrag = event.pageX - elDrag;
					    xpDrag = event.pageX; 
					    vector = [0,0];
					  }
					  else if (event.originalEvent.touches.length == 1) {
							xDrag = (event.originalEvent.touches[0].pageX) - elDrag;
							xpDrag = event.originalEvent.touches[0].pageX;
							hStart = event.originalEvent.touches[0].pageY;
					  }
					  movable = true;
					  allow = true;
					  }   
				  });
				    
				
				/* ====================== */
				// ! move on lenta        //  
				/* ====================== */    
				  $(document).on(devMove, function(event){
					  elDrag = parseInt($el.css('left'));
						tDrop = event.timeStamp;
						    
						if (devMove == 'pointermove') {
							xDrop = (event.originalEvent.pageX) - elDrag;   
							cDrop = (event.originalEvent.pageX);
							hStop = (event.originalEvent.pageY);
							
							vector.push( Math.abs(cDrop-xpDrag) - Math.abs(hStop-hStart) ); 
						}
						else if (devMove !== 'touchmove') {
						  xDrop = event.pageX - elDrag;
						  cDrop = event.pageX;
						}
						else {
							xDrop = (event.originalEvent.touches[0].pageX) - elDrag;   
							cDrop = (event.originalEvent.touches[0].pageX);
							hStop = (event.originalEvent.touches[0].pageY); 
							
							vector.push( Math.abs(cDrop-xpDrag) - Math.abs(hStop-hStart) );
						}
						  
						if(movable && vector[1] > -3){
						  difference = cDrop - xDrag;
	
						  if (devMove !== 'touchmove' && devMove !== 'pointermove') {
							  checkBorderLines(difference, 0);
						  }
	
						  event.preventDefault();
						  // if too much toRight
						  if (difference > lftBrdr) {
							  $el.css('left', Math.round(0.2*difference)+'px'); 
							  // and decrease the bar
							  $bar
							   	.width(beginWidth + Math.round(difference*(-sldDelta)*0.2))
							   	.css('left','0');
							}

							else if (difference < rgtBrdr){
							  $el.css('left', Math.round(0.2*difference+rgtBrdr*0.8)+'px');
							  $bar
							   .width(beginWidth+Math.ceil((difference-elDrag)*0.2*sldDelta))
							   //.css('left', $wrap.find('.'+barNm).width() - beginWidth - Math.ceil((difference-elDrag)*0.2*sldDelta));
							   .css({'left':'auto', 'right':'0'});
							}
							// if ordinary action
							else {
							  $el.css('left',difference+'px');
							  $bar.css('left', (-1*difference*sldDelta)+'px');
							}
						}
						    
						// locations and time marks of events, for inertia
						time_tick.push(event.timeStamp);
						x_tick.push(xDrop);
						c_tick.push(cDrop); 		    
					});
				
				
				
				/* ======================== */
				// ! mouse/finger up        //     
				/* ======================== */ 	
				 	$(document).on(devUp, function(event){
					
					// for fastest work on touches remove is here
					if (devUp != 'touchend' && devUp !== 'pointerup') {
					$el.removeClass('grabbing');
					
						if (event.metaKey && $(event.target).closest('a').length && $(event.target).closest('.'+scrNm).length) {
							event.preventDefault();
							var $target = $(event.target);
							var href = $target.closest('a').attr('href');
							window.open(href, '_blank');
							return false;
						}
					
						if (isVeryWide($(event.target).closest('.'+scrNm)) && $(event.target).closest('a').length) {
							
							var $target = $(event.target).closest('a');
							var $targ = $(event.target);
									
							if (settings['onclick'] !== null) {
								event.preventDefault();
								var t = settings.onclick($targ.parents('.'+itmNm));
							}
							else {
								// TODO prevent default I dont know what is this shit
								var href = $target.attr('href');
								if ($target.attr('target') != '_blank') {document.location = href;}
								else {
									// helper for prevent opening 5 windows
									if ($('html .'+targetBlankNm).size() == 0) {
										$('html').append('<a href="'+href+'" target="_blank" style="display:none;" class="'+targetBlankNm+'">sdfsdf</a>');
										window.open(href, '_blank');
										setTimeout(function(){$('html .'+targetBlankNm).detach();}, timeInt);
									}	
								}
							}	
							
							return false;
						}
						
					}	
					
						//$el.removeClass('grabbing');
						tDrop = event.timeStamp;
						var currentLeft = parseInt($el.css('left'));
					
						if (allow) {
						event.preventDefault();
				    	movable = false;
							if (currentLeft > 0) { 												
								jTweener.addTween($el, {left: '0.5px', time: timeInt, transition: 'easeoutexpo'/*, onComplete: function(){pressedMouseButton = false;}*/}); 
								jTweener.addTween($bar, {width:beginWidth, left: 0, time: timeInt, transition: 'easeoutexpo', onComplete: function(){removeNoSelectClass();}});
							}
							else if (currentLeft < rgtBrdr) {	
								anchsAllowFLAG = false;						
								jTweener.addTween($el, {left: rgtBrdr + 'px', time: timeInt, transition: 'easeoutexpo'/*, onComplete: function(){pressedMouseButton = false;}*/});
								jTweener.addTween($bar, {width:beginWidth, /*left: sldRgtBrdr + 'px',*/ time: timeInt, transition: 'easeoutexpo', onComplete: function(){
									$bar.css({'left':sldRgtBrdr+'px', 'right':'auto'});
									anchsAllowFLAG = true;
									removeNoSelectClass();
								}});
								//console.log(beginWidth+' '+sldRgtBrdr);
							}
							else {		
								if (devUp == 'pointerup')	{
									xDrop = event.originalEvent.pageX;
									var newXXX = (xDrop - c_tick[c_tick.length - 2])*16;//*8;
									newTime = tDrop - tDrag;	
									var offset = xDrop - currentLeft;
							
									if (vector[1] <= -3) {return false;}
								}
								else if (devUp != 'touchend') {
									xDrop = event.pageX;
									//var newXXX = (xDrop - c_tick[c_tick.length - 2])*16;
									//var newXXX = (xDrop - c_tick[c_tick.length - 2])*16;
									// 31 янв БАГ.mov, fixed maybe
									var newXXX = (c_tick[c_tick.length - 1] - c_tick[c_tick.length - 5])*4;
									newTime = tDrop - tDrag;	
									var offset = xDrop - currentLeft;
								}
								else {
									xDrop = event.originalEvent.changedTouches[0].pageX;
									var newXXX = (xDrop - c_tick[c_tick.length - 2])*16;//*8;
									newTime = tDrop - tDrag;	
									var offset = xDrop - currentLeft;
							
									if (vector[1] <= -3) {return false;}
								}
						
								// click or move?
								if (xDrop == xpDrag && $(event.target).closest('a').size() != 0 && !contextMenuFLAG) {
									
									var $target = $(event.target).closest('a');
									var $targ = $(event.target);
									
									if (settings['onclick'] !== null) {
										event.preventDefault();
										var t = settings.onclick($targ.parents('.'+itmNm));
									}
									else {
										var href = $target.attr('href');
										if ($target.attr('target') != '_blank') {document.location = href;}
										else {window.open(href, '_blank');}
									}
									
									return false;
								}
							
							// flag to default
							contextMenuFLAG = false;
							var dif = tDrop - time_tick[time_tick.length-1];
							var distance = x_tick[x_tick.length-2]+7;
							var flinged = newXXX+elDrag;//newXXX*2+elDrag;
							var borderLinesDelay = Math.round(newTime/timeDiff);
						
							if (xDrop < xpDrag && distance < offset && dif <= 30) {		
							
								if(flinged < rgtBrdr) {
									jTweener.addTween($el, {left: rgtBrdr+'px', time: Math.round(newTime/timeDiff), transition: 'easeoutexpo', onComplete: function(){
										hideRightBorderLine(0);
										removeNoSelectClass();
									}});
									jTweener.addTween($bar, {left: sldRgtBrdr+'px', time: Math.round(newTime/timeDiff), transition: 'easeoutexpo'});
								}      
								else {
									jTweener.addTween($el, {left:flinged + 'px', time: Math.round(newTime/timeDiff), transition: 'easeoutexpo', onComplete: function(){removeNoSelectClass()}});
									jTweener.addTween($bar, {left:(flinged)*(-1*sldDelta) + 'px', time: Math.round(newTime/timeDiff), transition: 'easeoutexpo'});
								} 
							}
						
							else if (xDrop > xpDrag && distance > offset & dif <= 30){
							
								if (flinged > 0){
									jTweener.addTween($el, {left: 0, time: timeInt, transition: 'easeoutexpo', onComplete: function(){
										hideLeftBorderLine(0);
										removeNoSelectClass();
									}});
									jTweener.addTween($bar, {left: 0, time: timeInt, transition: 'easeoutexpo'});
								}		
								else {
								//console.log(flinged);
								//console.log('newXXX:'+newXXX+' elDrag:'+elDrag);
									jTweener.addTween($el, {left: flinged+'px', time: Math.round(newTime/timeDiff), transition: 'easeoutexpo', onComplete: function(){removeNoSelectClass();}});
									jTweener.addTween($bar, {left: (flinged)*(-1*sldDelta)+'px', time: Math.round(newTime/timeDiff), transition: 'easeoutexpo'});
								}
							}
							
							else {removeNoSelectClass();}	
							}
							allow = false;
							// specially not here cuz of right behavior on touches
							//removeNoSelectClass();
						}	
					});
					
				// ! scrollbar //
					$bar.on(devDown, function(event){
						/*removeAutoRotate($el);*/
						sldTMvbl = true;
						jTweener.removeTween(elemsArray);
						var barLeft = $bar.position().left;
						if (devDown == 'pointerdown') {
							sldTDown = (event.originalEvent.pageX) - barLeft;
						}
						else if (devDown != 'touchstart') {
							sldTDown = event.pageX - barLeft;
						}
						else {
							sldTDown = (event.originalEvent.touches[0].pageX) - barLeft;
						}
					});
					
					
					$(document).on(devMove, function(event){
						if (sldTMvbl){
							if (devMove == 'pointermove') {
								sldTDrop = (event.originalEvent.pageX); 
							}
							else if (devMove != 'touchmove') {
								sldTDrop = event.pageX;
							}
							else {
								sldTDrop = (event.originalEvent.changedTouches[0].pageX); 
							}
						
						sldDifference = sldTDrop - sldTDown;
						sldScorp = -sldDifference/sldDelta;
						
						checkBorderLines(parseInt($('.'+drgblNm).css('left')), 0);
						
						if (sldDifference <= 0) {
							$bar.css('left',0+'px');
							$el.css('left', 0+'px');
						}
						else if (sldDifference >= sldRgtBrdr) {
							$el.css('left',rgtBrdr+'px');
							$bar.css('left', sldRgtBrdr+'px');	
						}
						else {
							$bar.css('left', sldDifference+'px');
							$el.css('left', sldScorp+'px');
						}
					}	
					});
					
					$(document).on(devUp, function(){
						if (sldTMvbl) {sldTMvbl = false;}
					});
					
					
				// ! scrollbar click //
					$wrap.find('.'+barNm).on(devDown, function(event){
						if (!$(event.target).hasClass(sldNm)) {
							jTweener.removeTween(elemsArray);
							if (devDown != 'touchstart') {
								var coordinate = event.pageX - $wrap.find('.'+barNm).offset().left;
							}
							else {
								var coordinate = event.originalEvent.touches[0].pageX - $wrap.find('.'+barNm).offset().left;	
							}
							
							coordinate = coordinate - beginWidth/2;
							var need = -coordinate/sldDelta;
						
							if (coordinate <= 0) {
								jTweener.addTween($el, {time: timeInt, left:0, transition: 'easeoutexpo'});
								jTweener.addTween($bar, {time: timeInt, left:0, transition: 'easeoutexpo'});	
							}
							else if (coordinate >= sldRgtBrdr) {
								jTweener.addTween($el, {time: timeInt, left:rgtBrdr, transition: 'easeoutexpo'});
								jTweener.addTween($bar, {time: timeInt, left:sldRgtBrdr, transition: 'easeoutexpo'});	
							}
							else {
								jTweener.addTween($el, {time: timeInt, left:need, transition: 'easeoutexpo'});
								jTweener.addTween($bar, {time: timeInt, left:coordinate, transition: 'easeoutexpo'});
							}
						}
					});
				
				
				// ! wheel //
					$wrap.find('.'+awrpNm).mousewheel(function(e, delta, deltaX, deltaY) {
					if (!$wrap.hasClass(veryWideClassName)/* && !pressedMouseButton*/) {
						// only if horizontal delta > vertical
						if (Math.abs(deltaX) > Math.abs(deltaY)) {
							jTweener.removeTween(elemsArray);
							//checkBorderLines(parseInt($('.'+drgblNm).css('left')), 0);
							e.preventDefault();
							/*removeAutoRotate($wrap);*/

							var temp = parseInt($el.css('left')) - deltaX;
							var sliderTemp = -temp*sldDelta;
					
							// if too much toLeft
							if (temp < rgtBrdr) {
								$el.css('left', rgtBrdr+'px');
								//$bar.css({'left': /*sldRgtBrdr+'px'*/'auto', 'right':'0'});
								$bar.css({'left':sldRgtBrdr+'px', 'right':'auto'});
								// I dont know why it doesnt work with "checkBorderLines"
								showLeftBorderLine(0);
								hideRightBorderLine(0);
							}

							else if (temp > lftBrdr) {
								$el.css('left', lftBrdr+'px');  
								$bar.css('left', 0+'px'); 
								hideLeftBorderLine(0);
								showRightBorderLine(0);
							}
							// ordinary action
							else {
								$el.css('left', temp+'px');
								if(sliderTemp < sldRgtBrdr) {
								$bar.css('left', sliderTemp+'px');
								showLeftBorderLine(0);
								showRightBorderLine(0);
								}
							} 
						}
					}	
					});
					
					// prevent selection on page
				    $el.addClass('unselectable').attr('unselectable','on').attr('draggable','false').on('dragstart',function(){return false;});
				    $el.find('*').attr('draggable','false').attr('unselectable','on'); 
				
				
				/* ====================== */
				//       ! resize         //
				/* ====================== */ 
				$(window).resize(function(){
					calcWdtOfWrap();
					rgtBrdr = $el.parent().width() - $el.width();
					if (rgtBrdr >= $el.position().left) {var differ = rgtBrdr - $el.position().left;$el.css('left','+='+differ+'px');}
					calcWdtOfSld();
					anchorsF();
					defineRightPosition();
					chkWdtOfVsbl();
				});
				};
				
				
				
				
				function destroyScroller($scroller) {
					var content = $scroller.find('.'+drgblNm).html();
					$scroller
						.html(content)
						.find('.'+itmNm)
							.each(function(){
								$(this).removeClass(itmNm);
							});
				};
				
				
				function checkInitScroller($scroller) {
					if ($scroller.attr(initAttr) == initState) {destroyScroller($scroller);}
					if ($scroller.closest(':hidden').size() == 0) {initScroller($scroller);}
					else {setTimeout(function(){checkInitScroller($scroller)}, 100);}
				};
								
				checkInitScroller($(this));
				
		
		});
		
	};
	
	
	$(function(){
		$('.scroller').scroller();
	});
	
})(jQuery);