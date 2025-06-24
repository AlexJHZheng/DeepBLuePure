<script setup lang="ts">
/**
 * 菜单管理页面
 * 用于管理系统中的菜单信息，包括新增、编辑、删除等操作。
 * 遵循 pure-admin 规范，接口类型见 src/api/menu.ts
 */
import { ref, reactive, onMounted, h } from "vue";
import { ElMessage } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import { Perms } from "@/components/RePerms";
import {
  getMenuList,
  createMenu,
  updateMenu,
  deleteMenu,
  type MenuItem,
  type MenuEditData
} from "@/api/menu";
import EditPen from "@iconify-icons/ep/edit-pen";
import Delete from "@iconify-icons/ep/delete";
import Refresh from "@iconify-icons/ep/refresh";
import MenuForm from "./MenuForm";
import { handleTree } from "@/utils/tree";

// 表格数据与分页
const loading = ref(true);
const dataList = ref<MenuItem[]>([]);
const pagination = reactive({
  total: 0
});

// 搜索与状态筛选
const searchForm = reactive({
  keyword: "",
  status: undefined as number | undefined
});

// 表格列定义
const columns: TableColumnList = [
  { label: "菜单ID", prop: "id" },
  { label: "菜单名称", prop: "title" },
  { label: "路由名称", prop: "name" },
  { label: "路由路径", prop: "path" },
  { label: "组件路径", prop: "component" },
  {
    label: "图标",
    prop: "icon",
    cellRenderer: ({ row }) => (row.icon ? h(useRenderIcon(row.icon)) : "-")
  },
  { label: "排序", prop: "order_num" },
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
  { label: "操作", fixed: "right", width: 180, slot: "operation" }
];

const menuTree = ref<MenuItem[]>([]);

/**
 * 获取菜单列表（树形）
 */
async function fetchMenuTree() {
  loading.value = true;
  try {
    const { data } = await getMenuList({
      page: 1,
      page_size: 999,
      keyword: searchForm.keyword,
      status: searchForm.status
    });
    menuTree.value = handleTree(data.list, "id", "parent_id", "children");
    pagination.total = data.pagination.total;
  } catch (e) {
    ElMessage.error("获取菜单列表失败");
  } finally {
    loading.value = false;
  }
}

/**
 * 打开新增/编辑弹窗
 */
function openDialog(title = "新增", row?: MenuItem, parentId = 0) {
  addDialog({
    title: `${title}菜单`,
    props: {
      formInline: {
        id: row?.id ?? null,
        title: row?.title ?? "",
        name: row?.name ?? "",
        path: row?.path ?? "",
        component: row?.component ?? "",
        icon: row?.icon ?? "",
        order_num: row?.order_num ?? 0,
        status: row?.status ?? 1,
        parent_id: row?.parent_id ?? parentId
      }
    },
    width: "520px",
    draggable: true,
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: ({ options }) => h(MenuForm, options.props),
    beforeSure: async (done, { options }) => {
      const curForm = options.props.formInline;
      const { id, ...formData } = curForm;
      try {
        if (id) {
          await updateMenu(id, formData);
          ElMessage.success("修改成功");
        } else {
          await createMenu(formData);
          ElMessage.success("新增成功");
        }
        done();
        fetchMenuTree();
      } catch (e) {
        ElMessage.error("操作失败");
      }
    }
  });
}

/**
 * 删除菜单
 */
async function handleDelete(row: MenuItem) {
  try {
    await deleteMenu(row.id);
    ElMessage.success("删除成功");
    fetchMenuTree();
  } catch (e) {
    ElMessage.error("删除失败");
  }
}

onMounted(() => {
  fetchMenuTree();
});
</script>

<template>
  <div class="main">
    <el-form :inline="true" class="search-form" @submit.prevent>
      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="菜单名称/路由名称"
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
          @click="fetchMenuTree"
          >查询</el-button
        >
      </el-form-item>
    </el-form>
    <div style="margin-bottom: 16px">
      <Perms value="system:menu:add">
        <button class="button2" @click="openDialog('新增', undefined, 0)">
          新增顶级菜单
        </button>
      </Perms>
    </div>
    <el-tree
      :data="menuTree"
      node-key="id"
      :props="{ label: 'title', children: 'children' }"
      default-expand-all
      highlight-current
      style=" padding: 16px;background: #fff; border-radius: 6px"
    >
      <template #default="{ node, data }">
        <span style="display: flex; align-items: center">
          <span>{{ data.title }}</span>
          <span style="margin-left: 8px; font-size: 12px; color: #888"
            >({{ data.name }})</span
          >
          <span style="margin-left: 8px; font-size: 12px; color: #888">{{
            data.path
          }}</span>
          <span v-if="data.icon" style="margin-left: 8px">
            <component :is="useRenderIcon(data.icon)"
          /></span>
          <Perms value="system:menu:add">
            <el-button
              v-if="node.level < 3"
              link
              size="small"
              type="primary"
              @click.stop="openDialog('新增', undefined, data.id)"
              >新增子菜单</el-button
            >
          </Perms>
          <Perms value="system:menu:edit">
            <el-button
              link
              size="small"
              type="primary"
              @click.stop="openDialog('编辑', data)"
              >编辑</el-button
            >
          </Perms>
          <Perms value="system:menu:delete">
            <el-popconfirm
              :title="`是否确认删除菜单名称为 ${data.title} 的这条数据？`"
              @confirm="handleDelete(data)"
            >
              <template #reference>
                <el-button link size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </Perms>
        </span>
      </template>
    </el-tree>
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
