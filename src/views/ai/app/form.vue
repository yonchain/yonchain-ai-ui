<template>
	<div class="app-form-dialog-container">
		<el-dialog 
			:close-on-click-modal="false" 
			:title="dataForm.id ? $t('common.editBtn') : importStep === 1 ? 'Dify导入 - 第一步' : 'Dify导入 - 第二步'" 
			draggable 
			v-model="visible"
			class="app-form-dialog"
			width="700px"
		>
			<div v-if="!dataForm.id && importStep > 0" class="steps-container">
				<el-steps :active="importStep" align-center>
					<el-step title="输入API信息" />
					<el-step title="填写应用信息" />
				</el-steps>
			</div>
			<el-form :model="dataForm" :rules="dataRules" label-width="90px" ref="dataFormRef" v-loading="loading">
				<template v-if="importStep === 1">
					<el-row :gutter="20">
						<el-col :span="24" class="mb20">
							<el-form-item label="API密钥" prop="apiKey" required>
								<el-input v-model="dataForm.api_key" placeholder="请输入Dify API密钥" clearable />
							</el-form-item>
						</el-col>
						<el-col :span="24" class="mb20">
							<el-form-item label="基础URL" prop="base_url" required>
								<el-input v-model="dataForm.base_url" placeholder="请输入Dify API基础URL" clearable />
							</el-form-item>
						</el-col>
					</el-row>
				</template>
				<el-row :gutter="20" v-else>

          		<el-col :span="24" class="mb20" v-if="dataForm.id === ''">
						<el-form-item label="提供商" prop="provider">
							<el-select v-model="dataForm.provider" placeholder="请选择应用提供商" class="w100" clearable>
								<el-option label="Dify" value="dify" />
								<el-option label="N8N" value="n8n" />
								<el-option label="Coze" value="coze" />
							</el-select>
						</el-form-item>
					</el-col>

					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('app.name')" prop="name">
							<el-input placeholder="请输入应用名称" v-model="dataForm.name"></el-input>
						</el-form-item>
					</el-col>

					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('app.mode')" prop="mode">
							<el-tooltip content="编辑模式下不能修改应用模式" placement="top" :disabled="!dataForm.id">
								<el-select 
									v-model="dataForm.mode" 
									class="w100" 
									clearable 
									placeholder="请选择应用模式" 
									:disabled="!!dataForm.id"
								>
								<el-option v-for="item in modeData" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
							</el-tooltip>
						</el-form-item>
					</el-col>

          	<el-col :span="24" class="mb20" v-if="dataForm.provider === 'dify'">
						<el-form-item label="API密钥" prop="apiKey" required>
							<el-input placeholder="请输入API密钥" v-model="dataForm.api_key">
								<template #append>
									<el-button @click="queryDifyAppByApiKey" :disabled="!dataForm.api_key" type="primary" size="small" plain>查询Dify</el-button>
								</template>
							</el-input>
						</el-form-item>
					</el-col>

      <el-col :span="24" class="mb20" v-if="dataForm.provider === 'dify'">
						<el-form-item :label="$t('provider.baseUrl')" prop="base_url" required>
							<el-input placeholder="请输入API基础URL" v-model="dataForm.base_url"></el-input>
						</el-form-item>
					</el-col>

					<el-col :span="24" class="mb20">
						<el-form-item label="关联角色" prop="role_ids">
							<el-select 
								v-model="dataForm.role_ids" 
								placeholder="请选择关联角色"
								:loading="loadingRoles"
								clearable
								filterable
								multiple
								class="w100"
							>
								<el-option
									v-for="item in roles"
									:key="item.id"
									:label="item.name"
									:value="item.id"
								/>
							</el-select>
						</el-form-item>
					</el-col>

					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('app.appDescription')" prop="description">
							<el-input :rows="6" type="textarea" placeholder="请输入应用描述" v-model="dataForm.description"></el-input>
						</el-form-item>
					</el-col>

	

				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
					<el-button v-if="importStep === 1" @click="queryDifyAppByApiKey" type="primary" :disabled="loading">下一步</el-button>
					<el-button v-else @click="onSubmit" type="primary" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" name="systemUserDialog" setup>
import { addObj, getObj, putObj, queryDifyAppByApiKeyApi } from '/@/api/app/index';
import { list } from '/@/api/admin/role';
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';

const { t } = useI18n();

// 定义刷新表格emit
const emit = defineEmits(['refresh']);

// 角色相关变量
const roles = ref<any[]>([]);
const loadingRoles = ref(false);

// 获取角色列表
const fetchRoles = async () => {
  try {
    loadingRoles.value = true;
    const res = await list();
    roles.value = res.data;
  } catch (err) {
    useMessage().error(err.message || '获取角色列表失败');
  } finally {
    loadingRoles.value = false;
  }
};

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

const importStep = ref(0); // 0: 未开始, 1: 第一步, 2: 第二步

const dataForm = reactive({
	id: '',
	description: '',
	name: '',
	mode: '',
	role_ids: [] as string[],
	enableSite: false,
	enableApi: false,
	provider: '',
	api_key: '',
  base_url: '',
});


const modeData = ref([
	{ label: '智能体', value: 'agent-chat' },
  { label: '聊天助手', value: 'chat' },
	{ label: '文本生成', value: 'completion' },
	{ label: '聊天工作流', value: 'advanced-chat' },
	{ label: '工作流', value: 'workflow' }
]);

const dataRules = ref({
	name: [{ required: true, message: '应用名称不能为空', trigger: 'blur' }],
	mode: [{ required: true, message: '应用模式不能为空', trigger: 'change' }],
	role_ids: [{ required: true, message: '请选择关联角色', trigger: 'change' }],
	provider: [{ required: true, message: '请选择应用提供商', trigger: 'change' }],
	api_key: [{ required: dataForm.provider === 'dify', message: 'API密钥不能为空', trigger: 'blur' }],
  base_url: [{ required: dataForm.provider === 'dify', message: 'API基础URL不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = async (id: string, type: string = '') => {
	visible.value = true;
	dataForm.id = '';
	importStep.value = type === 'importDify' ? 1 : 0;

	// 重置表单数据
	nextTick(() => {
		dataFormRef.value?.resetFields();
		if (type === 'importDify') {
			dataForm.provider = 'dify';
		}
	});

	// 获取角色列表并等待完成
	await fetchRoles();

	// 修改获取应用信息
	if (id) {
		dataForm.id = id;
		const res = await getObj(id);
		dataForm.name = res.name;
		dataForm.mode = res.mode;
		dataForm.description = res.description;
		// 直接使用接口返回的角色ID数组
		dataForm.role_ids = res.role_ids || [];
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

const queryDifyAppByApiKey = async () => {
	if (!dataForm.api_key || !dataForm.base_url) {
		useMessage().error('API密钥和基础URL不能为空');
		return;
	}
	try {
		loading.value = true;
		const res = await queryDifyAppByApiKeyApi(dataForm.api_key, dataForm.base_url);
		if (res.data) {
			// 回填表单数据
			dataForm.name = res.data.name || '';
			dataForm.mode = res.data.mode || '';
			dataForm.description = res.data.description || '';
			dataForm.provider = 'dify'; // 显示应用提供商
			importStep.value = 2; // 进入第二步
		}
		useMessage().success('查询成功');
	} catch (error: any) {
		useMessage().error(error.message || '查询失败');
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
.app-form-dialog {
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