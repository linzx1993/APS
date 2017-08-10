/**
 * Created by xujun on 2016/7/1.
 */
'use strict';
app.controller('previewCtrl', function ($scope, $rootScope, $http, $window, $location, $timeout, scheduleTableViewModelService, tool, http,$q) {
    $(".table-dialog-window").hide();   // 二级页面（此处二级页面暂时预留，等待AB测试结果，可删）
    //开始排程/再编辑
    let startApsType = "";
    //冻结期
    let fact_days = "";
    //初始化查询日期   注意！这个变量不要改! 时间操作另行赋值
    let today;
    //日历周期，目前设置为7天
    let offset = 6;
    //查询条件
    //通过json查询的对象声明
    let minStartTime, maxEndTime, queryObject, tableHeadViewModel, tableBodyViewModel;

    //设备
    let goEquipment = {};
    let goInfo = {};
    //用户名
    $scope.userName = $rootScope.userName;
    //获得来源页面(手动微调页面需要)
    $rootScope.lastSourcePage = $location.$$url;
	
	$scope.small_margin_left = 0; 
	
	//传入一级界面时间控制器的初始数据
	$scope.getDateChangeWidth = function(){
		let smallWidth = 62,
			defaultDay = 60,
			minStartDate = tool.dateToString(today),
			maxEndDate = tool.dateToString(tool.dateChange(defaultDay-1),today),
			smallTableMarginLeft = 0,
			bigTableMarginLeft = 0;
		
		//如果不是第一次
		if($scope.controllerDate){
			defaultDay = (tool.stringToDate($scope.controllerDate.maxEndDate) - tool.stringToDate($scope.controllerDate.minStartDate))/86400000 + 1;
			minStartDate = $scope.controllerDate.minStartDate;
			maxEndDate = $scope.controllerDate.maxEndDate;
			smallTableMarginLeft = $scope.controllerDate.smallTableMarginLeft;
			bigTableMarginLeft = $scope.controllerDate.bigTableMarginLeft;
		}
	
		let	bigWidth = 160,
			tableWidth = $(".wrap-content").width(),
			smallTableWidth = tableWidth - 82,
			bigTableWidth = tableWidth - 160,
			scrollbarWidth = $(".scrollbar").width(),
			smallScrollbarWidth = smallTableWidth,
			bigScrollbarWidth = bigTableWidth,
			smallTotleWidth = smallWidth*defaultDay,
			smallScrollWidth = smallTotleWidth - smallTableWidth,
			bigTotleWidth = bigWidth*defaultDay,
			bigScrollWidth = bigTotleWidth - bigTableWidth,
			smallScrollbarThumbWidth = scrollbarWidth * smallTableWidth/smallTotleWidth,
			bigScrollbarThumbWidth = scrollbarWidth * bigTableWidth/bigTotleWidth;
		
		//滑块最长不超过滑道
		smallScrollbarThumbWidth = smallScrollbarThumbWidth > smallScrollbarWidth - 4 ?  smallScrollbarWidth - 4 : smallScrollbarThumbWidth;
		bigScrollbarThumbWidth = bigScrollbarThumbWidth > bigScrollbarWidth - 4 ?  bigScrollbarWidth - 4 : bigScrollbarThumbWidth;
		
		
		$scope.controllerDate={
			today : today,
			minStartDate : minStartDate,
			maxEndDate : maxEndDate,
			smallScrollbarThumbWidth : smallScrollbarThumbWidth + "px",
			smallScrollbarThumb : smallScrollbarThumbWidth,
			bigScrollbarThumbWidth : bigScrollbarThumbWidth + "px",
			bigScrollbarThumb : bigScrollbarThumbWidth,
			scrollbarWidth: scrollbarWidth,
			smallScrollbarWidth: smallScrollbarWidth,
			bigScrollbarWidth: bigScrollbarWidth,
			smallTableMarginLeft: smallTableMarginLeft,
			bigTableMarginLeft: bigTableMarginLeft,
			smallScrollWidth: smallScrollWidth,
			bigScrollWidth: bigScrollWidth
		}
		
		$timeout(function(){
			$scope.refresh_margin_left();
		})
	};

    /**
    * desc:进入页面进行加载表格主题的方法
    * time:2017-03-28
    * @param:
    * @return:
    **/
    let initLoadingTableView = () =>{
        let defaultEle = $(".location-list").children("ul").children("li:eq(0)").children("i");
        let defaultId = defaultEle.attr("data-location-id");
        let defaultList = $scope.locationFilterList_pre;

        sessionStorage.userId = $rootScope.userId;  //存储当前用户Id
        $rootScope.getsessionStorage($scope.locationId_pre, $scope.locationId_res, true);

        //一级页面单元格类型
        http.get({
            url: $rootScope.restful_api.display_Info,
            successFn: function (res) {
                $rootScope.display_Info = res.data.displayConfigByLocationId;
				preview_show_table(defaultId, defaultList);  //查询显示
            }
        });

        //获取锁定期
        http.get({
            url: $rootScope.restful_api.get_lock_days,
            successFn: function (res) {
                fact_days = res.data.lockDate; //锁定期(可预排最大日期)
            },
            errorFn: function () {
                layer.alert('获取锁定期失败,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        //改变按钮位置
        $(".out-bg").animate({width: "64px"}, 0);
    };

    /**
     *    地点显示
     **/
    http.get({
        url: $rootScope.restful_api.aps_location_readable,
        successFn: function (res) {
            $rootScope.locationTreeData = res.data;
            $scope.folder = {"children": [scheduleTableViewModelService.getData($rootScope.locationTreeData)[0]]};//处理数据,并绑定到页面

            //获取上次登录的地点
            http.get({
                url: $rootScope.restful_api.view_last_location,
                successFn: function (res) {
                    let AllLocationIdArray = scheduleTableViewModelService.getAllLocationIdArray($rootScope.locationTreeData);
                    let lastLoginLocationTree = res.data.valueContent;
                    //首次进入没有地点 || 上次登录地点与本次权限地点不匹配，强行选择
					
					//获取偏移时间，返回偏移操作后的时间
					$scope.getRealToday = (function(){
						//先获取偏移时间
						let getDeviationUrl = $rootScope.restful_api.get_deviation;

						http.get({
							url: getDeviationUrl,
							successFn: function(res){
								today = new Date(+new Date() - res.data.daySec * 1000);

								//确定时间控件滑块的宽度(大格子和小格子)
								$scope.getDateChangeWidth();

								//发起一次请求
//								 preview_show_table(defaultId, defaultList);  //查询显示
							}
						});
					})();

                    if (!lastLoginLocationTree || !verifyContainLastLoginLocationId(AllLocationIdArray,lastLoginLocationTree.split(","))) {
                        $(".location-choose,.out-bg,.point-click").addClass("active");
                    }else{
                        //获取决定当前车间显示地点ID
                        sessionStorage.locationId_pre = $scope.locationId_pre = tool.getCommonLocationId(lastLoginLocationTree);
                        //筛选出显示车间的名字，用于配置页面显示
                        sessionStorage.currentShowLocationName = tool.getLocationName($scope.locationId_pre,$rootScope.locationTreeData);

                        let lastLoginLocationTreeArr = lastLoginLocationTree.split(",");//地点id的数组
                        //为地点树添加选中样式
                        lastLoginLocationTreeArr.forEach(function (item) {
                            let selectI = $("i[data-location-id=" + item + "]");
                            selectI.attr("class","select-status selected active");
                            changeParentSelected(selectI);
                        });
                        //如果显示车间id和查询车间最大父车间id一致，则查询车间列表为空，减小发送请求的数据量
                        if(lastLoginLocationTreeArr[0] === $scope.locationId_pre){
                            sessionStorage.locationFilterList_pre = $scope.locationFilterList_pre = ""
                        }else{
                            sessionStorage.locationFilterList_pre = $scope.locationFilterList_pre = lastLoginLocationTree;
                        }
                        //获取决定当前车间显示地点的名字,并存储到session避免手动微调页刷新页面丢失
                        // sessionStorage.currentShowLocationName = $scope.currentShowLocationName = tool.getLocationName(sessionStorage.locationId_pre,$rootScope.locationTreeData);
                        //是否可以显示页面相关菜单，在preview页面上使用到
                        $scope.initLoadingShow = true;
                        $timeout(function () {
                            initLoadingTableView();
                        }, 200)
                    }
                },
            });
        },
        errorFn: function () {
            layer.alert('获取数据失败，请联系技术人员处理', {
                skin: 'layer-alert-themecolor' //样式类名
            });
        }
    });

    //显示父元素的选中状态
    let changeParentSelected = (elem) => {
        let parentLi = elem.parent();
        let parentUl = parentLi.parent();
        const childrenLiLength = parentUl.find("i").length;//所有input的数量
        const selectedLength = parentUl.find(".active").length;//选中input的数量
        if(childrenLiLength === selectedLength){
            parentUl.siblings("i").attr("class","select-status active");
        }else{
            parentUl.siblings("i").attr("class","select-status select-some")
        }
        //如果不是第一级，则继续循环
        if(parentUl.parent().length && !parentUl.parent().hasClass("location-list")){
            changeParentSelected(parentUl.siblings("i"));
        }
    };

    //下拉框初始值设置
    $scope.materialCode = {showText : "物料编码", className : "material-code",value:""};
    $scope.materialName = {showText : "物料名称", className : "material-name",value:""};
    $scope.processCode = {showText : "工序编码", className : "process-code",value:""};
    $scope.processName = {showText : "工序名称", className : "process-name",value:""};
    $scope.punitCode = {showText : "设备编码", className : "punit-code",value:""};
    $scope.punitName = {showText : "设备名称", className : "punit-name",value:""};
    $scope.saleOrder = {showText : "订单号", className : "sale-order",value:""};
    $scope.productLineName = {showText : "产线", className : "product-line",value:""};
    $scope.searchDataList = [$scope.materialCode,$scope.materialName,$scope.processCode,$scope.processName,$scope.punitCode,$scope.punitName,$scope.saleOrder,$scope.productLineName];

    /**
     * 显示正式派工单表的排程计划
     **/
    function preview_show_table(location, locationFilterList) {
        //API接口
            $scope.get_differall_num();

            //拼url
            let get_url = $rootScope.restful_api.preview_show_table + "?locationFilterList=" + locationFilterList
                + "&startTime=" + $scope.controllerDate.minStartDate
                + "&endTime=" + $scope.controllerDate.maxEndDate;
            //获取和显示table数据
            http.get({
                url: get_url,
                successFn: function (response) {
                    //保存设备信息
                    goInfo = $.extend({}, response.data);
                    goEquipment = $.extend({}, response.data.punit);
                    //锁定期
                    response.data.freezeDate = fact_days;
                    //是否翻转状态
                    response.data.front = $rootScope.frontBack;
                    //json转viewModel对象
                    tableHeadViewModel = scheduleTableViewModelService.jsonToTableHeadViewModel(response.data);
                    tableBodyViewModel = scheduleTableViewModelService.jsonToTableBodyViewModelNew(response.data);
					
				
					//下拉框数据
					let searchItemDropDownList = tableBodyViewModel.searchItemDropDownList;
                    //实时更新搜索下拉目录的数据
                    $scope.materialCode.repeatData = Object.keys(searchItemDropDownList.materialCodeList);
                    $scope.materialName.repeatData = Object.keys(searchItemDropDownList.materialNameList);
                    $scope.processCode.repeatData = Object.keys(searchItemDropDownList.processCodeList);
                    $scope.processName.repeatData = Object.keys(searchItemDropDownList.processNameList);
                    $scope.punitCode.repeatData = searchItemDropDownList.punitCodeList;
                    $scope.punitName.repeatData = searchItemDropDownList.punitNameList;
                    $scope.saleOrder.repeatData = Object.keys(searchItemDropDownList.saleOrderList);
                    $scope.productLineName.repeatData = tableBodyViewModel.productLineNameList;

                    //用来判断某些下拉值初始状态选中
                    $scope.searchDataList.forEach((searchItemList) => {
                        const isClassActiveList = [];
                        const valueList = searchItemList.value.split(",");//初始选中的值
                        searchItemList.repeatData.forEach((repeatDataItem) => {
                            isClassActiveList.push({
                                'dragItemText' : repeatDataItem,
                                'isActive' : valueList.includes(repeatDataItem)
                            })
                        });
                        searchItemList.repeatData = isClassActiveList;
                    });

                    //有查询操作并且有查询成功的数据
                    if (tableBodyViewModel.searchSuccess === "success_search") {
                        layer.msg('根据您的查询条件，已高亮出查询结果，请查看', {time: 3500, icon: 1});
                    } else if (tableBodyViewModel.searchSuccess === "false_search") {
                        layer.msg('根据您的查询条件，未查询出结果', {time: 3500, icon: 2});
                    } else if (tableBodyViewModel.searchSuccess === "allUnitNull") {
                        layer.msg('当前无工单，无法查询', {time: 3500, icon: 2});
                    }

                    //查询时间
                    queryObject = scheduleTableViewModelService.jsonToQueryObject(response.data);
                    minStartTime = queryObject.minStartTime;
                    maxEndTime = queryObject.maxEndTime;
                    //绑定view层
                    $scope.tableHeadViewModel = tableHeadViewModel;
                    // 前端实现分页滚动，先获取所有数据缓存在本地，然后进行切分
                    $rootScope.cacheTableBodyData = tableBodyViewModel.tableBodyData;
                    //根据是否显示空白项来决定table表显示的数据的多少
                    if($scope.$parent.hide_empty){
                        $rootScope.tableBodyData = $rootScope.cacheTableBodyData.filter(function (item) {
                            return !item[0].useData.isEmpty;
                        }).slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
                    }else{
                        $rootScope.tableBodyData = $rootScope.cacheTableBodyData.slice(0,$rootScope.pageIndex * $rootScope.pageNumber);
                    }
					console.log($rootScope.cacheTableBodyData);
					console.log($rootScope.tableBodyData);

					$(".table-content").on("scroll", function () {
						$(this).parents(".j-table").find(".table-equipment-head>div").css("margin-top", -1 * $(this)[0].scrollTop + 1);
					});	
				},
                errorFn: function (response) {
                    layer.alert('获取数据失败，请联系技术人员处理', {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                    $(".page-select").css("pointer-events", "auto");
                }
            });
    }


    /**
     * 物料信息
     * 
     **/	
	$scope.material_info = function(){
		sessionStorage.materialStart = $scope.controllerDate.minStartDate;
		sessionStorage.materialEnd = $scope.controllerDate.maxEndDate;
		window.open("./view/materialInfo.html");
	};

    /**
     * 预排转实际
     * 打开预排转实际的弹窗
     **/

        //允许预排的天数
    var daysNum;
    $scope.open_tofact = function () {
        //获取设备信息
        var equipment = goInfo.punit,
            punitNameList = [];

        //初始化预排天数
        daysNum = 0;

        //将今天的日期取出
        var todayDate = new Date;
        todayDate.setHours(0);
        todayDate.setMinutes(0);
        todayDate.setSeconds(0, 0);

        //获取设备名，存入数组
        for (let i in equipment) {
            var punitName = equipment[i].punitName;
            punitNameList.push(punitName);
        }

        //显示到页面上
        $scope.punitNameList = punitNameList;

        //转换获取到的锁定期
        fact_days = tool.stringToDate(fact_days);

        //算今天到锁定期的相隔天数
        for (; todayDate.getTime() <= fact_days.getTime();) {
            todayDate = todayDate.setDate(todayDate.getDate() + 1);
            todayDate = new Date(todayDate);
            daysNum++;
        }

        //再次转换锁定期的日期格式
        fact_days = tool.dateToString(fact_days);

        //页面显示天数
        $scope.maxdays = daysNum;

        //控制输入框的输入，只允许输入固定范围内的数字
        $timeout(function () {
            var arrInput = $(".to-fact-box input");
            $(".to-fact-box input").each(function (i) {
                $(this).on("keyup", function () {
                    if (this.value.length == 1) {
                        this.value = this.value.replace(/[^0-9]/g, '')
                    } else {
                        this.value = this.value.replace(/\D/g, '')
                    }
                    if (this.value > daysNum) {
                        this.value = daysNum;
                    }
                })
            });

            //改变勾选的那行的输入框
            arrInput.eq(0).on("keyup", function () {
                var to_fact_days = arrInput.eq(0).val();
                $(".to-fact-box .each-pName-div").each(function (i) {
                    var checkVal = $(this).find("input[name = 'factPnameSingle']").is(':checked');
                    if (checkVal) {
                        $(this).find(".each_days_input").val(to_fact_days);
                    }
                })
            })
        }, 0);
    };

    /**
     * 确认预排转实际
     **/
    $scope.to_fact = function () {
        var daysList = [];
        var nullNum = 0;

        //得到所有输入框的值
        $(".to-fact-box .each-pName-div .each_days_input").each(function (i) {
            var each_pName_days = $(this).val() - 0;
            daysList.push(each_pName_days);
            if (!each_pName_days) {
                nullNum++;
            }
        });

        //若输入框的值都为空或者0,则不执行
        if (nullNum == daysList.length) {
            layer.alert('无法预排，请检查是否可排或检查是否输入了预排天数', {
                move: false,
                skin: 'layer-alert-themecolor' //样式类名
            });
        } else {
            layer.confirm('是否确认预排转实际？', {
                move: false,
                btn: ['确定', '取消'] //按钮
            }, function () {
                var equipment = goInfo.punit,
                    aList = [];

                //用于数组取值
                var temp = 0;
                for (var i in equipment) {

                    //今天日期
                    var nowDate = new Date;
                    nowDate.setHours(0);
                    nowDate.setMinutes(0);
                    nowDate.setSeconds(0, 0);

                    //对应的输入框有值
                    if (daysList[temp]) {

                        //设备ID
                        var equipmentId = i.substring(0, i.indexOf("_"));

                        var maxToFactDate,
                            dataList = [],
                            thisFreezeDate = tool.stringToDate(equipment[i].freezeDate);

                        //当前设备可预排的最大日期
                        maxToFactDate = nowDate.setDate(nowDate.getDate() + daysList[temp] - 1);
                        maxToFactDate = new Date(maxToFactDate);

                        //当天日期
                        var minDate = new Date;
                        minDate.setHours(0);
                        minDate.setMinutes(0);
                        minDate.setSeconds(0, 0);

                        //折算出从今天到最大日期间的所有日期
                        for (; minDate.getTime() <= maxToFactDate;) {
                            dataList.push(tool.dateToString(minDate));
                            minDate = minDate.setDate(minDate.getDate() + 1);
                            minDate = new Date(minDate);
                        }

                        //如果日期数组存在，则将设备信息，日期信息传给后台
                        if (dataList.length > 0) {
                            aList.push({
                                punitType: equipment[i].punitType,
                                punitId: equipmentId,
                                days: dataList
                            });
                        }

                        //下标加一
                        temp++;
                    } else {

                        //若当前设备预排天数为0,下标仍然加一,下次循环取下一个值
                        temp++;
                        continue;
                    }
                }

                if (aList.length > 0) {
                    aList = JSON.stringify(aList);
                    http.post({
                        url: $rootScope.restful_api.plan_to_fact,
                        data: aList,
                        successFn: function (res) {
                            layer.msg('预排转实际成功', {time: 3500, icon: 1});
                            $(".to-fact-box").hide();
                            $(".right-menu-button").removeClass("to-fact-click");
                        },
                        errorFn: function (res) {
                            layer.alert('预排转实际失败', {
                                move: false,
                                skin: 'layer-alert-themecolor' //样式类名
                            });
                        }
                    });
                } else {
                    layer.alert('锁定期内无单', {
                        move: false,
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                }
            });
        }
    };

    /**
     * 此处是一些JQ事件
     **/
    $(function () {
        //预排转实际加减号
        $(".to-fact-box").on("click", ".add", function () {
            var va = $(this).parent().find(".each_days_input").val() - 0;
            if (va < daysNum && va >= 0) {
                $(this).parent().find(".sub").css("cursor", "pointer");
                $(this).css("cursor", "pointer");
                $(this).parent().find(".each_days_input").val(va + 1);
            }
            if (va >= daysNum - 1) {
                $(this).css("cursor", "default");
                $(this).parent().find(".sub").css("cursor", "pointer");
            }
        });
        $(".to-fact-box ").on("click", ".sub", function () {
            var va = $(this).parent().find(".each_days_input").val() - 0;
            if (va <= daysNum && va > 0) {
                $(this).parent().find(".each_days_input").val(va - 1);
                $(this).parent().find(".add").css("cursor", "pointer");
                $(this).css("cursor", "pointer");
            }
            if (va <= 1) {
                $(this).css("cursor", "default");
                $(this).parent().find(".add").css("cursor", "pointer");
            }
        })
    });
	
	/**
     * 任务池切换维度
     **/
	$scope.exter_differ_dimension_text = "切换到订单维度"
	$scope.exter_differ_dimension = function(){
		$scope.exter_differ_dimension_text = $scope.exter_differ_dimension_text === "切换到订单维度" ? "切换到计划维度" : "切换到订单维度";
		$scope.get_differall_num($scope.exter_differ);
	};
	
    /**
     * 获取外部差异条数
     **/

    let bodyData;	//表体数据
    let tabList;	//标签数据
    let differAllNum;//总条数
    let headData;//表头数据
    let tableList;//关键字
    $scope.get_differall_num = function (fn) {
        /*拼接url开始*/
        // var ex_diff_url = "";
        const locationFilterString = $scope.locationFilterList_pre ? $scope.locationFilterList_pre.split(",") : [];
        let locationFilters = "",
			thisUrl = $scope.exter_differ_dimension_text === "切换到订单维度" ? "exter_differ" : "exter_differ_order";

        for (let i = 0; i < locationFilterString.length; i++) {
            if (i === 0) {
                locationFilters += "?locationFilterList=" + locationFilterString[i];
            } else {
                locationFilters += "&" + "locationFilterList=" + locationFilterString[i];
            }
        }
		
        /*拼接url结束*/
        http.get({
            url: $rootScope.restful_api[thisUrl] + locationFilters,
            successFn: function (response) {
                let resData = response.data;
                let externalDifferViewModel = scheduleTableViewModelService.jsonToexternalDifferViewModel(resData);
                bodyData = externalDifferViewModel.bodyData;
                tabList = externalDifferViewModel.tabList;
                headData = externalDifferViewModel.headData;
                tableList = externalDifferViewModel.tableList;

				//数据更新后执行传入的方法
				if(fn){fn()};
				
                let poolTaskChangeList = resData.poolTaskChangeList;
                if (poolTaskChangeList.length) {
                    //计算总条数
                    differAllNum = 0;
                    for (let i = 0; i < tabList.length; i++) {
                        //每部分对应的条数
                        differAllNum += tabList[i].each_differ_num;
                    }
                    $scope.differAllNum = differAllNum;
                    if (differAllNum) {
                        //如果有值,则显示数字
                        $(".right-menu .external-diff-num").show();
                    } else {
                        $(".right-menu .external-diff-num").hide();
                    }
                } else {
                    $(".right-menu .external-diff-num").hide();
                    differAllNum = 0;
                }
                // $scope.exter_differ();
            },
            errorFn: function (res) {
                layer.alert('"任务池"获取数据失败，请联系技术人员处理', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
    };

    /**
     * 获取列下标
     **/
    $scope.find_column_index = function (tabType) {
        var columnIndex = {
            rudt_index : -1,//未排数
            rtn_index : -1,//已排数
            ptt_index : -1,//车间计划时间
            nptt_index : -1,//新车间计划时间
        };
        for (var i = 0; i < tableList.length; i++) {
            if (tableList[i] === "resultUnDoTaskNum") {
                columnIndex.rudt_index = i;
            }else if (tableList[i] === "resultTaskNum") {
                columnIndex.rtn_index = i;
            }else if (tableList[i] === "poolTaskTime") {
                columnIndex.ptt_index = i;
            }else if (tableList[i] === "newPoolTaskTime") {
                columnIndex.nptt_index = i;
            }
        }

        if (tabType === "tim") {
            if (columnIndex.ptt_index !== -1) {
                $(".table-space table tbody").find("tr").each(function () {
                    $(this).find("td").eq(columnIndex.ptt_index).css("color", "#1E7CD9");//车间计划时间列高亮
                })
            }
            if (columnIndex.nptt_index !== -1) {
                $(".table-space table tbody").find("tr").each(function () {
                    $(this).find("td").eq(columnIndex.nptt_index).css("color", "#1E7CD9");//新车间计划时间列高亮
                })
            }
        } else if (tabType === "des" && columnIndex.rtn_index !== -1) {
            $(".table-space table tbody").find("tr").each(function () {
                $(this).find("td").eq(columnIndex.rtn_index).css("color", "#1E7CD9");//已排数列高亮
            })
        } else if (columnIndex.rudt_index !== -1) {
            $(".table-space table tbody").find("tr").each(function () {
                $(this).find("td").eq(columnIndex.rudt_index).css("color", "#1E7CD9");//未排数列高亮
            })
        }
    };

    /**
     * 外部差异
     **/
    $scope.exter_differ = function () {
        $(".differ-tip").remove();
        var jDifferWindow = $(".exDiffer-window");
        // jDifferWindow.show().animate({
        //     opacity: 1
        // }).css("display", "flex"); //打开弹窗

        //打开遮罩层
        $(".cover").show();

        if (differAllNum) {
            //tab标签
            $scope.tabList = tabList;

            if (headData.toString().indexOf("新车间计划时间") > -1) {
                headData.pop();
            }
            if (tableList.toString().indexOf("newPoolTaskTime") > -1) {
                tableList.pop();
            }

            //表头
            var firstTab = tabList[0].changeType;
            if (firstTab == "tim") {
                headData.push("新车间计划时间");
                tableList.push("newPoolTaskTime");
            }

            $scope.headData = headData;

            //第一个tab标签的表格
            $scope.changedBodyData = bodyData[firstTab];

            $(".exDiffer-window .null-data").hide();

        } else {
            $scope.changedBodyData = [];
            $scope.tabList = [];
            $(".exDiffer-window .null-data").show();
        }

        //表头
        $timeout(function () {
            tool.setTableHeadWidth($(".exDiffer-window"));

            //去除点击状态的tab样式
            $(".external-diff-tab").find("li").each(function () {
                if ($(this).hasClass("click-tab")) {
                    $(this).removeClass("click-tab");
                }
            });

            //第一个tab的样式有点击状态
            $(".external-diff-tab").children("li:first").not(".each-diff-num").addClass("click-tab");

            //小提示
            $("body").on("mouseover", ".help-span", function () {
                $(this).find(".help-box").show();
            }).on("mouseleave", ".help-span", function () {
                $(this).find(".help-box").hide();
            });

            $scope.find_column_index(firstTab);//高亮显示列

        }, 0);

        //关闭窗口
        jDifferWindow.find(".close-window").on("click", function () {
            jDifferWindow.hide();
            $(".cover").hide();
            $(".differ-tip").remove();
        })
    };

    $scope.exter_differ_show = function () {
        const jDifferWindow = $(".exDiffer-window");
        jDifferWindow.show().animate({
            opacity: 1
        }).css("display", "flex"); //打开弹窗
        $scope.exter_differ();
    };
    /**
     * 点击外部差异tab
     **/
    $scope.exteriffer_tab = function (tabInfo, $event) {
        const jDifferWindow = $(".exDiffer-window");

        if (headData.toString().indexOf("新车间计划时间") > -1) {
            headData.pop();
        }
        if (tableList.toString().indexOf("newPoolTaskTime") > -1) {
            tableList.pop();
        }

        //获取当前点击的li对应的类型
        const changeType = tabInfo.changeType;
        if (changeType === "tim") {
            headData.push("新车间计划时间");
            tableList.push("newPoolTaskTime");
        }
        $scope.headData = headData;

        //根据tab重绘表格部分
        $scope.changedBodyData = bodyData[changeType];

        //表头
        $timeout(function () {
            tool.setTableHeadWidth(jDifferWindow);

            //切换点击的tab的样式
            $($event.target).not(".each-diff-num").addClass("click-tab").siblings().removeClass("click-tab");
            jDifferWindow.on("click", ".each-diff-num", function () {
                $(this).parent().not(".each-diff-num").addClass("click-tab").siblings().removeClass("click-tab");
            });

            $scope.find_column_index(changeType);//高亮显示列

        }, 0);

        //关闭窗口
        jDifferWindow.find(".close-window").on("click", function () {
            jDifferWindow.hide();
            $(".cover").hide();
            $(".differ-tip").remove();
        })
    };
	
	//resize
	$(window).on("resize", function () {
		tool.setTableHeadWidth($(".exDiffer-window"));
		$scope.getDateChangeWidth();
		$scope.$apply();
	});
	
	//切换全屏时
	$scope.$on("fullScreen",function(allInfo,newState){
		$timeout(function(){
			$scope.getDateChangeWidth();
		});
		//切换到全屏，有一个自动的$apply()，取消全屏没有
		if(!newState){
			$scope.$apply();			
		}
	});

    /**
     * 点击查询，刷新页面。
     **/
    $scope.search = function () {
        preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);
        $(".search-box").hide();
        $(".search-btn").removeClass("search-btn-click");
    };

    /**
     * 表格单元格点击
     **/
    $scope.unit_click = function (cell, clickLiType) {
        //如果没有cell【0】.type值，说明是头部，调用头部方法
        if (!cell[0]) {
            $scope.date_click(cell,clickLiType);
            return;
        }
        if (cell[0].type == 3) {
            layer.alert("未排入生产任务");
            return;
        }
        let thisInf = cell[0],
            thisDate = thisInf.date,
            thisStartDate = thisInf.s_date,
            thisEndDate = thisInf.e_date,
            thisEquipment = thisInf.equipment_id;

        if (!!thisDate) {
            thisStartDate = thisDate;
            thisEndDate = thisDate;
        }
        //查询条件
        let saleOrder = tool.getFromInput_nocode(".sale-order"),
            materialName = tool.getFromInput_nocode(".material-name"),
            materialCode = tool.getFromInput_nocode(".material-code");
        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode, clickLiType);
    };

    /**
     * 表头单元格点击
     * @param date:数据;
     * @param clickLiType:小目录点击的位置
     **/
    $scope.date_click = function (date,clickLiType) {
        let thisData = date,
            thisStartDate = thisData.thisDate,
            thisEndDate = thisData.thisDate,
            thisEquipment = thisData.equipment,
            saleOrder = tool.getFromInput_nocode(".sale-order"),
            materialName = tool.getFromInput_nocode(".material-name"),
            materialCode = tool.getFromInput_nocode(".material-code");
        $scope.click_creat_window(thisStartDate, thisEndDate, thisEquipment, saleOrder, materialName, materialCode,clickLiType);
    };

    $scope.click_creat_window = function (startTime, endTime, equipment, saleOrder, materialName, materialCode,clickLiType) {
        var thisStartTime = startTime,
            thisEndTime = endTime,
            thisEquipment = equipment + "",
            // sUrl = "",
            thisEquipmentName = [],
            aEquipment = "";

        //拼接Url
        if (thisEquipment.indexOf(",") > -1) {
            aEquipment = thisEquipment.split(",");
        } else {
            aEquipment = [thisEquipment];
        }

            //查询二级页面数据

            var isArr = [];
            var isStr;

            for (var i in aEquipment) {
                var isObj = {};
                var newI = aEquipment[i].split("_");
                isObj.equipmentId = newI[0];
                isObj.equipmentType = newI[1];
                isArr.push(isObj);

                thisEquipmentName.push(goEquipment[aEquipment[i]].punitName);
            }

            //输入框有焦点状态下
            $(".window-search-box input").on("focus", function () {
                $(this).css("border", "1px solid #1E7CD9");
                if ($(this).hasClass("Wdate")) {
                    $(this).removeClass("Wdate").addClass("WdateActive");
                }
            });
            //输入框失去焦点
            $(".window-search-box input").on("blur", function () {
                $(this).css("border", "1px solid #BBBBBB");
                if ($(this).hasClass("WdateActive")) {
                    $(this).removeClass("WdateActive").addClass("Wdate");
                }
            });
            var body_data = {
                "startTime": thisStartTime,
                "endTime": thisEndTime,
                "materialName": materialName,
                "materialCode": materialCode,
                "saleOrderCode": saleOrder,
                "equipments": isArr,
                "from": "preview",
            };
        //根据点击的目录判断跳转哪个页面
        sessionStorage.setItem("hrefPrameter", JSON.stringify(body_data));
        if (clickLiType == 1) {
            window.open("./view/secondPage.html");
        } else if (clickLiType == 2) {
            //  换装页面
//			window.open("./view/secondChangePage.html");
            window.open("./view/changeAToB.html");
        } else if (clickLiType == 4) {
            //  任务清单
//            window.open("./view/secondChangePage.html");
            window.open("./view/taskList.html");
        }
    };

    /**
     * 点击确定，向后台传选中数据
     **/
    $scope.sure = function () {
        let selected = $(".jleftLocationTree .selected");
        let locationList = [];

        selected.each(function () {
            locationList.push($(this).attr("data-location-id"));
        });
        locationList.sort((a,b)=>{return a.length-b.length;});

        if (selected.length === 0) {
            layer.alert('请选择要查看的车间', {
                skin: 'layer-alert-themecolor' //样式类名
            });
            return;
        }
        // locationObj.locationIdList = locationList;

        //获取公共父元素车间ID,用于处理显示方案
        sessionStorage.locationId_pre = $rootScope.locationId_pre = tool.getCommonLocationId(locationList);
        //筛选出被选中的车间，如果子元素全选中，则选择父元素,
        //如果显示地点ID恰好等于最短地点ID时，则减少传送数据设置FilterList为空
        if(locationList[0] === $rootScope.locationId_pre){
            $scope.locationFilterList_pre = ""
        }else{
            $scope.locationFilterList_pre = locationList.join();
        }
        $rootScope.getsessionStorage($rootScope.locationId_pre, sessionStorage.locationId_res, true);

        //筛选出显示车间的名字，用于配置页面显示
        sessionStorage.currentShowLocationName = tool.getLocationName($rootScope.locationId_pre,$rootScope.locationTreeData);

		//一级页面单元格类型
        http.get({
            url: $rootScope.restful_api.display_Info,
            successFn: function (res) {
                $rootScope.display_Info = res.data.displayConfigByLocationId;
            }/*,
            errorFn: function () {
                $rootScope.showType = {
                    group_by: "processId",
                    cnName: "个工序"
                };
                layer.alert('获取合并规则错误,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }*/
        });
        layer.msg('地点已修改', {time: 3500, icon: 1});
		
		//查询显示
		 preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);  

        //获取锁定期
        http.get({
            url: $rootScope.restful_api.get_lock_days,
            successFn: function (res) {
                fact_days = res.data.lockDate; //锁定期(可预排最大日期)
            },
            errorFn: function () {
                layer.alert('获取锁定期失败,请联系技术人员', {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });

        //保存用户本次所选地点所选地点
        http.put({
            "url": $rootScope.restful_api.view_last_location,
            "data":{
                "selectList": [
                    {
                        "configName": "",
                        "locationId": "",
                        "systemConfig": true,
                        "userId": sessionStorage.userId,
                        "valueAlias": "本次退出登录所选地点",
                        "valueContent": locationList.join()
                    }
                ]
            },
            successFn: function () {
            }
        });

        //更改为默认第一级展开状态,并将地点树隐藏
        $(".location-list span").removeClass("open").removeClass("active");
        var folderUl = $(".location-list").find("ul");
        for (var i = 1; i < folderUl.length; i++) {
            $(folderUl[i]).hide();
        }
        $(".point-click").removeClass("active");
        $(".out-bg").animate({width: "64px"}, 300);
            $(".location-choose").animate({left:"-" + $(".location-choose").width() + "px"},300);
        //用户初始进来没有设置地点，不给展示信息，只有选了地点点击确定之后，各大菜单栏为显示
        $scope.initLoadingShow = true;
        //设置前面线的高度
        let thisB = $(folderUl[0]).children("b");
        thisB.height($(folderUl[0]).height() - 30);

        $scope.get_differall_num();
    };

    /**
     * 排程方案选择下拉框
     **/
    $(".aps-case").on("click", ".case-header", function () {
        	var j_head = $(this);
			j_head.children("ul").toggleClass("select-li");
			j_head.toggleClass("chosen");
        });

	/**
	 * 判断是否有已排程的方案
	 **/
	$scope.isHadScheduleScheme = function () {
	    //获得所有的排程方案
		function getAllScheme() {
			return $http.get($rootScope.restful_api.all_schedule_plan).then((function (res) {
				return res.data;
			}),function () {
				layer.alert('获取方案列表失败,请联系技术人员');
			});
		}
		//获得哪些方案已经排程
		function getHadScheduleScheme() {
			return $http.get($rootScope.restful_api.aps_location_writable).then((function (res) {
				return res.data;
			}),function () {
				layer.alert('获取方案内容失败,请联系技术人员');
			});
		}
		$q.all([getAllScheme(),getHadScheduleScheme()]).then(function (res) {
		    $scope.schemeNameList = res[0];//设置方案下拉展示列表
			const selectScheme = res[1];
			//根据获取的已选择方案，添加所有方案列表一个是否选择的参数
			$scope.schemeNameList.forEach((item) => {
			    //判断该方案是否被选中
				item.isSelected = selectScheme.some((selectItem) => {
				    return item.schemeId === selectItem.schemeId
                });
            });
            //初始设置第一个方案为展示方案
			$scope.selectLiScheme($scope.schemeNameList[0]);
		})
	};

    /**
     * 点击开始排程按钮
     **/
    $scope.startApsSchedule = function () {
        $(".wrap-box").next("p").remove();    //移除提示
        //判断是否有已配置的方案
        http.get({
            url: $rootScope.restful_api.all_schedule_plan,
            successFn: function (res) {
                const schemeLength = res.data.length;
                //若没有方案,弹窗提示
                if (schemeLength === 0) {
                    layer.alert("您没有配置方案,无法排程!", {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                } else {   //已配置方案,继续操作
                    startApsType = "apsStart";
                    $scope.isHadScheduleScheme();
                    const index = layer.open({
                        type: 1,
                        title: false,
                        closeBtn: 0,
                        shadeClose: false,
                        area: ['400px', 'auto'],
                        content: $(".aps-case"),
                        success: function () {
                            $(".aps-case").on("click", ".in-but", function () {
                                layer.close(index);
                                $(".case-content").removeClass("select-li");
                                $(".case-header").removeClass("chosen");
                                $(".wrap-box").next("p").remove();
                            })
                        }
                    })
                }
            },
            errorFn: function (res) {
                layer.alert("请求方案数据错误,请联系技术人员处理!", {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
        // //获取排程原因的下拉列表
        // http.get({
        //     url : $rootScope.restful_api.schedule_reason_list,
        //     successFn : function (res) {
        //         const scheduleReasonList = res.data;
        //         //将数组转化成组件所需要的数据
			// 	scheduleReasonList.map((item) => {
			// 		item.dragItemText = item.reason;
			// 		item.value = item.id;
			// 		item.isActive = false;
			// 	});
			// 	$scope.scheduleReason = {
			// 		showText : '排程原因',
			// 		repeatData : scheduleReasonList,
			// 		selectText : "请选择排程原因",
			// 		value : ""
			// 	}
			// }
        // });
    };

	//点击下拉目录的li选择方案
	$scope.selectLiScheme = function (scheme) {
		sessionStorage.schemeId = $scope.schemeId = scheme.schemeId;
		http.get({
			url: $rootScope.restful_api.single_schedule_plan + scheme.schemeId,
			successFn: function (res) {
				$scope.locationRuleList = res.data.locationRuleList;
				let data_body = {     //取消排程 往后台发送数据
					'schemeId': '',
					'locationDtoList': []
				};
				for (let i = 0,length = $scope.locationRuleList.length; i < length; i ++) {
					let objLocation = {};
					objLocation.locationId = $scope.locationRuleList[i].locationId;
					objLocation.locationFilterList = [];
					data_body.locationDtoList.push(objLocation);
					data_body.schemeId = scheme.schemeId;
				}
				sessionStorage.setItem("cancel_data", JSON.stringify(data_body));

				//成功赋值
				$(".case-content").removeClass("select-li");//下拉框消失
				//点击已经选中的方案，提示出现，出现直接跳往排程后的那个按钮
				$scope.chooseScheme = scheme;
				$scope.isHadScheduleShow = scheme.isSelected;
			},
			errorFn: function () {
				layer.alert('获取方案内容失败,请联系技术人员', {
					skin: 'layer-alert-themecolor' //样式类名
				});
			}
		});

		// //是否添加提示
		// $timeout(function () {
		// 	if ($(".case-header").children().length > 0) {
		// 		$scope.isHadScheduleShow = true;//提示出现，出现直接跳往排程后的那个按钮
		// 	} else {
		// 		$scope.isHadScheduleShow = false;
		// 	}
		// })
	};

	//点击继续按钮  跳转
	$scope.aps_continue = function () {
		$location.path("/result").replace();
		layer.closeAll();
	};

    /**
     * 点击再编辑
     **/
    $scope.edit_again = function () {
        //判断是否有已配置的方案
        http.get({
            url: $rootScope.restful_api.all_schedule_plan,
            successFn: function (res) {
                res = res.data;
                const sechemeLength = res.length;
                //若没有方案,弹窗提示
                if (sechemeLength === 0) {
                    layer.alert("您没有配置方案,无法再编辑!", {
                        skin: 'layer-alert-themecolor' //样式类名
                    });
                } else {    //已配置方案,继续操作
                    startApsType = "editAgain";
                    $scope.isHadScheduleScheme();
                    $rootScope.index = layer.open({
                        type: 1,
                        title: false,
                        closeBtn: 0,
                        shadeClose: false,
                        area: ['400px', 'auto'],
                        skin: 'yourclass',
                        content: $(".aps-case"),
                        success: function () {
                            $(".aps-case").on("click", ".in-but", function () {
                                layer.close($rootScope.index);
                                $(".wrap-box").next("p").remove();
                            })
                        }
                    })
                }
            },
            errorFn: function (res) {
                layer.alert("请求方案数据错误,请联系技术人员处理!", {
                    skin: 'layer-alert-themecolor' //样式类名
                });
            }
        });
    };

	/**
	 * 点击确定按钮开始排程
	 **/
	$scope.sureGoStartSchedule = function () {
		let thisUrl = "",
			thisPath = "",
			thisText = "";
		if (startApsType === "apsStart") {
			thisUrl = $rootScope.restful_api.aps_trigger;
			thisPath = "/progress";
			thisText = "开始排程";
		} else if (startApsType === "editAgain") {
			thisUrl = $rootScope.restful_api.edit_again;
			thisPath = "/result";
			thisText = "再编辑";
		}
		// //用户必须选择一个重排原因，用于分析
        // let selectReasonValue = $(".jChooseReason").find("input[type=hidden]").val();
		// if(!selectReasonValue){
		 //    layer.msg("请选择一个排程原因");
		 //    return;
        // }
		// //用户必须填写详情描述
		// if(!$("#reScheduleDescription").val()){
		 //    layer.msg("请填写详情描述");
		 //    return;
        // }
		let index = layer.confirm('确定' + thisText + '?', {
			btn: ['确定', '取消'] //按钮
		}, function () {
			//开始排程按钮
			http.post({
				url: thisUrl,
				data: {
					schemeId : $scope.schemeId,
					locationDtoList : [],
                    // reasonType : selectReasonValue,
                    // reasonDesr : $("#reScheduleDescription").val(),
                },
				successFn: function (response) {
					$location.path(thisPath).replace();
					// if(startApsType !== "editAgain"){
					layer.closeAll();
					// }
				},
			});
			//如果是跳往排程后页面的话，则结果页面关闭黑幕，避免页面未跳转黑幕消失时可以点击功能菜单的问题
		},function () {
			layer.closeAll();
		});
	};


    /**
     * desc:验证本次地点树是否全部包含上次退出选择的地点ID,如没有全部包含，则需重新选择地点
     * last:2017-03-24
     * @params:locationTreeData: 本次地点树所有的地点ID，Array
     * @params:lastLoginData: 用户上次退出登录时记录的地点ID,Array
     * @return: boolean true: 本次地点树全部包含,符合条件，正常使用，false:未全部包含，不符合条件，需重新挑选
     **/
    let verifyContainLastLoginLocationId = (locationTreeData, lastLoginData) => {
        //如果两棵树的地点数据为空，
        if(!locationTreeData || !lastLoginData){
            return false;
        }
        //验证是否为正确的数组
        locationTreeData = tool.typeObject(locationTreeData) !== "Array" ? locationTreeData.split(",") :locationTreeData;
        lastLoginData = tool.typeObject(lastLoginData) !== "Array" ? lastLoginData.split(",") :lastLoginData;
        return lastLoginData.every((item) => {
            return locationTreeData.includes(item)
        });
    };

    /**
    * desc:筛选出所有车间的公共父元素车间id。1当有父元素地点ID时，没有子元素地点ID
    * last:2017-03-24
    * @param: locationTreeData,Array: 地点树点击选中的地点数组
    * @return: 父子元素不冲突的地点
    **/
    let selectUniqueLocationId = (locationIdList) => {
        if(tool.typeObject(locationIdList) !== "Array"){
            locationIdList = locationIdList.split(",");
        }
        // 如果只选择了一个车间，直接返回
        if(locationIdList.length === 1){
            return locationIdList
        }
        //将车间顺序改为由一级到底级
        locationIdList.sort((a,b) => {return a - b});
        for(let i = 0;i < locationIdList.length; i++){
            locationIdList = locationIdList.filter(function (item) {
                //筛选规则：包含本次短地点ID但不等于 或 不包含本次短地点ID
                return (item.indexOf(locationIdList[i])>-1)&&item === locationIdList[i] || item.indexOf(locationIdList[i]) === -1;
            });
        }
        return locationIdList;
    };
	
	//当时间跨度改变时(起始时间)
	$scope.$watch("controllerDate.minStartDate",function(newStartDate,oldStartDate){			
		//转成时间对象
		let newStart = tool.stringToDate(newStartDate),
			oldStart = tool.stringToDate(oldStartDate);
		if(oldStartDate){
			//开始时间大于结束时间，无操作
			if(newStart > tool.stringToDate($scope.controllerDate.maxEndDate)){
				return;
			}
//			//起始时间前移，查询新起始时间到原起始时间之间的数据
//			if(newStart < oldStart){
//				preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);  
//			}else{
//				//起始时间后延，切割数据保留新起始时间-结束时间（起始时间不能大于结束时间）
//				let moveDay = (newStart - oldStart)/86400000;
//				
//				//切割数据
//				$rootScope.cacheTableBodyData.forEach(function(thisItem){
//					thisItem.splice(1,moveDay);
//				});
//				//切割时间头
//				$scope.tableHeadViewModel.splice(0,moveDay);
//			}
			preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre); 
			//刷新时间控件滚动条
			$scope.getDateChangeWidth();
		}
			
	})
	//当时间跨度改变时(结束时间)
	$scope.$watch("controllerDate.maxEndDate",function(newEndDate,oldEndDate){
		//转成时间对象
		let newEnd = tool.stringToDate(newEndDate),
			oldEnd = tool.stringToDate(oldEndDate);
		if(oldEndDate){
			//结束时间小于开始时间，无操作
			if(newEnd < tool.stringToDate($scope.controllerDate.minStartDate)){
				return;
			}
			
//			//结束时间后延，查询原结束时间到新结束时间之间的数据
//			if(newEnd > oldEnd){
//				preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);  
//			}else{
//				//结束时间前移，切割数据保留新起始时间-结束时间（起始时间不能大于结束时间）
//				let moveDay = (oldEnd - newEnd)/86400000;
//
//				//切割数据
//				$rootScope.cacheTableBodyData.forEach(function(thisItem){
//					thisItem.splice(-moveDay,moveDay);
//				});
//				//切割时间头
//				$scope.tableHeadViewModel.splice(-moveDay,moveDay);
//			}
			preview_show_table($scope.locationId_pre, $scope.locationFilterList_pre);  
			//刷新时间控件滚动条
			$scope.getDateChangeWidth();
		}
	})

});
