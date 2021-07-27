import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式表
import './assets/css/global.css'
import 'element-ui/lib/theme-chalk/index.css';

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.bubble.css'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

import axios from 'axios'
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'

import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table',TreeTable)



//axios请求拦截器，给请求头对象添加token验证的Authorization字段，以保证每次拥有获取菜单里的数据的权限。
//大概意思是用户登录之后的会将登录的token令牌赋值给Authorization对象，这个对象里面有token之后就能有权限查看和修改
//菜单里的数据
axios.interceptors.request.use(config=>{
  config.headers.Authorization=window.sessionStorage.getItem('token');
  return config;
})
Vue.prototype.$http=axios

// 全局过滤器 参数1名称 参数2要过滤的值的方法
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal*1000 )
  // ES7 padStart() String的方法，参数1字符串个数，参数2不足时候用其补全
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
