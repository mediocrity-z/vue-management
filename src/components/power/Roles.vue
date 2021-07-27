<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡牌视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot:default="scope">
            <el-row
              :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  type="primary"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 == 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot:default="scope">
            <el-button
              size="small"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="small"
              type="warning"
              icon="el-icon-setting"
              @click="showRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户的 对话框 visible.sync控制对话框的显示隐藏boolean-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="35%"
      @close="addDialogClosed()"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addUser">确 定</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="35%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="90px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" ></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="RightDialogVisible" width="35%" @close="RightDialogClosed">
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="allotRights">确 定</el-button>
        <el-button @click="RightDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getRolesList();
  },
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      //控制分配权限对话框的显示与隐藏
      RightDialogVisible: false,
      //所有权限的数据列表
      rightsList: [],
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //  树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      //默认选中的节点的id的数组
      defKeys:[],
      //当前即将分配角色的id
      roleId:'',
      // 添加用户表单数据
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加表单验证规则
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 7, message: "长度在 3 到 7 个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      // 修改用户对话框显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {
        roleName: "",
         roleDesc: "",
      },
      // 修改表单的验证规则对象
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 7, message: "长度在 3 到 7 个字符", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    //获取所有角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败!");
      this.roleList = res.data;
    },
    // 关闭清空输入框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // 表单提交预校验
        // console.log(valid)
        if (!valid) {
          return false;
        }
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("roles", this.addForm);
        // console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败!");
        }
        this.$message.success("添加用户成功!");
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    // 查询用户信息
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`, { id: id });
      //   console.log("修改项的id", res);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败!");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return ;
        }
        // 可以发起修改用户的网络请求
        const { data: res } = await this.$http.put(
          `roles/${this.editForm.roleId}`,
          {
            id: this.editForm.roleId,
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败！");
        }
        // 提示修改成功
        this.$message.success("更新用户信息成功！");
        // 关闭对话框
        this.editDialogVisible = false;
        this.editForm = res.data;
        // 刷新列表
        this.getRolesList();
      });
    },
    async removeUserById(id) {
      // 询问用户是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 如果用户确认删除返回值为confirm字符串,取消删除返回值为cancel
      if (confirmResult !== "confirm") {
        return;
      }
      // console.log('确认删除')
      const { data: res } = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败!");
      }
      this.getRolesList();
      this.$message.success("删除用户成功!");
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return;
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败!");
      }
      this.$message.success("删除权限成功!");
      //   this.getRolesList();
      role.children = res.data;
    },
    //展示分配权限的对话框
    async showRightDialog(role) {
        this.roleId=role.id;
      //获取所有权限的数据
      this.RightDialogVisible = true;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败!");
      }
      //把获取到的权限数据保存到data中
      this.rightsList = res.data;
      //递归获取三级节点的id
      this.getLeafKeys(role,this.defKeys)
    },
    //通过递归,获取角色下所有三级权限的id值,并保存到defKeys数组中
    getLeafKeys(node,arr){
        //如果当前node属性不包含children属性,则是三级节点
    if(!node.children) return arr.push(node.id);
    node.children.forEach(item=>this.getLeafKeys(item,arr))
    },
    //监听分配对话框的关闭事件
    RightDialogClosed(){
    this.defKeys=[]
    },
    //点击为角色分配权限
    async allotRights(){
    const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
    ];
    const idStr=keys.join(',');
  const{data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr});
    if(res.meta.status!==200) return this.$message.error('分配角色权限失败!');
    this.$message.success('分配角色权限成功!');
    this.getRolesList();
    this.RightDialogVisible=false;
  },
}
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>