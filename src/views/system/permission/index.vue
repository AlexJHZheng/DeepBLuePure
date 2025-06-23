<script setup lang="ts">
import { ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import { usePermission } from "./hook";
import { Perms } from "@/components/RePerms";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";

defineOptions({ name: "SystemPermission" });

const {
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  openDialog,
  handleDelete
} = usePermission();
</script>

<template>
  <div class="main">
    <PureTableBar title="权限列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <Perms value="system:permission:add">
          <button class="button2" @click="openDialog()">新增权限</button>
        </Perms>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="pagination.onPageSizeChange"
          @page-current-change="pagination.onCurrentChange"
        >
          <template #operation="{ row }">
            <Perms value="system:permission:edit">
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog('编辑', row)"
              >
                修改
              </el-button>
            </Perms>
            <Perms value="system:permission:delete">
              <el-popconfirm
                :title="`是否确认删除权限名称为 ${row.permission_name} 的这条数据`"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    class="reset-margin"
                    link
                    type="primary"
                    :size="size"
                    :icon="useRenderIcon(Delete)"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </Perms>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.button2 {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 0.4em 1.2em;
  overflow: hidden;
  font-size: 14px;
  color: #090909;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 0.5em;
  box-shadow:
    6px 6px 12px #c5c5c5,
    -6px -6px 12px #fff;
  transition: all 0.2s ease-in;
}

.button2:active {
  color: #666;
  box-shadow:
    inset 4px 4px 12px #c5c5c5,
    inset -4px -4px 12px #fff;
}

.button2::before {
  position: absolute;
  top: 100%;
  left: 50%;
  z-index: -1;
  display: block;
  width: 140%;
  height: 180%;
  content: "";
  background-color: rgb(0 0 0 / 5%);
  border-radius: 50%;
  transform: translateX(-50%) scaleY(1) scaleX(1.25);
  transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
}

.button2::after {
  position: absolute;
  top: 180%;
  left: 55%;
  z-index: -1;
  display: block;
  width: 160%;
  height: 190%;
  content: "";
  background-color: hsl(210deg 100% 54%);
  border-radius: 50%;
  transform: translateX(-50%) scaleY(1) scaleX(1.45);
  transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
}

.button2:hover {
  color: #fff;
  border: 1px solid hsl(210deg 100% 54%);
}

.button2:hover::before {
  top: -35%;
  background-color: hsl(210deg 100% 54%);
  transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
}

.button2:hover::after {
  top: -45%;
  background-color: hsl(210deg 100% 54%);
  transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
}
</style>
