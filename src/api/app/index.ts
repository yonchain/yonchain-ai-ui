import request from '/@/utils/request';

export const pageList = (params?: Object) => {
	return request({
		url: '/apps',
		method: 'get',
		params,
	});
};

export const addObj = (obj: Object) => {
	return request({
		url: '/apps',
		method: 'post',
		data: obj,
	});
};

export const getObj = (id: String) => {
	return request({
		url: '/apps/' + id,
		method: 'get',
	});
};

export const delObj = (id: String) => {
	return request({
		url: '/apps/' + id,
		method: 'delete',
	});
};

export const putObj = (id: String, obj: Object) => {
	return request({
		url: '/apps/' + id,
		method: 'put',
		data: obj,
	});
};
