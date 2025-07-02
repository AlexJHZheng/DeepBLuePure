<template>
  <div class="fuma-test-page">
    <el-card>
      <template #header>
        <span>孚盟测试 - 查询所有审核中（FlowExcOk=0）单据</span>
      </template>
      <el-button
        type="primary"
        :loading="loading"
        style="margin-bottom: 16px"
        @click="fetchData"
        >刷新</el-button
      >
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column prop="BillNo" label="单据编号" width="200" />
        <el-table-column prop="FlowName" label="流程名称" width="200" />
        <el-table-column prop="FlowExcOk" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.FlowExcOk === 0" type="warning">审核中</el-tag>
            <el-tag v-else type="success">已结束</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="CreateTime" label="创建时间" width="180" />
        <el-table-column prop="OwnerName" label="负责人" width="120" />
        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openFlowDialog(row)"
              >查看审核流</el-button
            >
            <el-button size="small" type="success" @click="openAuditDialog(row)"
              >审核</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="tableData.length === 0 && !loading"
        style="margin-top: 24px; color: #888; text-align: center"
      >
        暂无数据
      </div>
    </el-card>
    <!-- 审核流弹窗 -->
    <el-dialog
      v-model="flowDialog.visible"
      title="审核流节点"
      width="60%"
      :close-on-click-modal="false"
      @close="onFlowDialogClose"
    >
      <el-table
        v-loading="flowDialog.loading"
        :data="flowDialog.data"
        border
        style="width: 100%"
      >
        <el-table-column prop="FID" label="节点FID" width="180" />
        <el-table-column prop="EmpID" label="处理人ID" width="120" />
        <el-table-column prop="CNEmpName" label="处理人" width="120" />
        <el-table-column prop="BeginTime" label="开始时间" width="180" />
        <el-table-column prop="CurrStep" label="当前步骤" width="180" />
        <!-- 删除操作 -->
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="danger"
              :loading="flowDialog.deleteLoadingId === row.FID"
              @click="onDeleteNode(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="flowDialog.data.length === 0 && !flowDialog.loading"
        style="margin-top: 24px; color: #888; text-align: center"
      >
        暂无节点
      </div>
    </el-dialog>
    <!-- 审核弹窗 -->
    <el-dialog
      v-model="auditDialog.visible"
      title="审核操作"
      width="400px"
      :close-on-click-modal="false"
      @close="onAuditDialogClose"
    >
      <el-form :model="auditDialog.form">
        <el-form-item label="审核意见" required>
          <el-input
            v-model="auditDialog.form.notice"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          type="success"
          :loading="auditDialog.loading"
          @click="onAudit(1)"
          >通过</el-button
        >
        <el-button
          type="danger"
          :loading="auditDialog.loading"
          @click="onAudit(2)"
          >驳回</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from "vue";
import { queryExc, queryExcEmp, deleteExcEmp, auditOrder } from "@/api/fuma";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";

/**
 * 孚盟测试页面
 * 查询并展示所有 FlowExcOk=0（审核中）的 saExc 单据
 * 支持查看审核流节点及删除节点
 */
