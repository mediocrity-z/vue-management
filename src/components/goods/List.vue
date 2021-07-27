<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryInfo.query"
            @clear="
              queryInfo.pagenum = 1;
              getGoodsList();
            "
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="
                queryInfo.pagenum = 1;
                getGoodsList();
              "
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="110px"
        ></el-table-column>
        <el-table-column
          label="商品数量"
          width="120px"
          prop="goods_number"
        ></el-table-column>
        <el-table-column
          label="商品重量(千克)"
          width="120px"
          prop="goods_weight"
        ></el-table-column>
        <el-table-column label="最后修改时间" sortable width="200px" prop="add_time">
          <template #default="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column width="130px" label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
    <!-- 编辑商品信息的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editDialogVisible"
      width="35%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="120px"
        :rules="editFormRules"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格(元)" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量(千克)" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //获取商品的信息列表
      queryInfo: {
        query: "",
        //当前的页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 10,
      },
      goodsList: [],
      total: 0,
      //控制编辑商品信息的对话框的显示与隐藏
      editDialogVisible: false,
      //查询到的商品信息
      editForm: {
       
        goods_name: "",
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat:''
      },
      //商品修改的验证规则对象
      editFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //从服务器请求商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品列表失败!");
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    //监听pagesize值的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //监听页码值的改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getGoodsList();
    },
    //根据商品id删除对应的商品信息
    async removeGoodsById(id) {
      //弹框询问是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") return;
      //如果用户确认删除则返回字符串confirm,如果取消了删除则返回字符串cancel
      const { data: res } = await this.$http.delete("goods/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品失败!");
      }
      this.getGoodsList();
      this.$message.success("删除商品成功!");
    },
    //路由跳转到添加商品界面
    goAddPage() {
      this.$router.push("/goods/add");
    },
    //点击编辑按钮弹出编辑商品信息的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`goods/${id}`);

      if (res.meta.status !== 200)
        return this.$message.error("查询商品信息失败!");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //点击确定按钮更改商品信息
    editGoodsInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "goods/" + this.editForm.goods_id,
          {
            goods_cat:this.editForm.goods_cat,
            goods_name: this.editForm.goods_name,
            goods_price: this.editForm.goods_price,
            goods_number: this.editForm.goods_number,
            goods_weight: this.editForm.goods_weight,
          }
        );
        
        if (res.meta.status !== 200)
          return this.$message.error("修改商品信息失败!");

        this.editDialogVisible = false;
        this.getGoodsList();
        this.$message.success("修改商品信息成功!");
      });
    },
    //监听编辑商品信息对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
  },
};
</script>
<style lang="less" scoped>
</style>