<script setup lang="ts">
/**
 * 角色管理页面
 * 用于管理系统中的角色信息，包括新增、编辑、删除、权限分配、页面分配等操作。
 * 遵循 pure-admin 规范，接口类型见 src/api/role.ts
 */
import {
  ref,
  reactive,
  onMounted,
  h,
  defineComponent,
  nextTick,
  resolveComponent
} from "vue";
import { ElMessage } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import { Perms } from "@/components/RePerms";
import {
  getRoleList,
  updateRole,
  deleteRole,
  assignRolePermissions,
  assignRoleMenus,
  createRole,
  type RoleItem
} from "@/api/role";
import { getPermissionList } from "@/api/permission";
import { getMenuList } from "@/api/menu";
import EditPen from "@iconify-icons/ep/edit-pen";
import Delete from "@iconify-icons/ep/delete";
import Refresh from "@iconify-icons/ep/refresh";
import { handleTree } from "@/utils/tree";

// 表格数据与分页
const loading = ref(true);
const dataList = ref<RoleItem[]>([]);
const pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  onPageSizeChange: (size: number) => {
    pagination.pageSize = size;
    onSearch();
  },
  onCurrentChange: (page: number) => {
    pagination.currentPage = page;
    onSearch();
  }
});

// 搜索与状态筛选
const searchForm = reactive({
  keyword: "",
  status: undefined as number | undefined
});

// 表格列定义
const columns: TableColumnList = [
  { label: "角色ID", prop: "id" },
  { label: "角色名称", prop: "role_name" },
  { label: "角色标识", prop: "role_key" },
  {
    label: "状态",
    prop: "status",
    cellRenderer: ({ row }) => (row.status === 1 ? "正常" : "禁用")
  },
  {
    label: "创建时间",
    prop: "create_time",
    formatter: ({ create_time }) => create_time?.slice(0, 10)
  },
  { label: "操作", fixed: "right", width: 360, slot: "operation" }
];

/**
 * 获取角色列表
 */
async function onSearch() {
  loading.value = true;
  try {
    const { data } = await getRoleList({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status
    });
    dataList.value = data.list;
    pagination.total = data.pagination.total;
  } catch (e) {
    ElMessage.error("获取角色列表失败");
  } finally {
    loading.value = false;
  }
}

/**
 * 新增/编辑角色弹窗表单
 * 改为 <template> 语法，避免 TSX 写法导致 vue 编译报错
 */
const roleFormRef = ref();
const roleFormInline = reactive({
  id: null,
  role_name: "",
  role_key: "",
  status: 1
});
const roleFormRules = {
  role_name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  role_key: [{ required: true, message: "请输入角色标识", trigger: "blur" }]
};

function openDialog(title = "新增", row) {
  // 赋值表单
  roleFormInline.id = row?.id ?? null;
  roleFormInline.role_name = row?.role_name ?? "";
  roleFormInline.role_key = row?.role_key ?? "";
  roleFormInline.status = row?.status ?? 1;
  addDialog({
    title: `${title}角色`,
    width: "520px",
    draggable: true,
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: () =>
      h(
        resolveComponent("el-form"),
        {
          ref: roleFormRef,
          model: roleFormInline,
          rules: roleFormRules,
          "label-width": "90px",
          style: "padding: 0 20px;"
        },
        {
          default: () => [
            h(
              resolveComponent("el-form-item"),
              { label: "角色名称", prop: "role_name" },
              [
                h(resolveComponent("el-input"), {
                  modelValue: roleFormInline.role_name,
                  "onUpdate:modelValue": val =>
                    (roleFormInline.role_name = val),
                  placeholder: "请输入角色名称"
                })
              ]
            ),
            h(
              resolveComponent("el-form-item"),
              { label: "角色标识", prop: "role_key" },
              [
                h(resolveComponent("el-input"), {
                  modelValue: roleFormInline.role_key,
                  "onUpdate:modelValue": val => (roleFormInline.role_key = val),
                  placeholder: "请输入角色标识"
                })
              ]
            ),
            h(
              resolveComponent("el-form-item"),
              { label: "状态", prop: "status" },
              [
                h(
                  resolveComponent("el-radio-group"),
                  {
                    modelValue: roleFormInline.status,
                    "onUpdate:modelValue": val => (roleFormInline.status = val)
                  },
                  {
                    default: () => [
                      h(
                        resolveComponent("el-radio"),
                        { label: 1 },
                        { default: () => "正常" }
                      ),
                      h(
                        resolveComponent("el-radio"),
                        { label: 0 },
                        { default: () => "禁用" }
                      )
                    ]
                  }
                )
              ]
            )
          ]
        }
      ),
    beforeSure: async done => {
      await nextTick();
      await roleFormRef.value?.validate?.();
      const { id, ...formData } = roleFormInline;
      try {
        if (id) {
          await updateRole(id, formData);
          ElMessage.success("修改成功");
        } else {
          await createRole(formData);
          ElMessage.success("新增成功");
        }
        done();
        onSearch();
      } catch (e) {
        ElMessage.error("操作失败");
      }
    }
  });
}

