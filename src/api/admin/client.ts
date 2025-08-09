import request from '/@/utils/request';

export function fetchList(query?: Object) {
	return request({
		url: '/oauth2_clients',
		method: 'get',
		params: query,
	});
}

export function addObj(obj?: Object) {
	return request({
		url: '/oauth2_clients',
		method: 'post',
		data: obj,
	});
}

export function getObj(id?: string) {
	return request({
		url: '/oauth2_clients/' + id,
		method: 'get',
	});
}

export function delObj(ids?: object) {
	return request({
		url: '/oauth2_clients',
		method: 'delete',
		data: ids,
	});
}

export function putObj(obj?: Object) {
	return request({
		url: '/oauth2_clients/' + obj['id'],
		method: 'put',
		data: obj,
	});
}

export function refreshCache() {
	return request({
		url: '/oauth2_clients/sync',
		method: 'put',
	});
}

export function getDetails(obj: Object) {
	return request({
		url: '/oauth2_clients/getClientDetailsById/' + obj,
		method: 'get',
	});
}

export function validateclientId(rule: any, value: any, callback: any, isEdit: boolean) {
	if (isEdit) {
		return callback();
	}
	getObj(value).then((res) => {
		const result = res;
		if (result !== null) {
			callback(new Error('编号已经存在'));
		} else {
			callback();
		}
	});
}
