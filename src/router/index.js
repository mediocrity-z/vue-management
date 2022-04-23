import Vue from 'vue'
// import VueRouter from 'vue-router'
const Home = () => import('../views/Home.vue')
const Login = () => import('../components/Login.vue')
import Welcome from '../components/Welcome'
import User from '../components/user/User.vue'
const Rights = () => import('../components/power/Rights.vue')
const Roles = () => import('../components/power/Roles.vue')
const List = () => import('../components/goods/List.vue')
const Add = () => import('../components/goods/Add.vue')
const Params = () => import('../components/goods/Params.vue')
const Cate = () => import('../components/goods/Cate.vue')
const Order = () => import('../components/order/Order.vue')
const Report = () => import('../components/report/Report.vue')
const notFound = () => import('../components/notFound.vue')
Vue.use(VueRouter);


const routes = [
  {
    path: '/',
    redirect: '/login',
  }
  ,
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome,
      },
      {
        path: '/users',
        component: User
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: List,
      },
      {
        path: '/goods/add',
        component: Add,
      },
      {
        path: '/orders',
        component: Order,
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  },
  {
    path: '/notFound',
    component: notFound
  }

]
const router = new VueRouter({

  base: process.env.BASE_URL,
  routes
});

//导入nprogress包对应的js和css
import NProgress from 'nprogress/nprogress'
import 'nprogress/nprogress.css'

//挂载路由对象守卫
router.beforeEach((to, from, next) => {
  //next()是一个函数，表示放行,且next('/login')表示强制跳转
  if (to.path == '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token');
  //没有token令牌则强制跳转到登录页面
  if (!tokenStr) return next('/login');

  if (!to.matched.length) {
    next('/notFound');
  }
  next();
  //展示顶端的进度条
  NProgress.start();
  //隐藏顶端的进度条
  NProgress.done()
}
)
export default router
