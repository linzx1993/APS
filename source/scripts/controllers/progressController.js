/**
 * Created by xujun on 2016/7/1.
 */
app.controller('progressCtrl', function($scope, $rootScope, $interval, $location, $http,$timeout,tool,scheduleTableViewModelService) {
		//用户名
		$scope.userName = $rootScope.userName;
		tool.newprogressBar("#progressbar","#progress-label",$rootScope.restful_api.aps_rate+"?schemeId="+sessionStorage.schemeId,"自动排程",function(){
			//完全加载完时调用
			$scope.failAlert = false;
			$scope.successAlert = true;
			$timeout(function(){
				$(".pbody-wrap .wrap-info ul").find("li").each(function(){
					var stateText = $(this).find("span").eq(1).text();
					if(stateText === "自动排程完成"){
						$(this).find(".in-state-icon-success").show();
						$(this).find(".in-icon").show();
					}else if(stateText === "自动排程失败"){
						$(this).find(".in-state-icon-fail").show();
						$(this).find(".in-icon").show();

						$scope.failAlert = true;
						$scope.successAlert = false;
					}
				});

				//将动图替换为静止图
				$(".pro_bars span").removeClass("progressbar-gif").addClass("progressbar-static");
			},50);
			$scope.btnShow = true;
			
		},function(res){
				//未加载完时调用
				var mapState=res.mapState;

	            var listState = [];    //定义数组
	            for(var i in mapState){
					mapState[i].equipment = i;     //定义键名称
					listState.push(mapState[i]);   //把遍历对象存入数组中


					$timeout(function(){
	           	    	for(var j = 0;j < listState.length;j++){
                    		switch (listState[j].state){
                    			case "INIT":
	                    			return listState[j].state = "准备";break;
	                    		case "LOADING":
	                    			return listState[j].state = "加载数据";break;
	                    		case "SYSTEM_CONFIG_CHECKING":
	                    			return listState[j].state = "系统配置校验";break;
	                    		case "SCHEDULE_STEP_CHECKING":
	                    			return listState[j].state = "排程步骤校验";break;
	                    		case "MATERIAL_INFO_CHECKING":
	                    			return listState[j].state = "物料信息校验";break;
	                    		case "ROUTING_INFO_CHECKING":
	                    			return listState[j].state = "工艺路线信息校验";break;
                    			case "CAPABILITY_INFO_CHECKING":
	                    			return listState[j].state = "产能校验";break;
	                    		case "COLOR_INFO_CHECKING":
	                    			return listState[j].state = "颜色信息校验";break;
	                    		case "SUITABLE_PRODUCT_INFO_CHECKING":
	                    			return listState[j].state = "适宜设备校验";break;
                    			case "CT_INFO_CHECKIN":
	                    			return listState[j].state = "刀具信息校验";break;
	                    		case "FIXTURE_INFO_CHECKING":
	                    			return listState[j].state = "夹具信息校验";break;
	                    		case "PAP_INFO_CHECKING":
	                    			return listState[j].state = "PAP信息校验";break;
                    			case "SCHEDULING":
	                    			return listState[j].state = "排程中";break;
	                    		case "UPLOADING":
	                    			return listState[j].state = "排程中";break;
	                    		case "AUTOSCH_SUCCESS":
	                    			return listState[j].state = "自动排程完成";break;
	                    		case "AUTOSCH_FAILED":
	                    			return listState[j].state = "自动排程失败";break;
	                    		case "ADJUSTING":
	                    			return listState[j].state = "微调中";break;
	                    		case "CONFIRMSCH_DOING":
	                    			return listState[j].state = "排程确认中";break;
	                    		case "CONFIRMSCH_SUCCESS":
	                    			return listState[j].state = "排程确认成功";break;
	                    		case "CONFIRMSCH_FAILED":
	                    			return listState[j].state = "排程确认失败";break;
                    		}
                    		if(listState[j].state === "自动排程完成"){
                    			listState[j].icons = true;
                    		}
                    		
							$(".pbody-wrap .wrap-info ul").find("li").each(function(){
								var stateText = $(this).find("span").eq(1).text();
								if(stateText === "自动排程完成"){
									$(this).find(".in-state-icon-success").show();
									$(this).find(".in-icon").show();
								}else if(stateText === "自动排程失败"){
									$(this).find(".in-state-icon-fail").show();
									$(this).find(".in-icon").show();
								}
							})
	                	}
					},0)
	             }
	            $scope.states=listState;
		},$location.$$absUrl);

	//弹窗关闭
	$scope.close_megPromt = function() {
		$(".prompt_msg").hide();
		$(".pbody-wrap .wrap-info li b").removeClass("click-detail");
	};

	//按钮
	$scope.wrap_back = function() {
		$location.path("/preview");
	};

	$scope.wrap_forward = function() {
		$location.path("/result");
	};

	//提示
	$scope.alertMsg = function(info,$event) {
		$event.stopPropagation();
		let state = info.state;
		//详情数据
		$scope.in_alert_data = [];
		if(state === "自动排程完成"){
			let briefInfoMap = info.briefInfoMap;
			
			$scope.in_alert_data.push(
				"已排任务：" + briefInfoMap.doTaskNum + "个",
				"剩余任务：" + briefInfoMap.undoTaskNum + "个",
				"总任务数：" + briefInfoMap.totalTaskNum + "个",
				"排程所花时间：" + briefInfoMap.useTime + "秒"
			)			
		}else if(state === "自动排程失败"){
			//.如果后台有提供二级页面选项,通过判断是否有detailInfoObject这个属性
			if(info.detailInfoObject){
				//新的二级提示页面，以表格形式展现
				$scope.newAlertError(info.detailInfoObject);
			}else{
				let briefInfo = info.briefInfo;
				$scope.in_alert_data.push(briefInfo);
			}
		}

		
		$(".pbody-wrap .wrap-info li b").removeClass("click-detail");
		$($event.target).addClass("click-detail");
		
		$(".prompt_msg").show(0,function(){
			let body = $("body");
			let scrollTop = $(".page-wrapper").scrollTop(),
        		scrollLeft = $(".page-wrapper").scrollLeft();
			let d_left = $($event.target).offset().left + 56 + scrollLeft + 5;
			let d_top = $($event.target).offset().top - 71 + scrollTop;
			$(".prompt_msg").css({
                      "left" : d_left,
                      "top" :  d_top > (document.body.clientHeight - 100) ? document.body.clientHeight - 100 : d_top		
			})
		})
	};

	//新的错误提示形式，以二级页面展现
	$scope.newAlertError = function (info) {
		$scope.checkSchedule = true;//出现二级页面
		$scope.checkItemTableData = scheduleTableViewModelService.displayCheckBeforeSchedule(info);
		$scope.checkItemTableHeadData = $scope.checkItemTableData.checkItemTableHeadData;//表格头
		$scope.checkItemTableBodyData = $scope.checkItemTableData.checkItemTableBodyData;//表格主体内容
		$timeout(function () {
			tool.setTableHeadWidth($(".jcheckError"));
		});
	};

	//点击空白处隐藏 弹窗
	document.onclick = function(){
		$scope.close_megPromt();
	};
	$("body").on("click","#prompt_msg",function(){
		if(document.all){
			window.event.cancelBubble = true;
	 	}else{
			event.stopPropagation(); 
		}
	})
});