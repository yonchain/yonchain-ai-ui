<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view menu-container">
			<el-row shadow="hover" v-show="showSearch" class="ml10">
				<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
					<el-form-item :label="$t('sysmenu.name')" prop="menuName">
						<el-input :placeholder="$t('sysmenu.inputNameTip')" clearable style="max-width: 180px" v-model="state.queryForm.menuName" />
					</el-form-item>
          <el-form-item>
            <el-button @click="query" class="ml10" icon="search" type="primary">
              {{ $t('common.queryBtn') }}
            </el-button>
            <el-button @click="resetQuery" icon="Refresh">{{ $t('common.resetBtn') }}</el-button>
          </el-form-item>
				</el-form>
			</el-row>
			<el-row>
				<div class="mb8" style="width: 100%">
					<el-button @click="onOpenAddMenu" class="ml10" icon="Plus" type="primary" v-auth="'sys_menu_add'">
						{{ $t('common.addBtn') }}
					</el-button>
					<el-button @click="handleExpand"> {{ $t('common.expandBtn') }} </el-button>

				</div>
			</el-row>
			<el-table
				ref="tableRef"
				:data="state.dataList"
				:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
				row-key="path"
				style="width: 100%"
				v-loading="state.loading"
				border
				:cell-style="tableStyle.cellStyle"
				:header-cell-style="tableStyle?.headerCellStyle"
			>
				<el-table-column :label="$t('sysmenu.name')" fixed prop="name" show-overflow-tooltip></el-table-column>
				<el-table-column :label="$t('sysmenu.sortOrder')" prop="sort_order" show-overflow-tooltip></el-table-column>
				<el-table-column :label="$t('sysmenu.icon')" prop="icon" show-overflow-tooltip>
					<template #default="scope">
						<SvgIcon :name="scope.row.meta.icon" />
					</template>
				</el-table-column>
				<el-table-column :label="$t('sysmenu.path')" prop="path" show-overflow-tooltip></el-table-column>
				<el-table-column :label="$t('sysmenu.menuType')" show-overflow-tooltip>
					<template #default="scope">
						<el-tag v-if="scope.row.menu_type === '0'">菜单</el-tag>
						<el-tag v-if="scope.row.menu_type === '2'">顶菜单</el-tag>
						<el-tag type="success" v-if="scope.row.menu_type === '1'">按钮</el-tag>
					</template>
				</el-table-column>
				
				<el-table-column :label="$t('sysmenu.permission')" :show-overflow-tooltip="true" prop="permission"></el-table-column>
				<el-table-column :label="$t('common.action')" show-overflow-tooltip width="250">
					<template #default="scope">
						<el-button icon="Plus" @click="onOpenAddMenu('add', scope.row)" text type="primary" v-auth="'sys_menu_add'">
							{{ $t('common.addBtn') }}
						</el-button>
						<el-button icon="edit-pen" @click="onOpenEditMenu('edit', scope.row)" text type="primary" v-auth="'sys_menu_edit'"
							>{{ $t('common.editBtn') }}
						</el-button>

						<el-tooltip icon="delete" :content="$t('sysmenu.deleteDisabledTip')" :disabled="!deleteMenuDisabled(scope.row)" placement="top">
							<span style="margin-left: 12px">
								<el-button
									icon="delete"
								
									@click="handleDelete(scope.row)"
									text
									type="primary"
									v-auth="'sys_menu_del'"
								>
									{{ $t('common.delBtn') }}
								</el-button>
							</span>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<MenuDialog @refresh="getDataList()" ref="menuDialogRef" />
	</div>
</template>

<script lang="ts" name="systemMenu" setup>
import { delObj, pageList } from '/@/api/admin/menu';
import { BasicTableProps, useTable } from '/@/hooks/table';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
// 引入组件
const MenuDialog = defineAsyncComponent(() => import('./form.vue'));
const { t } = useI18n();
// 定义变量内容
const tableRef = ref();
const menuDialogRef = ref();
const queryRef = ref();
const showSearch = ref(true);
const isExpand = ref(false);
const state: BasicTableProps = reactive<BasicTableProps>({
	pageList: pageList, // H
	queryForm: {
		menuName: '',
	},
	isPage: false,
});

