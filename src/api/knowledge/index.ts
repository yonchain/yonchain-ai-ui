import request from '/@/utils/request';

export const pageList = (params?: Object) => {
	return request({
		url: '/datasets',
		method: 'get',
		params,
	});
};

export const addObj = (obj: Object) => {
	return request({
		url: '/datasets',
		method: 'post',
		data: obj,
	});
};

export const getObj = (id: String) => {
	return request({
		url: '/datasets/' + id,
		method: 'get',
	});
};

export const delObj = (id: String) => {
	return request({
		url: '/datasets/' + id,
		method: 'delete',
	});
};

export const putObj = (id: String, obj: Object) => {
	return request({
		url: '/datasets/' + id,
		method: 'put',
		data: obj,
	});
};
