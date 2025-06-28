<script setup lang="ts">
/**
 * 用户管理页面
 * 参考角色管理页面风格，支持新增、编辑、删除、分配角色等操作。
 * 遵循 pure-admin 规范，接口类型见 src/api/user.ts
 */
import { ref, reactive, onMounted, h, nextTick, resolveComponent } from "vue";
import { ElMessage } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import { Perms } from "@/components/RePerms";
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  assignUserRoles,
  type SysUser,
  updateUserPassword
} from "@/api/user";
import { getRoleList } from "@/api/role";
import EditPen from "@iconify-icons/ep/edit-pen";
import Delete from "@iconify-icons/ep/delete";
import Refresh from "@iconify-icons/ep/refresh";

// 表格数据与分页
const loading = ref(true);
const dataList = ref<SysUser[]>([]);
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
  { label: "用户ID", prop: "user_id" },
  { label: "用户名", prop: "username" },
  { label: "昵称", prop: "nickname" },
  {
    label: "孚盟ID",
    prop: "fuma_id",
    cellRenderer: ({ row }) => row.fuma_id ?? "-"
  },
  {
    label: "角色",
    prop: "roles",
    cellRenderer: ({ row }) => row.roles || "-"
  },
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
 * 获取用户列表
 */
async function onSearch() {
  loading.value = true;
  try {
    const { data } = await getUserList({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status
    });
    dataList.value = data.list;
    pagination.total = data.pagination.total;
  } catch (e) {
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
}

/**
 * 新增/编辑用户弹窗表单
 */
const userFormRef = ref();
const userFormInline = reactive({
  user_id: null,
  username: "",
  password: "",
  confirmPassword: "",
  nickname: "",
  avatar: "",
  status: 1,
  fuma_id: undefined
});

const passwordValidator = (rule, value) => {
  if (!value) return Promise.reject("请输入密码");
  if (value.length < 8 || value.length > 18) {
    return Promise.reject("密码长度需为8-18位");
  }
  // 至少包含两种类型：数字、字母、符号
  const types = [
    /[0-9]/.test(value),
    /[a-zA-Z]/.test(value),
    /[^a-zA-Z0-9]/.test(value)
  ];
  if (types.filter(Boolean).length < 2) {
    return Promise.reject("密码需为数字、字母、符号任意两种组合");
  }
  return Promise.resolve();
};

const userFormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, validator: passwordValidator, trigger: "blur" }],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      validator: (rule, value) => {
        if (userFormInline.password !== value) {
          return Promise.reject("两次密码输入不一致");
        }
        return Promise.resolve();
      },
      trigger: "blur"
    }
  ]
};

