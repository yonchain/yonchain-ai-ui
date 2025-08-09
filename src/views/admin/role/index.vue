<template>
	<div class="layout-padding ai-app-index">
		<div class="layout-padding-auto layout-padding-view">
			<el-row v-show="showSearch" class="search-card">
				<div class="card-container">
					<el-form ref="queryRef" :inline="true" :model="state.queryForm" @keyup.enter="getDataList">
						<el-form-item :label="$t('sysrole.roleGroup')" prop="groupId" class="search-input">
							<el-select
								v-model="state.queryForm.group_id"
								:placeholder="$t('sysrole.inputRoleGroupName')"
								:loading="loadingGroups"
								clearable
								filterable
								class="input-with-shadow"
							>
								<el-option
									v-for="item in roleGroups"
									:key="item.id"
									:label="item.name"
									:value="item.id"
								/>
							</el-select>
						</el-form-item>
						<el-form-item :label="$t('sysrole.roleName')" prop="name" class="search-input">
							<el-input
								v-model="state.queryForm.name"
								:placeholder="$t('sysrole.inputRoleNameTip')"
								clearable
								class="input-with-shadow"
							/>
						</el-form-item>
						<el-form-item class="search-buttons">
							<el-button
								icon="Search"
								type="primary"
								@click="getDataList"
								class="search-btn"
							>
								{{ $t('common.queryBtn') }}
							</el-button>
							<el-button
								icon="RefreshLeft"
								@click="resetQuery"
								class="reset-btn"
							>
								{{ $t('common.resetBtn') }}
							</el-button>
						</el-form-item>
					</el-form>
				</div>
			</el-row>
			<el-row>
				<div class="mb-[16px] flex items-center justify-between" style="width: 100%">
					<el-button-group class="button-group">
						<el-button
							icon="Plus"
							type="primary"
							@click="roleDialogRef?.openDialog()"
							class="action-button primary-action"
							v-auth="'sys_role_add'"
						>
							{{ $t('common.addBtn') }}
						</el-button>
						<el-button
							icon="folder-add"
							type="success"
							@click="roleGroupDialogRef?.openDialog()"
							class="action-button primary-action"
							v-auth="'sys_role_group'"
						>
							{{ $t('sysrole.roleGroup') }}
						</el-button>
					</el-button-group>
			
				</div>
			</el-row>
			<ul class="app-list">
				<li v-for="item in state.dataList" :key="item.id">
					<div class="flex">
						<p class="profile flex-c">{{ item.name.split('')[0] }}</p>
						<div class="w-full flex-1">
							<p class="app-name">{{ item.name }}</p>
							<p class="text-[#677182] text-sm mt-1">{{ item.code }}</p>
							<div class="mt-2">
								<el-tag 
									v-if="item.group_id" 
									size="small" 
									type="primary"
									effect="light"
									class="!text-primary !border-primary/30 mr-1"
								>
									{{ roleGroups.find(g => g.id === item.group_id)?.name || '' }}
								</el-tag>
							</div>
						</div>
					</div>
					<div class="mt-[12px] text-[#677182]">
						{{ item.description || '-' }}
					</div>
					<div class="app-actions">
						<el-button type="primary" size="small" icon="Edit" @click="roleDialogRef.openDialog(item.id)">{{ $t('common.editBtn') }}</el-button>
						<el-button type="success" size="small" icon="lock" @click="permessionRef.openDialog(item)">{{ $t('sysrole.permissionTip') }}</el-button>
						<el-button type="danger" size="small" icon="Delete" :disabled="item.id === '1' || item.category === '0'" :title="item.category === '0' ? $t('sysrole.systemRoleCannotDelete') : ''" @click="handleDelete([item.id])">{{ $t('common.delBtn') }}</el-button>
					</div>
				</li>
			</ul>
			<pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" v-bind="state.pagination" />
		</div>

		<!-- 角色编辑、新增  -->
		<role-dialog ref="roleDialogRef" @refresh="getDataList()" />
		<!-- 导入角色 -->
		<upload-excel
			ref="excelUploadRef"
			:title="$t('sysuser.importUserTip')"
			url="/admin/role/import"
			temp-url="/admin/sys-file/local/file/role.xlsx"
			@refreshDataList="getDataList"
		/>
		<!-- 授权 -->
		<permession ref="permessionRef" />

		<role-group-dialog ref="roleGroupDialogRef" />
	</div>
</template>

<script setup lang="ts" name="systemRole">


import { BasicTableProps, useTable } from '/@/hooks/table';
import { pageList, delObj } from '/@/api/admin/role';
import { getObjs } from '/@/api/admin/role-group';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';

// 引入组件
const RoleDialog = defineAsyncComponent(() => import('./form.vue'));
const Permession = defineAsyncComponent(() => import('./permession.vue'));
const RoleGroupDialog = defineAsyncComponent(() => import('./roleGroupDialog.vue'));
const { t } = useI18n();

// 定义变量内容
const roleGroups = ref<any[]>([]);
const loadingGroups = ref(false);

const roleDialogRef = ref();
const permessionRef = ref();
const excelUploadRef = ref();
const queryRef = ref();
const roleGroupDialogRef = ref();
const showSearch = ref(true);
// 多选rows
const selectObjs = ref([]) as any;
// 是否可以多选
const multiple = ref(true);

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		roleName: '',
		group_id: '',
	},
	pageList: pageList, // H
	descs: ['created_at'],
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

// 清空搜索条件
const resetQuery = () => {
	queryRef.value.resetFields();
	getDataList();
};

