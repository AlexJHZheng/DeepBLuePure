<script setup lang="ts">
/**
 * 菜单管理页面
 * 用于管理系统中的菜单信息，包括新增、编辑、删除等操作。
 */
defineOptions({ name: "SystemMenu" });
</script>

<template>
  <div class="system-menu-page">
    <h2>菜单管理</h2>
    <Perms value="system:menu:add">
      <el-button type="primary">新增菜单</el-button>
    </Perms>
    <Perms value="system:menu:edit">
      <el-button type="success">编辑菜单</el-button>
    </Perms>
    <Perms value="system:menu:delete">
      <el-button type="danger">删除菜单</el-button>
    </Perms>
  </div>
</template>

<style scoped>
.system-menu-page {
  padding: 24px;
}
</style>
