<template>
	<div class="layout-navbars-breadcrumb-user pr15" :style="{ flex: layoutUserFlexNum }">

		<div></div>

		<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onWorkspacesChange">
			<div class="layout-navbars-breadcrumb-user-icon">
				<span class="font-medium" style="font-size: 16px">{{ currentWorkspaceName }}</span>
				<el-icon class="ml-1"><ArrowDown /></el-icon>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<div class="dropdown-header" style="font-weight: 700; color: #606266; text-align: center; padding: 8px 16px; width: 100%; display: block; line-height: 1.5; margin: 0; background-color: #f5f7fa; border-bottom: 1px solid #e6e8eb;">{{ $t('user.title7') }}</div>
			
					<el-dropdown-item v-for="item in workspaceArr" :command="item.id" :disabled="item.id === currentWorkspaceId">{{
						item.name
					}}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onLanguageChange">
			<div class="layout-navbars-breadcrumb-user-icon">
				<el-icon :title="$t('user.title1')" style="font-size: 20px"><LanguageIcon /></el-icon>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="zh-cn" :disabled="state.disabledI18n === 'zh-cn'">简体中文</el-dropdown-item>
					<el-dropdown-item command="en" :disabled="state.disabledI18n === 'en'">English</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>

		<div class="layout-navbars-breadcrumb-user-icon mr10" @click="onScreenfullClick">
			<el-icon :title="state.isScreenfull ? $t('user.title6') : $t('user.title5')" style="font-size: 20px">
				<component :is="state.isScreenfull ? 'Aim' : 'FullScreen'" />
			</el-icon>
		</div>
		<UserDropdown :userInfos="userInfos" :baseURL="baseURL" />
		<Search ref="searchRef" />
		<global-websocket uri="/admin/ws/info" v-if="websocketEnable" @rollback="rollback" />
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUser">
import UserDropdown from './userinfo.vue';
import { getWorkspacesList, WorkspacesSwitch, currentWorkspaces } from '/@/api/admin/workspaces';
import { ElMessageBox, ElMessage } from 'element-plus';
import LanguageIcon from '/@/components/icons/LanguageIcon.vue';
import { FullScreen, Aim } from '@element-plus/icons-vue';

import screenfull from 'screenfull';
import { useI18n } from 'vue-i18n';
import { useUserInfo } from '/@/stores/userInfo';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import mittBus from '/@/utils/mitt';
import { Session, Local } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { useMsg } from '/@/stores/msg';
import { useWorkplace } from '/@/stores/workplace';
import pinia from '/@/stores/index';

// 引入组件
const GlobalWebsocket = defineAsyncComponent(() => import('/@/components/Websocket/index.vue'));
const Search = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/search.vue'));

// 定义变量内容
const { locale, t } = useI18n();
const router = useRouter();
const stores = useUserInfo();
const storesThemeConfig = useThemeConfig();
const { userInfos } = storeToRefs(stores);
const { themeConfig } = storeToRefs(storesThemeConfig);
const searchRef = ref();
const newsRef = ref();

interface State {
	[key: string]: boolean | string;
	isScreenfull: boolean;
	disabledI18n: string;
	disabledSize: string;
}

const state = reactive<State>({
	isScreenfull: false,
	disabledI18n: 'zh-cn',
	disabledSize: 'large',
});

// 是否开启websocket
const websocketEnable = ref(import.meta.env.VITE_WEBSOCKET_ENABLE === 'true');

// 设置分割样式
const layoutUserFlexNum = computed(() => {
	let num: string | number = '';
	const { layout, isClassicSplitMenu } = themeConfig.value;
	const layoutArr: string[] = ['defaults', 'columns'];
	if (layoutArr.includes(layout) || (layout === 'classic' && !isClassicSplitMenu)) num = '1';
	else num = '';
	return num;
});
// 全屏点击时
const onScreenfullClick = () => {
	if (!screenfull.isEnabled) {
		ElMessage.warning('暂不不支持全屏');
		return false;
	}
	screenfull.toggle();
	screenfull.on('change', () => {
		if (screenfull.isFullscreen) state.isScreenfull = true;
		else state.isScreenfull = false;
	});
};
// 布局配置 icon 点击时
const onLayoutSetingClick = () => {
	mittBus.emit('openSetingsDrawer');
};

// 菜单搜索点击
const onSearchClick = () => {
	searchRef.value.openSearch();
};

