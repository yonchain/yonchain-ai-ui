import request from '/@/utils/request';

export const list = (params?: Object) => {
	return request({
		url: '/roles/list',
		method: 'get',
		params,
	});
};

export const pageList = (params?: Object) => {
	return request({
		url: '/roles',
		method: 'get',
		params,
	});
};

export const deptRoleList = () => {
	return request({
		url: '/admin/role/list',
		method: 'get',
	});
};

export const getObj = (id: string) => {
	return request({
		url: '/roles/' + id,
		method: 'get',
	});
};

export const getObjDetails = (obj: object) => {
	return request({
		url: '/admin/role/details',
		method: 'get',
		params: obj,
	});
};

export const addObj = (obj: Object) => {
	return request({
		url: '/roles',
		method: 'post',
		data: obj,
	});
};

export const putObj = (obj: Object) => {
	return request({
		url: '/roles/'+obj['id'],
		method: 'put',
		data: obj,
	});
};

export const delObj = (ids: Object) => {
	return request({
		url: '/roles',
		method: 'delete',
		data: ids,
	});
};

export const permissionUpd = (roleId: string, menuIds: string) => {
	return request({
		url: '/roles/'+roleId+'/menus',
		method: 'post',
		data: menuIds,
	});
};

export const fetchRoleTree = (roleId: string) => {
	return request({
		url: '/menus/tree/' + roleId,
		method: 'get',
	});
};

export const getRoleMenus = (roleId: string) => {
	return request({
		url: '/roles/{'+roleId+'}/menus',
		method: 'get',
	});
};


export const exist = (obj: object) => {
	return request({
		url: '/roles/exist',
		method: 'get',
		params: obj,
	});
};


export function validateRoleCode(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	exist({ code: value }).then((response) => {
		const result = response.data;
		if (result) {
			callback(new Error('角色标识已经存在'));
		} else {
			callback();
		}
	});
}

export function validateRoleName(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}

	exist({ name: value }).then((response) => {
		const result = response.data;
		if (result) {
			callback(new Error('角色名称已经存在'));
		} else {
			callback();
		}
	});
}
