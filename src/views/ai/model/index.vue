<template>
	<div class="layout-padding ai-model-index">
		<div class="layout-padding-auto layout-padding-view">
			<el-row v-show="showSearch" class="search-card">
				<div class="card-container">
					<el-form ref="queryRef" :inline="true" :model="queryForm" @keyup.enter="initData">
            <el-form-item :label="$t('model.provider')" prop="provider_id" class="search-input">
							<el-select
								v-model="queryForm.provider_id"
								:placeholder="$t('model.selectProviderTip')"
								clearable
								class="input-with-shadow"
								:loading="loadingProviders"
							>
								<el-option
									v-for="item in providers"
									:key="item.id"
									:label="item.name"
									:value="item.id"
								/>
							</el-select>
						</el-form-item>
						<el-form-item :label="$t('model.type')" prop="type" class="search-input">
							<el-select
								v-model="queryForm.type"
								:placeholder="$t('model.selectTypeTip')"
								clearable
								class="input-with-shadow"
							>
								<el-option
									v-for="item in typeData"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								/>
							</el-select>
						</el-form-item>
						<el-form-item :label="$t('model.name')" prop="name" class="search-input">
							<el-input 
								v-model="queryForm.name" 
								:placeholder="$t('model.inputModelNameTip')" 
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
				<div class="mb-[16px] flex items-center justify-between" style="width: 100%">
					<!-- 主要操作区域 -->
					<el-button-group class="button-group">
						<el-button 
							icon="Plus" 
							type="primary" 
							@click="modelDialogRef.openDialog()"
							class="action-button primary-action"
						>
							{{ $t('common.addBtn') }}
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

			<ul class="model-list">
				<el-empty 
					v-if="modelList.length === 0" 
					description="暂无数据" 
					class="w-full"
				/>
				<li v-for="item in modelList" :key="item.id">
					<div class="flex">
						<p class="profile flex-c">{{ item.name.split('')[0] }}</p>
						<div class="w-full flex-1">
							<p class="model-name">{{ item.name }}</p>
							<el-tag 
								type="success" 
								effect="dark" 
								class="mt-[8px] font-medium"
							>
								{{ getTypeLabel(item.type) }}
							</el-tag>
							<div class="mt-[8px] text-[#677182]">
								<span>{{ $t('model.provider') }}: {{ item.provider_name || '-' }}</span>
								<span class="ml-4">{{ $t('model.type') }}: {{ getTypeLabel(item.type) || '-' }}</span>
								<div class="mt-[8px]">{{ $t('model.description') }}: {{ item.description || '-' }}</div>
							</div>
						</div>
					</div>
					<div class="mt-[12px] text-[#677182]">{{ item.description || '-' }}</div>
					<div class="model-actions">
						<el-button type="primary" size="small" icon="Edit" @click="modelDialogRef.openDialog(item.id)">{{ $t('common.editBtn') }}</el-button>
						<el-button type="danger" size="small" icon="Delete" @click="handleDelete(item.id)">{{ $t('common.delBtn') }}</el-button>
					</div>
				</li>
			</ul>

			<pagination v-bind="paginationData" @current-change="currentChangeHandle" @size-change="sizeChangeHandle"> </pagination>
		</div>

		<user-form ref="modelDialogRef" @refresh="initData()" />
	</div>
</template>

<script lang="ts" name="systemModel" setup>
import { delObj, pageList } from '/@/api/model/index';
import { list } from '/@/api/modelProvider/index';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';

// 动态引入组件
const UserForm = defineAsyncComponent(() => import('./form.vue'));

const { t } = useI18n();

// 提供商相关变量
const providers = ref<any[]>([]);
const loadingProviders = ref(false);

// 获取提供商列表
const fetchProviders = async () => {
  try {
    loadingProviders.value = true;
    const res = await list();
    providers.value = res.data;
  } catch (err) {
    useMessage().error(err.message || '获取提供商列表失败');
  } finally {
    loadingProviders.value = false;
  }
};

// 定义变量内容
const modelDialogRef = ref();
const queryRef = ref();
const showSearch = ref(true);

const modelList: any = ref([]);

// 定义表格查询、后台调用的API
const queryForm = reactive({
	type: '',
	name: '',
	provider_id: ''
});

const typeData = ref([
	{ label: '文本生成', value: 'text-generation' },
	{ label: '文本嵌入', value: 'embeddings' },
	{ label: '语音转文本', value: 'speech-to-text' },
	{ label: '文本转语音', value: 'text-to-speech' },
	{ label: '图像生成', value: 'image-generation' }
]);

// 获取类型对应的中文标签
const getTypeLabel = (type: string) => {
	const found = typeData.value.find(item => item.value === type);
	return found ? found.label : type;
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
		type: queryForm.type,
		name: queryForm.name,
		provider_id: queryForm.provider_id
	}).then((res) => {
		modelList.value = res.data;
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
	fetchProviders();
});

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
</script>
<style lang="scss" scoped>
.ai-model-index {
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

  .model-list {
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

      .model-name {
        font-size: 18px;
        font-weight: 600;
        color: $text-color;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
        transition: color 0.2s ease;
      }

      .model-actions {
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