/*
 * jQuery Edbox plugin v.1.3
 * @author Eduardo Carneiro Moreno
 * Code under MIT License
 */

(function($){

	var edboxInstance = false;

	$.fn.edbox = function(settings){

		var defaults = {
				content: null,
				width: null,
				height: null,
				boxClass: 'box',
				bgColor: '#fff',
				overlayBgColor: '#000',
				overlayOpacity: '.5',
				close: '<img src="images/close-modal.png"/>',
				onClose: function(){},
				imgLoad: 'images/box-load.gif',
				animation: true,
				fx: 'slide',
				duration: 'fast',
				easing: 'swing'
			},
			options = $.extend({}, defaults, settings),
			content;

		if(this.length){
			return this.each(function(){
				var elem = $(this).on('click', function(e){
					initBox();
					e.preventDefault();
				});
				content = options.content || elem.attr('href') || elem.attr('data-content');
			});
		} else {
			content = options.content;
			initBox();
		}

		function initBox(){
			if(!edboxInstance){
				edboxInstance = true;
				buildBox();
			} else {
				console.error('Multiple instances not permitted!');
			}
		}

		function buildBox(){
			var box, boxOverlay, boxContent, boxLoad, boxClose, contentImg, imgLoad, actualBox;

			$('body')
				.prepend(
					'<div class="' + options.boxClass + '-overlay"/>' +
					'<div class="' + options.boxClass + '-load" />' +
					'<div class="' + options.boxClass + '">' +
						'<a href="#" class="' + options.boxClass + '-close">' + options.close + '</a>' +
						'<div class="' + options.boxClass + '-content"/>' +
					'</div>'
				);

			boxOverlay = $('.' + options.boxClass + '-overlay').css({
				'background': options.overlayBgColor,
				'opacity': options.overlayOpacity,
				'width': '100%',
				'height': '100%',
				'position': 'fixed',
				'top': '0',
				'left': '0',
				'z-index': '100'
			});

			boxLoad = $('.' + options.boxClass + '-load').hide();

			box = $('.' + options.boxClass).hide();

			boxContent = $('.' + options.boxClass + '-content').hide();

			boxClose = box
				.find('.' + options.boxClass + '-close:first-child')
				.css({
					'display': 'none',
					'position': 'absolute',
					'cursor': 'pointer',
					'white-space': 'nowrap',
					'z-index': '1'
				});

			$.fx.off = !options.animation;

			$(document)
				.on('keydown', closeOnEsc)
				.on('click', '.' + options.boxClass + '-close, .' + options.boxClass + '-overlay', function(e){
					closeBox();
					e.preventDefault();
				});

			if(content == null || content == ''){
				error('The content option was not set');
			} else {
				content = content.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

				var getExt = content.lastIndexOf('.') > 0 && content.substr(content.lastIndexOf('.') + 1).toLowerCase(),
					getId = content.indexOf('#') == 0,
					getWhiteSpace = content.indexOf(' ') > -1;

				//File or image
				if(!getWhiteSpace && !getId && getExt){
					imgLoad = $('<img/>')
						.attr({
							'src': options.imgLoad + '?random=' + (new Date()).getTime() //dodge cache
						})
						.error(function(){
							error('\"' + options.imgLoad + '\" not found');
						})
						.css('display', 'block')
						.load(function(){
							boxLoad
								.show()
								.append(imgLoad)
								.css({
									'background': options.bgColor,
									'height': imgLoad.outerHeight(),
									'width': imgLoad.outerWidth(),
									'margin-top': -imgLoad.outerHeight() / 2,
									'margin-left': -imgLoad.outerWidth() / 2,
									'top': '50%',
									'left': '50%',
									'position': 'fixed',
									'display': 'none',
									'z-index': '102'
								})
								.setFx(options.fx, options.duration, options.easing, function(){
									if($.inArray(getExt, ['jpg', 'jpeg', 'gif', 'png']) > -1){
										contentImg = $('<img/>')
											.attr('src', content + '?random=' + (new Date()).getTime())
											.error(function(){
												hideLoading(function(){
													error('Image \"' + content + '\" not found');
												});
											})
											.load(function(){
												contentImg.appendTo(boxContent);
												hideLoading(openBox);
											})
											.css('display', 'block');
									} else {
										boxContent.load(content, function(response, status, xhr){
											hideLoading(function(){
												status == "error" ? error('File \"' + content + '\" ' + xhr.statusText.toLowerCase()) : openBox();
											});
										});
									}
								});
						});
				}

				//DOM Element
				else if(!getWhiteSpace && getId){
					if($(content).length){
						$(content)
							.clone()
							.appendTo(boxContent)
							.show();
						openBox();
					} else {
						error('Element \"' + content + '\" not found');
					}
				}

				//HTML or text
				else {
					boxContent
						.append(content)
						.css('white-space', 'nowrap');
					openBox();
				}
			}

			function openBox(){
				box.show();

				var horizontalPad = parseInt(box.css('padding-right')) + parseInt(box.css('padding-left')),
					verticalPad = parseInt(box.css('padding-top')) + parseInt(box.css('padding-bottom')),
					width = options.width || boxContent.width(),
					height = options.height || boxContent.height(),
					windowWidth = $(window).width(),
					windowHeight = $(window).height();

				width + horizontalPad + 20 > windowWidth && (width = windowWidth - horizontalPad - 20);
				height + verticalPad + 20 > windowHeight && (height = windowHeight - verticalPad - 20);

				boxClose.css('display', 'block');

				boxContent
					.css({
						'height': height,
						'overflow-x': 'hidden',
						'overflow-y': 'auto'
					})
					.fadeIn(options.duration);

				box
					.css({
						'background': options.bgColor,
						'height': height,
						'left': '50%',
						'margin-left': -(width + horizontalPad) / 2,
						'margin-top': -(height + verticalPad) / 2,
						'overflow': 'hidden',
						'position': 'fixed',
						'top': '50%',
						'width': width,
						'z-index': '101'
					})
					.hide()
					.setFx(options.fx, options.duration, options.easing);
			}

			function closeOnEsc(e){
				e.which == 27 && closeBox();
			}

			function closeBox(){
				$(document)
					.off('keydown', closeOnEsc)
					.off('click', '.' + options.boxClass + '-close, .' + options.boxClass + '-overlay');

				actualBox = box.height() ? box : boxLoad;
				actualBox
					.stop()
					.setFx(options.fx, options.duration, options.easing, function(){
						boxOverlay
							.add(box)
							.add(boxLoad)
							.detach();
						options.onClose.call(this);

						edboxInstance = false;
					});
			}

			function hideLoading(fn){
				boxLoad
					.stop()
					.delay('slow')
					.setFx(options.fx, options.duration, options.easing, function(){
						$(this).detach();
						fn();
					});
			}

			function error(msg){
				boxContent
					.append('<div class="' + options.boxClass + '-error"></div>')
					.find('.' + options.boxClass + '-error')
					.css('color', '#C00')
					.text('ERROR: ' + msg + '!');
				openBox();
			}
		}
	};

	$.edbox = function(settings){
		$().edbox(settings);
	};

	$.fn.setFx = function(fx, duration, easing, callback){
		return this.each(function(){
			var elem = $(this), effect;
			switch(fx){
				case 'fade':
					effect = fx + (elem.is(':visible') ? 'Out' : 'In');
					break;
				case 'slide':
					effect = fx + (elem.is(':visible') ? 'Up' : 'Down');
					break;
				case 'toggle':
					effect = elem.is(':visible') ? 'hide' : 'show';
					break;
			}
			elem[effect](duration, easing, callback);
		});
	};

})(jQuery);