const { getDataList, tableStyle } = useTable(state);

// 打开新增菜单弹窗
const onOpenAddMenu = (type?: string, row?: any) => {
	menuDialogRef.value.openDialog(type, row);
};
// 打开编辑菜单弹窗
const onOpenEditMenu = (type: string, row: any) => {
	menuDialogRef.value.openDialog(type, row);
};

//是否禁用删除
const deleteMenuDisabled = (row: any) => {
	return (row.children || []).length > 0;
};

// 展开折叠树
const handleExpand = async () => {
	isExpand.value = !isExpand.value;
	const dataList = await pageList();
	toggleExpand(dataList.data, isExpand.value);
};

const toggleExpand = (children: any[], unfold = true) => {
	for (const key in children) {
		tableRef.value?.toggleRowExpansion(children[key], unfold);
		if (children[key].children) {
			toggleExpand(children[key].children!, unfold);
		}
	}
};

// 搜索事件
const query = () => {
  state.dataList = [];
  getDataList();
};

// 清空搜索条件
const resetQuery = () => {
  queryRef.value.resetFields();
  state.dataList = [];
  getDataList();
};

// 删除操作
const handleDelete = async (row: any) => {
	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
		return;
	}

	try {
		await delObj(row.id);
		getDataList();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.message);
	}
};
</script>

<style lang="scss" scoped>
.menu-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
  padding: 24px;
  border: 1px solid #ebeef5;
  
  :deep(.el-table) {
    --el-table-border-color: #e6e6e6;
    --el-table-header-bg-color: #f8f8f8;
    --el-table-row-hover-bg-color: #f0f7ff;
    
    .el-table__row {
      transition: all 0.3s ease;
      
      &:nth-child(odd) {
        background-color: #fafafa;
      }
      
      &:hover {
        background-color: #e6f7ff !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      
      &.is-expanded {
        background-color: #e6f7ff;
        box-shadow: inset 0 0 10px rgba(64, 158, 255, 0.1);
      }
    }
    
    .el-table__expand-icon {
      color: var(--el-color-primary);
      font-size: 16px;
      
      &.el-table__expand-icon--expanded {
        transform: rotate(90deg);
      }
    }
  }
  
  .el-row {
    margin-bottom: 15px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .el-form-item {
    margin-bottom: 0;
  }
  
  .mb8 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    
    .el-button {
      margin-left: 10px;
    }
  }
  
  .el-tag {
    margin-right: 5px;
  }
  
  .el-button--text {
    padding: 5px;
    min-height: auto;
    
    &:hover {
      color: var(--el-color-primary);
      background-color: rgba(64, 158, 255, 0.1);
    }
  }
}

// 树形连接线样式
:deep(.el-table__indent) {
  padding-left: 0;
  .el-table__indent-wrapper {
    position: relative;
    transition: all 0.3s ease;
    
    &::before {
      content: '';
      position: absolute;
      left: 12px;
      top: -50%;
      width: 2px;
      height: 200%;
      background: linear-gradient(to bottom, 
        transparent 0%, 
        var(--el-color-primary-light-5) 30%, 
        var(--el-color-primary-light-5) 70%, 
        transparent 100%);
      opacity: 0.8;
    }
    
    &::after {
      content: '';
      position: absolute;
      left: 12px;
      top: 50%;
      width: 8px;
      height: 2px;
      background-color: var(--el-color-primary-light-5);
      transform: translateY(-1px);
    }
  }
}

:deep(.el-table__placeholder) {
  .el-table__indent-wrapper::before,
  .el-table__indent-wrapper::after {
    display: none;
  }
}

// 展开图标样式
:deep(.el-table__expand-icon) {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background-color: rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(64, 158, 255, 0.2);
    transform: scale(1.1);
  }
  
  &.el-table__expand-icon--expanded {
    transform: rotate(90deg) scale(1.1);
  }
}
</style>