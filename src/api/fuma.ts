import { http } from "@/utils/http";

/**
 * FUMA 审核订单接口返回的单条记录类型
 */
export interface FumaOrderRecord {
  FID: string;
  ExcFID: string;
  CurrStep: string;
  EmpID: string;
  CNEmpName: string;
  BeginTime: string;
  MouldID: string;
  BillNo: string;
  FlowName: string;
  // ... 其它字段可按需补充
}

/**
 * FUMA 审核订单分页返回类型
 */
export interface FumaPendingOrdersResult {
  code: number;
  msg: string;
  data: {
    total: number;
    records: FumaOrderRecord[];
    page: number;
    pageSize: number;
  };
}

/**
 * FUMA 审核订单详情返回类型
 */
export interface FumaOrderDetailResult {
  code: number;
  msg: string;
  data: {
    type: "poPO" | "bpProducts";
    detail: any;
    mouldID: string;
    billNo: string;
    flowName: string;
  };
}

/**
 * FUMA 订单审核接口返回类型
 */
export interface FumaAuditResult {
  code: number;
  msg: string;
  data: null | any[];
}

/**
 * 查询正在审核中的订单
 * @param params { empId, page, pageSize, pass }
 * @returns FUMA 审核订单分页数据
 */
export function getPendingOrders(params: {
  empId: string[] | string;
  page?: number;
  pageSize?: number;
  pass: string;
}) {
  return http.request<FumaPendingOrdersResult>("post", "/api/excEmp/pending", {
    data: params,
    baseURL: import.meta.env.VITE_FUMA_API_URL
  });
}

/**
 * 获取订单审核详情
 * @param params { FID, pass }
 * @returns 详情对象
 */
export function getOrderDetail(params: { FID: string; pass: string }) {
  return http.request<FumaOrderDetailResult>("post", "/api/excEmp/detail", {
    data: params,
    baseURL: import.meta.env.VITE_FUMA_API_URL
  });
}

/**
 * 订单审核（通过/驳回）
 * @param params { FID, EmpAction, Notice, LoginEmpID, pass }
 * @returns 审核结果
 */
export function auditOrder(params: {
  FID: string; // saExcEmp主键
  EmpAction: number; // 1=通过，2=驳回
  Notice: string; // 审核意见
  LoginEmpID: string; // 当前用户ID
  pass: string;
}) {
  return http.request<FumaAuditResult>("post", "/api/excEmp/audit", {
    data: params,
    baseURL: import.meta.env.VITE_FUMA_API_URL
  });
}

/**
 * 查询 saExc（支持 billNo 模糊、FlowExcOk 精确）
 * @param params { FlowExcOk, billNo, pass }
 * @returns 查询结果数组
 */
export interface FumaExcQueryResult {
  code: number;
  msg: string;
  data: any[];
}

export function queryExc(params: {
  FlowExcOk?: number;
  billNo?: string;
  pass: string;
}) {
  return http.request<FumaExcQueryResult>("post", "/api/exc/query", {
    data: params,
    baseURL: import.meta.env.VITE_FUMA_API_URL
  });
}

/**
 * 查询 saExcEmp 审核流节点
 * @param params { FID, ExcFID, EmpID, pass }
 * @returns 节点数组
 */
export interface FumaExcEmpQueryResult {
  code: number;
  msg: string;
  data: any[];
}
export function queryExcEmp(params: {
  FID?: string;
  ExcFID?: string;
  EmpID?: string;
  pass: string;
}) {
  return http.request<FumaExcEmpQueryResult>("post", "/api/excEmp/query", {
    data: params,
    baseURL: import.meta.env.VITE_FUMA_API_URL
  });
}

/**
 * 删除 saExcEmp 节点
 * @param params { FID, pass }
 * @returns 删除结果
 */
export interface FumaExcEmpDeleteResult {
  code: number;
  msg: string;
  data: null | any[];
}
export function deleteExcEmp(params: { FID: string; pass: string }) {
  return http.request<FumaExcEmpDeleteResult>("post", "/api/excEmp/delete", {
    data: params,
    baseURL: import.meta.env.VITE_FUMA_API_URL
  });
}