export default defineComponent({
  name: "FumaTest",
  setup() {
    const tableData = ref<any[]>([]);
    const loading = ref(false);

    // 审核流弹窗状态
    const flowDialog = reactive({
      visible: false,
      loading: false,
      data: [] as any[],
      excFid: undefined as string | undefined,
      deleteLoadingId: undefined as string | undefined
    });

    // 审核弹窗状态
    const auditDialog = reactive({
      visible: false,
      loading: false,
      row: null as any,
      form: { notice: "" }
    });

    // 获取当前用户 fuma_id
    const userStore = useUserStoreHook();
    const fumaId = computed(() => {
      return (
        (userStore as any).fuma_id ??
        (storageLocal().getItem(userKey) as any)?.fuma_id ??
        undefined
      );
    });

    /**
     * 查询所有审核中单据
     */
    const fetchData = async () => {
      loading.value = true;
      try {
        const { data, code, msg } = await queryExc({
          FlowExcOk: 0,
          pass: "itblue21"
        });
        if (code === 200) {
          tableData.value = data;
        } else {
          tableData.value = [];
          ElMessage.error(msg || "查询失败");
        }
      } catch (e) {
        tableData.value = [];
        ElMessage.error("接口请求失败");
      } finally {
        loading.value = false;
      }
    };

    /**
     * 打开审核流弹窗并查询节点
     */
    const openFlowDialog = async (row: any) => {
      flowDialog.visible = true;
      flowDialog.loading = true;
      flowDialog.data = [];
      flowDialog.excFid = row.ExcFID;
      try {
        const { data, code, msg } = await queryExcEmp({
          ExcFID: row.FID,
          pass: "itblue21"
        });
        if (code === 200) {
          flowDialog.data = data;
        } else {
          flowDialog.data = [];
          ElMessage.error(msg || "查询审核流失败");
        }
      } catch (e) {
        flowDialog.data = [];
        ElMessage.error("接口请求失败");
      } finally {
        flowDialog.loading = false;
      }
    };

    /**
     * 删除审核流节点
     */
    const onDeleteNode = (row: any) => {
      ElMessageBox.confirm("确定要删除该节点吗？", "提示", { type: "warning" })
        .then(async () => {
          flowDialog.deleteLoadingId = row.FID;
          try {
            const { code, msg } = await deleteExcEmp({
              FID: row.FID,
              pass: "itblue21"
            });
            if (code === 200) {
              ElMessage.success("删除成功");
              // 删除后刷新节点列表
              if (flowDialog.excFid) {
                const { data, code: qCode } = await queryExcEmp({
                  ExcFID: flowDialog.excFid,
                  pass: "itblue21"
                });
                if (qCode === 200) flowDialog.data = data;
                else flowDialog.data = [];
              }
            } else {
              ElMessage.error(msg || "删除失败");
            }
          } catch (e) {
            ElMessage.error("接口请求失败");
          } finally {
            flowDialog.deleteLoadingId = undefined;
          }
        })
        .catch(() => {});
    };

    /**
     * 关闭弹窗时清空数据
     */
    const onFlowDialogClose = () => {
      flowDialog.data = [];
      flowDialog.excFid = undefined;
      flowDialog.deleteLoadingId = undefined;
    };

    /**
     * 打开审核弹窗
     */
    const openAuditDialog = (row: any) => {
      auditDialog.visible = true;
      auditDialog.row = row;
      auditDialog.form.notice = "";
    };

    /**
     * 审核操作
     * @param empAction 1=通过，2=驳回
     */
    const onAudit = async (empAction: number) => {
      if (!auditDialog.row) return;
      if (!auditDialog.form.notice.trim()) {
        ElMessage.warning("请填写审核意见");
        return;
      }
      const loginEmpId = fumaId.value;
      if (!loginEmpId) {
        ElMessage.error("未获取到当前用户fuma_id，无法审核");
        return;
      }
      auditDialog.loading = true;
      try {
        await auditOrder({
          FID: auditDialog.row.ExcEmpFID,
          EmpAction: empAction,
          Notice: auditDialog.form.notice,
          LoginEmpID: loginEmpId,
          pass: "itblue21"
        });
        ElMessage.success(empAction === 1 ? "审核通过成功" : "已驳回");
        auditDialog.visible = false;
        auditDialog.form.notice = "";
        // 刷新主表
        fetchData();
      } catch (e) {
        ElMessage.error("操作失败");
      } finally {
        auditDialog.loading = false;
      }
    };

    /**
     * 关闭审核弹窗时清空数据
     */
    const onAuditDialogClose = () => {
      auditDialog.row = null;
      auditDialog.form.notice = "";
      auditDialog.loading = false;
    };

    // 页面加载自动查询
    fetchData();

    return {
      tableData,
      loading,
      fetchData,
      flowDialog,
      openFlowDialog,
      onDeleteNode,
      onFlowDialogClose,
      auditDialog,
      openAuditDialog,
      onAudit,
      onAuditDialogClose,
      fumaId,
      userStore
    };
  }
});
</script>

<style scoped>
.fuma-test-page {
  padding: 24px;
}
</style>
