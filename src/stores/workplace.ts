import { defineStore } from 'pinia';

/**
 * 工作空间
 * @methods setCurrentWorkplaceId 设置工作空间ID 
 * @methods setWorkplacesList 设置工作空间列表数据
 */
export const useWorkplace = defineStore('workplaces', {
	state: (): WorkplacesState => ({
		currentWorkplaceId: '',
		workplacesList: [],
	}),
	actions: {
		async setCurrentWorkplaceId(id: string) {
			this.currentWorkplaceId = id;
		},
		async setWorkplacesList(data: Array<string>) {
			this.workplacesList = data;
		},
	},
	persist: {
		enabled: true,
		strategies: [
			{
				key: 'currentWorkplaceId', //自定义 Key值
				storage: localStorage, // 选择存储方式
			},
		],
	},
});
