<template>
  <el-dialog
    v-model="visible"
    :title="$t('personal.name')"
    width="600px"
    align-center
    class="personal-dialog"
  >
    <el-tabs class="demo-tabs">
      <el-tab-pane label="基本信息" v-loading="loading">
        <el-form :model="formData" :rules="ruleForm" label-width="100px" class="mt30" ref="formdataRef">
          <el-row :gutter="20">
            <el-col :span="24" class="mb20">
              <el-form-item prop="avatar">
                <ImageUpload v-model:imageUrl="formData.avatar_url" v-model:fileId="formData.avatar" borderRadius="50%">
                  <template #empty>
                    <el-icon>
                      <Avatar/>
                    </el-icon>
                    <span>请上传头像</span>
                  </template>
                </ImageUpload>
              </el-form-item>
            </el-col>
            <el-col :span="24" class="mb20">
              <el-form-item label="用户名" prop="name">
                <el-input v-model="formData.name" clearable ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24" class="mb20">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="formData.email" placeholder="请输入邮箱" clearable disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24" class="mb20">
              <el-form-item>
                <el-button type="primary" @click="handleSaveUser"> 更新个人信息</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="安全信息">
        <el-form :model="passwordFormData" :rules="passwordRuleForm" label-width="100px" class="mt30"
                 ref="passwordFormdataRef">
          <el-row :gutter="20">
            <el-col :span="24" class="mb20">
              <el-form-item label="原密码" prop="password">
                <el-input v-model="passwordFormData.password" placeholder="请输入密码" clearable
                          type="password"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24" class="mb20">
              <el-form-item label="新密码" prop="new_password">
                <strength-meter
                    v-model="passwordFormData.new_password"
                    :minlength="6"
                    :maxlength="16"
                    placeholder="请输入新密码"
                    @score="passwordScore"
                ></strength-meter>
              </el-form-item>
            </el-col>
            <el-col :span="24" class="mb20">
              <el-form-item label="确认密码" prop="repeat_new_password">
                <strength-meter v-model="passwordFormData.repeat_new_password" :minlength="6" :maxlength="16"
                                placeholder="请重复密码"></strength-meter>
              </el-form-item>
            </el-col>
            <el-col :span="24" class="mb20">
              <el-form-item>
                <el-button type="primary" @click="handleChangePassword"> 修改密码</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import {useUserInfo} from '/@/stores/userInfo';
import {editInfo, getObj, resetCurrentUserPassword, getObjDetails} from '/@/api/admin/user';
import {useMessage} from '/@/hooks/message';
import {rule} from '/@/utils/validate';
import {Session} from '/@/utils/storage';
import {useI18n} from 'vue-i18n';

const {t} = useI18n();

const ImageUpload = defineAsyncComponent(() => import('/@/components/Upload/Image.vue'));
const StrengthMeter = defineAsyncComponent(() => import('/@/components/StrengthMeter/index.vue'));

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

const initialized = ref(false);

watch(visible, (val) => {
  emit('update:modelValue', val);
  if (val) {
    const data = useUserInfo().userInfos;
    initUserInfo(data.user.id);
    initialized.value = true;
  } else {
    passwordFormdataRef.value?.resetFields();
    initialized.value = false;
  }
});

// 定义变量内容
const formData = ref({
  id: '',
  name: '',
  email: '',
  avatar: '',
  avatar_url: ''
});

const passwordFormData = reactive({
  password: '',
  new_password: '',
  repeat_new_password: '',
});

const formdataRef = ref();
const passwordFormdataRef = ref();

const ruleForm = reactive({
  phone: [
    {required: true, message: '手机号不能为空', trigger: 'blur'},
    {validator: rule.validatePhone, trigger: 'blur'},
  ],
  nickname: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '昵称不能为空', trigger: 'blur'}],
  email: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '邮箱不能为空', trigger: 'blur'}],
  name: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '姓名不能为空', trigger: 'blur'}],
});

const validatorPassword2 = (rule: any, value: any, callback: any) => {
  if (value !== passwordFormData.new_password) {
    callback(new Error(t('personal.passwordRule')));
  } else {
    callback();
  }
};

const validatorScore = (rule: any, value: any, callback: any) => {
  if (score.value <= 1) {
    callback(new Error(t('personal.passwordScore')));
  } else {
    callback();
  }
};

const passwordRuleForm = reactive({
  password: [
    {required: true, message: '原密码不能为空', trigger: ['blur', 'submit']},
    {validator: rule.overLength, trigger: ['blur', 'submit']}
  ],
  new_password: [
    {required: true, message: '新密码不能为空', trigger: ['blur', 'submit']},
    {
      min: 6,
      max: 20,
      message: '密码长度必须为6-20个字符',
      trigger: ['blur', 'submit'],
    },
    {validator: validatorScore, trigger: ['blur', 'submit']},
  ],
  repeat_new_password: [
    {required: true, message: '请确认新密码', trigger: ['blur', 'submit']},
    {
      min: 6,
      max: 20,
      message: '密码长度必须为6-20个字符',
      trigger: ['blur', 'submit'],
    },
    {validator: validatorPassword2, trigger: ['blur', 'submit']},
  ],
});

