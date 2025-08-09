<template>
  <el-form size="large" class="login-content-form">
    <el-form-item>
      <el-button 
        type="primary" 
        class="login-content-submit" 
        round 
        @click="handleDingtalkLogin"
        :loading="loading"
      >
       <span>{{ $t('dingtalk.dingtalkLogin') }}</span>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts" name="dingtalk">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Session } from '/@/utils/storage';
import { useMessage } from '/@/hooks/message';

const emit = defineEmits(['signInSuccess']);
const { t } = useI18n();
const loading = ref(false);

// 钉钉OAuth2授权登录
const handleDingtalkLogin = () => {
  loading.value = true;
  
  const appId = import.meta.env.VITE_DINGTALK_APP_ID;
  if (!appId) {
    useMessage().error(t('login.dingtalkConfigError'));
    loading.value = false;
    return;
  }

  //const redirectUri = encodeURIComponent(`http://42.194.189.63/auth/dingtalk/callback`);
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/dingtalk/callback`);
  const state = 'dingtalk_' + Math.random().toString(36).substring(2);
  
  Session.set('dingtalk_state', state);
  
  const authUrl = `https://login.dingtalk.com/oauth2/challenge.htm?` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `client_id=${appId}&` +
    `scope=openid&` +
    `state=${state}`+
    `&prompt=consent`;
  
  const width = 600;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  const authWindow = window.open(
    authUrl,
    'dingtalk_auth',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  );
  
  // 监听弹窗关闭
  const timer = setInterval(() => {
    if (authWindow?.closed) {
      clearInterval(timer);
      // 检查是否登录成功
      if (Session.get('token')) {
        emit('signInSuccess');
      } 
      loading.value = false;
    }
  }, 500);

  // 添加窗口卸载时的清理
  onBeforeUnmount(() => {
    clearInterval(timer);
  });
};
</script>

<style scoped>
.login-content-submit {
  width: 100%;
  letter-spacing: 2px;
}
</style>