<script setup lang="ts">
/**
 * 用户管理页面
 * 用于管理系统中的用户信息，包括新增、编辑、删除等操作。
 */
defineOptions({ name: "User" });
</script>

<template>
  <div class="system-user-page">
    <h2>用户管理111</h2>
    <!-- 这里可以放表格、搜索、按钮等内容 -->
    <Perms value="system:user:add">
      <el-button type="primary">新增用户</el-button>
    </Perms>
    <Perms value="system:user:edit">
      <el-button type="success">编辑用户</el-button>
    </Perms>
    <Perms value="system:user:delete">
      <el-button type="danger">删除用户</el-button>
    </Perms>
  </div>
</template>

<style scoped>
.system-user-page {
  padding: 24px;
}
</style>
