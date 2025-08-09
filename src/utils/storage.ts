import Cookies from 'js-cookie';

/**
 * window.localStorage 浏览器永久缓存
 * @method set 设置永久缓存
 * @method get 获取永久缓存
 * @method remove 移除永久缓存
 * @method clear 移除全部永久缓存
 */
export const Local = {
	// 生成带应用前缀的键名
	setKey(key: string): string {
		// @ts-ignore
		return `${__NEXT_NAME__}:${key}`;
	},
	
	// 设置永久缓存
	set<T>(key: string, val: T): void {
		try {
			window.localStorage.setItem(Local.setKey(key), JSON.stringify(val));
		} catch (error) {
			console.error(`Error setting localStorage key "${key}":`, error);
		}
	},
	
	// 获取永久缓存
	get<T>(key: string): T | null {
		try {
			const json = window.localStorage.getItem(Local.setKey(key));
			if (json === null) return null;
			return JSON.parse(json) as T;
		} catch (error) {
			console.error(`Error getting localStorage key "${key}":`, error);
			return null;
		}
	},
	
	// 移除永久缓存
	remove(key: string): void {
		try {
			window.localStorage.removeItem(Local.setKey(key));
		} catch (error) {
			console.error(`Error removing localStorage key "${key}":`, error);
		}
	},
	
	// 移除全部永久缓存
	clear(): void {
		try {
			window.localStorage.clear();
		} catch (error) {
			console.error('Error clearing localStorage:', error);
		}
	},
};

/**
 * window.sessionStorage 浏览器临时缓存
 * @method set 设置临时缓存
 * @method get 获取临时缓存
 * @method remove 移除临时缓存
 * @method clear 移除全部临时缓存
 */
export const Session = {
	// 设置临时缓存
	set<T>(key: string, val: T): void {
		try {
			// 特殊处理 token 和 refresh_token，同时存储在 Cookie 中
			if (key === 'token' || key === 'refresh_token') {
				Cookies.set(key, String(val));
			}
			window.sessionStorage.setItem(key, JSON.stringify(val));
		} catch (error) {
			console.error(`Error setting sessionStorage key "${key}":`, error);
		}
	},
	
	// 获取临时缓存
	get<T>(key: string): T | null | string {
		try {
			// 特殊处理 token 和 refresh_token，优先从 Cookie 获取
			if (key === 'token' || key === 'refresh_token') {
				return Cookies.get(key) || null;
			}
			
			const json = window.sessionStorage.getItem(key);
			if (json === null) return null;
			return JSON.parse(json) as T;
		} catch (error) {
			console.error(`Error getting sessionStorage key "${key}":`, error);
			return null;
		}
	},
	
	// 移除临时缓存
	remove(key: string): void {
		try {
			// 特殊处理 token 和 refresh_token，同时从 Cookie 移除
			if (key === 'token' || key === 'refresh_token') {
				Cookies.remove(key);
			}
			window.sessionStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing sessionStorage key "${key}":`, error);
		}
	},
	
	// 移除全部临时缓存
	clear(): void {
		try {
			// 移除所有相关 Cookie
			Cookies.remove('token');
			Cookies.remove('refresh_token');
			Cookies.remove('tenantId');
			window.sessionStorage.clear();
		} catch (error) {
			console.error('Error clearing sessionStorage:', error);
		}
	},
	
	// 获取当前存储的 token
	getToken(): string | null {
		return this.get('token') as string | null;
	},
	
	// 获取当前的租户
	getTenant(): number {
		const tenantId = Local.get<number>('tenantId');
		return tenantId !== null ? tenantId : 1;
	},
};