function openDialog(title = "新增", row?: SysUser) {
  userFormInline.user_id = row?.user_id ?? null;
  userFormInline.username = row?.username ?? "";
  userFormInline.password = "";
  userFormInline.confirmPassword = "";
  userFormInline.nickname = row?.nickname ?? "";
  userFormInline.avatar = row?.avatar ?? "";
  userFormInline.status = row?.status ?? 1;
  userFormInline.fuma_id = row?.fuma_id ?? undefined;
  addDialog({
    title: `${title}用户`,
    width: "520px",
    draggable: true,
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: () =>
      h(
        resolveComponent("el-form"),
        {
          ref: userFormRef,
          model: userFormInline,
          rules: userFormRules,
          "label-width": "90px",
          style: "padding: 0 20px;"
        },
        {
          default: () => [
            h(
              resolveComponent("el-form-item"),
              { label: "用户名", prop: "username" },
              [
                h(resolveComponent("el-input"), {
                  modelValue: userFormInline.username,
                  "onUpdate:modelValue": val => (userFormInline.username = val),
                  placeholder: "请输入用户名",
                  disabled: !!row
                })
              ]
            ),
            !row &&
              h(
                resolveComponent("el-form-item"),
                { label: "密码", prop: "password" },
                [
                  h(resolveComponent("el-input"), {
                    modelValue: userFormInline.password,
                    "onUpdate:modelValue": val =>
                      (userFormInline.password = val),
                    placeholder: "请输入密码",
                    type: "password"
                  })
                ]
              ),
            !row &&
              h(
                resolveComponent("el-form-item"),
                { label: "确认密码", prop: "confirmPassword" },
                [
                  h(resolveComponent("el-input"), {
                    modelValue: userFormInline.confirmPassword,
                    "onUpdate:modelValue": val =>
                      (userFormInline.confirmPassword = val),
                    placeholder: "请再次输入密码",
                    type: "password"
                  })
                ]
              ),
            h(
              resolveComponent("el-form-item"),
              { label: "昵称", prop: "nickname" },
              [
                h(resolveComponent("el-input"), {
                  modelValue: userFormInline.nickname,
                  "onUpdate:modelValue": val => (userFormInline.nickname = val),
                  placeholder: "请输入昵称"
                })
              ]
            ),
            h(
              resolveComponent("el-form-item"),
              { label: "头像", prop: "avatar" },
              [
                h(resolveComponent("el-input"), {
                  modelValue: userFormInline.avatar,
                  "onUpdate:modelValue": val => (userFormInline.avatar = val),
                  placeholder: "请输入头像URL"
                })
              ]
            ),
            h(
              resolveComponent("el-form-item"),
              { label: "孚盟ID", prop: "fuma_id" },
              [
                h(resolveComponent("el-input"), {
                  modelValue: userFormInline.fuma_id,
                  "onUpdate:modelValue": val => (userFormInline.fuma_id = val),
                  placeholder: "请输入孚盟ID"
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
                    modelValue: userFormInline.status,
                    "onUpdate:modelValue": val => (userFormInline.status = val)
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
      await userFormRef.value?.validate?.();
      const { user_id, confirmPassword, ...formData } = userFormInline;
      try {
        if (user_id) {
          await updateUser(user_id, formData);
          ElMessage.success("修改成功");
        } else {
          await createUser(formData);
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
 * 删除用户
 */
async function handleDelete(row: SysUser) {
  try {
    await deleteUser(row.user_id);
    ElMessage.success("删除成功");
    onSearch();
  } catch (e) {
    ElMessage.error("删除失败");
  }
}

/**
 * 分配角色弹窗
 */
function openAssignRoles(row: SysUser) {
  let checked = ref<number[]>([]);
  let loading = ref(false);
  let roleList = ref<any[]>([]);
  // 获取角色列表
  getRoleList({ page: 1, page_size: 999 }).then(res => {
    roleList.value = res.data.list;
    // 当前用户已分配角色
    const userRoleNames = (row.roles || "")
      .split(",")
      .map(r => r.trim())
      .filter(Boolean);
    checked.value = roleList.value
      .filter(r => userRoleNames.includes(r.role_name))
      .map(r => r.id);
  });
  addDialog({
    title: `分配角色 - ${row.username}`,
    width: "400px",
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
        roleList.value.map(item =>
          h(
            resolveComponent("el-checkbox"),
            { key: item.id, label: item.id },
            { default: () => item.role_name }
          )
        )
      ),
    beforeSure: async done => {
      loading.value = true;
      try {
        await assignUserRoles(row.user_id, { role_ids: checked.value });
        ElMessage.success("分配角色成功");
        done();
        onSearch();
      } catch (e) {
        ElMessage.error("分配角色失败");
      } finally {
        loading.value = false;
      }
    }
  });
}

/**
 * 修改用户密码弹窗
 */
function openChangePassword(row: SysUser) {
  const pwdFormRef = ref();
  const pwdForm = reactive({
    new_password: "",
    confirmPassword: ""
  });
  const pwdRules = {
    new_password: [
      { required: true, validator: passwordValidator, trigger: "blur" }
    ],
    confirmPassword: [
      { required: true, message: "请再次输入新密码", trigger: "blur" },
      {
        validator: (rule, value) => {
          if (pwdForm.new_password !== value) {
            return Promise.reject("两次密码输入不一致");
          }
          return Promise.resolve();
        },
        trigger: "blur"
      }
    ]
  };
  addDialog({
    title: `修改密码 - ${row.username}`,
    width: "400px",
    draggable: true,
    fullscreenIcon: true,
    closeOnClickModal: false,
    contentRenderer: () =>
      h(
        resolveComponent("el-form"),
        {
          ref: pwdFormRef,
          model: pwdForm,
          rules: pwdRules,
          "label-width": "90px"
        },
        {
          default: () => [
            h(
              resolveComponent("el-form-item"),
              { label: "新密码", prop: "new_password" },
              [
                h(resolveComponent("el-input"), {
                  modelValue: pwdForm.new_password,
                  "onUpdate:modelValue": val => (pwdForm.new_password = val),
                  placeholder: "请输入新密码",
                  type: "password"
                })
              ]
            ),
            h(
              resolveComponent("el-form-item"),
              { label: "确认密码", prop: "confirmPassword" },
              [
                h(resolveComponent("el-input"), {
                  modelValue: pwdForm.confirmPassword,
                  "onUpdate:modelValue": val => (pwdForm.confirmPassword = val),
                  placeholder: "请再次输入新密码",
                  type: "password"
                })
              ]
            )
          ]
        }
      ),
    beforeSure: async done => {
      await nextTick();
      await pwdFormRef.value?.validate?.();
      try {
        await updateUserPassword(row.user_id, {
          new_password: pwdForm.new_password
        });
        ElMessage.success("密码修改成功");
        done();
      } catch (e) {
        ElMessage.error("密码修改失败");
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
          placeholder="用户名/昵称"
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
    <PureTableBar title="用户列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <Perms value="system:user:add">
          <button class="button2" @click="openDialog()">新增用户</button>
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
            <Perms value="system:user:edit">
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
            <Perms value="system:user:delete">
              <el-popconfirm
                :title="`是否确认删除用户名为 ${row.username} 的这条数据？`"
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
            <Perms value="system:user:assignRole">
              <el-button
                class="reset-margin"
                link
                type="warning"
                :size="size"
                @click="openAssignRoles(row)"
              >
                分配角色
              </el-button>
            </Perms>
            <Perms value="system:user:edit">
              <el-button
                class="reset-margin"
                link
                type="info"
                :size="size"
                @click="openChangePassword(row)"
              >
                修改密码
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
</style>
