<template>
	<div class="provider-form-dialog-container">
		<el-dialog 
			:close-on-click-modal="false" 
			:title="dataForm.id ? $t('common.editBtn') : $t('common.addBtn')" 
			draggable 
			v-model="visible"
			class="provider-form-dialog"
			width="700px"
		>
			<el-form :model="dataForm" :rules="dataRules" label-width="90px" ref="dataFormRef" v-loading="loading">
				<el-row :gutter="20">
					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('provider.name')" prop="name">
							<el-input placeholder="请输入提供商名称" v-model="dataForm.name"></el-input>
						</el-form-item>
					</el-col>

					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('provider.type')" prop="provider_type">
							<el-select 
								v-model="dataForm.provider_type" 
								class="w100" 
								clearable 
								placeholder="请选择提供商类型"
							>
								<el-option v-for="item in providerTypeData" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>

					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('provider.baseUrl')" prop="base_url">
							<el-input placeholder="请输入API基础URL" v-model="dataForm.base_url"></el-input>
						</el-form-item>
					</el-col>

					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('provider.apiKey')" prop="api_key">
							<el-input placeholder="请输入API密钥" v-model="dataForm.api_key" show-password></el-input>
						</el-form-item>
					</el-col>

					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('provider.description')" prop="description">
							<el-input :rows="4" type="textarea" placeholder="请输入提供商描述" v-model="dataForm.description"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
					<el-button @click="onSubmit" type="primary" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" name="systemProviderDialog" setup>
import { addObj, getObj, putObj } from '/@/api/modelProvider/index';
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';

const { t } = useI18n();

// 定义刷新表格emit
const emit = defineEmits(['refresh']);

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

const dataForm = reactive({
	id: '',
	description: '',
	name: '',
	provider_type: '',
	base_url: '',
	api_key: '',
});


const providerTypeData = ref([
	{ label: 'OpenAI', value: 'openai' },
	{ label: 'Azure OpenAI', value: 'azure_openai' },
	{ label: 'Anthropic', value: 'anthropic' },
	{ label: 'Google AI', value: 'google' },
	{ label: '百度文心', value: 'baidu' },
	{ label: '讯飞星火', value: 'xunfei' },
	{ label: '智谱AI', value: 'zhipu' },
	{ label: '自定义', value: 'custom' }
]);

const dataRules = ref({
	name: [{ required: true, message: '提供商名称不能为空', trigger: 'blur' }],
	provider_type: [{ required: true, message: '提供商类型不能为空', trigger: 'change' }],
	base_url: [{ required: true, message: 'API基础URL不能为空', trigger: 'blur' }],
	api_key: [{ required: true, message: 'API密钥不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = async (id: string) => {
	visible.value = true;
	dataForm.id = '';

	// 重置表单数据
	nextTick(() => {
		dataFormRef.value?.resetFields();
	});

	// 修改获取提供商信息
	if (id) {
		dataForm.id = id;
		const res = await getObj(id);
		dataForm.name = res.name;
		dataForm.provider_type = res.provider_type;
		dataForm.description = res.description;
		dataForm.base_url = res.base_url;
		dataForm.api_key = res.api_key;
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => {});
	if (!valid) return false;

	try {
		const { id } = dataForm;

		if (id) {
			loading.value = true;
			await putObj(dataForm.id, dataForm);
			useMessage().success(t('common.editSuccessText'));
			visible.value = false; // 关闭弹窗
			emit('refresh');
		} else {
			loading.value = true;
			await addObj(dataForm);
			useMessage().success(t('common.addSuccessText'));
			visible.value = false; // 关闭弹窗
			emit('refresh');
		}
	} catch (error: any) {
		useMessage().error(error.message);
	} finally {
		loading.value = false;
	}
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
.provider-form-dialog {
  .el-dialog__body {
    padding: 25px 30px;
    background-color: #f8fafc;
  }

  .el-dialog {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .el-dialog__header {
    padding: 20px 30px;
    background: linear-gradient(135deg, #f6f7f9, #e9ebee);
    border-bottom: 1px solid #e4e7ed;
    margin-right: 0;
  }

  .el-form {
    background: white;
    padding: 25px 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    
    .el-form-item {
      margin-bottom: 28px;
      transition: all 0.3s ease;
      padding: 12px 16px;
      border-radius: 8px;
      background-color: rgba(248, 250, 252, 0.5);
      border-left: 3px solid #e4e7ed;

      &:hover {
        transform: translateX(4px);
        border-left-color: var(--el-color-primary);
        background-color: rgba(236, 245, 255, 0.3);
      }

      :deep(.el-form-item__label) {
        font-weight: 600;
        color: #4a5568;
        font-size: 14px;
        padding-right: 15px;
        margin-bottom: 8px;
        display: block;
      }

      .el-input,
      .el-select {
        .el-input__wrapper {
          border-radius: 8px;
          box-shadow: 0 0 0 1px #e2e8f0;
          transition: all 0.3s ease;
          background-color: white;
          padding: 8px 12px;
          min-height: 42px;

          &:hover {
            box-shadow: 0 0 0 1px #cbd5e0;
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary);
          }
        }
      }

      .el-textarea {
        .el-textarea__inner {
          border-radius: 8px;
          box-shadow: 0 0 0 1px #e2e8f0;
          transition: all 0.3s ease;
          padding: 12px;
          min-height: 100px;
          line-height: 1.6;

          &:hover {
            box-shadow: 0 0 0 1px #cbd5e0;
          }

          &:focus {
            box-shadow: 0 0 0 1px var(--el-color-primary);
          }
        }
      }
    }
  }

  .el-select {
    :deep(.el-tag) {
      background: linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(64, 169, 255, 0.2));
      border-color: rgba(24, 144, 255, 0.3);
      color: var(--el-color-primary);
      font-weight: 500;
      margin: 4px 4px 4px 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    :deep(.el-select__tags) {
      margin: 0;
      padding: 1px 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
  }
  
  :deep(.el-select-dropdown) {
    border: none;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    padding: 8px 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .el-select-dropdown__item {
      padding: 8px 20px;
      margin: 2px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: rgba(236, 245, 255, 0.8);
        transform: translateX(4px);
      }
      
      &.selected {
        color: var(--el-color-primary);
        font-weight: 500;
        background-color: rgba(236, 245, 255, 0.5);
      }
      
      &.is-disabled {
        color: var(--el-text-color-disabled);
        cursor: not-allowed;
      }
    }
    
    .el-select-dropdown__empty {
      padding: 12px 0;
      color: var(--el-text-color-secondary);
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20px 0 0;
    margin-top: 20px;
    border-top: 1px dashed #e2e8f0;

    .el-button {
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      letter-spacing: 0.5px;

      + .el-button {
        margin-left: 15px;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.el-button--primary {
        background-color: #1890ff;
        border-color: #1890ff;
        color: white;
        
        &:hover {
          background-color: #40a9ff;
          border-color: #40a9ff;
        }
        
        &:active {
          background-color: #096dd9;
          border-color: #096dd9;
        }
      }
    }
  }
}
</style>