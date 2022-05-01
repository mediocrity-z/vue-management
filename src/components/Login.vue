<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box"><img src="../assets/logo.png" alt="" /></div>
      <!-- avatar:化身，体现 -->

      <!-- 登陆表单区域 -->
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-width="60px"
        class="login-form"
      >
        <!-- ref意为绑定当前元素节点并使用一个自定义名称 -->

        <!-- 账号 -->
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="success" @click="login" round>登录</el-button>
          <el-button type="info" @click="reset" round>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { userLogin } from "../api/login/login";
export default {
  data() {
    return {
      // 登陆表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 表单的验证规则对象
      rules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: "请输入账号", trigger: "blur" },
          { min: 3, max: 10, message: "长度在3~10个字符", trigger: "blur" },
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 18, message: "长度在6~18个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 点击重置按钮，重置登录表单的数据
    reset() {
      // console.log(this.$refs);
      this.$refs.formRef.resetFields();
      // ref 加在子组件上，用this.$refs.ref值 获 取 到 的 是 组 件 实例， 可 以 使 用 组 件 的 所 有 方 法 。
    },
    login() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await userLogin(this.loginForm);
        if (res.meta.status !== 200) {
          return this.$message.error("登录失败,请核对用户信息");
        }
        this.$message.success("登录成功");

        // 1.将登录成功之后的token令牌保存到客户端的sessionStorage中（即token只在当前网站打开期间生效）
        // localStorage和cookie则会长期保存token
        window.sessionStorage.setItem("token", res.data.token);
        // 2.通过编程式导航跳转到网站主页，路由地址是/home
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login-container {
  background-color: rgb(129, 17, 204);
  height: 100%;
}

.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  /* 块级元素水平垂直居中 */

  .avatar-box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #dddd;
    position: absolute;
    left: 32%;
    background-color: #fff;
    transform: translate(0, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
  // boxsizing属性使文本框被包含在盒子里面
}

.btns {
  display: flex;
  justify-content: center;
}
</style>
