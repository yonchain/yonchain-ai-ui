<template>
	<div class="layout-padding ai-app-index">
		<div class="layout-padding-auto layout-padding-view">
			<el-row v-show="showSearch" class="search-card">
				<div class="card-container">
					<el-form ref="queryRef" :inline="true" :model="queryForm" @keyup.enter="initData">
						<el-form-item :label="$t('knowledge.name')" prop="name" class="search-input">
							<el-input 
								v-model="queryForm.name" 
								:placeholder="$t('knowledge.inputKnowledgeNameTip')" 
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
					<el-button-group class="button-group">
						<el-button 
							icon="Plus" 
							type="primary" 
							@click="appDialogRef.openDialog()"
							class="action-button primary-action"
						>
							{{ $t('common.addBtn') }}
						</el-button>
						<el-button 
							icon="Link" 
							type="success" 
							@click="handleApi"
							class="action-button api-action"
						>
							API
						</el-button>
					</el-button-group>
				
				</div>
			</el-row>

			<ul class="app-list">
				<el-empty 
					v-if="appList.length === 0" 
					description="暂无数据" 
					class="w-full"
				/>
				<li v-for="item in appList" @click="openKnowledgeDetail(item.id)">
					<div class="flex">
						<p class="profile flex-c">{{ item.name.split('')[0] }}</p>
						<div class="w-full flex-1">
							<p class="app-name">{{ item.name }}</p>
						</div>
					</div>
					<div class="app-description">{{ item.description || '-' }}</div>
					<div class="app-actions">
						<el-button type="primary" size="small" icon="Edit" @click.stop="appDialogRef.openDialog(item.id)">{{ $t('common.editBtn') }}</el-button>
						<el-button type="danger" size="small" icon="Delete" @click.stop="handleDelete(item.id)">{{ $t('common.delBtn') }}</el-button>
					</div>
				</li>
			</ul>

			<pagination v-bind="paginationData" @current-change="currentChangeHandle" @size-change="sizeChangeHandle"> </pagination>
		</div>

		<user-form ref="appDialogRef" @refresh="initData()" />
	</div>
</template>

<script lang="ts" name="systemUser" setup>
import { delObj, pageList } from '/@/api/knowledge/index';
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
	name: '',
});

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
	pageList({ page: paginationData.value.current, limit: paginationData.value.size, name: queryForm.name }).then((res) => {
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

// 打开知识库详情页
const openKnowledgeDetail = (knowledgeId: string) => {
  window.open(`/auth/dify/redirect?redirect_uri={difyBaseUrl}/datasets/${knowledgeId}/documents/`, '_blank');
};

// 删除操作
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

// 处理API按钮点击事件
const handleApi = () => {
	useMessage().success('API功能即将开放，敬请期待！');
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
      .search-btn {
        background-color: $primary-color;
        border-color: $primary-color;
        box-shadow: $button-shadow;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: lighten($primary-color, 5%);
          box-shadow: 0 6px 12px rgba(64, 158, 255, 0.2);
          transform: translateY(-2px);
        }
      }
      
      .reset-btn {
        background-color: $bg-color;
        border-color: $border-color;
        color: $text-secondary;
        box-shadow: $button-shadow;
        transition: all 0.3s ease;
        
        &:hover {
          color: $primary-color;
          border-color: $primary-color;
          box-shadow: 0 6px 12px rgba(64, 158, 255, 0.15);
          transform: translateY(-2px);
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
      padding: 16px;
      border-radius: 8px;
      background: $bg-color;
      box-shadow: $card-shadow;
      transition: all 0.3s ease;
      border: 1px solid $border-color;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
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

      .app-description {
        color: $text-secondary;
        font-size: 14px;
        line-height: 1.6;
        margin-top: 12px;
      }

      .app-actions {
        border-top: 1px solid rgba($border-color, 0.5);
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