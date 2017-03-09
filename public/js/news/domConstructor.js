function DomConstructor(){

	var _show_control_config_arr = [
			{	"name":'news_source',//来源
				"svg":''},
			{	"name":'criticism_count',//评论数
				"svg":'<svg viewBox="0 0 22 22"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-134.000000, -121.000000)"><g transform="translate(134.000000, 121.000000)"><path d="M1,1 L21,1 L21,19 L13,19 L11,21 L9,19 L1,19 L1,1 Z M10,9 L12,9 L12,11 L10,11 L10,9 Z M5,9 L7,9 L7,11 L5,11 L5,9 Z M15,9 L17,9 L17,11 L15,11 L15,9 Z" id="Combined-Shape" fill="#BDBDBD"></path><rect id="Rectangle-6" fill="#FF0000" opacity="0" x="0" y="0" width="22" height="22"></rect></g></g></g></svg>'},
			{	"name":'favour_count',//点赞数
				"svg":'<svg viewBox="0 0 23 22"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-213.000000, -121.000000)"><g transform="translate(213.000000, 121.000000)"><path d="M15.8889761,17.757941 L15.8807018,11.8675622 C17.9414746,12.7364363 20.5964208,13.6115252 22.3631754,12.7158625 C23.1613949,12.3112604 23.6635093,11.43077 23.653682,10.640294 C23.6350465,9.10184799 22.5003451,8.49597599 21.0757747,8.23954067 C19.1340699,7.89008027 14.8197762,5.35725235 14.5304168,2.87558809 L2.94779965,2.87558809 L2.94779965,15.1697057 C2.94779965,16.4638234 4.30834576,17.0043795 4.96160648,17.1748306 C4.96160648,17.1748306 11.8755792,18.5803263 13.9591369,19.0309431 C14.7154508,19.1948038 15.1771641,19.1437159 15.5089871,18.8711363 C15.7994142,18.6323862 15.8729127,18.3350094 15.8889761,17.757941 Z" id="Shape" stroke="#BDBDBD" stroke-width="1.29411765" fill="#BDBDBD" transform="translate(13.300812, 10.999929) rotate(-90.000000) translate(-13.300812, -10.999929) "></path><rect id="Combined-Shape" fill="#BDBDBD" x="0" y="9" width="3" height="13"></rect><rect id="Rectangle" fill="#FF0000" opacity="0" x="0" y="0" width="22" height="22"></rect></g></g></g></svg>'},
			{	"name":'view_count',//阅读量
				"svg":'<svg viewBox="0 0 22 22"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-292.000000, -121.000000)"><g transform="translate(292.000000, 121.000000)"><path d="M11,20 C19.0245686,20 22,11 22,11 C22,11 19.0245686,2 11,2 C2.97543144,2 0,11 0,11 C0,11 2.97543144,20 11,20 Z M11,16 C13.7614237,16 16,13.7614237 16,11 C16,8.23857625 13.7614237,6 11,6 C8.23857625,6 6,8.23857625 6,11 C6,13.7614237 8.23857625,16 11,16 Z M11,14 C12.6568542,14 14,12.6568542 14,11 C14,9.34314575 12.6568542,8 11,8 C9.34314575,8 8,9.34314575 8,11 C8,12.6568542 9.34314575,14 11,14 Z" fill="#BDBDBD"></path><rect fill="#FF0000" opacity="0" x="0" y="0" width="22" height="22"></rect></g></g></g></svg>'}
		];


	var _constructBottomInfo = function(newsObj,isFullLine){
		var ret = '';

		var t_show_control =  newsObj.show_control;
		t_show_control = (t_show_control == "00000") ? "00001" : t_show_control;
		var t_show_control_arr = t_show_control.split("");

		//标签
		if(newsObj.tag_name){
			ret += '<li class="badge" '+(newsObj.tag_bgcolor ? ('style="background-color:'+newsObj.tag_bgcolor+'" '):'')+'><span>'+newsObj.tag_name+'</span></li>';
		};

		//1-来源  2-评论数 3-点赞数 4-阅读量/播放量
		for(var i=0,len=_show_control_config_arr.length;i<len;i++){

			var t_config_obj = _show_control_config_arr[i],
				t_val = newsObj[t_config_obj.name];
			//如果控制位为0，或者newsObj中对应的字段为null或undefined，则continue
			if("0"==t_show_control_arr[i] || t_val ==null || t_val == "") continue;

			ret += '<li class="trivalInfo">'
					+ (t_config_obj.svg ? ('<div class="svgWrapper">'+t_config_obj.svg+'</div>'):'')
					+ '<span>'+t_val+'</span>'
				+ '</li>';
		};

		//时间
		var t_time_control_val = t_show_control_arr.pop(),//最后一个标志位代表时间
			t_time_val = newsObj.show_time;
		if("1"==t_time_control_val && t_time_val){
			var t_class = isFullLine ? "trivalInfo rightTime " : "trivalInfo";
			ret += '<li class="'+t_class+'"><span time="'+t_time_val+'">'+Util.formatTime(t_time_val)+'</span></li>'
		};


		//构造父DOM
		var t_parent_class = "bottom";
		if(isFullLine && "1"==t_time_control_val && t_time_val){
			t_parent_class = "bottom fullWithTime";
		};
		ret = '<div class="'+t_parent_class+'" >' + ret + '</div>';

		return ret;
	}

	//1，单张大图
	var _singleBigPic = function(newsObj){

		var ret = '';

		ret += '<div class="newsItemWrapper" newsid="'+ newsObj.news_id +'" topflag="'+newsObj.top_flag+'">';
			ret += '<div class="newsItem t-bigOrMulti-image">';
				ret += '<div class="title">'
							+ (newsObj.icon_url ? '<img src="'+newsObj.icon_url+'" alt="" class="icon">' : "")
							+ '<span>'+newsObj.news_name+'</span>'
						+'</div>';
				ret += '<div class="one-big-image" style="background-image:url('+newsObj.image_one_url+')"></div>';
				ret += _constructBottomInfo(newsObj,true);
			ret += '</div>';
		ret += '</div>';

		return ret;

	};

	var _pureText = function(newsObj){
		var ret = '';

		ret += '<div class="newsItemWrapper" newsid="'+ newsObj.news_id +'" topflag="'+newsObj.top_flag+'">';
			ret += '<div class="newsItem t-pure-text">';
				ret += '<div class="text-wrapper">'

					if(newsObj.news_brief){
						//如果有摘要，那么显示单行标题和文章简介
                        ret += '<div class="title one-line">' + newsObj.news_name + '</div>'
                       		+ '<div class="desc">' + newsObj.news_brief + '</div>';
					}
					else{
                        ret += '<div class="title multi-lines">' + newsObj.news_name + '</div>'
					}
				ret += '</div>';
				
				ret += _constructBottomInfo(newsObj,true);
			ret += '</div>';
		ret += '</div>';

		return ret;

	}

	//3、4，缩略图
	//@param imgPosition代表小图的位置，如果居左，则为‘left’,居右则为‘right’
	var _singleSmallPic = function(newsObj,imgPosition){

		var ret = '';

		ret += '<div class="newsItemWrapper" newsid="'+ newsObj.news_id +'" topflag="'+newsObj.top_flag+'">';
			ret += '<div class="newsItem t-small-image '+(imgPosition == 'left' ? ' t-left-image' : '')+'">';

				ret += '<div class="img"  style="background-image:url('+newsObj.image_one_url+')"></div>';
				
				ret += '<div class="text-wrapper">'

					if(newsObj.news_brief){
						//如果有摘要，那么显示单行标题和文章简介
                        ret += '<div class="title one-line">' + newsObj.news_name + '</div>'
                       		+ '<div class="desc">' + newsObj.news_brief + '</div>';
					}
					else{
                        ret += '<div class="title multi-lines">' + newsObj.news_name + '</div>'
					}

					ret += _constructBottomInfo(newsObj,false);

				ret += '</div>';
			ret += '</div>';
		ret += '</div>';

		return ret;

	};


	//5，多图
	var _multiPics = function(newsObj){

		var ret = '';

		ret += '<div class="newsItemWrapper" newsid="'+ newsObj.news_id +'" topflag="'+newsObj.top_flag+'">';
			ret += '<div class="newsItem t-bigOrMulti-image">';
				ret += '<div class="title">'
							+ (newsObj.icon_url ? '<img src="'+newsObj.icon_url+'" alt="" class="icon">' : "")
							+ '<span>'+newsObj.news_name+'</span>'
						+'</div>';

                ret += '<div class="multi-images-wrapper">' 
                			+ '<div class="img" style="background-image:url('+newsObj.image_one_url+')"></div>'
                			+ '<div class="img" style="background-image:url('+newsObj.image_two_url+')"></div>'
                			+ '<div class="img" style="background-image:url('+newsObj.image_three_url+')"></div>'
                		+'</div>';
				ret += _constructBottomInfo(newsObj,true);
			ret += '</div>';
		ret += '</div>';

		return ret;
	};


	var _constructNews = function(newsObj){
		if(newsObj == null ) return "";
		var t_show_form = newsObj.show_form;
		switch(t_show_form){
			case 'SINGLE_PIC':
				return _singleBigPic(newsObj);
			case 'SINGLE_THUMBNAIL_LEFT':
				return _singleSmallPic(newsObj,"left");
			case 'SINGLE_THUMBNAIL_RIGHT':
				return _singleSmallPic(newsObj,"right");
			case 'MULTI_PIC':
				return _multiPics(newsObj);
			case 'TEXT_ONLY':
				return _pureText(newsObj);	
			default:
				return "";
		};
	};

	//构造收藏列表中的一条新闻
	var _constructColletionNews = function(collectionObj){

		var ret = '';

		ret += '<div class="newsItemWrapper" newsid="'+collectionObj.news_id+'" time="'+collectionObj.show_time+'">';
			
			ret += '<div class="newsItem t-small-image t-left-image">';

				ret += '<div class="img"  style="background-image:url('+(collectionObj.news_image ? collectionObj.news_image : BASE_URL+"/imgs/news/default_news.png")+')"></div>';
				
				ret += '<div class="text-wrapper">'

					if(collectionObj.news_brief){
						//如果有摘要，那么显示单行标题和文章简介
                        ret += '<div class="title one-line">' + collectionObj.news_name + '</div>'
                       		+ '<div class="desc">' + collectionObj.news_brief + '</div>';
					}
					else{
                        ret += '<div class="title multi-lines"><span>' + collectionObj.news_name + '</span></div>'
					}

					ret += '<div class="bottom">'
		                        + (collectionObj.news_source ? ('<li class="trivalInfo"><span>'+ collectionObj.news_source +'</span></li>'): '')
		                        + '<li class="trivalInfo"><span>'+Util.formatTime(collectionObj.show_time)+'</span></li>'
		                  +'</div> ';

				ret += '</div>';
			ret += '</div>';
			ret += '<div class="deleteBtn">删除</div>';
		ret += '</div>';

		return ret;
	}

	//构建首页的新闻列表DOM
	this.constructNewsList = function(newslist){
		if(newslist == null || !newslist.length) return "";

		var ret = "";
		for(var i=0,len=newslist.length;i<len;i++){
			ret +=  _constructNews(newslist[i]);
		};

		return ret;
	};

	//构建收藏列表DOM
	this.constructCollectionList = function(collectionlist){
		if(collectionlist == null || !collectionlist.length) return "";

		var ret = "";
		for(var i=0,len=collectionlist.length;i<len;i++){
			ret +=  _constructColletionNews(collectionlist[i]);
		};

		return ret;
	};

	//构建二级栏目
	this.constructSubNavbar = function(columnlist){
		//如果二级栏目为空，则隐藏；
		if(columnlist == null || !columnlist.length){
			$(".hn-subNavBar").hide();
			return;
		}

		var domStr = '';
		for(var i=0,len=columnlist.length;i<len;i++){
			var columnObj = columnlist[i];
			//默认第一个被选中
			domStr += '<li columnId='+columnObj.column_id+(i==0?' class="selected" ':'')+'>'+ columnObj.column_name +'</li>';
		};

		$(".hn-subNavBar ul").empty().append(domStr).parent().show();
		return;
	}
};