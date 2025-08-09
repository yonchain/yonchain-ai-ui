<template>
	<div class="select-none">
		<div class="flex-c absolute right-5 top-3"></div>
		<div class="login-container" style="background: #fff; display: flex; justify-content: center; align-items: center">
			<div class="login-box" style="width: 100%; max-width: 500px; background: #fff; padding: 50px; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.12)">
				<div class="login-form" style="margin: 0 auto; max-width: 380px">
					<div class="login-title" style="font-size: 28px; font-weight: 600; margin-bottom: 40px; text-align: center; color: #1a73e8">{{ getThemeConfig.globalTitle }}</div>
					<el-tabs v-model="tabsActiveName">
						<!-- 用户名密码登录 -->
						<el-tab-pane :label="$t('label.one1')" name="account">
							<Password @signInSuccess="signInSuccess" />
						</el-tab-pane>
						<!-- 钉钉登录 -->
						<el-tab-pane :label="$t('label.dingtalk')" name="dingtalk">
							<Dingtalk 
							  v-if="tabsActiveName === 'dingtalk'" 
							  @signInSuccess="signInSuccess"/>
							<router-view @signInSuccess="signInSuccess" />
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { useThemeConfig } from '/@/stores/themeConfig';
import { NextLoading } from '/@/utils/loading';
import { useI18n } from 'vue-i18n';
import { formatAxis } from '/@/utils/formatTime';
import { useMessage } from '/@/hooks/message';
import { Session } from '/@/utils/storage';
import { initBackEndControlRoutes } from '/@/router/backEnd';

// 引入组件
const Password = defineAsyncComponent(() => import('./component/password.vue'));
const Dingtalk = defineAsyncComponent(() => import('./component/dingtalk.vue'));

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// 是否开启注册
const registerEnable = ref<boolean>(import.meta.env.VITE_REGISTER_ENABLE === 'true');

// 默认选择账号密码登录方式
const tabsActiveName = ref<'account' | 'dingtalk'>('account');

// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});


// 登录成功后的跳转处理事件
const signInSuccess = async () => {
	try {
		const isNoPower = await initBackEndControlRoutes();
		
		if (isNoPower) {
			useMessage().wraning('抱歉，您没有登录权限');
			Session.clear();
			if (window.opener) {
				try {
					window.opener.location.href = '/login';
					window.close();
				} catch (error) {
					console.error('关闭弹窗失败:', error);
				}
			}
		} else {
			// 初始化登录成功时间问候语
			let currentTimeInfo = formatAxis(new Date());
			
			// 处理跳转逻辑
			const handleRedirect = () => {
				try {
					if (route.query?.redirect) {
						const queryParams = route.query?.params ? JSON.parse(<string>route.query?.params) : {};
						router.push({
							path: <string>route.query?.redirect,
							query: queryParams,
						});
					} else {
						router.push('/');
					}
				} catch (error) {
					console.error('路由跳转失败:', error);
					router.push('/');
				}
			};

			// 如果是弹窗环境，在主窗口跳转
			if (window.opener) {
				try {
					window.opener.postMessage({ 
						type: 'loginSuccess', 
						redirect: route.query?.redirect 
					}, window.location.origin);
					window.close();
				} catch (error) {
					console.error('与父窗口通信失败:', error);
					handleRedirect();
				}
			} else {
				handleRedirect();
			}

			// 登录成功提示
			const signInText = t('signInText');
			useMessage().success(`${currentTimeInfo}，${signInText}`);
			// 添加 loading，防止第一次进入界面时出现短暂空白
			NextLoading.start();
		}
	} catch (error: any) {	
		let errorMsg = error?.message || '服务器内部错误，请联系管理员';
		if (error?.status === 500) {
			errorMsg = '服务器内部错误，请联系管理员';
		}
		
		useMessage().error(errorMsg);
		console.error('登录处理失败:', error);
	}
};

// 监听来自弹窗的消息
const messageHandler = (event: MessageEvent) => {
	try {
		if (event.origin !== window.location.origin) return;
		
		if (event.data.type === 'loginSuccess') {
			const queryParams = route.query?.params ? JSON.parse(<string>route.query?.params) : {};
			if (event.data.redirect) {
				router.push({
					path: event.data.redirect,
					query: queryParams,
				});
			} else {
				router.push('/');
			}
		} else if (event.data.type === 'dingtalkLoginError') {
			useMessage().error(event.data.message);
		} else if (event.data.type === 'dingtalkLoginWarning') {
			useMessage().wraning(event.data.message);
		}
	} catch (error) {
		console.error('消息处理失败:', error);
	}
};

onMounted(() => {
	NextLoading.done();
	window.addEventListener('message', messageHandler);
});

onUnmounted(() => {
	window.removeEventListener('message', messageHandler);
});

// 页面加载时
onMounted(() => {
	NextLoading.done();
});
</script>