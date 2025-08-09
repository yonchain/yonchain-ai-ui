<template>
	<div class="layout-padding ai-app-index">
		<div class="layout-padding-auto layout-padding-view">
			<el-row v-show="showSearch" class="search-card">
				<div class="card-container">
					<el-form ref="queryRef" :inline="true" :model="state.queryForm" @keyup.enter="getDataList">
						<el-form-item :label="$t('sysuser.name')" prop="name" class="search-input">
							<el-input 
								v-model="state.queryForm.name" 
								:placeholder="$t('sysuser.inputUsernameTip')" 
								clearable 
								class="input-with-shadow"
							/>
						</el-form-item>
						<el-form-item :label="$t('sysuser.email')" prop="email" class="search-input">
							<el-input 
								v-model="state.queryForm.email" 
								:placeholder="$t('sysuser.inputEmailTip')" 
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
								icon="Refresh" 
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
							v-auth="'sys_user_add'"
							icon="Plus" 
							type="primary" 
							@click="userDialogRef.openDialog()"
							class="action-button"
						>
							{{ $t('common.addBtn') }}
						</el-button>
						<el-button 
							v-auth="'sys_user_add'"
							icon="upload-filled"
							type="success"
							class="action-button"
							@click="excelUploadRef.show()"
						>
							{{ $t('common.importBtn') }}
						</el-button>
					</el-button-group>
				</div>
			</el-row>
			<ul class="app-list">
				<li v-for="(item, index) in state.dataList" :key="index">
					<div class="flex">
						<p class="profile flex-c">{{ item.name.split('')[0] }}</p>
						<div class="w-full flex-1">
							<p class="app-name">{{ item.name }}</p>
							<p class="text-[#677182] text-sm mt-1">{{ item.email }}</p>
							<div class="mt-2">
								<el-tag v-for="(role, idx) in item.role_list" :key="idx" type="primary" class="mr-1">{{ role.name }}</el-tag>
							</div>
						</div>
					</div>
					<div class="mt-[12px] text-[#677182]">
		
						<div class="mt-1">{{ $t('sysuser.lastActiveTime') }}: {{ item.last_active_at }}</div>
					</div>
					<div class="app-actions">
						<el-tooltip :content="$t('sysuser.deleteDisabledTip')" :disabled="item.email !== 'admin@yonchain.com'" placement="top">
							<el-button v-auth="'sys_user_edit'" type="primary" :disabled="item.email === 'admin@yonchain.com'" size="small" icon="Edit" @click="userDialogRef.openDialog(item.id)">{{ $t('common.editBtn') }}</el-button>
						</el-tooltip>
						<el-tooltip :content="$t('sysuser.deleteDisabledTip')" :disabled="item.email !== 'admin@yonchain.com'" placement="top">
							<el-button
								v-auth="'sys_user_del'"
								type="danger"
								size="small"
								icon="Delete"
								:disabled="item.email === 'admin@yonchain.com'"
								@click="handleDelete([item.id])"
							>
								{{ $t('common.delBtn') }}
							</el-button>
						</el-tooltip>
					</div>
				</li>
			</ul>
			<pagination v-bind="state.pagination" @current-change="currentChangeHandle" @size-change="sizeChangeHandle"> </pagination>
		</div>

		<user-form ref="userDialogRef" @refresh="getDataList(false)" />

		<upload-excel
			ref="excelUploadRef"
			:title="$t('sysuser.importUserTip')"
			temp-url="/admin/sys-file/local/file/user.xlsx"
			url="/admin/user/import"
			@refreshDataList="getDataList"
		/>
	</div>
</template>

<script lang="ts" name="systemUser" setup>
import { delObj, pageList, putObj } from '/@/api/admin/user';
import { BasicTableProps, useTable } from '/@/hooks/table';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';

// 动态引入组件
const UserForm = defineAsyncComponent(() => import('./form.vue'));
const QueryTree = defineAsyncComponent(() => import('/@/components/QueryTree/index.vue'));

const { t } = useI18n();

// 定义变量内容
const userDialogRef = ref();
const excelUploadRef = ref();
const queryRef = ref();
const showSearch = ref(true);


// 定义表格查询、后台调用的API
const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		deptId: '',
		name: '',
		phone: '',
	},
	pageList: pageList,
});
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);



// 清空搜索条件
const resetQuery = () => {
	queryRef.value?.resetFields();
	state.queryForm.deptId = '';
	getDataList();
};


// 导出excel
const exportExcel = () => {
	downBlobFile('/admin/user/export', state.queryForm, 'users.xlsx');
};



// 删除操作
const handleDelete = async (ids: string[]) => {
	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
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
              0 2px 12px rgba(0, 0, 0, 0.08),
              inset 0 0 0 1px rgba($primary-color, 0.5);
          }
          
          &:focus-within {
            box-shadow: 
              0 2px 12px rgba(0, 0, 0, 0.1),
              inset 0 0 0 1px $primary-color;
            border: 1px solid $primary-color;
            outline: none;
          }
        }
      }
    }

          .search-buttons {
            .el-form-item__content {
              display: flex;
              align-items: center;
              height: 32px;
              gap: 6px;
              margin: 0;
              padding: 0;
            }
      
      .search-btn {
        background: $primary-color;
        border: 1px solid $primary-color;
        color: white;
        font-weight: 500;
        letter-spacing: 0.5px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba($primary-color, 0.2);
        border-radius: 6px;
        height: 32px;
        padding: 0 12px;
        margin: 0;
        
        &:hover {
          background: lighten($primary-color, 5%);
          border-color: lighten($primary-color, 5%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba($primary-color, 0.3);
        }
        
        &:active {
          background: darken($primary-color, 5%);
          border-color: darken($primary-color, 5%);
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba($primary-color, 0.3);
        }
      }
      
      .reset-btn {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 6px;
        font-weight: 500;
        letter-spacing: 0.5px;
        height: 32px;
        padding: 0 12px;
        
        &:hover {
          color: $primary-color;
          border-color: $primary-color;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba($primary-color, 0.1);
        }
        
        &:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba($primary-color, 0.1);
        }
      }
    }
  }

  .app-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    
    li {
      width: calc(25% - 12px);
      padding: 20px;
      border-radius: 10px;
      background: $bg-color;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
      transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
      border: 1px solid $border-color;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
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
        box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
        transition: all 0.25s ease;
      }

      .app-name {
        font-size: 18px;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
        transition: color 0.2s ease;
      }

      .app-actions {
        border-top: 1px solid rgba($border-color, 0.5);
        padding-top: 16px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 16px;
        
        .el-button {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
          
          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          }
          
          &.el-button--primary {
            background-color: $primary-color;
            border-color: $primary-color;
          }
          
          &.el-button--success {
            background-color: $success-color;
            border-color: $success-color;
          }
          
          &.el-button--danger {
            background-color: $danger-color;
            border-color: $danger-color;
          }
        }
      }
      
      & > div:last-child {
        color: $text-secondary;
        font-size: 14px;
        line-height: 1.6;
        margin-top: 12px;
      }
    }
  }
}
</style>