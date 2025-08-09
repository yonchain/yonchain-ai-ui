import request from '/@/utils/request';

export const pageList = (params?: Object) => {
	return request({
		url: '/workspaces/page',
		method: 'get',
		params,
	});
};

export const addObj = (obj: Object) => {
	return request({
		url: '/workspaces',
		method: 'post',
		data: obj,
	});
};

export const getObj = (id: String) => {
	return request({
		url: '/workspaces/' + id,
		method: 'get',
	});
};

export const delObj = (id: String) => {
	return request({
		url: '/workspaces/' + id,
		method: 'delete',
	});
};

export const putObj = (id: String, obj: Object) => {
	return request({
		url: '/workspaces/' + id,
		method: 'put',
		data: obj,
	});
};
