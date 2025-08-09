<template>
  <el-dialog 
    :close-on-click-modal="false" 
    :title="form.id ? $t('common.editBtn') : $t('common.addBtn')" 
    width="700px"
    draggable 
    v-model="visible"
    class="client-form-dialog"
  >
    <el-form :model="form" :rules="dataRules" formDialogRef label-width="120px" ref="dataFormRef" v-loading="loading">
      <el-form-item :label="t('client.clientId')" prop="client_id">
        <el-input 
          :placeholder="t('client.inputClientIdTip')" 
          v-model="form.client_id"
          :disabled="form.client_id === 'yonchain'"
        />
      </el-form-item>
      <el-form-item :label="t('client.clientSecret')" prop="client_secret">
        <el-input :placeholder="t('client.inputClientSecretTip')" v-model="form.client_secret"/>
      </el-form-item>
       <el-form-item :label="t('client.clientName')" prop="client_name">
        <el-input :placeholder="t('client.inputClientNameTip')" v-model="form.client_name"/>
      </el-form-item>
      <el-form-item :label="t('client.scope')" prop="scopes">
        <el-input :placeholder="t('client.inputScopeTip')" v-model="form.scopes"/>
      </el-form-item>
      <el-form-item :label="t('client.authorizedGrantTypes')" prop="authorization_grant_types" class="grant-types-item">
        <div style="display: flex; align-items: center; width: 100%">
          <el-select 
            collapse-tags 
            collapse-tags-tooltip 
            :max-collapse-tags="2"
            multiple 
            v-model="selectedGrantTypes"
            class="grant-types-select"
          >
            <el-option :key="index" :label="item.label" :value="item.value"
                      v-for="(item, index) in grant_types"></el-option>
          </el-select>
          <span class="selected-count" v-if="selectedGrantTypes.length > 0">
            已选 {{ selectedGrantTypes.length }} 个
          </span>
        </div>
      </el-form-item>
      <el-form-item :label="t('client.accessTokenValidity')" prop="access_token_time_to_live">
        <el-input-number :placeholder="t('client.inputAccessTokenValidityTip')" v-model="form.access_token_time_to_live"/>
      </el-form-item>
      <el-form-item :label="t('client.refreshTokenValidity')" prop="refresh_token_time_to_live">
        <el-input-number :placeholder="t('client.inputRefreshTokenValidityTip')" v-model="form.refresh_token_time_to_live"/>
      </el-form-item>


      <el-form-item :label="t('client.webServerRedirectUri')" prop="redirect_uris"
                    v-if="form.authorization_grant_types.includes('authorization_code')">
        <el-input :placeholder="t('client.inputWebServerRedirectUriTip')" v-model="form.redirect_uris"/>
      </el-form-item>
    </el-form>
    <template #footer>
			<span class="dialog-footer">
				<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
				<el-button @click="onSubmit" type="primary" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
			</span>
    </template>
  </el-dialog>
</template>

<script lang="ts" name="SysOauthClientDetailsDialog" setup>
import {useMessage} from '/@/hooks/message';
import {addObj, getObj, putObj, validateclientId} from '/@/api/admin/client';
import {useI18n} from 'vue-i18n';
import {rule} from '/@/utils/validate';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const {t} = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);
const selectedGrantTypes = ref<string[]>([]);

// 定义字典
const grant_types = [
  {label: '授权码模式', value: 'authorization_code'},
  {label: '密码模式', value: 'password'},
  {label: '客户端模式', value: 'client_credentials'},
  {label: '简化模式', value: 'implicit'},
  {label: '刷新Token', value: 'refresh_token'},
  {label: '钉钉模式', value: 'dingtalk' },
  {label: 'dify模式', value: 'dify' },
  {label: 'dify授权码模式',value: 'dify_authorization_code' },
];

const common_status = [
  {label: '是', value: 'true'},
  {label: '否', value: 'false'}
];

// 提交表单数据
const form = reactive({
  id: '',
  client_id: '',
  client_secret: '',
  client_name:'',
  scopes: 'server',
  authorization_grant_types: [] as string[],
  redirect_uris: '',
  authorities: '',
  access_token_time_to_live: 43200,
  refresh_token_time_to_live: 2592001,
  autoapprove: 'true',
  delFlag: '',
  createBy: '',
  updateBy: '',
  createTime: '',
  updateTime: '',
  tenantId: '',
  onlineQuantity: '1',
  captchaFlag: '1',
  encFlag: '1',
});

