

//上拉加载下拉刷新插件
$.fn.slideFresh = function(option) {
	var usId = this.selector.split('#')[1];
	var setHtml = '<div id=' + usId + '_wrap class="scroll-wrap"></div>';
	var $this = $(this.selector);
	var eventHtml = '';
	if (option.scrollDown) {
		eventHtml += '<div class="MyMedicalLifeText">我的医疗生活</div><div class="scroll-roller-top"><div class="slice"><div data-loader="circle"></div></div></div>'
	};
	$this.append(eventHtml).addClass('scroll-bd').before(setHtml).appendTo($(this.selector + '_wrap'));
	var $thisWrap = $(this.selector + '_wrap');
	if (eventHtml == '') {
		$thisWrap.css('background', 'none')
	};
	var getHeight = option.height || $(window).height();
	$thisWrap.height(getHeight);

	var s = new IScroll({
		wrapper: $thisWrap,
		scroller: $this,
		scrollbars: option.scrollbars,
		click: false
	});
	s.loading = function() {

	};
	s.autoRefresh = function() {
		setTimeout(function() {
			$thisWrap.find('> .scroll-curtain').fadeOut('fast');
			s.refresh()
		}, 500)
	};
	s.on('slideMoveEnd', function() {
		var y = this.y,
			maxY = this.maxScrollY - y;
		var height = parseInt($('html').attr('data-dpr') || 1)*16*3;
		if (y > height) {
			if (option.scrollDown) {
				s.loading();
				option.scrollDown()
			}
		};
		// if (maxY > height) {
		// 	if (option.scrollUp) {
		// 		s.loading();
		// 		option.scrollUp()
		// 	}
		// }
	});

	s.on('scrollEnd', function() {
        if ((this.y - this.maxScrollY < 100 ) && option.scrollUp){
        	s.loading();
			option.scrollUp()
        }
	});

	return s
};
