import request from '/@/utils/request';
import { Session } from '/@/utils/storage';
import { validateNull } from '/@/utils/validate';
import { useUserInfo } from '/@/stores/userInfo';
import other from '/@/utils/other';

/**
 * https://www.ietf.org/rfc/rfc6749.txt
 * OAuth 协议 4.3.1 要求格式为 form 而不是 JSON 注意！
 */
const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded';

/**
 * 登录
 * @param data
 */
export const login = (data: any) => {
	const basicAuth = 'Basic ' + window.btoa(import.meta.env.VITE_OAUTH2_PASSWORD_CLIENT);
	Session.set('basicAuth', basicAuth);
	let encPassword = data.password;
	// 密码加密
	if (import.meta.env.VITE_PWD_ENC_KEY) {
		encPassword = other.encryption(data.password, import.meta.env.VITE_PWD_ENC_KEY);
	}
	return request({
		url: '/oauth2/token',
		method: 'post',
		data: { ...data, password: encPassword },
		headers: {
			skipToken: true,
			Authorization: basicAuth,
			'Content-Type': FORM_CONTENT_TYPE,
			'X-Forwarded-For': data.ip || '',
		},
	});
};

export const loginByDingtalk = (code: any) => {
	const grant_type = 'dingtalk';
	const scope = 'server';
	const basicAuth = 'Basic ' + window.btoa(import.meta.env.VITE_OAUTH2_DINGTALK_CLIENT);
	Session.set('basicAuth', basicAuth);

	return request({
		url: '/oauth2/token',
		headers: {
			skipToken: true,
			Authorization: basicAuth,
			'Content-Type': FORM_CONTENT_TYPE
		},
		method: 'post',
		data: { 
			code: code, 
			grant_type, 
			scope 
		},
	});
};


/**
 * 登录到dify
 * @param data
 */
export const loginToDify = (token: any) => {
	const grant_type = 'dify';
	const scope = 'server';
	const basicAuth = 'Basic ' + window.btoa(import.meta.env.VITE_OAUTH2_DIFY_CLIENT);
	Session.set('basicAuth', basicAuth);

	return request({
		url: '/oauth2/token',
		headers: {
			skipToken: true,
			Authorization: basicAuth,
			'Content-Type': FORM_CONTENT_TYPE,
		},
		method: 'post',
		data: { 
			token: token, 
			grant_type, 
			scope 
		},
	});
};


export const refreshTokenApi = (refresh_token: string) => {
	const grant_type = 'refresh_token';
	const scope = 'server';
	// 获取当前选中的 basic 认证信息
	const basicAuth = Session.get('basicAuth');

	return request({
		url: '/oauth2/token',
		headers: {
			skipToken: true,
			Authorization: basicAuth,
			'Content-Type': FORM_CONTENT_TYPE,
		},
		method: 'post',
		data: { refresh_token, grant_type, scope },
	});
};


/**
 * 获取用户信息
 */
export const getUserInfo = () => {
	return request({
		url: '/users/current',
		method: 'get',
	});
};

export const logout = () => {
	return request({
		url: '/auth/logout',
		method: 'delete',
	});
};


/**
 * 跳转时的授权码
 * @param refreshLock
 */
export const postOauthAuthorize = (clientId: string, redirectUri: string) => {
	return request({
		url: `/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`,
		method: 'post',
	});
};
