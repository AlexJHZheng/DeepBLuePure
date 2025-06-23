import { ref, reactive, onMounted, h, defineComponent } from "vue";
import { ElMessage } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import {
  getPermissionList,
  createPermission,
  updatePermission,
  deletePermission
} from "@/api/permission";
import type { Permission } from "@/api/permission";

const FormContent = defineComponent({
  props: {
    formInline: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    return () => (
      <el-form model={props.formInline} label-width="80px">
        <el-form-item label="权限名称" prop="permission_name">
          <el-input
            v-model={props.formInline.permission_name}
            placeholder="请输入权限名称"
          />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission_key">
          <el-input
            v-model={props.formInline.permission_key}
            placeholder="请输入权限标识"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model={props.formInline.status}>
            <el-radio label={1}>正常</el-radio>
            <el-radio label={0}>禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    );
  }
});

export function usePermission() {
  const loading = ref(true);
  const dataList = ref<Permission[]>([]);

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

  const columns: TableColumnList = [
    { label: "权限ID", prop: "id" },
    { label: "权限名称", prop: "permission_name" },
    { label: "权限标识", prop: "permission_key" },
    {
      label: "状态",
      prop: "status",
      cellRenderer: ({ row }) => (row.status === 1 ? "正常" : "禁用")
    },
    {
      label: "创建时间",
      prop: "create_time",
      formatter: ({ create_time }) => create_time.slice(0, 10)
    },
    { label: "操作", fixed: "right", width: 180, slot: "operation" }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getPermissionList({
        page: pagination.currentPage,
        page_size: pagination.pageSize
      });
      dataList.value = data.list;
      pagination.total = data.pagination.total;
    } catch (e) {
      console.error(e);
      ElMessage.error("获取权限列表失败");
    } finally {
      loading.value = false;
    }
  }

  function openDialog(title = "新增", row?: Permission) {
    addDialog({
      title: `${title}权限`,
      props: {
        formInline: {
          id: row?.id ?? null,
          permission_name: row?.permission_name ?? "",
          permission_key: row?.permission_key ?? "",
          menu_id: null,
          status: row?.status ?? 1
        }
      },
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: ({ options }) => h(FormContent, options.props),
      beforeSure: async (done, { options }) => {
        const curForm = options.props.formInline;
        const { id, permission_name, permission_key, menu_id, status } =
          curForm;

        try {
          if (id) {
            await updatePermission(id, {
              permission_name,
              permission_key,
              status
            });
            ElMessage.success("修改成功");
          } else {
            await createPermission({
              permission_name,
              permission_key,
              menu_id
            });
            ElMessage.success("新增成功");
          }
          done();
          onSearch();
        } catch (e) {
          console.error(e);
          ElMessage.error("操作失败");
        }
      }
    });
  }

  async function handleDelete(row: Permission) {
    try {
      await deletePermission(row.id);
      ElMessage.success("删除成功");
      onSearch();
    } catch (e) {
      console.error(e);
      ElMessage.error("删除失败");
    }
  }

  onMounted(() => {
    onSearch();
  });

  return {
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    openDialog,
    handleDelete
  };
}