// 导出excel
const exportExcel = () => {
	downBlobFile('/admin/role/export', state.queryForm, 'role.xlsx');
};

// 删除操作
const handleDelete = async (ids: string[]) => {
	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
		return;
	}

	// 检查是否为系统角色
	const role = state.dataList.find(item => item.id === ids[0]);
	if (role?.category === '0') {
		useMessage().error(t('sysrole.systemRoleCannotDelete'));
		return;
	}

	try {
		await delObj(ids);
		getDataList();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.message);
	}
};

// 获取角色组
const fetchRoleGroups = async () => {
  try {
    loadingGroups.value = true;
    const res = await getObjs();
    roleGroups.value = res.data;
  } catch (err) {
    useMessage().error(err.message || '获取角色组失败');
  } finally {
    loadingGroups.value = false;
  }
};

onMounted(() => {
  fetchRoleGroups();
});

</script>

<style lang="scss" scoped>
.ai-app-index {
  // 定义颜色变量
  $primary-color: #409eff;
  $success-color: #23d7a0;
  $danger-color: #f56c6c;
  $warning-color: #e6a23c;
  $text-color: #1a1a1a;
  $text-secondary: #677182;
  $border-color: #e4e7ed;
  $bg-color: #fff;
  $shadow-color: rgba(0, 0, 0, 0.05);
  $card-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  $button-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1440px) {
    .app-list li {
      width: calc(33.33% - 12px);
    }
  }

  @media (max-width: 1024px) {
    .app-list li {
      width: calc(50% - 12px);
    }
  }

  @media (max-width: 768px) {
    .app-list li {
      width: 100%;
    }

    .search-card .card-container {
      flex-direction: column;
      align-items: flex-start;
    }

    .search-input {
      margin-right: 0;
      margin-bottom: 12px;
    }
  }

  .button-group {
    display: flex;
    gap: 12px;
    
    .action-button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: $button-shadow;
      border-radius: 6px !important;
      font-weight: 500;
      letter-spacing: 0.5px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      &.el-button--primary {
        background-color: $primary-color;
        border-color: $primary-color;
      }
      
      &.el-button--success {
        background-color: $success-color;
        border-color: $success-color;
      }
      
      &.el-button--warning {
        background-color: $warning-color;
        border-color: $warning-color;
      }
    }
  }
  
  .search-card {
    margin-bottom: 20px;
    
    .card-container {
      padding: 20px !important;
      background: $bg-color !important;
      border-radius: 8px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid rgba($border-color, 0.5) !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      display: flex !important;
      align-items: center !important;
      min-height: 80px !important;
      
      .el-form {
        width: 100% !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        flex-wrap: wrap !important;
        gap: 12px !important;
        
        .el-form-item {
          margin-bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          height: 32px !important;
          
          &__content {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            line-height: 39px !important;
          }
        }
      }
      
      &:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        border-color: rgba($primary-color, 0.3);
      }
    }

    .search-input {
      margin-right: 16px;
      
      .el-form-item__label {
        font-weight: 500;
        color: lighten($text-color, 10%);
        transition: color 0.25s ease;
      }
      
      .input-with-shadow {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        width: 200px;
        
        :deep(.el-input__wrapper) {
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.05),
            inset 0 0 0 1px rgba($border-color, 1);
          background: white;
          border-radius: 6px;
          height: 32px;
          padding: 0 10px;
          width: 100%;
          
          &:hover {
            box-shadow: 
              0 2px 12px rgba(0, 0, 0, 0.1),
              inset 0 0 0 1px rgba($primary-color, 0.5);
          }
        }
      }
    }

    .search-buttons {
      .search-btn {
        background-color: $primary-color;
        border-color: $primary-color;
        color: white;
        
        &:hover {
          background-color: lighten($primary-color, 5%);
          border-color: lighten($primary-color, 5%);
        }
      }
      
      .reset-btn {
        background-color: $bg-color;
        border-color: $border-color;
        color: $text-secondary;
        
        &:hover {
          background-color: darken($bg-color, 2%);
          border-color: darken($border-color, 5%);
        }
      }
    }
  }

  .app-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    li {
      width: calc(33.33% - 12px);
      min-height: 200px;
      max-height: 300px;
      padding: 16px;
      border-radius: 8px;
      background: $bg-color;
      box-shadow: $card-shadow;
      transition: all 0.3s ease;
      border: 1px solid $border-color;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      @media (max-width: 1440px) {
        width: calc(50% - 12px);
      }

      @media (max-width: 768px) {
        width: 100%;
      }
    }
    gap: 16px;
    li {
      width: calc(25% - 12px);
      padding: 16px;
      border-radius: 8px;
      background: $bg-color;
      box-shadow: $card-shadow;
      transition: all 0.3s ease;
      border: 1px solid $border-color;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        border-color: $primary-color;
      }

      .profile {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #3a7bd5, #00d2ff);
        font-size: 22px;
        font-weight: bold;
        color: #fff;
        border-radius: 50%;
        margin-right: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(58, 123, 213, 0.3);
        transition: all 0.3s ease;
      }

      .app-name {
        font-size: 18px;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 6px;
        letter-spacing: 0.5px;
      }

      .app-actions {
        border-top: 1px solid #f0f2f5;
        padding-top: 16px;
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
        
        .el-button {
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          min-width: 80px;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
        }

        @media (max-width: 768px) {
          justify-content: center;
          gap: 6px;
          
          .el-button {
            padding: 4px 8px;
            min-width: 70px;
          }
        }
      }
    }
  }
}
</style>