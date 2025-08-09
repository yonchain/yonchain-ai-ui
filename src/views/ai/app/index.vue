<template>
	<div class="layout-padding ai-app-index">
		<div class="layout-padding-auto layout-padding-view">
			<el-row v-show="showSearch" class="search-card">
				<div class="card-container">
					<el-form ref="queryRef" :inline="true" :model="queryForm" @keyup.enter="initData">
						<el-form-item :label="$t('app.mode')" prop="mode" class="search-input">
							<el-select
								v-model="queryForm.mode"
								:placeholder="$t('app.selectModeTip')"
								clearable
								class="input-with-shadow"
							>
								<el-option
									v-for="item in modeData"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								/>
							</el-select>
						</el-form-item>
						<el-form-item :label="$t('app.name')" prop="name" class="search-input">
							<el-input 
								v-model="queryForm.name" 
								:placeholder="$t('app.inputAppNameTip')" 
								clearable 
								class="input-with-shadow"
							/>
						</el-form-item>
						<el-form-item class="search-buttons">
							<el-button 
								icon="Search" 
								type="primary" 
								@click="initData"
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
				<div class="flex items-center justify-between" style="width: 100%; margin-bottom: 8px;">
					<!-- 主要操作区域 -->
					<el-button-group class="button-group">
						<el-button 
							icon="Plus" 
							type="primary" 
							@click="appDialogRef.openDialog()"
							class="action-button"
						>
							{{ $t('common.addBtn') }}
						</el-button>
						<el-button 
							icon="Upload" 
							type="success"
							class="action-button"
							@click="handleImportDify"
						>
							导入Dify
						</el-button>
						<el-button 
							icon="Upload" 
							type="warning"
							class="action-button"
							@click="handleImportCoze"
						>
							导入Coze
						</el-button>
						<el-button 
							icon="Upload" 
							type="danger"
							class="action-button"
							@click="handleImportN8N"
						>
							导入N8N
						</el-button>
					</el-button-group>
					
					<!-- 辅助功能区域 -->
					<div class="flex items-center gap-2">
						<div class="h-6 w-px bg-gray-200 mx-2"></div>
						<el-button-group class="button-group">
							<!-- 预留更多辅助按钮位置 -->
						</el-button-group>
					</div>
				</div>
			</el-row>

			<ul class="app-list" style="max-height: calc(100vh - 400px); min-height: 200px; margin-bottom: 32px;">
				<el-empty 
					v-if="appList.length === 0" 
					description="暂无数据" 
					class="w-full"
				/>
				<li v-for="item in appList" @click="openAppDetail(item.id)">
					<div class="flex">
						<p class="profile flex-c">{{ item.name.split('')[0] }}</p>
						<div class="w-full flex-1">
							<p class="app-name">{{ item.name }}</p>
							<el-tag 
								type="success" 
								effect="dark" 
								class="mt-[8px] font-medium"
							>
								{{ getModeLabel(item.mode) }}
							</el-tag>
							<div v-if="item.roles?.length" class="mt-[8px]">
								<el-tag 
									v-for="role in item.roles" 
									:key="role.id"
									size="small"
									:class="`mr-[4px] mb-[4px] ${getRoleTagClass(role.id)}`"
									effect="light"
								>
									{{ role.name }}
								</el-tag>
							</div>
							<div v-else class="mt-[8px] text-[#999] text-sm">未关联角色</div>
						</div>
					</div>
					<div class="mt-[12px] text-[#677182] line-clamp-2 overflow-hidden text-ellipsis" style="max-height: 3em;">{{ item.description || '-' }}</div>
					<div class="app-actions">
						<el-button type="success" size="small" icon="MagicStick" @click.stop="openAppDetail(item.id)">{{ $t('app.designBtn') }}</el-button>
						<el-button type="primary" size="small" icon="Edit" @click.stop="appDialogRef.openDialog(item.id)">{{ $t('common.editBtn') }}</el-button>
						<el-button type="danger" size="small" icon="Delete" @click.stop="handleDelete(item.id)">{{ $t('common.delBtn') }}</el-button>
					</div>
				</li>
			</ul>

			<div style="margin-top: 24px; margin-bottom: 24px;">
			<pagination v-bind="paginationData" @current-change="currentChangeHandle" @size-change="sizeChangeHandle"> </pagination>
		</div>
		</div>

		<user-form ref="appDialogRef" @refresh="initData()" />
	</div>
</template>

<script lang="ts" name="systemUser" setup>
import { delObj, pageList } from '/@/api/app/index';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';

// 动态引入组件
const UserForm = defineAsyncComponent(() => import('./form.vue'));

const { t } = useI18n();

// 定义变量内容
const appDialogRef = ref();
const queryRef = ref();
const showSearch = ref(true);

const appList: any = ref([]);

// 定义表格查询、后台调用的API
const queryForm = reactive({
	mode: '',
	name: '',
});

const modeData = ref([
	{ label: '聊天助手', value: 'chat' },
	{ label: '智能体', value: 'agent-chat' },
	{ label: '文本生成', value: 'completion' },
	{ label: '聊天工作流', value: 'advanced-chat' },
	{ label: '工作流', value: 'workflow' }
]);

// 获取模式对应的中文标签
const getModeLabel = (mode: string) => {
	const found = modeData.value.find(item => item.value === mode);
	return found ? found.label : mode;
};

