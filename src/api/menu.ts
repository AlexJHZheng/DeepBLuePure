import { http } from "@/utils/http";

/**
 * 菜单对象类型
 */
export interface MenuItem {
  id: number;
  parent_id: number;
  name: string;
  path: string;
  component: string;
  title: string;
  icon: string;
  order_num: number;
  status: number;
  create_time: string;
  update_time: string;
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
 * 获取菜单列表返回类型
 */
export interface MenuListResult {
  code: number;
  message: string;
  data: {
    list: MenuItem[];
    pagination: Pagination;
  };
}

/**
 * 创建/编辑菜单请求体类型
 */
export interface MenuEditData {
  name: string;
  path: string;
  component: string;
  title: string;
  icon?: string;
  order_num?: number;
  status?: number;
  parent_id?: number;
}

/**
 * 创建菜单返回类型
 */
export interface MenuCreateResult {
  code: number;
  message: string;
  data: {
    menu_id: number;
  };
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
 * 获取菜单列表（分页、搜索、状态筛选）
 * @param params 查询参数
 */
export const getMenuList = (params: {
  page: number;
  page_size: number;
  keyword?: string;
  status?: number;
}) => {
  return http.request<MenuListResult>("get", "/api/menus", { params });
};

/**
 * 新增菜单
 * @param data 菜单数据
 */
export const createMenu = (data: MenuEditData) => {
  return http.request<MenuCreateResult>("post", "/api/menus", { data });
};

/**
 * 编辑菜单
 * @param menu_id 菜单ID
 * @param data 菜单数据
 */
export const updateMenu = (menu_id: number, data: Partial<MenuEditData>) => {
  return http.request<SimpleResult>("put", `/api/menus/${menu_id}`, { data });
};

/**
 * 删除菜单
 * @param menu_id 菜单ID
 */
export const deleteMenu = (menu_id: number) => {
  return http.request<SimpleResult>("delete", `/api/menus/${menu_id}`);
};
