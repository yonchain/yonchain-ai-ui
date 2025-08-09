import request from '/@/utils/request';

// 获取角色组列表
export const getObjs = (params: any) => {
  return request({
    url: '/role-groups',
    method: 'get',
    params
  });
};

// 删除角色组
export const delObj = (id: string) => {
  return request({
    url: '/role-groups/'+id,
    method: 'delete'
  });
};

// 添加角色组
export const addObj = (data: any) => {
  return request({
    url: '/role-groups',
    method: 'post',
    data
  });
};


// 更新角色组(全量更新)
export const putObj = (data: any) => {
  return request({
    url: '/role-groups/'+data.id,
    method: 'put',
    data
  });
};
