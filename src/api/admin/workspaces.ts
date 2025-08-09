import request from '/@/utils/request';

// 查询租户列表
export function getWorkspacesList() {
	return request({
		url: '/workspaces',
		method: 'get',
	});
}

// 租户切换
export const WorkspacesSwitch = (params: Object) => {
	return request({
		url: '/workspaces/switch',
		method: 'post',
		params,
	});
};

// 查询当前用户的租户
export function currentWorkspaces() {
	return request({
		url: '/workspaces/current',
		method: 'get',
	});
}

