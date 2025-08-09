<template>
	<slot v-if="getUserAuthBtnList" />
</template>

<script setup lang="ts" name="auths">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserInfo } from '/@/stores/userInfo';

// 定义父组件传过来的值
interface Props {
	value: string[];
}

const props = withDefaults(defineProps<Props>(), {
	value: () => [],
});

// 定义变量内容
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

// 获取 pinia 中的用户权限
const getUserAuthBtnList = computed(() => {
	try {
		return userInfos.value.authBtnList.some((auth: string) => 
			props.value.includes(auth)
		);
	} catch (error) {
		console.error('权限验证失败:', error);
		return false;
	}
});
</script>
