
//为老式浏览器增加api
// import 'babel-polyfill';
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import store from './vuex/store'
import VueRouter from 'vue-router';
import App from './App'
import router from './router/routerConfig'

Vue.use(Vuex);

	//路由配置
import axios from 'axios'
import ajaxInterceptors from './scripts/ajaxInterceptors'
Vue.prototype.$http = axios;

//引入接口
import url from './scripts/url';
Vue.prototype.url = url;

//引入小方法js
import tool from "./scripts/tool";
Vue.prototype.tool = tool;
//引入数据处理的js
import dataProcess from "./scripts/dataProcesse"
Vue.prototype.dataProcess = dataProcess;
//================****引入element模块****===================//
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
Vue.use(ElementUI);

//================****引入 ECharts 主模块****===================//
const echarts = require('echarts/lib/echarts');
// 引入图标
require('echarts/lib/chart/bar'); //柱状图
require('echarts/lib/chart/line'); //折线图
require('echarts/lib/chart/pie'); //折线图
// 引入组件
require('echarts/lib/component/tooltip'); //提示框
require('echarts/lib/component/title'); //标题组件
require('echarts/lib/component/legend'); //小标题
require('echarts/lib/component/dataZoom'); //数据缩放视图
require('echarts/lib/component/toolbox'); //小工具栏
Vue.prototype.echarts = echarts;

//================****引入相关scss文件****===================//
import "./styles/reset.scss";
import "./styles/common.scss";
import "./styles/index.scss";
//================****引入自定义插件****===================//
import apsUI from "./install.js"
Vue.use(apsUI);

Vue.config.productionTip = false; //阻止 vue 在启动时生成生产提示。

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	template: '<App/>',
	components: {
		App
	}
})

