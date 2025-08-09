import request from '/@/utils/request';

/**
 * 获取已安装应用列表
 * @param params 查询参数
 * @returns Promise
 */
export const getInstalledApps = (params?: Object) => {
	return request({
		url: '/installed-apps',
		method: 'get',
		params,
	});
};

/**
 * 获取已安装应用详情
 * @param id 应用ID
 * @returns Promise
 */
export const getInstalledAppDetail = (id: String) => {
	return request({
		url: '/installed-apps/' + id,
		method: 'get',
	});
};