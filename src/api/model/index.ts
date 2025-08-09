import request from '/@/utils/request';

/**
 * 获取模型分页列表
 * @param params 查询参数
 * @returns 分页数据
 */
export const pageList = (params?: any) => {
  return request({
    url: '/models',
    method: 'get',
    params
  });
};

/**
 * 获取模型详情
 * @param id 模型ID
 * @returns 模型详情
 */
export const getObj = (id: string) => {
  return request({
    url: `/models/${id}`,
    method: 'get'
  });
};

/**
 * 添加模型
 * @param data 模型数据
 * @returns 添加结果
 */
export const addObj = (data: any) => {
  return request({
    url: '/models',
    method: 'post',
    data
  });
};

/**
 * 修改模型
 * @param id 模型ID
 * @param data 模型数据
 * @returns 修改结果
 */
export const putObj = (id: string, data: any) => {
  return request({
    url: `/models/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除模型
 * @param id 模型ID
 * @returns 删除结果
 */
export const delObj = (id: string) => {
  return request({
    url: `/models/${id}`,
    method: 'delete'
  });
};