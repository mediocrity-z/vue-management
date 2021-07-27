<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
     

      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="订单编号"
          width="220px"
          prop="order_number"
        ></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="付款状态" prop="order_pay">
          <template #default="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'"
              >未支付</el-tag
            >
            <el-tag type="success" v-else>已支付</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="最后修改时间" sortable prop="create_time">
          <template #default="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-tooltip
              content="修改订单状态"
              placement="top"
              :enterable="false"
            >
              <el-button
                size="small"
                type="primary"
                @click="editShowDialog(scope.row.order_id)"
                icon="el-icon-edit"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <!-- 修改订单状态的对话框 -->
    <el-dialog
      title="修改订单状态"
      :visible.sync="editDialogVisible"
      width="35%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="订单价格" class="el-form-item" prop="order_price">
          <el-input v-model="editForm.order_price"></el-input>
        </el-form-item>

        <el-form-item label="付款状态" class="el-form-item" prop="order_pay">
          <el-select v-model="editForm.order_pay" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="是否发货" prop="is_send">
          <el-switch v-model="editForm.is_send" active-color="#13ce66">
          </el-switch>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showOrderInfo">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //向服务端发起请求的参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //获取到的订单数据列表
      orderList: [],
      total: 0,
      //控制修改地址对话框的显示与隐藏
      editDialogVisible: false,
      //修改地址的表单数据对象
      editForm: {},

      //修改地址的表单验证规则对象
      editFormRules: {
        order_price: [
          { required: true, message: "请输入订单价格", trigger: "blur" },
        ],
        order_pay: [{ required: true, trigger: "blur" }],
        is_send: [{ required: true, trigger: "blur" }],
      },
      options: [
        {
          value: "0",
          label: "未支付",
        },
        {
          value: "1",
          label: "已支付",
        },
      ],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    //获取所有订单列表数据
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取订单数据列表失败!");
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    //监听pagesize值的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    //监听页码值的改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getOrderList();
    },
    //展示修改地址的对话框
    async editShowDialog(id) {
      const { data: res } = await this.$http.get(`orders/${id}`);

      if (res.meta.status !== 200)
        return this.$message.error("查询订单信息失败!");
      this.editForm = res.data;

      this.editDialogVisible = true;
    },
    //监听修改地址对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    async showOrderInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "orders/" + this.editForm.order_id,
          {
            order_price: this.editForm.order_price,
            is_send: this.editForm.is_send,
            order_pay: this.editForm.order_pay,
          }
        );

        if (res.meta.status !== 201)
          return this.$message.error("修改订单状态失败!");

        this.editDialogVisible = false;
        this.getOrderList();
        this.$message.success("修改订单状态成功!");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
.el-form-item {
  width: 230px;
}
</style>
