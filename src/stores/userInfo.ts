import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';
import { getUserInfo, login, refreshTokenApi ,loginByDingtalk} from '/@/api/login/index';
import other from '/@/utils/other';
import { useMessage } from '/@/hooks/message';
import mittBus from '/@/utils/mitt';

/**
 * @function useUserInfo
 * @returns {UserInfosStore}
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			userName: '',
			photo: '',
			time: 0,
			roles: [],
			authBtnList: [],
		},
	}),

	actions: {
		/**
		 * 登录方法
		 * @function login
		 * @async
		 * @param {Object} data - 登录数据
		 * @returns {Promise<Object>}
		 */
		async login(data:any) {
			data.grant_type = 'password';
			data.scope = 'server';

			return new Promise((resolve, reject) => {
				login(data)
					.then((res) => {
						// 存储token 信息
						Session.set('token', res.access_token);
						Session.set('refresh_token', res.refresh_token);
						resolve(res);
					})
					.catch((err) => {
						useMessage().error(err?.message || '系统异常请联系管理员');
						reject(err);
					});
			});
		},
				
		/**
		 * 钉钉登录方法
		 * @function loginByMobile
		 * @async
		 * @param {Object} data - 登录数据
		 * @returns {Promise<Object>}
		 */
		async loginByDingtalk(data:any) {
			return new Promise((resolve, reject) => {
				loginByDingtalk(data.code)
					.then((res) => {
						// 存储token 信息
						Session.set('token', res.access_token);
						Session.set('refresh_token', res.refresh_token);
						resolve(res);
					})
					.catch((err) => {
						useMessage().error(err?.message || '系统异常请联系管理员');
						reject(err);
					});
			});
		},

		/**
		 * 刷新token方法
		 * @function refreshToken
		 * @async
		 * @returns {Promise<any>}
		 */
		async refreshToken() {
			return new Promise((resolve, reject) => {
				const refreshToken = Session.get('refresh_token');
				refreshTokenApi(refreshToken)
					.then((res) => {
						// 存储token 信息
						Session.set('token', res.access_token);
						Session.set('refresh_token', res.refresh_token);
						resolve(res);
					})
					.catch((err) => {
						useMessage().error(err.message);
						reject(err);
					});
			});
		},

		/**
		 * 获取用户信息方法
		 * @function setUserInfos
		 * @async
		 */
		async setUserInfos() {
			await getUserInfo().then((res) => {
				const userInfo: any = {
					user: res.user,
					time: new Date().getTime(),
					roles: res.roles,
					authBtnList: res.permissions,
				};
				this.userInfos = userInfo;
				// 重新加载水印
				mittBus.emit('updateWartermark');
			});
		},
	},
});