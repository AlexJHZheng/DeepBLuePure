<script setup lang="ts">
/**
 * 产品分析页面
 * 用于展示和分析产品相关数据，支持分页、搜索等功能。
 * 遵循 pure-admin 规范。
 */
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { PureTableBar } from "@/components/RePureTableBar";
import Refresh from "@iconify-icons/ep/refresh";
import {
  getAnalyzeProductList,
  type AnalyzeProductItem,
  type AnalyzeProductListResult
} from "@/api/analyzeProduct";

// 表格数据与分页
const loading = ref(true);
const dataList = ref<AnalyzeProductItem[]>([]);
const pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  onPageSizeChange: (size: number) => {
    pagination.pageSize = size;
    fetchList();
  },
  onCurrentChange: (page: number) => {
    pagination.currentPage = page;
    fetchList();
  }
});

// 搜索表单
const searchForm = reactive({
  analysis_month: "",
  category: "",
  itemNo: ""
});

// 表格列定义
const columns = [
  // { label: "分析ID", prop: "analyze_id" },
  { label: "商品编号", prop: "ItemNo" },
  { label: "分析月份", prop: "analysis_month" },
  { label: "品类", prop: "category" },
  { label: "分析结果", prop: "analysis_result" },
  { label: "跟踪结果", prop: "tracking_result" },
  { label: "剩余库存", prop: "RemainingStock" },
  { label: "平均销量", prop: "averageSales" },
  { label: "销售月份", prop: "saleMonth" },
  { label: "库存数量", prop: "stockQty" },
  { label: "跟踪销售月", prop: "track_saleMonth" },
  { label: "在途总数", prop: "inTransitTotal" },
  // { label: "是否加急", prop: "is_urgent" },
  { label: "创建时间", prop: "createTime" }
  // { label: "更新时间", prop: "updateTime" }
];

/**
 * 获取分析数据列表
 */
async function fetchList() {
  loading.value = true;
  try {
    const { data } = await getAnalyzeProductList({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      analysis_month: searchForm.analysis_month || undefined,
      category: searchForm.category || undefined,
      itemNo: searchForm.itemNo || undefined
    });
    dataList.value = data.list;
    pagination.total = data.pagination.total;
  } catch (e) {
    ElMessage.error("获取分析数据失败");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="analyze-page">
    <el-form :inline="true" class="search-form" @submit.prevent>
      <el-form-item label="分析月份">
        <el-input
          v-model="searchForm.analysis_month"
          placeholder="如 2024-06"
          clearable
        />
      </el-form-item>
      <el-form-item label="品类">
        <el-input
          v-model="searchForm.category"
          placeholder="请输入品类"
          clearable
        />
      </el-form-item>
      <el-form-item label="商品编号">
        <el-input
          v-model="searchForm.itemNo"
          placeholder="请输入商品编号"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Refresh" @click="fetchList"
          >查询</el-button
        >
      </el-form-item>
    </el-form>
    <PureTableBar title="产品分析" :columns="columns" @refresh="fetchList">
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
        />
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped>
.analyze-page {
  padding: 24px;
}
</style>
