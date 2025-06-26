import { http } from "@/utils/http";

/**
 * 产品分析数据项类型
 */
export interface AnalyzeProductItem {
  analyze_id: number;
  ItemNo: string;
  resultId: number;
  analysis_result: string;
  analysis_month: string;
  tracking_result: string;
  createTime: string;
  is_urgent: number;
  category: string;
  updateTime: string;
  RemainingStock: number;
  averageSales: number;
  saleMonth: string;
  stockQty: number;
  track_saleMonth: string;
  inTransitTotal: number;
}

/**
 * 产品分析分页返回类型
 */
export interface AnalyzeProductListResult {
  code: number;
  message: string;
  data: {
    list: AnalyzeProductItem[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
    };
  };
}

/**
 * 获取产品分析分页数据
 * @param params 查询参数
 */
export const getAnalyzeProductList = (params: {
  page: number;
  page_size: number;
  analysis_month?: string;
  category?: string;
  itemNo?: string;
}) => {
  return http.request<AnalyzeProductListResult>("get", "/api/analyze_product", {
    params
  });
};
