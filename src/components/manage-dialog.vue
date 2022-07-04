<template>
  <div class="manage-dialog" v-bind="$attrs" v-on="$listeners">
    <el-dialog
      :showClose="false"
      :visible.sync="$attrs.visible"
      :title="$attrs.title"
      :width="$attrs.width"
    >
      <slot></slot>
      <span slot="footer" class="manage-dialog-footer">
        <el-button type="primary" @click="yes">确 定</el-button>
        <el-button @click="no">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  methods: {
    no() {
      this.$emit("no");
    },
    yes() {
      this.$emit("yes");
    },
  },
};
</script>

<style>
</style>