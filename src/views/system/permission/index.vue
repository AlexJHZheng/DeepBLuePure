<script setup lang="ts">
import { ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import { usePermission } from "./hook";
import { Perms } from "@/components/RePerms";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";

defineOptions({ name: "SystemPermission" });

const formRef = ref();
const {
  loading,
  columns,
  dataList,
  pagination,
  searchFormParams,
  onSearch,
  resetForm,
  openDialog,
  handleDelete
} = usePermission();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="权限名称：" prop="permission_name">
        <el-input
          v-model="searchFormParams.permission_name"
          placeholder="请输入权限名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="权限标识：" prop="permission_key">
        <el-input
          v-model="searchFormParams.permission_key"
          placeholder="请输入权限标识"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="权限列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <Perms value="system:permission:add">
          <el-button
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增权限
          </el-button>
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
</style>