/**
 * 删除角色
 */
async function handleDelete(row: RoleItem) {
  try {
    await deleteRole(row.id);
    ElMessage.success("删除成功");
    onSearch();
  } catch (e) {
    ElMessage.error("删除失败");
  }
}

/**
 * 分配权限弹窗
 */
function openAssignPermissions(row: RoleItem) {
  let checked = ref<number[]>(row.permissions.map(p => p.id));
  let loading = ref(false);
  let permissionList = ref<{ id: number; permission_name: string }[]>([]);
  // 获取权限列表
  getPermissionList().then(res => {
    permissionList.value = res.data.list;
  });
  addDialog({
    title: `分配权限 - ${row.role_name}`,
    width: "500px",
    draggable: true,
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: () =>
      h(
        resolveComponent("el-checkbox-group"),
        {
          modelValue: checked.value,
          "onUpdate:modelValue": val => (checked.value = val),
          style: "display:flex;flex-wrap:wrap;gap:12px;"
        },
        {
          default: () =>
            permissionList.value.map(item =>
              h(
                resolveComponent("el-checkbox"),
                { key: item.id, label: item.id },
                { default: () => item.permission_name }
              )
            )
        }
      ),
    beforeSure: async done => {
      loading.value = true;
      try {
        await assignRolePermissions(row.id, checked.value);
        ElMessage.success("分配权限成功");
        done();
        onSearch();
      } catch (e) {
        ElMessage.error("分配权限失败");
      } finally {
        loading.value = false;
      }
    }
  });
}

/**
 * 分配页面弹窗
 */
function openAssignMenus(row: RoleItem) {
  let checked = ref<number[]>(row.menus.map(m => m.id));
  let loading = ref(false);
  let menuList = ref<any[]>([]);
  // 获取菜单列表
  getMenuList({ page: 1, page_size: 999 }).then(res => {
    // 转为树结构
    menuList.value = handleTree(res.data.list, "id", "parent_id", "children");
  });
  addDialog({
    title: `分配页面 - ${row.role_name}`,
    width: "500px",
    draggable: true,
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: () =>
      h(resolveComponent("el-tree"), {
        data: menuList.value,
        "node-key": "id",
        "show-checkbox": true,
        "default-checked-keys": checked.value,
        props: { label: "title", children: "children" },
        "highlight-current": true,
        style: "max-height:400px;overflow:auto;",
        onCheck: (data, checkedInfo) =>
          (checked.value = (checkedInfo?.checkedKeys ?? []) as number[])
      }),
    beforeSure: async done => {
      loading.value = true;
      try {
        await assignRoleMenus(row.id, checked.value);
        ElMessage.success("分配页面成功");
        done();
        onSearch();
      } catch (e) {
        ElMessage.error("分配页面失败");
      } finally {
        loading.value = false;
      }
    }
  });
}

onMounted(() => {
  onSearch();
});
</script>

<template>
  <div class="main">
    <el-form :inline="true" class="search-form" @submit.prevent>
      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="角色名称/标识"
          clearable
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="全部" :value="undefined" />
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Refresh)"
          @click="onSearch"
          >查询</el-button
        >
      </el-form-item>
    </el-form>
    <PureTableBar title="角色列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <Perms value="system:role:add">
          <button class="button2" @click="openDialog()">新增角色</button>
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
            <Perms value="system:role:edit">
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
            <Perms value="system:role:delete">
              <el-popconfirm
                :title="`是否确认删除角色名称为 ${row.role_name} 的这条数据？`"
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
            <Perms value="system:role:assign-perms">
              <el-button
                class="reset-margin"
                link
                type="warning"
                :size="size"
                @click="openAssignPermissions(row)"
              >
                分配权限
              </el-button>
            </Perms>
            <Perms value="system:role:assign-menus">
              <el-button
                class="reset-margin"
                link
                type="success"
                :size="size"
                @click="openAssignMenus(row)"
              >
                分配页面
              </el-button>
            </Perms>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped lang="scss">
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
