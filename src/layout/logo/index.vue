<template>
	<div class="layout-logo" :class="{'logo-defaults': isSpecialLayout}" v-if="setShowLogo" @click="onThemeConfigChange">
		<span>{{ themeConfig.globalTitle }}</span>
	</div>
	<div class="layout-logo-size" v-else @click="onThemeConfigChange">
		<img :src="logoMini" class="layout-logo-size-img" />
	</div>
</template>

<script setup lang="ts" name="layoutLogo">
import { useThemeConfig } from '/@/stores/themeConfig';
import logoMini from '/@/assets/icons/dify4j-logo.svg';

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 判断是否为defaults或columns布局
const isSpecialLayout = computed(() => {
	return themeConfig.value.layout === 'defaults' || themeConfig.value.layout === 'columns';
});

// 设置 logo 的显示。classic 经典布局默认显示 logo
const setShowLogo = computed(() => {
	let { isCollapse, layout } = themeConfig.value;
	return !isCollapse || layout === 'classic' || document.body.clientWidth < 1000;
});
// logo 点击实现菜单展开/收起
const onThemeConfigChange = () => {

	themeConfig.value.isCollapse = !themeConfig.value.isCollapse;
};
</script>

<style scoped lang="scss">
.layout-logo {
	width: 220px;
	height: 45px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	color: var(--next-bg-topBarColor);
	font-size: 16px;
	cursor: pointer;
	transition: all 0.3s ease;
	border-radius: 3px;
	margin-right: 10px;
	padding: 0 10px;
	
	span {
		white-space: nowrap;
		display: inline-block;
		font-size: 21.5px;
		font-weight: 700;
		transition: all 0.3s ease;
		transform-origin: center center;
	}
	
	&:hover {
		transform: translateY(0) scale(1.05);
		transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		
		span {
			color: var(--next-bg-topBarColor);
			transform: scale(1.05);
			transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		}
	}
	
	&.logo-defaults {
		background: var(--next-bg-topBar);
		span {
			color: var(--el-color-primary);
		}
		&:hover {
			transform: translateY(0) scale(1.05);
			transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
			span {
				color: var(--el-color-primary);
				transform: scale(1.05);
				transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
			}
		}
	}
}

.layout-logo-size {
	width: 50px;
	height: 45px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
	border-radius: 3px;
	margin-right: 10px;
	
	&-img {
		width: 24px;
		height: 24px;
		transition: all 0.3s ease;
	}
	
	&:hover {
		transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		
		.layout-logo-size-img {
			transform: scale(1.15);
			transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		}
	}
}

@keyframes logoAnimation {
	0% {
		transform: scale(0);
	}
	80% {
		transform: scale(1.1);
	}
	100% {
		transform: scale(1);
	}
}
</style>