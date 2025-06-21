<script setup lang="ts">
/**
 * 角色管理页面
 * 用于管理系统中的角色信息，包括新增、编辑、删除等操作。
 */
defineOptions({ name: "Role" });
</script>

<template>
  <div class="system-role-page">
    <h2>角色管理1112</h2>
    <h1>你好大方的手法第三方卡上飞机卡上飞机啊舒服</h1>
    <Perms value="system:role:add">
      <el-button type="primary">新增角色</el-button>
    </Perms>
    <Perms value="system:role:edit">
      <el-button type="success">编辑角色</el-button>
    </Perms>
    <Perms value="system:role:delete">
      <el-button type="danger">删除角色</el-button>
    </Perms>
  </div>
</template>

<style scoped>
.system-role-page {
  padding: 24px;
}
</style>