// 获取角色标签的样式类
const getRoleTagClass = (roleId: string) => {
	const colors = [
		'bg-blue-100 text-blue-800 border-blue-200',
		'bg-green-100 text-green-800 border-green-200',
		'bg-yellow-100 text-yellow-800 border-yellow-200',
		'bg-purple-100 text-purple-800 border-purple-200',
		'bg-pink-100 text-pink-800 border-pink-200',
		'bg-indigo-100 text-indigo-800 border-indigo-200',
	];
	// 根据角色ID哈希值选择颜色
	const hash = Array.from(roleId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return colors[hash % colors.length];
};


// 清空搜索条件
const resetQuery = () => {
	queryRef.value?.resetFields();
	initData();
};

const paginationData = ref({
	current: 1,
	size: 12,
	total: 0,
	pageSizes: [1, 12, 30, 50, 100, 200],
	layout: 'total, sizes, prev, pager, next, jumper',
});

const initData = () => {
	pageList({ 
		page: paginationData.value.current, 
		limit: paginationData.value.size, 
		mode: queryForm.mode,
		name: queryForm.name 
	}).then((res) => {
		appList.value = res.data;
		paginationData.value.current = res.page;
		paginationData.value.size = res.limit;
		paginationData.value.total = res.total;
	});
};

const currentChangeHandle = (val: number) => {
	paginationData.value.current = val;
	initData();
};
const sizeChangeHandle = (val: number) => {
	paginationData.value.size = val;
	initData();
};

onMounted(() => {
	initData();
});


const openAppDetail = (appId: string) => {
  //跳转到Dify平台应用详情页
  window.open(`/auth/dify/redirect?redirect_uri={difyBaseUrl}/app/${appId}/configuration/`, '_blank');
};

const handleDelete = async (id: string) => {
	try {
		await useMessageBox().confirm(t('common.delConfirmText'));
	} catch {
		return;
	}

	try {
		await delObj(id);
		initData();
		useMessage().success(t('common.delSuccessText'));
	} catch (err: any) {
		useMessage().error(err.message);
	}
};



const handleImportDify = () => {
  appDialogRef.value.openDialog(null, 'import');
};

const handleImportCoze = () => {
  useMessage().success(t('开发中，敬请期待'));
  // TODO: 实现导入Coze功能
};

const handleImportN8N = () => {
  useMessage().success(t('开发中，敬请期待'));
  // TODO: 实现导入N8N功能
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

  // 响应式断点
  $breakpoint-desktop: 1440px;
  $breakpoint-laptop: 1024px;
  $breakpoint-tablet: 768px;
  $breakpoint-mobile: 480px;

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

    @media (max-width: $breakpoint-tablet) {
      flex-wrap: wrap;
      gap: 8px;
    }

    @media (max-width: $breakpoint-mobile) {
      gap: 6px;
    }

    @media (min-width: 1920px) {
      gap: 16px;
    }
  }
  
  .refresh-button {
    transition: all 0.3s ease;
    border-radius: 6px;
    box-shadow: $button-shadow;
    
    &:hover {
      color: $primary-color;
      border-color: $primary-color;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(64, 158, 255, 0.15);
    }
    
    &:active {
      transform: translateY(0);
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

            @media (max-width: $breakpoint-tablet) {
              padding: 16px !important;
              min-height: 72px !important;
            }

            @media (max-width: $breakpoint-mobile) {
              padding: 12px !important;
              min-height: 64px !important;
            }
        
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

      @media (max-width: $breakpoint-tablet) {
        margin-right: 12px;
        
        .input-with-shadow {
          width: 180px;
        }
      }

      @media (max-width: $breakpoint-mobile) {
        margin-right: 8px;
        
        .input-with-shadow {
          width: 160px;
        }
      }

      @media (min-width: 1920px) {
        margin-right: 24px;
        
        .input-with-shadow {
          width: 240px;
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

  .secondary-action.icon-only {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    &:hover {
      transform: scale(1.1);
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
    }
    
    &:active {
      transform: scale(0.95);
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
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        border-color: $primary-color;
        z-index: 1;
        position: relative;
      }
      
      @media (max-width: 1920px) {
        width: calc(25% - 12px);
        padding: 20px;
      }
      
      @media (max-width: 1440px) {
        width: calc(33.33% - 12px);
        padding: 18px;
      }
      
      @media (max-width: 1280px) {
        width: calc(50% - 12px);
        padding: 16px;
      }
      
      @media (max-width: 1024px) {
        width: calc(50% - 10px);
        padding: 14px;
        gap: 12px;
      }
      
      @media (max-width: 768px) {
        width: 100%;
        padding: 12px;
      }
      
      @media (min-width: 1920px) {
        gap: 24px;
      }

      @media (max-width: $breakpoint-desktop) {
        width: calc(33.33% - 12px);
      }

      @media (max-width: $breakpoint-laptop) {
        width: calc(50% - 12px);
      }

      @media (max-width: $breakpoint-tablet) {
        width: 100%;
        padding: 16px;
      }

      @media (max-width: $breakpoint-mobile) {
        padding: 12px;
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

        @media (max-width: $breakpoint-tablet) {
          font-size: 16px;
        }

        @media (max-width: $breakpoint-mobile) {
          font-size: 14px;
        }
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

        @media (max-width: $breakpoint-tablet) {
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 12px;
          margin-top: 12px;
          
          .el-button {
            padding: 6px 12px;
          }
        }

        @media (max-width: $breakpoint-mobile) {
          gap: 6px;
          padding-top: 8px;
          margin-top: 8px;
          
          .el-button {
            padding: 4px 8px;
            font-size: 12px;
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