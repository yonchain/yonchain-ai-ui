<template>
	<el-config-provider :size="getGlobalComponentSize" :locale="getGlobalI18n">
		<router-view />
		<Setings ref="settingRef" />
		<CloseFull />
	</el-config-provider>
</template>

<script setup lang="ts" name="app">
import { useI18n } from 'vue-i18n';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import { Local, Session } from '/@/utils/storage';
import mittBus from '/@/utils/mitt';
import setIntroduction from '/@/utils/setIconfont';
import type { ThemeConfig } from '/@/types/theme';

// 引入组件
const Setings = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/setings.vue'));
const CloseFull = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/closeFull.vue'));

// 定义变量内容
const { messages, locale } = useI18n();
const settingRef = ref<InstanceType<typeof Setings>>();
const route = useRoute();
const stores = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);


// 获取全局组件大小
const getGlobalComponentSize = computed(() => {
	try {
		return other.globalComponentSize();
	} catch (error) {
		console.error('获取全局组件大小失败:', error);
		return 'default';
	}
});

// 获取全局 i18n
const getGlobalI18n = computed(() => {
	try {
		return messages.value[locale.value];
	} catch (error) {
		console.error('获取i18n配置失败:', error);
		return {};
	}
});

// 设置初始化，防止刷新时恢复默认
onBeforeMount(() => {
	try {
		// 设置批量第三方 icon 图标
		setIntroduction.cssCdn();
		// 设置批量第三方 js
		setIntroduction.jsCdn();
	} catch (error) {
		console.error('初始化第三方资源失败:', error);
	}
});
// 页面加载时
onMounted(() => {
	nextTick(() => {
		try {
			// 监听布局配置弹窗点击打开
			mittBus.on('openSetingsDrawer', () => {
				try {
					settingRef.value?.openDrawer();
				} catch (error) {
					console.error('打开设置抽屉失败:', error);
				}
			});

			// 获取缓存中的布局配置
			const themeConfig = Local.get<ThemeConfig>('themeConfig');
			if (themeConfig) {
				storesThemeConfig.setThemeConfig({ themeConfig });
				document.documentElement.style.cssText = Local.get('themeConfigStyle') || '';
			}

			// 获取缓存中的全屏配置
			const isFullscreen = Session.get<boolean>('isTagsViewCurrenFull');
			if (isFullscreen !== undefined) {
				stores.setCurrenFullscreen(isFullscreen);
			}
		} catch (error) {
			console.error('页面初始化失败:', error);
		}
	});
});

// 页面销毁时，关闭监听布局配置/i18n监听
onUnmounted(() => {
	try {
		mittBus.off('openSetingsDrawer');
	} catch (error) {
		console.error('移除事件监听失败:', error);
	}
});
// 监听路由的变化，设置网站标题
watch(
	() => route.path,
	() => {
		try {
			other.useTitle();
		} catch (error) {
			console.error('设置页面标题失败:', error);
		}
	},
	{
		deep: true,
	}
);
</script>
