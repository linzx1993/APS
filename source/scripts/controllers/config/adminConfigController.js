/**
 * Created by yiend on 2017/1/16.
 */
app.controller("adminConfigController",["$rootScope","$scope","$http","$window", "$location","$timeout","$q","$templateCache","scheduleTableViewModelService","http",function($rootScope,$scope,$http, $window, $location,$timeout,$q,$templateCache,scheduleTableViewModelService,http) {
    //显示正确的目录class-active
    $scope.configNav.activeNav = ".admin";

    let getColumnData = () =>{
		http.get({
			url: $rootScope.restful_api.reset_show_column + $scope.locationId,
			successFn: (res) => {
                //获得get到的数据，渲染页面
                $scope.setDisplayGetData(res);
            },
			errorFn: () => {
                $scope.info.fail("获取数据失败，请检查是否连上服务器")
            }
		})
    };
    getColumnData();
    //创造车间树
    $scope.createWorkshop();

    //初始化拖拽
    $scope.clickLiGetItem();

    //根据点击不同的车间选择不同的显示项
    $("#columnWorkshop").on("click", ".select-status", (e) => {
        //根据点击的车间ID
        $scope.locationId = e.target.getAttribute("data-location-id");
        $(".select-status").removeClass("active");
        $(e.target).addClass("active");
        //移除临时拖拽项
        $(".js-move").remove();
        getColumnData();
    });

    /**保存数据**/
    $scope.saveAdminDefaultDisplay = () => {
        let postData = $scope.getDisplayPostData("请至少选择一项显示");
        //检测数据是否正确
        if(!postData){
            return;
        }
		http.put({
			url: $rootScope.restful_api.reset_show_column + $scope.locationId,
			data: postData,
			successFn: function(response){
                if(response.data === true){
                    $scope.info.success("默认显示项保存成功");
                }
            },
			errorFn: function(){
                $scope.info.fail("默认显示项保存失败");
            }
		});
    };

    /**系统管理员页面还原数据**/
    $scope.resetAdminConfig = () => {
		http.delete({
			url: $rootScope.restful_api.admin_content_config + $scope.locationId,
			successFn: function(res){
                $scope.adminOptionList = res.data.optionList;
                $scope.adminSelectList = res.data.selectList[0];
                $scope.carHouseSelected = $scope.adminSelectList.valueContent;
                $scope.info.success("还原配置成功");
            },
			errorFn: function(){
                $scope.info.fail("还原配置失败");
            }
		})
    };
}]);