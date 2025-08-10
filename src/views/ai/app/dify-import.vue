<template>
  <div class="dify-import-container">
    <el-dialog
      :close-on-click-modal="false"
      title="Dify应用导入"
      draggable
      v-model="visible"
      width="700px"
    >
      <div class="steps-container">
        <el-steps :active="currentStep" align-center>
          <el-step title="API信息" />
          <el-step title="应用信息" />
        </el-steps>
      </div>

      <!-- 第一步表单 -->
      <el-form
        v-if="currentStep === 1"
        :model="formData"
        :rules="formRules"
        ref="step1Form"
        label-width="100px"
      >
        <el-form-item label="API密钥" prop="api_key" required>
          <el-input v-model="formData.api_key" placeholder="请输入Dify API密钥" clearable />
        </el-form-item>
        <el-form-item label="基础URL" prop="base_url" required>
          <el-input v-model="formData.base_url" placeholder="请输入Dify API基础URL" clearable />
        </el-form-item>
      </el-form>

      <!-- 第二步表单 -->
      <el-form
        v-if="currentStep === 2"
        :model="formData"
        :rules="formRules"
        ref="step2Form"
        label-width="100px"
      >
        <el-form-item label="应用名称" prop="name" required>
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="应用模式" prop="mode" required>
          <el-select v-model="formData.mode" class="w100" clearable placeholder="请选择应用模式" disabled>
            <el-option v-for="item in modeData" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
         <el-form-item label="API密钥" prop="api_key">
          <el-input v-model="formData.api_key" disabled />
        </el-form-item>
        <el-form-item label="基础URL" prop="base_url">
          <el-input v-model="formData.base_url" />
        </el-form-item>
        <el-form-item label="关联角色" prop="role_ids">
          <el-select
            v-model="formData.role_ids"
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
        <el-form-item label="应用描述" prop="description">
          <el-input :rows="6" type="textarea" v-model="formData.description" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button 
            v-if="currentStep === 1" 
            @click="handleNextStep" 
            type="primary"
            :loading="loading"
          >
            下一步
          </el-button>
          <el-button 
            v-if="currentStep === 2" 
            @click="currentStep = 1" 
            type="default"
          >
            上一步
          </el-button>
          <el-button 
            v-if="currentStep === 2" 
            @click="handleSubmit" 
            type="primary"
          >
            确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { queryDifyAppByApiKeyApi, addObj, putObj } from '/@/api/app/index';
import { list } from '/@/api/admin/role';

const visible = ref(false);
const currentStep = ref(1);

// 定义刷新表格emit
const emit = defineEmits(['refresh']);

const modeData = ref([
  { label: '智能体', value: 'agent-chat' },
  { label: '聊天助手', value: 'chat' },
  { label: '文本生成', value: 'completion' },
  { label: '聊天工作流', value: 'advanced-chat' },
  { label: '工作流', value: 'workflow' }
]);

const formData = reactive({
  api_key: '',
  base_url: '',
  name: '',
  mode: '',
  description: '',
  role_ids: []
});

const formRules = {
  api_key: [{ required: true, message: '请输入API密钥', trigger: 'blur' }],
  base_url: [{ required: true, message: '请输入基础URL', trigger: 'blur' }],
  role_ids: [{ required: true, message: '请选择关联角色', trigger: 'change' }]
};

const step1Form = ref();
const step2Form = ref();
const loadingRoles = ref(false);
const roles = ref<any[]>([]);

// 获取角色列表
const fetchRoles = async () => {
  try {
    loadingRoles.value = true;
    const res = await list();
    roles.value = res.data;
  } catch (err) {
    ElMessage.error(err.message || '获取角色列表失败');
  } finally {
    loadingRoles.value = false;
  }
};

// 打开弹窗
const openDialog = async () => {
  visible.value = true;
  currentStep.value = 1;
  resetForm();
  await fetchRoles();
};

// 重置表单
const resetForm = () => {
  formData.api_key = '';
  formData.base_url = '';
  formData.name = '';
  formData.mode = '';
  formData.description = '';
};

// 下一步
const loading = ref(false);
const handleNextStep = async () => {
  try {
    loading.value = true;
    
    // 验证表单
    try {
      await step1Form.value.validate();
    } catch (validateError) {
      // 表单校验错误
      if (validateError?.errors) {
        const firstError = validateError.errors[0];
        ElMessage.error(firstError.message || '请检查表单填写是否正确');
      }
      return;
    }
    
    if (!formData.api_key || !formData.base_url) {
      ElMessage.error('请填写API密钥和基础URL');
      return;
    }
    
    // 调用接口查询应用信息
    const res = await queryDifyAppByApiKeyApi(formData.api_key, formData.base_url);
    formData.name = res.name || '';
    formData.mode = res.mode || '';
    formData.description = res.description || '';
    currentStep.value = 2;
  } catch (error) {
    ElMessage.error(error.message || '查询失败，请检查网络或API配置');
  } finally {
    loading.value = false;
  }
};

// 提交
const handleSubmit = async () => {
  try {
    loading.value = true;
    
    // 显式调用表单校验
    try {
      await step2Form.value.validate();
    } catch (validateError) {
      // 表单校验错误
      if (validateError?.errors) {
        const firstError = validateError.errors[0];
        ElMessage.error(firstError.message || '请检查表单填写是否正确');
      }
      return;
    }
    
    // 检查必填字段
    if (!formData.role_ids || formData.role_ids.length === 0) {
      ElMessage.error('请选择关联角色');
      return;
    }
    
    const { id } = formData;
    
    try {
      if (id) {
        await putObj(formData.id, formData);
        ElMessage.success('导入成功');
      } else {
        await addObj(formData);
        ElMessage.success('导入成功');
      }
      
      visible.value = false;
      emit('refresh');
    } catch (apiError) {
      // API调用错误
      ElMessage.error(apiError.message || '导入失败，请稍后重试');
      console.error('API调用错误:', apiError);
    }
  } catch (unexpectedError) {
    // 未预期的错误
    ElMessage.error('发生未知错误，请检查控制台');
    console.error('未预期的错误:', unexpectedError);
  } finally {
    loading.value = false;
  }
};

// 暴露方法
defineExpose({
  openDialog
});
</script>

<style lang="scss" scoped>
.dify-import-container {
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

  .steps-container {
    margin-bottom: 24px;
    padding: 0 20px;
  }

  .dialog-footer {
    .el-button {
      border-radius: 6px;
      padding: 10px 20px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: translateY(0);
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
</style>