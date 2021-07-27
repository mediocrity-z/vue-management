<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted == false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag type="primary" size="small" v-if="scope.row.cat_level == 0"
            >一级</el-tag
          >
          <el-tag
            type="success"
            size="small"
            v-else-if="scope.row.cat_level == 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="small" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        
           <template #opt="{row}">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click = "editCateDialogById(row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click = "deleteCateDialogById(row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="cateDialogVisible"
      width="35%"
      @close="cateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        ref="cateFormRef"
        :model="cateForm"
        :rules="cateFormRules"
        label-width="90px"
      >
        <el-form-item label="父级分类:" class="el-formItem1">
          <!-- potions指定数据源 -->
          <!-- cascaderProps对象用来指定级联选择器的配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable="true"
            change-on-select
          ></el-cascader>
        </el-form-item>
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="cateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addCate">确 定</el-button>
        <el-button @click="cateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="35%"
      @close="editCateDialogClosed">
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="90px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="editCateDialog">确 定</el-button>  
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Cate",
  data() {
    return {
      //商品分类的数据列表,默认为空
      cateList: [],
      //总数据条数
      total: 0,
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //表示将当前列定义为自定义模板列
          type: "template",
          //当前这一列模板的名称
          template: "isok",
        },
        {
          label: "排序",
          //表示将当前列定义为自定义模板列
          type: "template",
          //当前这一列模板的名称
          template: "order",
        },
        {
          label: "操作",
          //表示将当前列定义为自定义模板列
          type: "template",
          //当前这一列模板的名称
          template: "opt",
        },
      ],
      //控制添加分类对话框的显示与隐藏,默认隐藏
      cateDialogVisible: false,
      //添加分类的表单数据对象
      cateForm: {
        //将要添加的分类的名称
        cat_name: "",
        //父级分类的id
        cat_rid: 0,
        //分类的等级,默认要添加的分类是一级分类
        cat_level: 0,
      },

      //添加分类表单的验证规则对象
      cateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //父级分类的列表
      parentCateList: [],
      //选中的父级分类的id数组
      selectedKeys: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: false
      },
      //控制编辑商品分类对话框的显示与隐藏
      editCateDialogVisible: false,
      //编辑分类的表单数据对象
      editCateForm: {},
      //编辑商品分类的表单验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败!");
      //把数据列表赋值给cateList
      this.cateList = res.data.result;
      //为总数据条数赋值
      this.total = res.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum的改变的事件
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getCateList();
    },
    //展示添加分类的对话框
    showCateDialog() {
      //先获取到父级分类的列表数据
      this.getParentCateList();
      //再展示出对话框
      this.cateDialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取父级列表数据失败!");

      this.parentCateList = res.data;
    },
    //选择项发生变化触发这个函数
    handleChange() {
      //如果selectedKeys的长度大于0,则证明选中了父级分类,反之没有选中
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        //为当前分类的等级赋值
        this.cateForm.cat_level = this.selectedKeys.length;
        
      } else {
        this.cateForm.cat_pid = 0;
        this.cateForm.cat_level = 0;
      }
    },
    //点击确定按钮添加新的分类
   addCate(){
        this.$refs.cateFormRef.validate( async valid=>{
            if(!valid) return;
            const {data:res} =await this.$http.post('categories',this.cateForm);
            if(res.meta.status!==201) return this.$message.error('添加分类失败!')
            this.$message.success('添加分类成功!');
            this.getCateList();
            this.cateDialogVisible=false
        })
    },
    //监听添加分类对话框的关闭事件,并重置表单数据
    cateDialogClosed(){
this.$refs.cateFormRef.resetFields();
this.selectedKeys=[];
this.cateForm.cat_pid=0;
this.cateForm.cat_level=0
    },
    // 根据id查询到对应的商品分类信息
    async editCateDialogById (id) {
      const { data: res } = await this.$http.get(`categories/${id}`, { params: { id: id } })
      if (res.meta.status !== 200) {
        return this.$message.error('商品查询分类失败!')
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    //监听编辑分类对话框的关闭事件,并重置表单数据
    editCateDialogClosed () {
      this.$refs.editCateFormRef.resetFields()
    },
    //点击确定按钮编辑商品分类的名称
    editCateDialog () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { id: this.editCateForm.cat_id, cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error('商品分类编辑失败!')
        }
        this.$message.success('商品分类编辑成功!')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    //根据商品分类id删除对应的商品分类
    async deleteCateDialogById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除商品分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return ;
      }
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品分类失败!')
      }
      this.$message.success('删除商品分类成功!')
      this.getCateList()
    }
  },
};
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-formItem1{
    width:100%
}
.el-cascader{
    width:100%
}
</style>