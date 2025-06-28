<template>
  <div class="fuma-page">
    <!-- 测试区域：显示当前用户 fuma_id -->
    <el-card class="mb-16 fuma-test">
      <template #header>
        <span>测试：当前用户 fuma_id</span>
      </template>
      <div>fuma_id: {{ fumaId ?? "未获取" }}</div>
    </el-card>
    <!-- 多选处理人区域（使用 el-checkbox-group） -->
    <el-card class="mb-16">
      <template #header>
        <span>选择处理人</span>
      </template>
      <!-- 多选复选框，支持选择多个处理人 -->
      <el-checkbox-group v-model="selectedEmpIds">
        <el-checkbox
          v-for="item in empOptions"
          :key="item.value"
          :label="item.value"
          border
        >
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-card>
    <!-- Fuma 审核订单列表页面 -->
    <el-card>
      <template #header>
        <span>FUMA 审核订单列表</span>
      </template>
      <!-- 表格展示数据 -->
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="FID" label="主键(FID)" width="180" />
        <el-table-column prop="BillNo" label="单据编号" width="180" />
        <el-table-column prop="CNEmpName" label="当前处理人" width="120" />
        <el-table-column prop="BeginTime" label="开始时间" width="180" />
        <el-table-column prop="FlowName" label="流程名称" />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";

/**
 * Fuma 页面
 * 展示 FUMA 审核订单的表格数据
 * 上方添加处理人多选区域（el-checkbox-group）
 * 新增：测试区域显示当前用户 fuma_id
 */
export default defineComponent({
  name: "Fuma",
  setup() {
    // 通过 Pinia 获取当前用户信息
    const userStore = useUserStoreHook();
    // 兼容 userStore 里没有 fuma_id 字段的情况，从本地 user-info 读取
    const fumaId = computed(() => {
      return (
        (userStore as any).fuma_id ??
        (storageLocal().getItem(userKey) as any)?.fuma_id ??
        "未获取"
      );
    });

    // 多选复选框选项
    const empOptions = [
      { label: "张三", value: "10001" },
      { label: "李四", value: "10002" },
      { label: "王五", value: "10003" }
    ];
    // 选中的处理人ID
    const selectedEmpIds = ref<string[]>([]);

    // 模拟表格数据
    const tableData = ref([
      {
        FID: "FID001",
        BillNo: "PO20240601",
        CNEmpName: "张三",
        BeginTime: "2024-06-01 10:00:00",
        FlowName: "采购合同审批"
      },
      {
        FID: "FID002",
        BillNo: "PO20240602",
        CNEmpName: "李四",
        BeginTime: "2024-06-02 11:20:00",
        FlowName: "采购合同审批"
      }
    ]);

    return {
      fumaId,
      userStore,
      empOptions,
      selectedEmpIds,
      tableData
    };
  }
});
</script>

<style scoped>
.fuma-page {
  padding: 24px;
}

.mb-16 {
  margin-bottom: 16px;
}

.fuma-test {
  background: #f8f8ff;
}
</style>
