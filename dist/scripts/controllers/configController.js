webpackJsonp([0,7],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Created by yiend on 2017/2/4.
	 */
	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Created by yiend on 2017/1/16.
	 */
	app.controller("adminConfigController", ["$rootScope", "$scope", "$http", "$window", "$location", "$timeout", "$q", "$templateCache", "scheduleTableViewModelService", function ($rootScope, $scope, $http, $window, $location, $timeout, $q, $templateCache, scheduleTableViewModelService) {
	    var getColumnData = function getColumnData() {
	        $http.get($rootScope.restful_api.reset_show_column + $scope.locationId).then(function (res) {
	            //获得get到的数据，渲染页面
	            $scope.setDisplayGetData(res);
	        }, function () {
	            $scope.info.fail("获取数据失败，请检查是否连上服务器");
	        });
	    };
	    getColumnData();
	    //创造车间树
	    $scope.createWorkshop();

	    //初始化拖拽
	    $scope.clickLiGetItem();

	    //根据点击不同的车间选择不同的显示项
	    $("#columnWorkshop").on("click", ".select-status", function (e) {
	        //根据点击的车间ID
	        $scope.locationId = e.target.getAttribute("data-location-id");
	        $(".select-status").removeClass("active");
	        $(e.target).addClass("active");
	        //移除临时拖拽项
	        $(".js-move").remove();
	        getColumnData();
	    });

	    /**保存数据**/
	    $scope.saveAdminDefaultDisplay = function () {
	        var postData = getDisplayPostData("请至少选择一项显示");
	        //检测数据是否正确
	        if (!postData) {
	            return;
	        }
	        $http.put($rootScope.restful_api.reset_show_column + $scope.locationId, postData).then(function (response) {
	            if (response.data === true) {
	                $scope.info.success("默认显示项保存成功");
	            }
	        }, function () {
	            $scope.info.fail("默认显示项保存失败");
	        });
	    };

	    /**系统管理员页面还原数据**/
	    $scope.resetAdminConfig = function () {
	        $http.delete($rootScope.restful_api.admin_content_config + $scope.locationId).then(function (res) {
	            $scope.adminOptionList = res.data.optionList;
	            $scope.adminSelectList = res.data.selectList[0];
	            $scope.carHouseSelected = $scope.adminSelectList.valueContent;
	            $scope.info.success("还原配置成功");
	        }, function () {
	            $scope.info.fail("还原配置失败");
	        });
	    };
	}]);

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Created by yiend on 2017/2/6.
	 */
	app.controller("versionController", ["$rootScope", "$scope", "$http", "$state", "tool", function ($rootScope, $scope, $http, $state, tool) {
	    $http.get($rootScope.restful_api.public_version_number).then(function (res) {
	        $scope.versionNumer = res.data.version;
	        // 版本页面
	        $scope.browser = tool.getBrowser().browser;
	        $scope.version = tool.getBrowser().version;
	    }, function () {
	        layer.alert("获取系统版本失败，请检查服务器");
	    });
	}]);

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Created by yiend on 2017/1/14.
	 */
	'use strict';

	app.controller("secondPageController", ["$rootScope", "$scope", "$state", function ($rootScope, $scope, $state) {
	    $state.go('config.second.column'); //默认显示第一个tab
	    $scope.secondPage = {
	        title: "" };
	}]).controller("columnController", ["$rootScope", "$scope", "$http", function ($rootScope, $scope, $http) {
	    //设置面包屑导航
	    $scope.secondPage.showPageConfig = "显示排序项";

	    /**
	     *根据点击的车间树获得相应的车间ID,显示对应排序表的数据
	     */
	    var getColumnData = function getColumnData() {
	        $http.get($rootScope.restful_api.column_content_config + $scope.locationId).then(function (res) {
	            //获得get到的数据，渲染页面
	            $scope.setDisplayGetData(res);
	        }, function () {
	            $scope.info.fail("获取数据失败，请检查是否连上服务器");
	        });
	    };
	    getColumnData();

	    //获取数据，创造车间树
	    $scope.createWorkshop(true, getColumnData);

	    //初始化拖拽
	    $scope.clickLiGetItem();

	    /**列信息配置点击保存进行发送数据**/
	    $scope.saveColumnContent = function () {
	        var postData = $scope.getDisplayPostData("请至少选择一项显示");
	        //检测数据是否正确
	        if (!postData) {
	            return;
	        }
	        $http.put($rootScope.restful_api.column_content_config + $scope.locationId, postData).then(function (response) {
	            if (response.data === true) {
	                $scope.info.success("数据保存成功");
	            }
	        }, function () {
	            $scope.info.fail("数据保存失败");
	        });
	    };

	    /**列信息还原数据**/
	    $scope.resetColumnConfig = function () {
	        $http.delete($rootScope.restful_api.column_content_config + $scope.locationId).then(function (res) {
	            $("#all-item").find(".js-move").remove();
	            //获得get到的数据，渲染页面
	            $scope.setDisplayGetData(res);
	            $scope.info.success("还原配置成功");
	        }, function () {
	            $scope.info.fail("还原配置失败");
	        });
	    };
	}]).controller("sortController", ["$rootScope", "$scope", "$http", "$window", "$location", "$timeout", "$q", "$templateCache", "scheduleTableViewModelService", function ($rootScope, $scope, $http, $window, $location, $timeout, $q, $templateCache, scheduleTableViewModelService) {
	    //设置面包屑导航
	    $scope.secondPage.showPageConfig = "多列排序项";

	    function getSortConfig() {
	        $http.get($rootScope.restful_api.sort_content_config + $scope.locationId).then(function (res) {
	            //获得get到的数据，渲染页面
	            $scope.setDisplayGetData(res);
	        }, function () {
	            $scope.info.fail("获取数据失败，请检查是否连上服务器");
	        });
	        //合并项
	        $http.get($rootScope.restful_api.sort_combine_config + $scope.locationId).then(function (res) {
	            $scope.combineItem = $.extend({}, res.data);
	            $scope.combineObj = {
	                combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
	                combineDrag: true,
	                combineActive: false
	            };
	        });
	        //汇总项
	        $http.get($rootScope.restful_api.sort_summary_config + $scope.locationId).then(function (res) {
	            $scope.summaryItem = $.extend({}, res.data);
	            $scope.summaryObj = {
	                summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
	                summaryDrag: true,
	                summaryActive: true
	            };
	        });
	    }
	    //创建车间树
	    $scope.createWorkshop(true, getSortConfig);

	    //渲染数据
	    getSortConfig();

	    //初始化拖拽
	    $scope.clickLiGetItem();

	    /**多列排序信息配置点击保存进行发送数据**/
	    $scope.saveSortContent = function () {
	        var postData = $scope.getDisplayPostData("请至少选择一项进行排序");
	        //检测数据是否正确
	        if (!postData) {
	            return;
	        }
	        $http.put($rootScope.restful_api.sort_content_config + $scope.locationId, postData).then(function (response) {
	            if (response.data === true) {
	                $scope.info.success("数据保存成功");
	            }
	        }, function () {
	            $scope.info.fail("数据保存失败");
	        });
	        //合并项
	        var combineP = document.getElementsByClassName("combine-item")[0].getElementsByTagName("span");
	        $scope.combineItem.selectList = [];

	        var _loop = function _loop(i) {
	            var value = combineP[i].getAttribute("data-value");
	            $scope.combineItem.optionList.forEach(function (item) {
	                if (item.valueContent == value) {
	                    $scope.combineItem.selectList.push(item);
	                }
	            });
	        };

	        for (var i = 0; i < combineP.length; i++) {
	            _loop(i);
	        }
	        //空的情况下暂时使用还原功能
	        if ($scope.combineItem.selectList.length === 0) {
	            $scope.combineItem.selectList = null;
	            $http.delete($rootScope.restful_api.sort_combine_config + $scope.locationId, $scope.combineItem).then(function (response) {
	                //$scope.info.success("数据保存成功");
	            }, function (res) {
	                $scope.info.fail("合并项保存失败");
	            });
	        } else {
	            $http.put($rootScope.restful_api.sort_combine_config + $scope.locationId, $scope.combineItem).then(function (response) {
	                //$scope.info.success("数据保存成功");
	            }, function () {
	                $scope.info.fail("合并项保存失败");
	            });
	        }
	        //汇总项
	        var summaryP = document.getElementsByClassName("Summary-item")[0].getElementsByTagName("span");
	        $scope.summaryItem.selectList = [];

	        var _loop2 = function _loop2(i) {
	            var value = summaryP[i].getAttribute("data-value");
	            $scope.summaryItem.optionList.forEach(function (item) {
	                if (item.valueContent == value) {
	                    $scope.summaryItem.selectList.push(item);
	                }
	            });
	        };

	        for (var i = 0; i < summaryP.length; i++) {
	            _loop2(i);
	        }
	        //空的情况下暂时使用还原功能
	        if ($scope.summaryItem.selectList.length === 0) {
	            $scope.summaryItem.selectList = null;
	            $http.delete($rootScope.restful_api.sort_summary_config + $scope.locationId, $scope.summaryItem).then(function (response) {
	                //$scope.info.success("数据保存成功");
	            }, function (res) {
	                $scope.info.fail("汇总项保存失败");
	            });
	        } else {
	            $http.put($rootScope.restful_api.sort_summary_config + $scope.locationId, $scope.summaryItem).then(function (response) {
	                //$scope.info.success("数据保存成功");
	            }, function (res) {
	                $scope.info.fail("汇总项保存失败");
	            });
	        }
	    };

	    /**多列排序信息还原数据**/
	    $scope.resetSortConfig = function () {
	        $http.delete($rootScope.restful_api.sort_content_config + $scope.locationId).then(function (res) {
	            $("#all-item").find(".js-move").remove();
	            //获得get到的数据，渲染页面
	            $scope.setDisplayGetData(res);
	            $scope.info.success("还原配置成功");
	        }, function () {
	            $scope.info.fail("还原配置失败");
	        });
	        //还原合并项
	        $http.delete($rootScope.restful_api.sort_combine_config + $scope.locationId, null).then(function (response) {
	            $scope.combineItem = $.extend({}, response.data);
	            $scope.combineObj = {
	                combine: scheduleTableViewModelService.combinecountItem($scope.combineItem),
	                combineDrag: true,
	                combineActive: false
	            };
	        }, function (res) {
	            $scope.info.fail("合并项保存失败");
	        });
	        //还原汇总项
	        $http.delete($rootScope.restful_api.sort_summary_config + $scope.locationId, null).then(function (response) {
	            $scope.summaryItem = $.extend({}, response.data);
	            $scope.summaryObj = {
	                summary: scheduleTableViewModelService.combinecountItem($scope.summaryItem),
	                summaryDrag: true,
	                summaryActive: true
	            };
	        }, function (res) {
	            $scope.info.fail("汇总项保存失败");
	        });
	    };

	    //删除||选中-合并和汇总项
	    $scope.addItem = function (data, $event) {
	        data.show = true;
	        $event.stopPropagation();
	    };
	    $scope.deleteDragItem = function (data, $event) {
	        data.show = false;
	        //$event.target.parentNode.parentNode;
	        //console.log($event.target.parentNode.parentNode.nextElementSibling);
	    };
	}]);

/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Created by yiend on 2017/1/23.
	 */
	'use strict';

	app.controller("firstPageController", ["$rootScope", "$scope", "$http", "$state", function ($rootScope, $scope, $http, $state) {
	    //默认显示第一个tab---start
	    $state.go('config.first.displayDays');
	    //默认显示第一个tab---end
	    $scope.firstPage = {
	        title: "", //面包屑导航三级目录文字
	        showItemLists: [], //显示天数
	        combineItemList: [] };
	}]).controller("displayDaysController", ["$rootScope", "$scope", "$http", function ($rootScope, $scope, $http) {
	    //设置面包屑导航
	    $scope.firstPage.title = "显示天数";

	    /**
	     *根据点击的车间树获得相应的车间ID,显示对应显示天数的数据
	     */
	    var getDisplayDayData = function getDisplayDayData() {
	        $http.get($rootScope.restful_api.firstPage_display_days + $scope.locationId).then(function (res) {
	            //获得get到的数据，渲染页面
	            $scope.firstPage.showItemLists = res.data.selectList;
	            $scope.firstPage.showItemLists.map(function (item) {
	                item.valueContent = Number(item.valueContent);
	            });
	            $scope.selectValue = $scope.firstPage.showItemLists[0].valueContent;
	        }, function () {
	            layer.alert("获取一级页面显示天数失败，请检查服务器");
	        });
	    };
	    getDisplayDayData();

	    //显示输入数字范围
	    $scope.validateNum = function (val) {
	        if (val.length == 1) {
	            val = val.replace(/[^1-9]/g, '');
	        } else {
	            val = val.replace(/\D/g, '');
	        }
	        if (val > 90) {
	            val = 30;
	        }
	        $scope.selectValue = val;
	    };

	    //保存数据
	    $scope.saveDisplayDays = function () {
	        var postData = {
	            "selectList": []
	        };
	        $scope.firstPage.showItemLists.forEach(function (item) {
	            var obj = {};
	            obj.valueContent = $(".input-text-box").val();
	            obj.valueAlias = item.valueAlias;
	            postData.selectList.push(obj);
	        });
	        $http.put($rootScope.restful_api.firstPage_display_days + $scope.locationId, postData).then(function (res) {
	            if (res.data) {
	                $scope.info.success("数据保存成功");
	            } else {
	                $scope.info.fail("数据保存失败");
	            }
	        }, function () {
	            layer.alert("数据保存失败，请检查服务器");
	        });
	    };

	    //创建车间树
	    $scope.createWorkshop(true, getDisplayDayData);
	}]).controller("displayCombineController", ["$rootScope", "$scope", "$http", function ($rootScope, $scope, $http) {
	    //设置面包屑导航
	    $scope.firstPage.title = "显示合并项";

	    /**
	     *根据点击的车间树获得相应的车间ID,显示对应显示合并项的数据
	     */
	    var getDisplayCombineData = function getDisplayCombineData() {
	        $http.get($rootScope.restful_api.firstPage_display_combine + $scope.locationId).then(function (res) {
	            //获得get到的数据，渲染页面
	            $scope.firstPage.combineItemList = res.data.optionList;
	            $scope.selectValue = res.data.selectList[0].valueContent;
	        }, function () {
	            layer.alert("获取显示合并项失败，请检查服务器");
	        });
	    };
	    getDisplayCombineData();

	    //创建车间树
	    $scope.createWorkshop(true, getDisplayCombineData);

	    //保存数据
	    $scope.saveDisplayCombine = function () {
	        //第一次进入页面没有选择
	        if (!$scope.selectValue) {
	            layer.alert("请选择一个一级页面合并规则");
	            return;
	        }
	        var selectObj = $scope.firstPage.combineItemList.filter(function (item) {
	            return item.valueContent === $scope.selectValue;
	        })[0];
	        var postData = {
	            "selectList": [{
	                valueContent: selectObj.valueContent,
	                valueAlias: selectObj.valueAlias
	            }]
	        };
	        $http.put($rootScope.restful_api.firstPage_display_combine + $scope.locationId, postData).then(function (res) {
	            if (res.data) {
	                $scope.info.success("数据保存成功");
	            } else {
	                $scope.info.fail("数据保存失败");
	            }
	        }, function () {
	            layer.alert("数据保存失败，请检查服务器");
	        });
	    };
	}]).controller("displayFlipController", ["$rootScope", "$scope", "$http", function ($rootScope, $scope, $http) {
	    $scope.firstPage.title = "显示翻转";
	    /**
	     *根据点击的车间树获得相应的车间ID,显示对应一级页面是否翻转
	     */
	    var getDisplayFlipData = function getDisplayFlipData() {
	        $http.get($rootScope.restful_api.front_back + $scope.locationId).then(function (res) {
	            //获得get到的数据，渲染页面
	            $scope.firstPage.flipList = res.data.optionList;
	            $scope.selectValue = res.data.selectList[0].valueContent || 0; //默认不翻转
	        }, function () {
	            layer.alert("获取显示翻转数据失败，请检查服务器");
	        });
	    };
	    getDisplayFlipData();

	    //保存数据
	    $scope.saveDisplayFlip = function () {
	        console.log($scope.selectValue);
	        var selectObj = $scope.firstPage.flipList.filter(function (item) {
	            return item.valueContent === $scope.selectValue;
	        })[0];
	        var postData = {
	            "selectList": [{
	                valueContent: selectObj.valueContent,
	                valueAlias: selectObj.valueAlias
	            }]
	        };
	        $http.put($rootScope.restful_api.front_back + $scope.locationId, postData).then(function (res) {
	            if (res.data) {
	                $scope.info.success("数据保存成功");
	            } else {
	                $scope.info.fail("数据保存失败");
	            }
	        }, function () {
	            layer.alert("数据保存失败，请检查服务器");
	        });
	    };

	    //创建车间树
	    $scope.createWorkshop(true, getDisplayFlipData);
	}]);

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Created by yiend on 2017/1/16.
	 */
	app.controller("planController", ["$rootScope", "$scope", "$http", "$window", "$location", "$timeout", "$q", "$templateCache", "scheduleTableViewModelService", "dataService", "tool", function ($rootScope, $scope, $http, $window, $location, $timeout, $q, $templateCache, scheduleTableViewModelService, dataService, tool) {
	    $scope.ruleList = dataService.ruleList;
	    $scope.columnWorkshop = false;

	    //获取车间计划列表
	    $http.get($rootScope.restful_api.all_schedule_plan).then(function (res) {
	        $scope.planList = res.data;
	        //如果没哟排序计划
	        if ($scope.planList.error_response) {
	            $scope.planList = [];
	            $scope.planId = 0;
	        } else {
	            $scope.planId = $scope.planList[0].schemeId;
	        }
	        //默认点击第一个
	        $http.get($rootScope.restful_api.single_schedule_plan + $scope.planId).then(function (response) {
	            $scope.locationRuleList = response.data.locationRuleList;
	            //渲染车间树样式
	            $scope.setWorkshop();
	        });
	    }, function (res) {
	        //获取服务器数据失败的情况下
	        $scope.planList = [];
	    })
	    //获取规则列表
	    .then(function () {
	        //没有规则列表时请求获得
	        if (dataService.ruleList.length) {
	            return;
	        } else {
	            $http.get($rootScope.restful_api.all_schedule_rule).success(function (res) {
	                $scope.ruleList = dataService.ruleList = res;
	                //设置方案前，没有排程规则[];
	                if (!dataService.ruleList.length) {
	                    layer.alert("请先设置一个排程规则");
	                } else {
	                    $scope.ruleId = dataService.ruleList[0].ruleId;
	                }
	                console.log(dataService.ruleList);
	            }).error(function (res) {
	                dataService.ruleList = [];
	                console.log(res);
	            }).then(function () {
	                console.log($scope.ruleList);
	            });
	        }
	    });

	    //**********妥协代码start*********//
	    //执行拖拽
	    $timeout(function () {
	        $(".gridly").dragsort({ dragSelector: "li", dragEnd: function dragEnd() {}, dragBetween: false, placeHolderTemplate: "<li></li>" });
	        var timeClick;
	        $(".gridly li").on("mousedown", ".workshop-ruleNav", function (e) {
	            console.log(e);
	            timeClick = new Date();
	            e.stopPropagation();
	        }).on("mouseup", ".workshop-ruleNav", function (e) {

	            if (new Date() - timeClick > 300) {} else {
	                e.stopPropagation();
	            }
	        });
	    }, 1000);
	    //**********妥协代码end*********//
	    //初始化车间树==查看不同计划时调用
	    $scope.setWorkshop = function () {
	        var workshopTree = $("#jWorkshop");
	        //清空痕迹
	        workshopTree.find("i").attr("class", "select-status");
	        workshopTree.find("ul ul span").removeClass("item-select");
	        //第一次进入，没有数据
	        if ($scope.locationRuleList) {
	            $scope.locationRuleList.forEach(function (item) {
	                var selectI = workshopTree.find("i[data-location-id=" + item.locationId + "]");
	                selectI.siblings("span").addClass("item-select");
	                selectI.addClass("active");
	                //子地点全部选中，且设置为disable不可更改
	                selectI.siblings("folder-tree").find("select-status").addClass("active");
	            });
	        }
	    };

	    /**排程方案保存进行发送数据**/
	    $scope.saveSchedulePlan = function () {
	        var postData = {
	            "schemeId": $(".schedulePlanLi.active").attr("data-scheme-id"),
	            "schemeName": $(".schedulePlanLi.active span").text(),
	            "locationRuleList": []
	        };
	        Array.prototype.forEach.call($("#workshopRule>ul>li"), function (item, index) {
	            var locationA = item.firstElementChild;
	            var ruleA = item.lastElementChild.firstElementChild;
	            var obj = {
	                "locationId": locationA.getAttribute("data-locationid"),
	                "locationName": locationA.innerHTML,
	                "ruleId": ruleA.getAttribute("data-rule-id"),
	                "ruleName": ruleA.innerHTML
	            };
	            postData.locationRuleList.push(obj);
	        });
	        //方案中车间为空给出提示
	        if (postData.locationRuleList.length <= 0) {
	            layer.alert("请为方案至少选择一个车间");
	            return;
	        }
	        //planId正确更新，错误新建
	        if (postData.schemeId.slice(0, 7) == "tempory") {
	            delete postData.schemeId;
	            $http.post($rootScope.restful_api.single_schedule_plan, postData).then(function (res) {
	                if (res.data) {
	                    $scope.info.success("新排程方案保存成功");
	                } else {
	                    $scope.info.fail("新排程方案保存失败");
	                }
	            }, function () {
	                $scope.info.fail("新排程方案保存失败");
	            });
	        } else {
	            $http.put($rootScope.restful_api.single_schedule_plan + $scope.planId, postData).then(function (res) {
	                $scope.info.success("排程方案更新成功");
	            }, function () {
	                $scope.info.fail("排程方案更新失败");
	            });
	        }
	    };

	    //新建方案窗口
	    $scope.openPlanWindow = function () {
	        var index = layer.open({
	            type: 1,
	            title: false,
	            closeBtn: 0,
	            shadeClose: true,
	            skin: 'yourclass',
	            content: $(".addNewPlan"),
	            success: function success() {
	                $(".planName").focus();
	                $(".layui-layer-content").on("click", ".close,.cancal", function () {
	                    layer.close(index);
	                });
	            }
	        });
	    };

	    //临时添加方案，创建临时方案数据库，存储临时创建但是未保存的方案，关闭或刷新页面数据库消失
	    $scope.temporySchemeData = {};
	    $scope.recordTemporaryPlan = function () {
	        if (!$scope.newSchemeName) {
	            //输入框中已设置newSchemeName
	            layer.msg("排程方案名不能为空");
	            return false;
	        }
	        if (!tool.checkRepeatName($scope.newSchemeName, $scope.planList, "scheme")) {
	            layer.msg("排程方案名重复，请重新输入");
	            return false;
	        }
	        $scope.index = $scope.planList.length - 1;
	        //临时方案设置为true
	        //初始化页面内容,通过判断方案ID查看是否设置了复制方案
	        var cloneSchemeId = $("#planSelect").val();
	        if (cloneSchemeId - 0 > 0) {
	            $http.get($rootScope.restful_api.single_schedule_plan + cloneSchemeId).then(function (res) {
	                $scope.locationRuleList = res.data.locationRuleList || [];
	                $scope.planList.push({
	                    schemeName: $scope.newSchemeName,
	                    schemeId: "tempory" + $scope.planList.length,
	                    locationRuleList: $scope.locationRuleList
	                });
	                $scope.planId = "tempory" + $scope.planList.length;
	                // $scope.newSchemeName = "";
	                //点击目录选中最后一个li
	                $scope.temporySchemeData["tempory" + ($scope.planList.length - 1)] = $scope.locationRuleList;
	                $timeout(function () {
	                    $(".schedulePlanLi").last().trigger("click");
	                });
	            });
	        } else {
	            $scope.locationRuleList = [];
	            $scope.planList.push({
	                schemeName: $scope.newSchemeName,
	                schemeId: "tempory" + $scope.planList.length,
	                locationRuleList: $scope.locationRuleList
	            });
	            $scope.planId = "tempory" + $scope.planList.length;
	            //点击目录选中最后一个li
	            $scope.temporySchemeData["tempory" + ($scope.planList.length - 1)] = $scope.locationRuleList;
	            $timeout(function () {
	                $(".schedulePlanLi").last().trigger("click");
	            });
	        }
	        layer.closeAll();
	    };

	    //查看方案
	    $scope.lookPlan = function (id) {
	        //先判断是否是临时方案
	        //获取临时方案的车间和规则
	        if ((id + "").slice(0, 7) == "tempory") {
	            $scope.locationRuleList = $scope.temporySchemeData[id];
	            $scope.setWorkshop();
	        } else {
	            //获取存储的车间和规则
	            $http.get($rootScope.restful_api.single_schedule_plan + id).then(function (res) {
	                $scope.schemeDate = res.data;
	                $scope.planId = id;
	                $scope.locationRuleList = res.data.locationRuleList;
	                $scope.setWorkshop();
	            }, function () {
	                $scope.planId = null;
	            });
	        }
	    };

	    //删除方案
	    $scope.deletePlan = function (id, event) {
	        //获取临时方案的车间和规则
	        var deletePlan = layer.confirm('确定删除此排程方案', {
	            btn: ['确定', '取消'] //按钮
	        }, function () {
	            if ((id + "").slice(0, 7) == "tempory") {
	                $scope.locationRuleList = $scope.temporySchemeData[id];
	                //方案列表删除此方案
	                $timeout(function () {
	                    $scope.planList = $scope.planList.filter(function (item) {
	                        return item.schemeId !== id;
	                    });
	                });
	            } else {
	                (function () {
	                    var target = event.target || event.srcElement;
	                    var parentElement = target.parentNode;
	                    var schemeId = parentElement.getAttribute("data-scheme-id");
	                    $http.delete($rootScope.restful_api.single_schedule_plan + schemeId).then(function () {
	                        $scope.planList.forEach(function (item, index) {
	                            if (item.schemeId == schemeId) {
	                                $scope.planList.splice(index, 1);
	                            }
	                        });
	                        //没有方案时，不需要执行
	                        if ($scope.planList.length != 0) {
	                            $scope.lookPlan($scope.planList[0].schemeId);
	                        }
	                    }, function () {
	                        $scope.info.fail("删除方案失败，请检查服务器");
	                    });
	                })();
	            }
	            layer.close(deletePlan);
	        }, function () {
	            layer.close(deletePlan);
	        });
	    };

	    /**
	     * 排程方案界面 选择规则目录下拉选择查看排程规则
	     * @param ruleId,: 规则ID
	     * @param ruleName: 规则名字
	     * @param event:  event
	     * @return 页面渲染所需数据
	     */
	    $scope.viewRule = function (ruleId, ruleName, event) {
	        $http.get($rootScope.restful_api.single_schedule_rule + ruleId).then(function (res) {
	            $scope.setCheckData(res.data);
	            var lookRule = layer.open({
	                type: 1,
	                title: ruleName,
	                area: ["900px", "750px"],
	                skin: 'viewRuleBox',
	                content: $(".layerBox"),
	                success: function success() {
	                    // $(".viewRuleBox .layui-layer-close1").hide();
	                    $scope.viewRuleShow = true;
	                    $(".viewRuleBox").click(function (e) {
	                        // e.preventDefault();
	                        // return false;
	                    });
	                    $("body").on("click", ".save-sort", function () {
	                        layer.close(lookRule);
	                        $timeout(function () {
	                            $scope.viewRuleShow = false;
	                        });
	                    });
	                }
	            });
	        });
	        event.stopPropagation();
	    };

	    $scope.createPlanWorkshopTree = function () {
	        $http.get($rootScope.restful_api.get_new_location).then(function (res) {
	            $scope.resWorkshop = res.data;
	            $scope.folder = tool.getLocationTreeData($.extend({}, $scope.resWorkshop))[0]; //处理数据,并绑定到页面
	        }, function (res) {
	            layer.alert("读取车间失败，请检查服务器");
	        }).then(function () {
	            $timeout(function () {
	                $("[data-location-id=" + $scope.locationId + "]").addClass("active");
	                $("#jWorkshop").on("click", "ul span", function () {
	                    if ($(this).next().find("ul li").length == 0) {
	                        return;
	                    } else {
	                        $(this).toggleClass("active").toggleClass("open");
	                        $(this).next().toggle();
	                    }
	                    //设置前面线的高度
	                    var thisUL = $(this).parents("ul");
	                    var thisLI = thisUL.children("li");
	                    var thisHeight = 0;
	                    for (var i = 0; i < thisLI.length - 1; i++) {
	                        thisHeight += $(thisLI[i]).height();
	                    }
	                    //改变按钮的位置
	                    var bgPosition = $(".location-choose").width();
	                    $(".out-bg").width(bgPosition);
	                })
	                //选择添加/删除车间
	                .on("click", ".select-status", function (event) {
	                    var e = event || window.event;
	                    var target = e.target || e.srcElement;
	                    var id = target.getAttribute("data-location-id");
	                    var firstRule = dataService.ruleList[0];
	                    //判断有没有排程规则
	                    if (!firstRule) {
	                        layer.alert("请先添加排程规则");
	                        // return;
	                    }
	                    //子列表变为不可编辑状态
	                    //选中状态下，取消左侧菜单里本车间
	                    //未选中状态下，点击一级之后取消左侧菜单里面所有的子级车间(有选中的二级情况下)==>主要是为了取消子级车间
	                    //因为不管选不选中都要执行这一段代码，所以提取到了最头上
	                    for (var i = $scope.locationRuleList.length - 1; i >= 0; i--) {
	                        if ($scope.locationRuleList[i].locationId.slice(0, id.length) === id) {
	                            $scope.locationRuleList.splice(i, 1);
	                        }
	                    }

	                    var parentLi = $(target).parent();
	                    var parentUl = parentLi.parent();
	                    var activeLiLength = void 0; //所有选中的子车间的长度
	                    var selectStatusLength = parentUl.find(".select-status").length; //所有子车间的长度
	                    var parentSelectStatus = parentUl.parent().siblings(".select-status"); //父车间的checkbox（i标签）

	                    //车间已被选中，则子列表变为可点击，未选中的状态
	                    if ($(target).hasClass("active")) {
	                        if (parentSelectStatus.hasClass("active")) {
	                            $scope.locationRuleList = $scope.locationRuleList.filter(function (item) {
	                                return item.locationId !== id.slice(0, id.length - 2);
	                            });
	                            Array.prototype.forEach.call(parentLi.siblings("li"), function (item) {
	                                var liItem = $(item);
	                                console.log(liItem.children(".item-select"));
	                                $scope.locationRuleList.push({
	                                    locationId: liItem.children("i").attr("data-location-id"),
	                                    locationName: liItem.children("span").text(),
	                                    ruleName: firstRule ? firstRule.ruleName : "请选择排程规则",
	                                    ruleId: firstRule ? firstRule.ruleId : ""
	                                });
	                            });
	                        }

	                        //==========class的变化--start========
	                        $(target).parent().find("i").attr("class", "select-status");
	                        activeLiLength = parentUl.find(".active").length;
	                        if (activeLiLength === 0) {
	                            parentSelectStatus.attr("class", "select-status");
	                            //继续向上查找，查看爷车间是否需要变化
	                        } else {
	                            parentSelectStatus.attr("class", "select-status select-some");
	                        }
	                        //==========class的变化--end========
	                    }
	                    //==========如果车间没被选中========
	                    else {
	                            //所有子车间加上active的class
	                            $(target).addClass("active");
	                            activeLiLength = parentUl.find(".active").length;
	                            Array.prototype.forEach.call(parentLi.find("folder-tree .select-status"), function (item) {
	                                item.className = "select-status active";
	                            });

	                            //左侧菜单出现本车间的信息
	                            $scope.locationRuleList.push({
	                                locationId: id,
	                                locationName: target.nextElementSibling.innerText,
	                                ruleName: firstRule ? firstRule.ruleName : "请选择排程规则",
	                                ruleId: firstRule ? firstRule.ruleId : ""
	                            });
	                            //=========二级菜单合并为一级菜单--start===========
	                            //同级列表全部选中时，左侧列变为父级一个出现，移除所有同级的车间展示
	                            //如果全部选中，父级变为选中，左侧列表只显示父级
	                            //active的个数等于所有个数则表示选中所有父级，
	                            if (activeLiLength === selectStatusLength) {
	                                //设置为不选，。然后点击调用方法，全部选中
	                                //判断是否为第一级春风车间,不是则继续执行
	                                if (parentUl.parent().prev().length) {
	                                    parentSelectStatus.attr("class", "select-status");
	                                    parentSelectStatus.trigger("click");
	                                    //偷懒，先父级选中，所有子级不可选中
	                                    // Array.prototype.forEach.call(parentUl.find(".select-status"),function(item){
	                                    // });
	                                }
	                                layer.msg("已合并为上一级车间", { time: 2000 });
	                            } else if (activeLiLength !== 0) {
	                                //没有全部选中，添加class->select-some
	                                parentSelectStatus.attr("class", "select-status select-some");
	                            } else {
	                                parentSelectStatus.attr("class", "select-status");
	                            }
	                            //=========二级菜单合并为一级菜单--end===========
	                        }
	                    //强制刷新dom
	                    $scope.$apply();
	                });
	            });
	        });
	    };
	    $scope.createPlanWorkshopTree();
	}]);

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * Created by yiend on 2017/1/16.
	 */
	app.controller("ruleController", ["$rootScope", "$scope", "$http", "$timeout", "scheduleTableViewModelService", "dataService", "tool", function ($rootScope, $scope, $http, $timeout, scheduleTableViewModelService, dataService, tool) {
	    $scope.columnWorkshop = false;
	    $scope.disable = {
	        schedulePointSelected: false, //pap排程规则下拉列表==>
	        scheduleInterval: false //排程周期 ==>
	    };
	    $scope.notEdit = {
	        schedulePointSelected: false,
	        scheduleInterval: false
	    };
	    // $scope.ruleList = dataService.ruleList;
	    $http.get($rootScope.restful_api.all_schedule_rule).success(function (res) {
	        $scope.ruleList = $.extend([], res);
	        //如果有规则，显示第一条排程规则
	        if ($scope.ruleList[0]) {
	            $scope.ruleId = $scope.ruleList[0].ruleId;
	            $http.get($rootScope.restful_api.single_schedule_rule + $scope.ruleId).success(function (res) {
	                $scope.setCheckData(res);
	            })
	            //表单初始化
	            .then(function () {
	                //设置pap排程规则
	                if ($scope.scheduleCheckData.papType == "PAP_DISABLE") {
	                    $scope.disable.schedulePointSelected = true;
	                    $scope.notEdit.schedulePointSelected = true;
	                } else if ($scope.scheduleCheckData.papType == "PAP_SCHEDULE_RULE") {
	                    $scope.disable.schedulePointSelected = false;
	                    $scope.notEdit.schedulePointSelected = true;
	                }
	                //设置下拉选中值,初始化时间框
	                setTimeout(function () {
	                    Array.prototype.forEach.call($("dd.relative span"), function (item) {
	                        var text = $(item).siblings("select").find("option:selected").text();
	                        $(item).text(text);
	                    });
	                }, 0);
	                document.getElementById("scheduleInterval").onkeyup = function () {
	                    if (this.value.length == 1) {
	                        this.value = this.value.replace(/[^0-9]/g, '');
	                    } else {
	                        this.value = this.value.replace(/\D/g, '');
	                    }
	                    if (this.value > 90) {
	                        this.value = 90;
	                    }
	                };
	                document.getElementById("freezePeriod").onkeyup = function () {
	                    if (this.value.length == 1) {
	                        this.value = this.value.replace(/[^1-9]/g, '');
	                    } else {
	                        this.value = this.value.replace(/\D/g, '');
	                    }
	                    if (this.value > 90) {
	                        this.value = 90;
	                    }
	                };
	                //当前日期前的车间计划
	                if (!$scope.scheduleCheckData.isLoadOverduePoolTask) {
	                    $("input[name=overduePeriod]").attr("disabled", "disabled");
	                } else {
	                    $("input[name=overduePeriod]").removeAttr("disabled");
	                }
	            })
	            //表单验证及相关逻辑联动
	            .then(function () {
	                //用于修改点击label会触发input点击导致两次的bug
	                var a = 0;
	                $("label[for=isLoadOverduePoolTask]").on("click", function () {
	                    a += 2;
	                    if (a % 4 === 0) {
	                        $("input[name=overduePeriod]").attr("disabled", !$("input[name=overduePeriod]").prop("disabled"));
	                    }
	                });
	                var regex = /^(\d{1,2}(\.\d{1})?|100)$/; //只能输入大于0小于100的数字
	                $(".jScheduleWeightMap input").each(function () {
	                    $(this).keyup(function () {
	                        if (!$(this).val()) {
	                            $(this).addClass("error").siblings("b").show().text("输入项不能为空");
	                        } else if (!regex.test($(this).val())) {
	                            $(this).addClass("error").siblings("b").show().text("输入项不符合规则");
	                        } else {
	                            $(this).removeClass("error").siblings("b").hide();
	                        }
	                    });
	                });
	            });
	        }
	    }).error(function () {
	        info.fail("请求规则失败，请检查服务器");
	        $scope.ruleList = [];
	    });

	    //判断需要发送的数据要保存的属性
	    function getFromValue(postData, searchObj) {
	        for (var name in postData) {
	            //如果这个属性是对象的话
	            if (_typeof(postData[name]) === "object") {
	                getFromValue(postData[name], searchObj);
	            } else {
	                //如果序列化结果没有这个属性的话，例如userId,ruleId
	                if (searchObj[name] === undefined) {} else {
	                    //boolean属性判断,on或者ng-checked表示选中
	                    if (searchObj[name] === "on" || searchObj[name] === "ng-checked") {
	                        postData[name] = true;
	                    }
	                    //为false，表示表单未选中
	                    else if (!searchObj[name]) {
	                            postData[name] = false;
	                        } else {
	                            postData[name] = searchObj[name];
	                        }
	                }
	            }
	        }
	        return postData;
	    }

	    //表单序列化
	    $.fn.serializeObject = function () {
	        var o = {};
	        var a = this.serializeArray();
	        $.each(a, function () {
	            if (o[this.name] !== undefined) {
	                if (!o[this.name].push) {
	                    o[this.name] = [o[this.name]];
	                }
	                o[this.name].push(this.value || '');
	            } else {
	                o[this.name] = this.value || '';
	            }
	        });
	        var $radio = $('input[type=radio],input[type=checkbox]', this);
	        $.each($radio, function () {
	            if (!o.hasOwnProperty(this.name)) {
	                o[this.name] = false;
	            }
	        });
	        return o;
	    };

	    /**排程前校验，排程后校验点击保存进行发送数据**/
	    $scope.saveCheckConfig = function () {
	        //=========先判断表单是否为空
	        var validata = true;
	        //执行判断
	        (function () {
	            var regex = /^(\d{1,2}(\.\d{1})?|100)$/; //只能输入大于0小于100的数字
	            //foreach无法跳出循环,每项都显示
	            Array.prototype.forEach.call(document.getElementsByClassName("jScheduleWeightMap")[0].getElementsByClassName("require"), function (item, index) {
	                //如果没填写
	                if (!item.value) {
	                    $(item).addClass("error").siblings("b").show().text("输入项不能为空");
	                    //获取提示文字，去除文字和冒号
	                    // let tipWord = item.parentNode.previousElementSibling.innerText.slice(1,-2);
	                    validata = false;
	                } else {
	                    //如果输入项不符合规则的话
	                    if (regex.test(item.value)) {
	                        $(item).removeClass("error").siblings("b").hide();
	                    } else {
	                        //如果填写不正确
	                        validata = false;
	                        $(item).addClass("error").siblings("b").show().text("输入项不符合规则");
	                    }
	                }
	            });
	        })();
	        //如果有错直接返回
	        if (!validata) {
	            return false;
	        }
	        var post = getFromValue($scope.scheduleCheckData, $("form").serializeObject());
	        //获取不到日历插件的值，手工获取
	        post.minScheduleDay = $("#minScheduleDay").val();
	        //发送数据
	        $http.put($rootScope.restful_api.single_schedule_rule + $scope.ruleId, post).then(function (response) {
	            if (response.data.error_response) {
	                info.fail("数据保存失败");
	            } else {
	                info.success("数据保存成功");
	            }
	        }, function () {
	            info.fail("数据保存失败,请检查服务器");
	        });
	    };

	    //弹出新建排程规则窗口
	    $scope.openRuleWindow = function () {
	        var index = layer.open({
	            type: 1,
	            title: false,
	            closeBtn: 0,
	            shadeClose: true,
	            skin: 'yourclass',
	            content: $(".addNewRule"),
	            success: function success() {
	                $(".addNewRule").on("click", ".close,.cancal", function () {
	                    layer.close(index);
	                });
	            }
	        });
	    };

	    //发送新建规则请求
	    $scope.postNewRule = function () {
	        //检测是否重名
	        if (!$scope.newRuleName) {
	            layer.msg('请输入正确的排程规则名');
	            return false;
	        }
	        if (!tool.checkRepeatName($scope.newRuleName, $scope.ruleList, "rule")) {
	            layer.msg('排程规则名重复，请重新输入');
	            return;
	        }
	        //判断用户是否选了规则,没选设置为默认规则
	        $scope.ruleId = $("#ruleSelect").val() === "0" ? "default" : $("#ruleSelect").val();
	        $http.get($rootScope.restful_api.single_schedule_rule + $scope.ruleId).success(function (res) {
	            $scope.scheduleCheckData = res;
	        }).error(function () {
	            layer.msg("创建新规则失败，请检查网络");
	        })
	        //再获得对应的数据,then create Rule
	        .then(function () {
	            //删除获取到的Id,post创建规则
	            delete $scope.scheduleCheckData.ruleId;
	            $scope.scheduleCheckData.ruleName = $scope.newRuleName;
	            $http.post($rootScope.restful_api.single_schedule_rule, $scope.scheduleCheckData).success(function (res) {
	                $scope.ruleId = res;
	                $scope.ruleList.push({
	                    "ruleId": res,
	                    "ruleName": $scope.scheduleCheckData.ruleName
	                });
	                $scope.setCheckData($scope.scheduleCheckData);
	                $scope.newRuleName = "";
	                layer.closeAll();
	            }).error(function () {
	                info.fail("创建规则失败-post");
	            });
	        });
	    };

	    //查看规则
	    $scope.lookRule = function (id) {
	        $http.get($rootScope.restful_api.single_schedule_rule + id).then(function (res) {
	            $scope.ruleId = id;
	            $scope.setCheckData(res.data);
	        });
	    };

	    //删除排程规则
	    $scope.deleteRule = function (event) {
	        // event.stopPropagation();
	        var deleteRule = layer.confirm('确定删除此排程规则？', {
	            btn: ['确定', '取消'] //按钮
	        }, function () {
	            var target = event.target || event.srcElement;
	            var parentElement = target.parentNode;
	            var ruleId = parentElement.getAttribute("data-rule-id");
	            layer.close(deleteRule);
	            $http.delete($rootScope.restful_api.single_schedule_rule + ruleId).then(function (res) {
	                //成功返回
	                console.log(res.data);
	                if (res.data == "1") {
	                    $scope.ruleList.forEach(function (item, index) {
	                        if (item.ruleId == ruleId) {
	                            $scope.ruleList.splice(index, 1);
	                        }
	                    });
	                    //没有规则时，不需要执行
	                    if ($scope.ruleList.length != 0) {
	                        $scope.lookRule($scope.ruleList[0].ruleId);
	                    }
	                } else if (res.data.error_response.code == "102") {
	                    info.fail("你没有权限删除此规则");
	                    // return
	                } else if (res.data.error_response.code == "103") {
	                    info.fail("此规则正在使用，无法删除");
	                    // return
	                }
	            }, function () {
	                info.fail("删除规则失败，请检查服务器");
	            });
	        }, function () {
	            layer.close(deleteRule);
	        });
	    };

	    $rootScope.jExpertConfiguration = false;
	    $scope.toggleAdvancedShow = function () {
	        $scope.jAdvancedConfiguration = !$scope.jAdvancedConfiguration;
	    };
	    $scope.toggleExpertShow = function () {
	        $scope.jExpertConfiguration = !$scope.jExpertConfiguration;
	    };
	    $scope.hideAdvancedConfig = function () {
	        $scope.jExpertConfiguration = $scope.jAdvancedConfiguration = false;
	    };
	    $("body")
	    //pap决定起排工序
	    .on("click", ".pap-type li", function () {
	        if ($(this).attr("data-value") == "PAP_DISABLE") {
	            $timeout(function () {
	                $scope.disable.schedulePointSelected = true;
	                $scope.notEdit.schedulePointSelected = true;
	                $(".schedule-point li").eq(0).trigger("click");
	            });
	        } else if ($(this).attr("data-value") == "PAP_SCHEDULE_RULE") {
	            $timeout(function () {
	                $scope.disable.schedulePointSelected = false;
	                $scope.notEdit.schedulePointSelected = true;
	                $(".schedule-point li").eq(2).trigger("click");
	            });
	        } else {
	            $timeout(function () {
	                $scope.disable.schedulePointSelected = false;
	                $scope.notEdit.schedulePointSelected = false;
	            });
	        }
	    })
	    //排程周期决定排程间隔
	    .on("click", ".schedulePeriod li", function () {
	        if ($(this).attr("data-value") == "BY_DAY") {
	            $timeout(function () {
	                $scope.disable.scheduleInterval = false;
	                $scope.notEdit.scheduleInterval = false;
	            });
	        } else {
	            $timeout(function () {
	                $scope.disable.scheduleInterval = true;
	                $scope.notEdit.scheduleInterval = true;
	            });
	        }
	    });
	}]);

/***/ }
]);