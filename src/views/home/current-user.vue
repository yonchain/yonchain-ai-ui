<template>
	<el-card style="height: 100%">
		<div style="display: flex; justify-content: space-between">
			<div style="display: flex">
				<el-avatar style="width: 60px; height: 60px" shape="circle" :size="100" fit="cover" :src="userData.avatar" />
				<div class="info">
					<span style="font-weight: 600; margin: 2px; font-size: 18px">{{ userData.name }}</span>
				</div>
			</div>
			<span style="margin: 2px">
				{{ parseTime(date) }}
			</span>
		</div>
	</el-card>
</template>

<script setup lang="ts" name="currentUser">
import { useUserInfo } from '/@/stores/userInfo';
import { getObj } from '/@/api/admin/user';

const { proxy } = getCurrentInstance();
const date = ref(new Date());

const userData = ref({
	name: '',
	id: '',
	avatar: ''
} as any);
const loading = ref(false);

setInterval(() => {
	date.value = new Date();
}, 1000);

onMounted(() => {
	const data = useUserInfo().userInfos;
	initUserInfo(data.user.id);
});

/**
 * 根据用户 ID 初始化用户信息。
 * @param {any} userId - 要查询的用户 ID。
 * @returns {Promise<void>} - 初始化用户信息的 Promise 实例。
 */
const initUserInfo = async (userId: any): Promise<void> => {
	try {
		loading.value = true; // 显示加载状态

		const res = await getObj(userId); // 执行查询操作
		userData.value = res; // 将查询到的数据保存到 userData 变量中
		// 文件上传增加后端前缀
		userData.value.avatar = proxy.baseURL + res.avatar;
	} finally {
		loading.value = false; // 结束加载状态
	}
};
</script>

<style scoped>
.info {
	margin-left: 8px;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
</style>
