import { RouteRecordRaw } from 'vue-router';

/**
 * 建议：路由 path 路径与文件夹名称相同，找文件可浏览器地址找，方便定位文件位置
 *
 * 路由meta对象参数说明
 * meta: {
 *      title:          菜单栏及 tagsView 栏、菜单搜索名称（国际化）
 *      is_link：        是否超链接菜单，开启外链条件，`1、is_link: 链接地址不为空 2、is_iframe:false`
 *      is_hide：        是否隐藏此路由
 *      is_keep_alive：   是否缓存组件状态
 *      is_affix：       是否固定在 tagsView 栏上
 *      is_iframe：      是否内嵌窗口，开启条件，`1、is_iframe:true 2、is_link：链接地址不为空`
 *      roles：         当前路由权限标识，取角色管理。控制路由显示、隐藏。超级管理员：admin 普通角色：common
 *      icon：          菜单、tagsView 图标，阿里：加 `iconfont xxx`，fontawesome：加 `fa xxx`
 * }
 */

// 扩展 RouteMeta 接口
declare module 'vue-router' {
	interface RouteMeta {
		is_link?: string;
		is_hide?: boolean;
		isAuth?: boolean;
		is_keep_alive?: boolean;
		is_affix?: boolean;
		is_iframe?: boolean;
		roles?: string[];
		icon?: string;
	}
}

/**
 * 定义静态路由（默认路由）
 * 前端添加路由，请在此处加
 */
export const dynamicRoutes: Array<RouteRecordRaw> = [
	{
		path: '/home',
		name: 'router.home',
		component: () => import('/@/views/home/index.vue'),
		meta: {
			is_link: '',
			is_hide: false,
			is_keep_alive: true,
			is_affix: true,
			is_iframe: false,
			icon: 'iconfont icon-shouye',
		},
	},
	{
		path: '/personal',
		name: 'router.personal',
		component: () => import('/@/views/admin/user/personal.vue'),
		meta: {
			is_hide: true,
		},
	},
];

/**
 * 定义静态路由（默认路由）
 */
export const staticRoutes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: 'staticRoutes.login',
		component: () => import('/@/views/login/index.vue'),
		meta: {
			isAuth: false,
		},
	},
	{
		path: '/auth/dingtalk/callback',
		name: 'staticRoutes.dingtalkCallback',
		component: () => import('/@/views/auth/dingtalk/callback.vue'),
		meta: {
			isAuth: false,
			is_hide: true
		},
	},
	{
		path: '/auth/dify/redirect',
		name: 'staticRoutes.difyRedirect',
		component: () => import('/@/views/auth/dify/redirect.vue'),
		meta: {
			isAuth: false,
			is_hide: true,
			skipAuth: true,
			noCheckPermission: true
		},
	}
];

/**
 * 定义404、401界面
 */
export const notFoundAndNoPower = [
	{
		path: '/:path(.*)*',
		name: 'staticRoutes.notFound',
		component: () => import('/@/views/error/404.vue'),
		meta: {
			is_hide: true,
		},
	},
	{
		path: '/401',
		name: 'staticRoutes.noPower',
		component: () => import('/@/views/error/401.vue'),
		meta: {
			is_hide: true,
		},
	},
];

/**
 *  基础性路由
 *
 * 所有节点都是挂载此节点下
 */
export const baseRoutes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: '/',
		component: () => import('/@/layout/index.vue'),
		redirect: '/home',
		meta: {
			is_keep_alive: true,
		},
		children: []
	},
];