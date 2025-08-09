import request from '/@/utils/request';

/**
 * 获取模型提供商分页列表
 * @param params 查询参数
 * @returns 分页数据
 */
export const pageList = (params?: any) => {
  return request({
    url: '/model-providers',
    method: 'get',
    params
  });
};

/**
 * 获取所有模型提供商列表（不分页）
 * @returns 提供商列表
 */
export const list = () => {
  return request({
    url: '/model-providers/list',
    method: 'get'
  });
};

/**
 * 获取模型提供商详情
 * @param id 提供商ID
 * @returns 提供商详情
 */
export const getObj = (id: string) => {
  return request({
    url: `/model-provider/${id}`,
    method: 'get'
  });
};

/**
 * 添加模型提供商
 * @param data 提供商数据
 * @returns 添加结果
 */
export const addObj = (data: any) => {
  return request({
    url: '/model-provider',
    method: 'post',
    data
  });
};

/**
 * 修改模型提供商
 * @param id 提供商ID
 * @param data 提供商数据
 * @returns 修改结果
 */
export const putObj = (id: string, data: any) => {
  return request({
    url: `/model-provider/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除模型提供商
 * @param id 提供商ID
 * @returns 删除结果
 */
export const delObj = (id: string) => {
  return request({
    url: `/model-provider/${id}`,
    method: 'delete'
  });
};