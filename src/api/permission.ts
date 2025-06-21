import { http } from "@/utils/http";

/** 权限对象 */
export interface Permission {
  id: number;
  permission_name: string;
  permission_key: string;
  status: number;
  create_time: string;
  update_time: string;
}

/** 分页信息 */
export interface Pagination {
  total: number;
  page: number;
  page_size: number;
}

/** 获取权限列表返回 */
export interface PermissionListResult {
  code: number;
  message: string;
  data: {
    list: Permission[];
    pagination: Pagination;
  };
}

/** 创建权限请求体 */
export interface PermissionCreateData {
  menu_id: number;
  permission_name: string;
  permission_key: string;
}

/** 创建权限返回 */
export interface PermissionCreateResult {
  code: number;
  message: string;
  data: {
    id: number;
  };
}

/** 更新权限请求体 */
export interface PermissionUpdateData {
  permission_name?: string;
  permission_key?: string;
  status?: number;
}

/** 通用简单返回 */
export interface SimpleResult {
  code: number;
  message: string;
}

/** 获取权限列表 */
export const getPermissionList = (params?: object) => {
  return http.request<PermissionListResult>("get", "/api/permissions", {
    params
  });
};

/** 创建权限 */
export const createPermission = (data: PermissionCreateData) => {
  return http.request<PermissionCreateResult>("post", "/api/permissions", {
    data
  });
};

/** 更新权限 */
export const updatePermission = (id: number, data: PermissionUpdateData) => {
  return http.request<SimpleResult>("put", `/api/permissions/${id}`, { data });
};

/** 删除权限 */
export const deletePermission = (id: number) => {
  return http.request<SimpleResult>("delete", `/api/permissions/${id}`);
};
