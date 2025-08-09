<template>
	<div class="layout-padding ai-app-index">
		<div class="layout-padding-auto layout-padding-view">
			<el-row v-show="showSearch" class="search-card">
				<div class="card-container">
					<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList" ref="queryRef">
						<el-form-item :label="$t('client.clientName')" prop="clientName" class="search-input">
							<el-input
								v-model="state.queryForm.clientName"
								:placeholder="$t('client.clientName')"
								clearable
								class="input-with-shadow"
							/>
						</el-form-item>
            <el-form-item :label="$t('client.clientId')" prop="clientId" class="search-input">
							<el-input
								v-model="state.queryForm.clientId"
								:placeholder="$t('client.clientId')"
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
							@click="formDialogRef.openDialog()"
							class="action-button primary-action"
							v-auth="'sys_client_add'"
						>
							{{ $t('common.addBtn') }}
						</el-button>
					</el-button-group>

				</div>
			</el-row>
			<ul class="app-list">
				<li v-for="item in state.dataList" :key="item.id">
					<div class="flex">
						<p class="profile flex-c">{{ item.client_name?.split('')[0] || 'C' }}</p>
						<div class="w-full flex-1">
							<p class="app-name">{{ item.client_name }}</p>
							<div class="mt-[8px] flex flex-wrap items-center gap-1">
								<el-tag type="danger" class="mr-1" v-if="item.client_id === 'yonchain'">默认</el-tag>
								<el-tag type="success" class="mr-1">ID: {{ item.client_id }}
									<el-button 
										:type="supportsLinkType ? 'link' : 'text'"
										icon="DocumentCopy" 
										@click.stop="copyText(item.client_id)"
										class="ml-1 copy-btn"
									/>
								</el-tag>
								<el-tag type="success" class="mr-1" v-if="item.client_secret">
									密钥: {{ item.client_secret }}
									<el-button 
										:type="supportsLinkType ? 'link' : 'text'"
										icon="DocumentCopy" 
										@click.stop="copyText(item.client_secret)"
										class="ml-1 copy-btn"
									/>
								</el-tag>
								<el-tag type="info">有效期: {{ item.access_token_time_to_live }}秒</el-tag>
							</div>
						</div>
					</div>
					<div class="mt-[12px]">
						<el-tag v-for="type in formatGrantTypes(item.authorization_grant_types)" 
							:key="type" 
							class="mr-2 mb-2">
							{{ type }}
						</el-tag>
					</div>
					<div class="app-actions">
						<el-button type="primary" size="small" icon="Edit" @click="formDialogRef.openDialog(item.id)" v-auth="'sys_client_add'">
							{{ $t('common.editBtn') }}
						</el-button>
						<el-tooltip content="默认客户端不允许删除" placement="top" :disabled="item.client_id !== 'yonchain'">
							<el-button type="danger" size="small" icon="Delete" @click="handleDelete([item.id])" v-auth="'sys_client_del'" :disabled="item.client_id === 'yonchain'">
								{{ $t('common.delBtn') }}
							</el-button>
						</el-tooltip>
					</div>
				</li>
			</ul>
			<pagination @current-change="currentChangeHandle" @size-change="sizeChangeHandle" v-bind="state.pagination" />
		</div>
		<!-- 编辑、新增  -->
		<form-dialog @refresh="getDataList()" ref="formDialogRef" />
	</div>
</template>

<script lang="ts" name="systemSysOauthClientDetails" setup>
import { BasicTableProps, useTable } from '/@/hooks/table';
import { delObj, fetchList, refreshCache } from '/@/api/admin/client';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { ElTooltip } from 'element-plus';

const grant_types = [
  { value: 'authorization_code', label: '授权码模式' },
  { value: 'password', label: '密码模式' },
  { value: 'client_credentials', label: '客户端模式' },
  { value: 'implicit', label: '简化模式' },
  { value: 'dify', label: 'dify模式' },
  { value: 'dify_authorization_code', label: 'dify授权码模式' },
  { value: 'refresh_token', label: '刷新令牌' },
  { value: 'dingtalk', label: '钉钉模式' }
];

const formatGrantTypes = (input: string | string[]) => {
  // 处理空值
  if (!input) return [];
  
  // 统一转为数组
  const types = Array.isArray(input) ? input : input.split(',');
  
  // 映射为标签并过滤空值
  return types.map(type => {
    const found = grant_types.find(item => item.value === type.trim());
    return found ? found.label : type;
  }).filter(Boolean);
};

// 引入组件
const FormDialog = defineAsyncComponent(() => import('./form.vue'));
const { t } = useI18n();
// 定义变量内容
const formDialogRef = ref();
const queryRef = ref();
// 搜索变量
const showSearch = ref(true);
// 多选变量
const selectObjs = ref([]) as any;
const multiple = ref(true);

const supportsLinkType = computed(() => {
  try {
    const version = require('element-plus/package.json').version;
    return version >= '2.3.0'; // 假设2.3.0开始支持link类型
  } catch {
    return false;
  }
});

const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {},
	pageList: fetchList,
	descs: ['id'],
});

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);
const { copy: copyToClipboard } = useClipboard();

const copyText = (text: string) => {
  copyToClipboard(text);
  useMessage().success('已复制到剪贴板');
};

// 删除缓存
const handleRefreshCache = () => {
	refreshCache().then(() => {
		useMessage().success('同步成功');
	});
};

const resetQuery = () => {
	queryRef.value.resetFields();
	// state.queryForm = {};
	selectObjs.value = [];
	getDataList();
};

// 导出excel
const exportExcel = () => {
	downBlobFile('/admin/client/export', state.queryForm, 'client.xlsx');
};

// 多选事件
const handleSelectionChange = (objs: { id: string }[]) => {
	selectObjs.value = objs.map(({ id }) => id);
	multiple.value = !objs.length;
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
.custom-danger {
  --el-tag-bg-color: #ffebee;
  --el-tag-border-color: #ffcdd2;
  --el-tag-text-color: #ff7b7b;
}

.copy-btn {
  padding: 0;
  font-size: inherit;
  height: auto;
  line-height: 1;
  color: inherit;
  &:hover {
    color: var(--el-color-primary);
    background-color: transparent;
  }
  &:active {
    color: var(--el-color-primary);
  }
}

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
        gap: 12px;
        margin-top: 16px;
        
        .el-button {
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }
}
</style>