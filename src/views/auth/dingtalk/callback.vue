<template>
  <div class="dingtalk-callback">
    <div v-if="loading" class="loading-text">
      {{ $t('login.dingtalkProcessing') }}
    </div>
    <div v-else class="result-message">
      {{ resultMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Session } from '/@/utils/storage';
import { useMessage } from '/@/hooks/message';
import { useUserInfo } from '/@/stores/userInfo';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';


const emit = defineEmits(['signInSuccess']); // 声明事件名称

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const userInfoStore = useUserInfo();
const loading = ref(true);
const resultMessage = ref('');

onMounted(async () => {
  try {
    const code = route.query.code as string;
    const state = route.query.state as string;

    if (!code || !state) {
      throw new Error(t('login.dingtalkInvalidResponse'));
    }

    const savedState = Session.get('dingtalk_state');
    if (state !== savedState) {
      //暂时不抛出错误，如果不从父级页面打开，会报错
      //throw new Error(t('login.dingtalkStateMismatch'));
    }

    useMessage().success(t('login.dingtalkProcessing'));
    
    // 调用钉钉登录接口
    await userInfoStore.loginByDingtalk({code});

    // 触发登录成功事件，由父组件处理后续跳转
    emit('signInSuccess');
    
    // 关闭当前弹窗
    if (window.opener) {
      window.close();
    }

  } catch (error: any) {
    const errorMsg = error.message || t('login.dingtalkLoginFailed');
    resultMessage.value = errorMsg;
    useMessage().error(resultMessage.value);
    
    //关闭弹窗并在主窗口显示错误信息
      if (window.opener) {
        window.opener.postMessage({
          type: 'dingtalkLoginError',
          message: errorMsg
        }, window.location.origin);
        window.close();
      } else {
        router.push('/login');
      }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dingtalk-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
}

.loading-text {
  font-size: 18px;
  color: var(--el-color-primary);
}

.result-message {
  font-size: 18px;
  color: var(--el-color-danger);
}
</style>