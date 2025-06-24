import { http } from "@/utils/http";

/**
 * 角色对象类型
 */
export interface RoleItem {
  id: number;
  role_name: string;
  role_key: string;
  status: number;
  create_time: string;
  update_time: string;
  permissions: { id: number; permission_name: string }[];
  menus: { id: number; title: string }[];
}

/**
 * 分页信息类型
 */
export interface Pagination {
  total: number;
  page: number;
  page_size: number;
}

/**
 * 获取角色列表返回类型
 */
export interface RoleListResult {
  code: number;
  message: string;
  data: {
    list: RoleItem[];
    pagination: Pagination;
  };
}

/**
 * 编辑角色请求体类型
 */
export interface RoleEditData {
  role_name?: string;
  role_key?: string;
  status?: number;
}

/**
 * 通用返回类型
 */
export interface SimpleResult {
  code: number;
  message: string;
  data?: null;
}

/**
 * 分配权限/菜单请求体类型
 */
export interface AssignIdsData {
  permission_ids?: number[];
  menu_ids?: number[];
}

/**
 * 获取角色列表
 */
export const getRoleList = (params: {
  page: number;
  page_size: number;
  keyword?: string;
  status?: number;
}) => {
  return http.request<RoleListResult>("get", "/api/roles", { params });
};

/**
 * 编辑角色
 */
export const updateRole = (role_id: number, data: RoleEditData) => {
  return http.request<SimpleResult>("put", `/api/roles/${role_id}`, { data });
};

/**
 * 删除角色
 */
export const deleteRole = (role_id: number) => {
  return http.request<SimpleResult>("delete", `/api/roles/${role_id}`);
};

/**
 * 分配角色权限
 */
export const assignRolePermissions = (
  role_id: number,
  permission_ids: number[]
) => {
  return http.request<SimpleResult>(
    "post",
    `/api/roles/${role_id}/permissions`,
    { data: { permission_ids } }
  );
};

/**
 * 分配角色菜单
 */
export const assignRoleMenus = (role_id: number, menu_ids: number[]) => {
  return http.request<SimpleResult>("post", `/api/roles/${role_id}/menus`, {
    data: { menu_ids }
  });
};

/**
 * 新增角色
 */
export const createRole = (data: {
  role_name: string;
  role_key: string;
  status?: number;
}) => {
  return http.request<SimpleResult>("post", "/api/roles", { data });
};
