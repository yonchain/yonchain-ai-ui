<template>
	<el-dialog :close-on-click-modal="false" :title="$t('sysrole.roleGroup')" width="800px" draggable v-model="visible">
		<div class="role-group-container">
			<div class="mb-4 flex justify-between items-center">
				<el-button type="primary" icon="Plus" @click="handleAdd">{{ $t('common.addBtn') }}</el-button>
				<el-input
					v-model="searchText"
					:placeholder="$t('sysrole.inputRoleGroupName')"
					clearable
					style="width: 200px"
					@clear="handleSearchClear"
					@keyup.enter="handleSearch"
				>
					<template #prefix>
						<el-icon><Search /></el-icon>
					</template>
				</el-input>
			</div>

			<el-table
				:data="filteredGroups"
				border
				stripe
				highlight-current-row
				style="width: 100%"
				empty-text="暂无角色组数据"
				v-loading="loading"
			>
				<el-table-column prop="name" label="角色组名称">
					<template #default="{ row }">
						<el-input
							v-if="row.editing"
							v-model="row.name"
							:placeholder="$t('sysrole.inputRoleGroupName')"
							@blur="handleEditBlur(row)"
							@keyup.enter="handleEditBlur(row)"
						/>
						<span v-else>{{ row.name }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="220" align="center" fixed="right">
					<template #default="{ row }">
						<div class="flex gap-2">
							<el-button
								size="small"
								type="primary"
								:icon="row.editing ? 'Check' : 'Edit'"
								@click.stop.prevent="handleButtonClick(row)"
								@keydown.enter.stop="handleButtonClick(row)"
							>
								{{ row.editing ? $t('common.saveBtn') : $t('common.editBtn') }}
							</el-button>
							<el-button 
								size="small" 
								type="danger" 
								icon="Delete" 
								@click="handleDelete(row)"
							>
								{{ $t('common.delBtn') }}
							</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</el-dialog>
</template>

<script lang="ts" name="systemRoleGroupDialog" setup>
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { getObjs, addObj, putObj, delObj } from '/@/api/admin/role-group';

const { t } = useI18n();
const emit = defineEmits(['refresh']);

const visible = ref(false);
const loading = ref(false);
const searchText = ref('');
const state = reactive({
  groups: [] as any[]
});

const filteredGroups = computed(() => {
	if (!searchText.value) return state.groups;
	return state.groups.filter(
		(group) => group.name.includes(searchText.value) || String(group.id).includes(searchText.value)
	);
});

const openDialog = async () => {
  visible.value = true;
  try {
    await fetchRoleGroups();
  } catch (err) {
    useMessage().error(err.message || '获取角色组失败');
  }
};

const fetchRoleGroups = async () => {
  try {
    loading.value = true;
    const res = await getObjs();
    state.groups = res.data.map((group) => ({ ...group, editing: false }));
  } catch (err) {
    useMessage().error(err.message || '获取角色组失败');
  } finally {
    loading.value = false;
  }
};

const handleAdd = async () => {
  const newGroup = { 
    id: '', 
    name: '', 
    editing: true,
    originalName: '' 
  };
  state.groups = [newGroup, ...state.groups];
};

const handleEdit = (row) => {
  if (!row.editing) {
    row.editing = true;
    row.originalName = row.name;
    const index = state.groups.findIndex(g => g === row);
    if (index !== -1) {
      state.groups.splice(index, 1, {...row});
    }
  }
};

const handleSave = async (row) => {
  if (!row.editing) return;
  
  if (!row.name.trim()) {
    useMessage().error('角色组名称不能为空');
    return;
  }

  try {
    loading.value = true;
    const index = state.groups.findIndex(g => g === row);
    if (index === -1) return;

    if (row.id) {
      await putObj({ id: row.id, name: row.name });
      useMessage().success(t('common.editSuccessText'));
    } else {
      const res = await addObj({ name: row.name });
      row.id = res.id;
      useMessage().success(t('common.addSuccessText'));
    }
    
    row.editing = false;
    state.groups.splice(index, 1, {...row});
    emit('refresh');
    // 触发全局事件通知角色组数据已更新
    window.dispatchEvent(new CustomEvent('roleGroupsUpdated'));
  } catch (err) {
    let errorMsg = '操作失败';
    if (err.response) {
      errorMsg = err.response?.message || err.response.statusText || errorMsg;
    }
    useMessage().error(errorMsg);
  } finally {
    loading.value = false;
  }
};

const handleEditBlur = (row) => {
  // 如果是编辑状态，且没有修改，取消编辑状态
  if (row.editing && row.id && row.name === row.originalName) {
    row.editing = false;
  } 
  // 如果是新增的，且没有输入任何内容，删除新增行
  else if (row.editing && !row.id && !row.name.trim()) {
    const index = state.groups.findIndex((g) => g === row);
    if (index !== -1) {
      state.groups.splice(index, 1);
    }
  }
};

const handleDelete = async (row) => {
	try {
    // 如果是新增的，直接删除新增行
    if (row.editing && !row.id) {
      const index = state.groups.findIndex((g) => g === row);
      if (index !== -1) {
        state.groups.splice(index, 1);
      }
      return;
    }
    
		await useMessageBox().confirm(t('common.delConfirmText'));
		await delObj(row.id);
		await fetchRoleGroups();
		useMessage().success(t('common.delSuccessText'));
    // 触发全局事件通知角色组数据已更新
    window.dispatchEvent(new CustomEvent('roleGroupsUpdated'));
	} catch (err) {
		if (err !== 'cancel') {
			useMessage().error(err.message || '删除失败');
		}
	}
};

const handleSearch = () => {
	// 计算属性会自动处理
};

const handleSearchClear = () => {
	searchText.value = '';
};

const handleButtonClick = (row) => {
  if (row.editing === true) {
    handleSave(row);
  } else {
    handleEdit(row);
  }
};

defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
.role-group-container {
  padding: 16px 20px;
  background: var(--el-bg-color);
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--el-box-shadow);
  }
}

.el-table {
  margin-top: 16px;
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  
  :deep(.el-table__header) th {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }
  
  :deep(.el-table__body) tr:hover td {
    background-color: var(--el-color-primary-light-8) !important;
  }
  
  :deep(.cell) {
    display: flex;
    align-items: center;
    padding: 8px 12px;
  }
}

.el-input {
  width: 100%;
  
  &:deep(.el-input__wrapper) {
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px var(--el-input-hover-border-color);
    }
  }
}

.flex.justify-between {
  margin-bottom: 20px;
}

.el-button {
  transition: all 0.3s ease;
  
  & + .el-button {
    margin-left: 10px;
  }
}
</style>