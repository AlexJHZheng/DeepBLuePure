import { ref, reactive, onMounted, h } from "vue";
import { ElMessage } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import { http } from "@/utils/http";

// API
const getPermissionList = params => {
  return http.request("get", "/api/permissions", { params });
};
const createPermission = data => {
  return http.request("post", "/api/permissions", { data });
};
const updatePermission = (id, data) => {
  return http.request("put", `/api/permissions/${id}`, { data });
};
const deletePermission = id => {
  return http.request("delete", `/api/permissions/${id}`);
};

// 表单内容组件
const FormContent = {
  props: {
    formInline: {
      type: Object,
      default: () => ({})
    }
  },
  render() {
    return h("el-form", { model: this.formInline, labelWidth: "80px" }, [
      h(
        "el-form-item",
        { label: "权限名称", prop: "permission_name" },
        h("el-input", {
          modelValue: this.formInline.permission_name,
          "onUpdate:modelValue": val => (this.formInline.permission_name = val),
          placeholder: "请输入权限名称"
        })
      ),
      h(
        "el-form-item",
        { label: "权限标识", prop: "permission_key" },
        h("el-input", {
          modelValue: this.formInline.permission_key,
          "onUpdate:modelValue": val => (this.formInline.permission_key = val),
          placeholder: "请输入权限标识"
        })
      ),
      !this.formInline.id
        ? h(
            "el-form-item",
            { label: "关联菜单ID", prop: "menu_id" },
            h("el-input-number", {
              modelValue: this.formInline.menu_id,
              "onUpdate:modelValue": val => (this.formInline.menu_id = val),
              min: 1,
              placeholder: "请输入关联菜单ID"
            })
          )
        : null,
      h(
        "el-form-item",
        { label: "状态", prop: "status" },
        h(
          "el-radio-group",
          {
            modelValue: this.formInline.status,
            "onUpdate:modelValue": val => (this.formInline.status = val)
          },
          () => [
            h("el-radio", { label: 1 }, () => "正常"),
            h("el-radio", { label: 0 }, () => "禁用")
          ]
        )
      )
    ]);
  }
};

export function usePermission() {
  const loading = ref(true);
  const dataList = ref([]);
  const searchFormParams = reactive({
    permission_name: "",
    permission_key: ""
  });

  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    onPageSizeChange: size => {
      pagination.pageSize = size;
      onSearch();
    },
    onCurrentChange: page => {
      pagination.currentPage = page;
      onSearch();
    }
  });

  const columns = [
    { label: "权限名称", prop: "permission_name" },
    { label: "权限标识", prop: "permission_key" },
    { label: "关联菜单", prop: "menu_name" },
    {
      label: "状态",
      prop: "status",
      cellRenderer: ({ row }) => (row.status === 1 ? "正常" : "禁用")
    },
    { label: "创建时间", prop: "create_time" },
    { label: "操作", fixed: "right", width: 210, slot: "operation" }
  ];

  function onSearch() {
    loading.value = true;
    getPermissionList({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ...searchFormParams
    })
      .then(res => {
        if (res.code === 200) {
          dataList.value = res.data.list;
          pagination.total = res.data.pagination.total;
        } else {
          ElMessage.error(res.message || "获取权限列表失败");
        }
      })
      .catch(() => {
        ElMessage.error("获取权限列表失败");
      })
      .finally(() => {
        loading.value = false;
      });
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row) {
    addDialog({
      title: `${title}权限`,
      props: {
        formInline: {
          id: row?.id ?? null,
          permission_name: row?.permission_name ?? "",
          permission_key: row?.permission_key ?? "",
          menu_id: row?.menu_id ?? null,
          status: row?.status ?? 1
        }
      },
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: ({ options }) => h(FormContent, options.props),
      beforeSure: (done, { options }) => {
        const curForm = options.props.formInline;
        const { id, permission_name, permission_key, menu_id, status } =
          curForm;

        if (id) {
          updatePermission(id, { permission_name, permission_key, status })
            .then(res => {
              if (res.code === 200) {
                ElMessage.success("修改成功");
                done();
                onSearch();
              } else {
                ElMessage.error(res.message || "修改失败");
              }
            })
            .catch(() => ElMessage.error("修改失败"));
        } else {
          createPermission({ permission_name, permission_key, menu_id })
            .then(res => {
              if (res.code === 200) {
                ElMessage.success("新增成功");
                done();
                onSearch();
              } else {
                ElMessage.error(res.message || "新增失败");
              }
            })
            .catch(() => ElMessage.error("新增失败"));
        }
      }
    });
  }

  function handleDelete(row) {
    deletePermission(row.id)
      .then(res => {
        if (res.code === 200) {
          ElMessage.success("删除成功");
          onSearch();
        } else {
          ElMessage.error(res.message || "删除失败");
        }
      })
      .catch(() => ElMessage.error("删除失败"));
  }

  onMounted(() => {
    onSearch();
  });

  return {
    loading,
    columns,
    dataList,
    pagination,
    searchFormParams,
    onSearch,
    resetForm,
    openDialog,
    handleDelete
  };
}
