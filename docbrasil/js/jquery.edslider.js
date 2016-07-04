/*
 * jQuery edSlider plugin v.1.6
 * @author Eduardo Moreno
 * Code under MIT License
 */

(function($){

	$.fn.edslider = function(settings){

		var options = $.extend({
			width     : 960,
			height    : 400,
			position  : 1,
			interval  : 5000,
			duration  : 500,
			animation : true,
			paginator : true,
			navigator : true,
			progress  : true,
			loadImgSrc: 'images/load.gif',
			skin      : 'edslider'
		}, settings);

		return this.each(function(){

			//Building (wrapping, validating, setting up)
			var slider = $(this).addClass('slider'),
				sliderLi = slider.find('li'),
				sliderBgImg = sliderLi.css('background-image')
				sliderImg = slider.find('img'),
				wrapper = slider
					.wrap('<div class="' + options.skin + '"/>')
					.parent()
					.css('width', options.width),
				startPosition = options.position;

			if(sliderLi.length <= 1){
				console.error('error: must be more then 2 items on your list!');
				if(startPosition == 0 || startPosition > sliderLi.length){
					console.error('error: start position value must be between 1 and ' + sliderLi.length + '!');
					startPosition = 1;
				}
			}

			sliderLi
				.filter(':nth-child(' + startPosition + ')')
				.addClass('current');

			slider
				.on('mouseenter', function(){
					$(this).addClass('hover');
					hoverControl();
				})
				.on('mouseleave', function(){
					$(this).removeClass('hover');
					hoverControl();
				});

			options.height == 'auto' ? slider.height(options.height) : slider.add(sliderLi).height(options.height);

			//Controls (navigation, pagination and progress bar)
			var position, paginator, paginatorLi, navigator, progress, progressWidth, progressElapsed, interact = false;

			if((options.navigator || options.paginator) && sliderLi.length > 1){
				if(options.paginator){
					paginator = wrapper
						.prepend('<ul class="paginator"/>')
						.find('.paginator');

					sliderLi.each(function(){
						paginator.append('<li>&nbsp;</li>');
					});

					paginatorLi = paginator
						.css({
							'left' : '50%',
							'margin-left' : -paginator.width()/2
						})
						.find('li')
						.on('click', function(){
							if(interact){
								position = $(this).index();
								if((index - 1) != position){
									sliderLi
										.removeClass('current')
										.filter(':nth-child(' + ++position + ')')
										.addClass('current');
									play();
								}
							}
						});
				}
				if(options.navigator){
					navigator = wrapper
						.prepend('<div class="navigator prev"/><div class="navigator next"/>')
						.find('.navigator')
						.css({
							'top': '50%',
							'margin-top': - wrapper.find('.navigator').height()/2
						})
						.on('click', function(){
							var btn = $(this);
							btn.hasClass('next') && interact && next();
							btn.hasClass('prev') && interact && prev();
						});

					wrapper
						.find('.prev')
						.css('left', 0)
						.end()
						.find('.next')
						.css('right', 0);
				}
			}

			progress = wrapper
				.prepend('<div class="progress"/>')
				.find('.progress').width(0);

			!options.progress && progress.height(0);

			//Functions (init, play, next, prev, pause, resume)
			var timeLeft = options.interval, current, index, paused;

			function init(){
				sliderLi.length > 1 ? play() : sliderLi.fadeIn(options.duration);
			}

			function play(){
				progressResize();
				progressReset();
				interact = false;
				current = sliderLi
					.filter('.current')
					.siblings()
					.fadeOut(options.animation && options.duration || 0)
					.end()
					.fadeIn(options.animation && options.duration || 0, function(){
						interval();
						progressResize();
					});				

				/*navigator
					.add(paginator)
					.fadeIn(options.animation && options.duration || 0);*/

				index = sliderLi.index(current) + 1;

				if(options.paginator){
					paginatorLi
						.removeClass('current')
						.filter(':nth-child(' + index + ')')
						.addClass('current');
				}
			}

			function next(){
				sliderLi.removeClass('current');
				if(++index <= sliderLi.length){
					current
						.next()
						.addClass('current');
				} else {
					sliderLi
						.filter(':first-child')
						.addClass('current');
				}
				play();
			}

			function prev(){
				sliderLi.removeClass('current');
				if(--index >= 1){
					current
						.prev()
						.addClass('current');
				} else {
					sliderLi
						.filter(':last-child')
						.addClass('current');
				}
				play();
			}

			function pause(){
				paused = true;
				progressElapsed = progress
					.stop()
					.width();
				timeLeft = (progressWidth - progressElapsed) * (options.interval / progressWidth);
			}

			function interval(){
				paused = false;
				interact = true;
				progress
					.stop()
					.animate({
						'width': '+=' + (progressWidth - progressElapsed)
					}, timeLeft, 'linear', function(){
						progressReset();
						next();
					});
				hoverControl();
			}

			function progressReset(){
				progress
					.stop()
					.width(0);				
				progressElapsed = 0;
				timeLeft = options.interval;
			}

			function progressResize(){
				$(window)
					.resize(function(){
						progressWidth = slider.width();
						pause();
						interval();
					})
					.resize();
			}

			function hoverControl(){
				if(interact){
					if(slider.hasClass('hover')){
						pause();
					} else if(paused){
						interval();
					}
				}
			}

			//Preloading images and init
			var totalImgsUrl = [],
				preloadedImgs = 0;
			
			sliderLi.each(function(){
				sliderBgImg = $(this)
					.css('background-image')
					.replace(/.*\s?url\([\'\"]?/, '')
					.replace(/[\'\"]?\).*/, '');
				sliderBgImg != 'none' && totalImgsUrl.push(sliderBgImg);
			});
			
			sliderImg.each(function(){
				totalImgsUrl.push(this.src);
			});

			if(totalImgsUrl.length){
				$.each(totalImgsUrl, function(value){
					$('<img/>')
						.hide()
						.attr('src', totalImgsUrl[value] + '?random=' + new Date().getTime())
						.on('load', function(){
							if(++preloadedImgs == totalImgsUrl.length){
								slider.css('background-image', 'none');
								init();
							} else {
								slider.css({
									'background-image'   : 'url("' + options.loadImgSrc + '")',
									'background-repeat'  : 'no-repeat',
									'background-position': 'center'
								});
							}
						});
				});
			} else {
				init();
			}
		});
	}
})(jQuery);