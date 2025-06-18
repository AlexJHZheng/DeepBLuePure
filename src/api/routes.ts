import { http } from "@/utils/http";

/**
 * 获取当前用户菜单（路由）
 * @returns 菜单（路由）数据
 */
type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", "/api/user/menu");
};
