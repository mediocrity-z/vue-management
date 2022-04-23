<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-alert
            title="添加商品信息"
            type="info"
            center
            show-icon
            :closable="false"
          >
          </el-alert>
        </el-col>
      </el-row>
      <el-steps
        :space="200"
        :active="+activeIndex"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="参数列表"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input class="el-input" v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input class="el-input" v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input class="el-input" v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input class="el-input" v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="(item, index) in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals" size="small">
                <el-checkbox
                  :label="itemCheck"
                  v-for="(itemCheck, i) in item.attr_vals"
                  :key="i"
                  border
                  @change="checkboxChange(index)"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="(item, idx) in onlyTableData"
              :key="item.attr_id"
            >
              <el-input
                v-model="item.attr_vals"
                @input="editChange(idx)"
              ></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的api地址 list-type表示预览效果-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="medium" type="primary">点击上传</el-button>
              <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器内容 -->
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from "lodash";

export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品表单数据对象
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        // 商品所属的分类数组
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品详情描述
        goods_introduce: "",
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
          
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
          
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      catelist: [],
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      manyTableData: [],
      onlyTableData: [],
      uploadURL: "http://175.27.228.178:3434/api/private/v1/upload",
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      previewVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败!");
      }
      this.catelist = res.data;
    },
    // 级联选择器选中项变化触发
    handleChange() {
      // console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return this.$message.error("只允许选择三级分类!");
      }
    },
    // activeName：即将进入的标签页名字
    // oldActiveName：即将离开的标签页名字
    beforeTabLeave(activeName, oldActiveName) {
      // console.log(activeName, oldActiveName)
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类!");
        return false;
      } else if (
        oldActiveName === "0" &&
        (this.addForm.goods_name == "" ||
          this.addForm.goods_price == "" ||
          this.addForm.goods_number == "" ||
          this.addForm.goods_weight == "")
      ) {
        this.$message.error("请完成未完成的输入项!");
        return false;
      }
    },
    async tabClicked() {
      // console.log(this.activeIndex)
      if (this.activeIndex === "1") {
        const {
          data: res,
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: "many" },
        });
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数失败!");
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        // console.log(this.manyTableData)
      } else if (this.activeIndex === "2") {
        const {
          data: res,
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: "only" },
        });
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性失败!");
        }
        this.onlyTableData = res.data;
        // console.log(this.onlyTableData)
      }
    },
    async editDataFnc(index) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${this.cateData[index].attr_id}`,
        {
          attr_name: this.cateData[index].attr_name,
          attr_sel: this.cateData[index].attr_sel,
          attr_vals:
            this.activeIndex === "1"
              ? this.cateData[index].attr_vals.join(" ")
              : this.cateData[index].attr_vals,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败!");
      }
      // this.$message.success('修改参数项成功')
    },
    checkboxChange(index) {
      // console.log(this.manyTableData)
      this.editDataFnc(index);
    },
    editChange(index) {
      this.editDataFnc(index);
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // console.log(file)
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((item) => item.pic === filePath);
      this.addForm.pics.splice(i, 1);
      // console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // console.log(response)
      if (response.meta.status !== 200) {
        return this.$message.error("图片上传失败,请重试!");
      }
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
      // console.log(this.addForm)
    },
    add() {
      // console.log(this.addForm)
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("请填写必要的表单项!");
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        // 处理attrs 动态参数和静态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        // console.log(form)
        const { data: res } = await this.$http.post("goods", form);console.log(res.meta.status);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败!");
        }
        
        this.$message.success("添加商品成功!");
        this.$router.push("/goods");
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[this.addForm.goods_cat.length - 1];
      }
      return null;
    },
    cateData() {
      if (this.activeIndex === "1") {
        return this.manyTableData;
      } else if (this.activeIndex === "2") {
        return this.onlyTableData;
      }
      return null;
    },
  },
};
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
.el-input{
    width: 217px;
}
</style>