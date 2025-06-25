import { http } from "@/utils/http";

/**
 * 用户表结构类型
 */
export interface SysUser {
  user_id: number;
  username: string;
  nickname: string;
  avatar: string;
  status: number; // 0:禁用 1:正常
  create_time: string;
  update_time: string;
  roles: string; // 逗号分隔的角色名
}

/**
 * 用户分页列表返回类型
 */
export interface UserListResult {
  code: number;
  message: string;
  data: {
    list: SysUser[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
    };
  };
}

/**
 * 获取用户列表（分页、搜索、状态筛选）
 * @param params 查询参数
 */
export const getUserList = (params: {
  page: number;
  page_size: number;
  keyword?: string;
  status?: number;
}) => {
  return http.request<UserListResult>("get", "/api/users", { params });
};

/**
 * 新增用户
 * @param data 用户数据
 */
export const createUser = (data: {
  username: string;
  password: string;
  nickname?: string;
  avatar?: string;
}) => {
  return http.request<{
    code: number;
    message: string;
    data: { user_id: number };
  }>("post", "/api/users", { data });
};

/**
 * 修改用户
 * @param user_id 用户ID
 * @param data 用户数据
 */
export const updateUser = (
  user_id: number,
  data: {
    nickname?: string;
    avatar?: string;
    status?: number;
  }
) => {
  return http.request<{ code: number; message: string; data: null }>(
    "put",
    `/api/users/${user_id}`,
    { data }
  );
};

/**
 * 删除用户
 * @param user_id 用户ID
 */
export const deleteUser = (user_id: number) => {
  return http.request<{ code: number; message: string; data: null }>(
    "delete",
    `/api/users/${user_id}`
  );
};

/**
 * 修改用户密码
 * @param user_id 用户ID
 * @param data 密码数据
 */
export const updateUserPassword = (
  user_id: number,
  data: {
    new_password: string;
  }
) => {
  return http.request<{ code: number; message: string; data: null }>(
    "post",
    `/api/users/${user_id}/password`,
    { data }
  );
};

/**
 * 分配用户角色
 * @param user_id 用户ID
 * @param data 角色数据
 */
export const assignUserRoles = (
  user_id: number,
  data: {
    role_ids: number[];
  }
) => {
  return http.request<{ code: number; message: string; data: null }>(
    "post",
    `/api/users/${user_id}/roles`,
    { data }
  );
};

export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

/**
 * 获取当前用户菜单（路由）
 * @returns 菜单（路由）数据
 */
export type UserMenuResult = {
  code: number;
  message: string;
  data: Array<any>; // 可根据实际后端返回结构细化类型
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/api/user/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

export const getUserMenu = () => {
  return http.request<UserMenuResult>("get", "/api/user/menu");
};
