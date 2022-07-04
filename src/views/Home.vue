<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <span>电商后台管理系统</span>
      <el-button type="info" @click="loginout">退出</el-button></el-header
    >
    <!-- 页面主体区域 -->
    <el-container class="main-container">
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          :default-active="activePath"
          :router="true"
          :collapse-transition="false"
          :collapse="isCollapse"
          unique-opened
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="icons[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavstate('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  //页面刚一加载出来就应该显示出来左侧菜单
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      icons: {
        125: "el-icon-s-check",
        103: "el-icon-s-operation",
        101: "el-icon-s-goods",
        102: "el-icon-s-order",
        145: "el-icon-s-marketing",
      },
      //默认是展开状态
      isCollapse: false,
      //被激活的链接地址
      activePath: "",
    };
  },
  methods: {
    loginout() {
      //清除token并跳转到登陆页面
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //获取所有的菜单,异步操作
    async getMenuList() {
      //menus是接口文档中的请求路径
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
    },
    //点击按钮，切换左侧菜单的折叠和展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //保存链接的激活状态到sessionStorage中的acivePath属性中
    saveNavstate(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  position: relative;
}
.el-menu {
  border-right: none;
}
.main-container {
  margin-top: 60px;
  height: 100%;
  overflow: hidden;
  .el-aside {
    background-color: #333744;
    height: 100%;
  }
  .el-main {
    background-color: #eaedf1;
  }
}
//组件名本身当成一个类选择器使用
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  position: fixed;
  width: 100%;
  height: 100%;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>