const score = ref(0);

const passwordScore = (e: any) => {
  score.value = e;
};

const handleChangePassword = () => {
  passwordFormdataRef.value.validate((valid: boolean) => {
    if (!valid) {
      return false;
    }
    resetCurrentUserPassword(passwordFormData)
        .then(() => {
          useMessage().success('修改成功');
          // 需要重新登录
          // 清除缓存/token等
          Session.clear();
          // 使用 reload 时，不需要调用 resetRoute() 重置路由
          window.location.reload();
        })
        .catch((err) => {
          useMessage().error(err.message);
        });
  });
};

// 保存用户
const handleSaveUser = () => {
  formdataRef.value.validate((valid: boolean) => {
    if (!valid) {
      return false;
    }

    const { avatar_url, ...submitData } = formData.value;
    editInfo(submitData)
        .then(() => {
          useMessage().success('修改成功');
          // 更新上下文的 user信息
          useUserInfo().setUserInfos();
        })
        .catch((err) => {
          useMessage().error(err.message);
        });
  });
};

const loading = ref(false);
const initUserInfo = (userId: any) => {
  loading.value = true;
  getObjDetails(userId)
      .then((res) => {
        formData.value.id = res.id;
        formData.value.name = res.name;
        formData.value.email = res.email;
        formData.value.avatar = res.avatar;
        formData.value.avatar_url = res.avatar_url;
      })
      .catch((err) => {
        useMessage().error(err.message);
      })
      .finally(() => {
        loading.value = false;
      });
};

// 暴露方法
const open = () => {
  visible.value = true;
  const data = useUserInfo().userInfos;
  initUserInfo(data.user.id);
};

defineExpose({
  open,
});
</script>

<style scoped lang="scss">
.personal-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  
  :deep(.el-dialog__header) {
    padding: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-right: 0;
    
    .el-dialog__title {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.demo-tabs {
  background: white;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  
  :deep(.el-tabs__header) {
    background: var(--el-bg-color-page);
    margin: 0;
    padding: 0 24px;
    box-shadow: 0 1px 0 var(--el-border-color-lighter);
  }
  
  :deep(.el-tabs__nav-wrap) {
    &::after {
      height: 1px;
      background-color: var(--el-border-color-lighter);
    }
  }
  
  :deep(.el-tabs__item) {
    font-weight: 500;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    
    &:hover {
      color: var(--el-color-primary);
    }
    
    &.is-active {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
  
  :deep(.el-tabs__content) {
    padding: 15px;
  }
}

.mt30 {
  margin-top: 16px;
  
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

    &:last-child {
      margin-bottom: 0;
    }
    
    :deep(.el-form-item__label) {
      font-weight: 600;
      color: #4a5568;
      font-size: 15px;
      padding-right: 15px;
      margin-bottom: 8px;
      display: block;
    }

    :deep(.el-form-item__error) {
      font-size: 15px;
      padding-top: 3px;
    }

    .el-input,
    .el-select {
      :deep(.input__wrapper) {
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
  }
}

:deep(.el-upload) {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  border: 2px dashed var(--el-border-color);
  background-color: rgba(245, 247, 250, 0.5);
  
  &:hover {
    border-color: var(--el-color-primary);
    background-color: rgba(64, 158, 255, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    
    .el-icon {
      color: var(--el-color-primary);
    }
  }
  
  .el-icon {
    font-size: 36px;
    color: var(--el-text-color-secondary);
    transition: all 0.3s;
  }
  
  span {
    margin-top: 12px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.el-form-item:has(.el-button) {
  margin-top: 32px;
  padding: 0;
  background: transparent;
  border-left: none;
  width: 100%;
  
  &:hover {
    transform: none;
    background: transparent;
  }
  
  :deep(.el-form-item__content) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-left: 0 !important;
    gap: 16px;
  }
}

.el-button {
  width: auto;
  min-width: 140px;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
  }
  
  &--primary {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    
    &:hover {
      background: var(--el-color-primary-light-3);
      border-color: var(--el-color-primary-light-3);
    }
  }
}

.mb20 {
  margin-bottom: 20px;
  
  .el-input {
    :deep(.el-input__wrapper) {
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
}

.strength-meter {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-input__wrapper) {
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

.form-section {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    
    .el-icon {
      margin-right: 8px;
      color: var(--el-color-primary);
    }
  }
}
</style>