// 定义校验规则
const dataRules = ref({
  client_id: [
    {validator: rule.overLength, trigger: 'blur'},
    {required: true, message: '客户id不能为空', trigger: 'blur'}
  /**   {
      validator: (rule: any, value: any, callback: any) => {
        validateclientId(rule, value, callback, form.id !== '');
      },
      trigger: 'blur',
    },*/
  ],
  client_secret: [
    {validator: rule.overLength, trigger: 'blur', message: '客户端密钥长度不能超过限制'},
    {required: true, message: '客户端密钥不能为空', trigger: 'blur'}
  ],
  client_name: [
    {required: true, message: '客户端名称不能为空', trigger: 'blur'}
  ],
  scopes: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '范围不能为空', trigger: 'blur'}],
  authorization_grant_types: [{required: true, message: '授权模式不能为空', trigger: 'blur'}],
  access_token_time_to_live: [
    {validator: rule.overLength, trigger: 'blur'},
    {required: true, message: '令牌时效不能为空', trigger: 'blur'},
    {type: 'number', min: 1, message: '令牌时效不能小于一小时', trigger: 'blur'},
  ],
  refresh_token_time_to_live: [
    {validator: rule.overLength, trigger: 'blur'},
    {required: true, message: '刷新时效不能为空', trigger: 'blur'},
    {type: 'number', min: 1, message: '刷新时效不能小于两小时', trigger: 'blur'},
  ],
  autoapprove: [{required: true, message: '自动放行不能为空', trigger: 'blur'}],
  redirect_uris: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '回调地址不能为空', trigger: 'blur'}],
  authorities: [{validator: rule.overLength, trigger: 'blur'}],
});

// 打开弹窗
const openDialog = (id: string) => {
  visible.value = true;
  form.id = '';
  // 重置表单数据
  nextTick(() => {
    dataFormRef.value?.resetFields();
  });

  // 获取sysOauthClientDetails信息
  if (id) {
    form.id = id;
    getsysOauthClientDetailsData(id);
  }
};

// 提交
const onSubmit = async () => {
  // 将数组转换为逗号分隔字符串
  form.authorization_grant_types = selectedGrantTypes.value.join(',');
  const valid = await dataFormRef.value.validate().catch((err) => {
    return false;
  });
  if (!valid) return false;

  try {
    loading.value = true;
    form.id ? await putObj(form) : await addObj(form);
    useMessage().success(t(form.id ? 'common.editSuccessText' : 'common.addSuccessText'));
    visible.value = false;
    emit('refresh');
  } catch (err: any) {
    useMessage().error(err.message);
  } finally {
    loading.value = false;
  }
};

// 初始化表单数据
const getsysOauthClientDetailsData = (id: string) => {
  // 获取数据
  getObj(id).then((res: any) => {
    Object.assign(form, res);
    // 将字符串转换为数组用于回显
    if (res.authorization_grant_types) {
      selectedGrantTypes.value = res.authorization_grant_types.split(',');
      form.authorization_grant_types = res.authorization_grant_types;
    } else {
      selectedGrantTypes.value = [];
      form.authorization_grant_types = '';
    }
  });
};

// 监听selectedGrantTypes变化
watch(selectedGrantTypes, (newVal) => {
  form.authorization_grant_types = newVal.join(',');
});

// 暴露变量
defineExpose({
  openDialog,
});

</script>

<style lang="scss" scoped>
.client-form-dialog {
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

  .grant-types-item {
    .el-form-item__content {
      display: flex;
      align-items: center;
    }
  }

  .grant-types-select {
    flex: 1;
    min-width: 200px;
    margin-right: 6px;
    
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
  
  .selected-count {
    font-size: 12px;
    font-weight: 500;
    color: white;
    background: linear-gradient(135deg, #1890ff, #40a9ff);
    padding: 4px 10px;
    border-radius: 12px;
    white-space: nowrap;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
    margin-left: 6px;
    
    &:hover {
      background: linear-gradient(135deg, #40a9ff, #1890ff);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(24, 144, 255, 0.4);
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

  @media (max-width: 768px) {
    .grant-types-item {
      .el-form-item__content {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .selected-count {
        margin-top: 8px;
        margin-left: 0;
      }
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