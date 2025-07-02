<template>
  <div class="fuma-page">
    <!-- 测试区域：显示当前用户 fuma_id -->
    <!-- <el-card class="mb-16 fuma-test">
      <template #header>
        <span>测试：当前用户 fuma_id</span>
      </template>
      <div>fuma_id: {{ fumaId ?? "未获取" }}</div>
    </el-card> -->
    <!-- 多选处理人区域（使用 el-checkbox-group） -->
    <!-- <el-card class="mb-16">
      <template #header>
        <span>选择处理人</span>
      </template> -->
    <!-- 多选复选框，支持选择多个处理人 -->
    <!-- <el-checkbox-group v-model="selectedEmpIds">
        <el-checkbox
          v-for="item in empOptions"
          :key="item.value"
          :label="item.value"
          border
        >
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-card> -->
    <!-- Fuma 审核订单列表页面 -->
    <el-card>
      <template #header>
        <span>孚盟FUMA 审核订单列表</span>
      </template>
      <!-- 表格展示数据 -->
      <el-table
        border
        :data="tableData"
        style="width: 100%"
        :loading="loading"
        :header-cell-style="{ background: '#1976d2', color: '#fff' }"
      >
        <el-table-column prop="FlowName" label="流程名称" width="240" />
        <el-table-column prop="BillNo" label="单据编号" width="280" />
        <!-- 开始时间改成年月日分时的中文形态，slot 强制格式化 -->
        <el-table-column prop="BeginTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatBeginTime(null, null, row.BeginTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="CurrStepName" label="当前步骤" width="200" />
        <el-table-column prop="CNEmpName" label="当前处理人" width="120" />
        <!-- 操作列 -->
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="large" type="text" @click="openDetail(row)"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px; text-align: right">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :total="pagination.total"
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="handlePageChange"
          @size-change="handlePageSizeChange"
        />
      </div>
    </el-card>
    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="订单详情"
      width="80%"
      :close-on-click-modal="false"
    >
      <template v-if="detailDialog.loading">
        <el-skeleton rows="4" animated />
      </template>
      <template v-else-if="detailDialog.data">
        <div style="margin-bottom: 8px">
          <b>类型：</b>{{ detailDialog.data.type }}
          <b style="margin-left: 24px">流程：</b
          >{{ detailDialog.data.flowName }}
          <b style="margin-left: 24px">单号：</b>{{ detailDialog.data.billNo }}
        </div>
        <!-- poPO 类型 -->
        <template v-if="detailDialog.data.type === 'poPO'">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="FID">{{
              detailDialog.data.detail.FID
            }}</el-descriptions-item>
            <el-descriptions-item label="PONo">{{
              detailDialog.data.detail.PONo
            }}</el-descriptions-item>
            <el-descriptions-item label="创建日期">{{
              formatDate(detailDialog.data.detail.CreateDate)
            }}</el-descriptions-item>
            <el-descriptions-item label="海外业务员">{{
              detailDialog.data.detail.SaleName
            }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{
              detailDialog.data.detail.DeptName
            }}</el-descriptions-item>
            <el-descriptions-item label="总数量">{{
              detailDialog.data.detail.TotProdQty
            }}</el-descriptions-item>
            <el-descriptions-item label="总金额">{{
              detailDialog.data.detail.TotProdAmt
            }}</el-descriptions-item>
            <el-descriptions-item label="供应商">{{
              detailDialog.data.detail.BName
            }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{
              detailDialog.data.detail.OwnerName
            }}</el-descriptions-item>
          </el-descriptions>
          <div style="margin: 12px 0 4px"><b>产品明细：</b></div>
          <el-table
            :data="detailDialog.data.detail.productList || []"
            size="small"
            style="width: 100%"
            :header-cell-style="{ background: '#43a047', color: '#fff' }"
            border
          >
            <el-table-column label="操作" fixed="left" width="80">
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="primary"
                  @click="onProductView(row)"
                  >查看</el-button
                >
              </template>
            </el-table-column>
            <el-table-column prop="ItemNo" label="商品编号" fixed="left" />
            <el-table-column prop="Item_E_Name" label="产品外文名" width="300">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, row.Item_E_Name)"
                  @mouseleave="hideTooltip"
                  >{{ row.Item_E_Name }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="Item_E_Spec" label="产品类别" width="120">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, row.Item_E_Spec)"
                  @mouseleave="hideTooltip"
                  >{{ row.Item_E_Spec }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="Brand" label="品牌" width="120">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, row.Brand)"
                  @mouseleave="hideTooltip"
                  >{{ row.Brand }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="BPurQty" label="采购数量" width="70">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, String(row.BPurQty))"
                  @mouseleave="hideTooltip"
                  >{{ Number(row.BPurQty) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="UnitBoxQty" label="装箱数" width="60">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, String(row.UnitBoxQty))"
                  @mouseleave="hideTooltip"
                  >{{ Number(row.UnitBoxQty) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="BoxQty" label="箱数" width="50">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, String(row.BoxQty))"
                  @mouseleave="hideTooltip"
                  >{{ Number(row.BoxQty) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="FinishDate" label="交货期" width="120">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, row.FinishDate)"
                  @mouseleave="hideTooltip"
                  >{{ formatDate(row.FinishDate) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="DtCustomField1" label="交货期描述">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, row.DtCustomField1)"
                  @mouseleave="hideTooltip"
                  >{{ row.DtCustomField1 }}</span
                >
              </template>
            </el-table-column>

            <el-table-column prop="BPurPrice" label="采购单价" width="70">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, row.BPurPrice)"
                  @mouseleave="hideTooltip"
                  >{{ row.BPurPrice }}</span
                >
              </template>
            </el-table-column>
            <el-table-column prop="ManufNote" label="生产要求" width="200">
              <template #default="{ row }">
                <span
                  class="ellipsis-cell"
                  @mouseenter="showTooltip($event, row.ManufNote)"
                  @mouseleave="hideTooltip"
                  >{{ row.ManufNote }}</span
                >
              </template>
            </el-table-column>
          </el-table>
        </template>
        <!-- bpProducts 类型 -->
        <template v-else-if="detailDialog.data.type === 'bpProducts'">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="商品编号">{{
              detailDialog.data.detail.ItemNo
            }}</el-descriptions-item>
            <el-descriptions-item label="英文名">{{
              detailDialog.data.detail.Item_E_Name
            }}</el-descriptions-item>
            <el-descriptions-item label="产品类别">{{
              detailDialog.data.detail.Item_E_Spec
            }}</el-descriptions-item>
            <el-descriptions-item label="装箱数">{{
              detailDialog.data.detail.UnitBoxQty
            }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{
              detailDialog.data.detail.OwnerName
            }}</el-descriptions-item>
            <el-descriptions-item label="创建日期">{{
              formatDate(detailDialog.data.detail.CreateDate)
            }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{
              detailDialog.data.detail.FLD002
            }}</el-descriptions-item>
            <el-descriptions-item label="供应商">{{
              detailDialog.data.detail.FLD003
            }}</el-descriptions-item>
          </el-descriptions>
          <div
            v-if="bpProductImg"
            style="display: flex; justify-content: center; margin-top: 12px"
          >
            <el-card
              style="
                display: inline-block;
                text-align: center;
                box-shadow: 0 2px 8px #f0f1f2;
              "
              :body-style="{ padding: '0px' }"
            >
              <el-image
                :src="bpProductImg"
                style="
                  max-width: 180px;
                  max-height: 180px;
                  cursor: pointer;
                  border: 1px solid #eee;
                "
                :preview-src-list="[bpProductImg]"
                :initial-index="0"
                fit="contain"
                preview-teleported
              />
              <div style="padding: 14px">
                <div class="bottom clearfix">
                  <span>点击查看大图</span>
                </div>
              </div>
            </el-card>
          </div>
        </template>
        <template v-else>
          <div>未知类型</div>
        </template>
        <!-- 审核操作区域 -->
        <div style="margin-top: 18px">
          <!-- 快捷选项 -->
          <div style="margin-bottom: 6px">
            <el-tag
              style="margin-right: 8px; cursor: pointer"
              type="success"
              @click="auditForm.notice = '同意'"
              >通过</el-tag
            >
            <el-tag
              style="cursor: pointer"
              type="danger"
              @click="auditForm.notice = '不同意'"
              >不通过</el-tag
            >
          </div>
          <el-input
            v-model="auditForm.notice"
            type="textarea"
            :rows="2"
            placeholder="请输入审核意见（必填）"
            maxlength="200"
            show-word-limit
            style="margin-bottom: 12px"
          />
          <el-button
            type="success"
            :loading="auditForm.loading"
            @click="handleAudit(1)"
            >通过</el-button
          >
          <el-button
            type="danger"
            :loading="auditForm.loading"
            @click="handleAudit(2)"
            >驳回</el-button
          >
        </div>
      </template>
      <template v-else>
        <div>暂无数据</div>
      </template>
    </el-dialog>
    <!-- 产品详情弹窗 -->
    <el-dialog
      v-model="productDetailDialog.visible"
      title="产品详情"
      width="60%"
      :close-on-click-modal="false"
    >
      <template v-if="productDetailDialog.loading">
        <el-skeleton rows="4" animated />
      </template>
      <template v-else-if="productDetailDialog.data">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="产品编码">{{
            productDetailDialog.data.product_id
          }}</el-descriptions-item>
          <el-descriptions-item
            v-if="productDetailDialog.purQty !== undefined"
            label="采购数量"
            >{{ productDetailDialog.purQty }}</el-descriptions-item
          >
          <el-descriptions-item label="分类">{{
            productDetailDialog.data.category
          }}</el-descriptions-item>
          <el-descriptions-item label="产品名称" :span="3">{{
            productDetailDialog.data.product_name
          }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{
            productDetailDialog.data.area
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{
            productDetailDialog.data.status
          }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">{{
            productDetailDialog.data.current_stock
          }}</el-descriptions-item>
          <el-descriptions-item label="装箱数">{{
            productDetailDialog.data.pack
          }}</el-descriptions-item>
          <el-descriptions-item label="售价">{{
            productDetailDialog.data.price
          }}</el-descriptions-item>
          <el-descriptions-item label="成本价">{{
            productDetailDialog.data.cost
          }}</el-descriptions-item>
          <el-descriptions-item label="余货">{{
            productDetailDialog.data.remaining_stock
          }}</el-descriptions-item>
          <el-descriptions-item label="平均月销售">{{
            productDetailDialog.data.avg_month_sales
          }}</el-descriptions-item>
          <el-descriptions-item label="可售月数">{{
            productDetailDialog.data.can_sale_month
          }}</el-descriptions-item>
        </el-descriptions>
        <!-- 最近两次分析及打分表格 -->
        <div style="margin: 18px 0 8px; font-weight: bold">
          最近两次分析及打分
        </div>
        <el-table
          :data="productDetailDialog.data.analyze_results || []"
          size="small"
          border
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column prop="analysis_month" label="分析月份" width="120" />
          <el-table-column
            prop="analysis_result"
            label="分析结果"
            width="120"
          />
          <el-table-column
            prop="analysis_result_point"
            label="分析得分"
            width="100"
          />
          <el-table-column prop="averageSales" label="平均销量" width="100" />
          <!-- 可根据实际接口返回补充更多字段 -->
        </el-table>
        <!-- 最近12个月销售情况横向表格 -->
        <div style="margin: 18px 0 8px; font-weight: bold">
          最近12个月销售情况
        </div>
        <el-table
          :data="sales12MonthsRow"
          size="small"
          border
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column
            v-for="(month, idx) in sales12MonthsHeader"
            :key="month"
            :prop="month"
            :label="month"
            width="68"
          >
            <template #default="scope">
              {{
                scope.row.sales_12_months ? scope.row.sales_12_months[idx] : 0
              }}
            </template>
          </el-table-column>
        </el-table>
        <!-- 未来6个月预测表格 -->
        <div style="margin: 18px 0 8px; font-weight: bold">未来6个月预测</div>
        <el-table
          :data="forecast6MonthsMatrix"
          size="small"
          border
          style="width: 100%"
        >
          <el-table-column prop="field" label="字段/月份" width="110" fixed />
          <el-table-column
            v-for="month in forecast6MonthsHeader"
            :key="month"
            :prop="month"
            :label="month"
            width="100"
          />
        </el-table>
        <div style="margin: 18px 0 8px; font-weight: bold">在途信息</div>
        <el-table
          :data="productDetailDialog.data.in_transit || []"
          size="small"
          border
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column prop="ItemNo" label="商品编号" width="120" />
          <el-table-column prop="ShipQty" label="发货数量" width="100" />
          <el-table-column prop="CreateDate" label="创建日期" width="140" />
          <el-table-column prop="DGSJ" label="到港时间" width="140" />
        </el-table>
      </template>
      <template v-else>
        <div>暂无数据</div>
      </template>
    </el-dialog>
    <div
      v-if="tooltip.visible"
      class="custom-tooltip"
      :style="{ left: tooltip.left + 'px', top: tooltip.top + 'px' }"
    >
      {{ tooltip.content }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from "vue";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";
import {
  getPendingOrders,
  type FumaOrderRecord,
  getOrderDetail,
  auditOrder
} from "@/api/fuma";
import { ElMessage } from "element-plus";
import { getProductDetail } from "@/api/analyzeProduct";

/**
 * Fuma 页面
 * 展示 FUMA 审核订单的表格数据
 * 上方添加处理人多选区域（el-checkbox-group）
 * 新增：测试区域显示当前用户 fuma_id
 * 新增：接入 FUMA 审核订单接口，默认用 fuma_id 查询
 */
export default defineComponent({
  name: "Fuma",
  setup() {
    // 通过 Pinia 获取当前用户信息
    const userStore = useUserStoreHook();
    // fuma_id 兼容 userStore 和本地 user-info
    const fumaId = computed(() => {
      return (
        (userStore as any).fuma_id ??
        (storageLocal().getItem(userKey) as any)?.fuma_id ??
        undefined
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

    // FUMA 审核订单表格数据
    const tableData = ref<FumaOrderRecord[]>([]);
    // 分页信息
    const pagination = ref({
      total: 0,
      page: 1,
      pageSize: 10
    });
    // 加载状态
    const loading = ref(false);

    // 详情弹窗状态
    const detailDialog = ref({
      visible: false,
      loading: false,
      data: null as null | any,
      mainFID: undefined as string | undefined // 记录主表FID
    });

    // 审核表单状态
    const auditForm = ref({
      notice: "",
      loading: false
    });

    // bpProducts 图片 base64
    const bpProductImg = computed(() => {
      const detail = detailDialog.value.data?.detail;
      if (
        detailDialog.value.data?.type === "bpProducts" &&
        detail?.mSmallPic &&
        Array.isArray(detail.mSmallPic.data)
      ) {
        const uint8Arr = new Uint8Array(detail.mSmallPic.data);
        // 尝试用 Blob 生成 URL
        try {
          const blob = new Blob([uint8Arr], { type: "image/jpeg" });
          return URL.createObjectURL(blob);
        } catch {
          // 兼容性兜底：转 base64
          let binary = "";
          uint8Arr.forEach(byte => (binary += String.fromCharCode(byte)));
          return "data:image/jpeg;base64," + btoa(binary);
        }
      }
      return "";
    });

    // 自定义 tooltip 逻辑，黑底白字，内容溢出即弹
    const tooltip = reactive({
      visible: false,
      content: "",
      left: 0,
      top: 0
    });
    function showTooltip(event: MouseEvent, content: string) {
      const el = event.target as HTMLElement;
      if (el.scrollWidth > el.offsetWidth) {
        tooltip.visible = true;
        tooltip.content = content;
        tooltip.left = event.clientX + 10;
        tooltip.top = event.clientY - 30;
      }
    }
    function hideTooltip() {
      tooltip.visible = false;
    }

    // 产品详情弹窗状态
    const productDetailDialog = ref({
      visible: false,
      loading: false,
      data: null as any,
      purQty: undefined as number | undefined // 新增采购数量字段
    });

    // 计算最近12个月的月份（表头）
    const sales12MonthsHeader = computed(() => {
      const arr: string[] = [];
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        arr.push(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        );
      }
      return arr;
    });
    // 计算表格数据（只有一行，内容为销售数量数组）
    const sales12MonthsRow = computed(() => {
      const arr = productDetailDialog.value.data?.sales_12_months || [];
      return [{ sales_12_months: arr }];
    });

    // 预测字段列表
    const forecastFields = [
      { key: "predicted_sales", label: "预测销量" },
      { key: "opening_stock", label: "期初库存" },
      { key: "closing_stock", label: "期末库存" },
      { key: "ship_order", label: "发货单" },
      { key: "purchase_order", label: "采购单" },
      { key: "in_transit_arrivals", label: "在途到货" },
      { key: "remaining_stock_after", label: "期末余货" }
    ];
    // 生成多行横向表格数据（确保每行都包含所有月份 key）
    const forecast6MonthsHeader = computed(() => {
      const arr = productDetailDialog.value.data?.forecast_6_months || [];
      return arr.map((item, idx) => item?.forecast_month || `M${idx + 1}`);
    });
    const forecast6MonthsMatrix = computed(() => {
      const arr = productDetailDialog.value.data?.forecast_6_months || [];
      return forecastFields.map(field => {
        const row: Record<string, any> = { field: field.label };
        forecast6MonthsHeader.value.forEach((month, idx) => {
          row[month] = arr[idx]?.[field.key] ?? "";
        });
        return row;
      });
    });
    console.log("forecast6MonthsHeader", forecast6MonthsHeader.value);
    console.log("forecast6MonthsMatrix", forecast6MonthsMatrix.value);

    /**
     * 获取 FUMA 审核订单列表
     * 默认用当前用户 fuma_id 查询
     */
    const fetchOrders = async () => {
      if (!fumaId.value) return;
      loading.value = true;
      try {
        const { data } = await getPendingOrders({
          empId: fumaId.value,
          page: pagination.value.page,
          pageSize: pagination.value.pageSize,
          pass: "itblue21" // 真实项目建议用环境变量
        });
        tableData.value = data.records;
        pagination.value.total = data.total;
      } catch (e) {
        tableData.value = [];
        pagination.value.total = 0;
      } finally {
        loading.value = false;
      }
    };

    // 页面加载时自动请求
    onMounted(() => {
      fetchOrders();
    });

    // 分页切换
    const handlePageChange = (page: number) => {
      pagination.value.page = page;
      fetchOrders();
    };
    const handlePageSizeChange = (size: number) => {
      pagination.value.pageSize = size;
      pagination.value.page = 1;
      fetchOrders();
    };

    /**
     * 打开详情弹窗并请求数据
     */
    const openDetail = async (row: any) => {
      detailDialog.value.visible = true;
      detailDialog.value.loading = true;
      detailDialog.value.data = null;
      detailDialog.value.mainFID = row.FID; // 记录主表FID
      try {
        const { data } = await getOrderDetail({
          FID: String(row.FID),
          pass: "itblue21"
        });
        detailDialog.value.data = data;
      } catch (e) {
        detailDialog.value.data = null;
      } finally {
        detailDialog.value.loading = false;
      }
    };

    /**
     * 审核操作（通过/驳回）
     * @param empAction 1=通过，2=驳回
     */
    const handleAudit = async (empAction: number) => {
      if (!detailDialog.value.mainFID) return;
      if (!auditForm.value.notice.trim()) {
        ElMessage.warning("请填写审核意见");
        return;
      }
      // 获取当前用户 fuma_id 作为 LoginEmpID
      const loginEmpId = fumaId.value || (userStore as any).fuma_id;
      if (!loginEmpId) {
        ElMessage.error("未获取到当前用户fuma_id，无法审核");
        return;
      }
      auditForm.value.loading = true;
      try {
        await auditOrder({
          FID: String(detailDialog.value.mainFID), // saExcEmp主键 FID
          EmpAction: empAction, // 1=通过，2=驳回
          Notice: auditForm.value.notice,
          LoginEmpID: loginEmpId,
          pass: "itblue21"
        });
        ElMessage.success(empAction === 1 ? "审核通过成功" : "已驳回");
        detailDialog.value.visible = false;
        auditForm.value.notice = "";
        // 刷新订单列表
        fetchOrders();
      } catch (e) {
        ElMessage.error("操作失败");
      } finally {
        auditForm.value.loading = false;
      }
    };

    /**
     * 格式化开始时间为中文年月日分时，兼容 ISO 8601 和 yyyy-MM-dd HH:mm:ss
     */
    const formatBeginTime = (_: any, __: any, cellValue: string) => {
      if (!cellValue) return "-";
      // 兼容 ISO 格式
      const dateObj = new Date(cellValue);
      if (!isNaN(dateObj.getTime())) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");
        const hh = String(dateObj.getHours()).padStart(2, "0");
        const mm = String(dateObj.getMinutes()).padStart(2, "0");
        return `${y}年${m}月${d}日 ${hh}:${mm}`;
      }
      // 兜底：原有格式
      const [date, time] = cellValue.split(" ");
      if (!date || !time) return cellValue;
      const [y, m, d] = date.split("-");
      const [hh, mm] = time.split(":");
      return `${y}年${m}月${d}日 ${hh}:${mm}`;
    };

    /**
     * 格式化日期为中文年月日
     */
    const formatDate = (val: string) => {
      if (!val) return "-";
      const dateObj = new Date(val);
      if (!isNaN(dateObj.getTime())) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");
        return `${y}年${m}月${d}日`;
      }
      return val;
    };

    /**
     * 查看产品详情
     * @param row 产品明细行
     */
    async function onProductView(row: any) {
      productDetailDialog.value.visible = true;
      productDetailDialog.value.loading = true;
      productDetailDialog.value.data = null;
      productDetailDialog.value.purQty = row.BPurQty; // 记录采购数量
      try {
        const { data } = await getProductDetail({ product_id: row.ItemNo });
        productDetailDialog.value.data = data;
      } catch (e) {
        productDetailDialog.value.data = null;
      } finally {
        productDetailDialog.value.loading = false;
      }
    }

    return {
      fumaId,
      userStore,
      empOptions,
      selectedEmpIds,
      tableData,
      pagination,
      loading,
      handlePageChange,
      handlePageSizeChange,
      detailDialog,
      openDetail,
      auditForm,
      handleAudit,
      bpProductImg,
      formatBeginTime,
      formatDate,
      tooltip,
      showTooltip,
      hideTooltip,
      onProductView,
      productDetailDialog,
      sales12MonthsHeader,
      sales12MonthsRow,
      forecast6MonthsHeader,
      forecast6MonthsMatrix
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

.ellipsis-cell {
  display: inline-block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}

.custom-tooltip {
  position: fixed;
  z-index: 9999;
  max-width: 400px;
  padding: 6px 12px;
  font-size: 13px;
  color: #fff;
  word-break: break-all;
  pointer-events: none;
  background: rgb(0 0 0 / 85%);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
}
</style>