// 语言切换
const onLanguageChange = (lang: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
	other.useTitle();
	initI18nOrSize('globalI18n', 'disabledI18n');
};


// 初始化组件大小/i18n
const initI18nOrSize = (value: string, attr: string) => {
	state[attr] = Local.get('themeConfig')[value];
};

// 获取到消息
const rollback = (msg: string) => {
	useMsg().setMsg({ label: 'websocket消息', value: msg, time: formatAxis(new Date()) });
};

const isDot = computed(() => {
	return useMsg().getAllMsg().length > 0;
});

const WorkplaceStores = useWorkplace();
const { workplacesList } = storeToRefs(WorkplaceStores);

const currentWorkspaceId = ref('');
const currentWorkspaceName = ref('');
// 租户管理修改就可自动同步数据
const workspaceArr = ref<Array<{id: string, name: string}>>([]);

// 获取工作空间列表
const getWorkSpace = async () => {
	const res = await getWorkspacesList();
	if (res?.workspaces) {
		workspaceArr.value = res.workspaces;
		await getCurrentWorkspace();
	}
};

// 获取当前用户的工作空间id
const getCurrentWorkspace = async () => {
	const res = await currentWorkspaces();
	if (res?.id) {
		currentWorkspaceId.value = res.id;
		currentWorkspaceName.value = res.name;
		const storesWorkplace = useWorkplace(pinia);
		storesWorkplace.setCurrentWorkplaceId(res.id);
	}
};

// 工作空间切换
const onWorkspacesChange = async (id: string) => {
	currentWorkspaceId.value = id;
	currentWorkspaceName.value = workspaceArr.value.find((p) => p.id === id)?.name || '';
	const storesWorkplace = useWorkplace(pinia);
	storesWorkplace.setCurrentWorkplaceId(id);

	const res = await WorkspacesSwitch({ tenant_id: id });
	if (res.code === '200') {
		ElMessage.success('切换成功');
		setTimeout(() => {
			window.location.reload();
		}, 500);
	}
};

// 页面加载时
onMounted(() => {
	getWorkSpace();
	if (Local.get('themeConfig')) {
		initI18nOrSize('globalComponentSize', 'disabledSize');
		initI18nOrSize('globalI18n', 'disabledI18n');
	}
});
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 5px;

	&-link {
		height: 100%;
		display: flex;
		align-items: center;
		white-space: nowrap;
		padding: 0 10px;
		border-radius: 20px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.15);
		}

		&-photo {
			width: 40px;
			height: 40px;
			border-radius: 50%;
			border: 2px solid rgba(255, 255, 255, 0.2);
			margin: 2px 0;
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
			transition: all 0.3s ease;
		}
	}

	&-icon {
		padding: 0 12px;
		cursor: pointer;
		color: var(--next-bg-topBarColor);
		height: 40px;
		line-height: 40px;
		display: flex;
		align-items: center;
		border-radius: 20px;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.15);
			transform: translateY(-1px);

			i {
				animation: logoAnimation 0.3s ease-in-out;
			}
		}
	}

	:deep(.el-dropdown) {
		color: var(--next-bg-topBarColor);
	}

	:deep(.el-badge) {
		height: 40px;
		line-height: 40px;
		display: flex;
		align-items: center;
	}

	:deep(.el-badge__content.is-fixed) {
		top: 10px;
		right: 10px;
	}
	
	:deep(.el-dropdown-menu) {
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		
		.dropdown-header {
			padding: 12px 16px;
			font-weight: 700;
			font-size: 14px;
			color: var(--el-text-color-primary) !important;
			background-color: var(--el-bg-color-page) !important;
			border-bottom: 1px solid var(--el-border-color-light) !important;
			text-align: center;
			width: 100%;
			display: block;
			line-height: 1.5;
			margin: 0;
			box-sizing: border-box;
			border-radius: 8px 8px 0 0;
		}
		
		.el-dropdown-menu__item {
			padding: 10px 16px;
			transition: all 0.2s ease;
			font-size: 13px;
			font-weight: 500;
			line-height: 1.6;
			
			&:hover {
				background-color: var(--el-color-primary-light-9);
				color: var(--el-color-primary);
				transform: translateX(2px);
			}
			
			&.is-disabled {
				color: var(--el-text-color-disabled);
				font-weight: 400;
				opacity: 0.8;
			}
		}
	}
}

@keyframes logoAnimation {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
	100% {
		transform: scale(1);
	}
}
</style>