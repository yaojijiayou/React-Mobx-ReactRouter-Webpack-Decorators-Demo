function TimeCalculator(){
	/*
	当前处在哪个时间段
	-1:  12月1日前；
	0:  12月1日-12月11日；
	1:  12月12日；
	2:  12月12日之后；
	*/
	this.inWhichPeriod = function(p_time){
		var currentTime = moment();
		if(p_time && p_time != -1){
			currentTime = moment(p_time);
		}

		var firstDay = moment("2016-12-01 00:00:00");
		var twelvethDay = moment("2016-12-12 00:00:00");
		
		if(currentTime.isBefore(firstDay)){
			return g_TimePeriodEnum.beforeStart;
		}

		if(currentTime.isBefore(twelvethDay)){
			return g_TimePeriodEnum.starting;
		}

		if(currentTime.isSame(twelvethDay,'day')){
			return g_TimePeriodEnum.inDoubleTwelve;
		}

		return g_TimePeriodEnum.afterDoubleTwelve;
	}
}
