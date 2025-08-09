()<template>
  <div class="auth-redirect-container">
    <div class="loading-container">
      <div v-if="!error" class="loading-spinner"></div>
      <el-icon v-else class="error-icon"><CloseBold /></el-icon>
      <div class="loading-text">正在跳转...</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { postOauthAuthorize, loginToDify } from '/@/api/login';
import { useRoute } from 'vue-router';
import { CloseBold } from '@element-plus/icons-vue';
import { Session } from '/@/utils/storage';

interface OAuthResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * 构建重定向URL,追加dify token和替换difyBaseUrl
 * @param redirectUri 重定向URL
 * @param params URL参数对象
 * @returns 完整的重定向URL
 */
const buildRedirectUrl = (redirectUri: string, params: Record<string, string>): string => {
  if (redirectUri.includes('{difyBaseUrl}')) {
      redirectUri = redirectUri.replace('{difyBaseUrl}', import.meta.env.VITE_DIFY_REDIRECT_BASE_URL);
  }

  //替换占位符后，URL不是以http或https开头，说明URL有误，则提示错误
  if (!redirectUri.startsWith('http://') && !redirectUri.startsWith('https://')) {
    throw new Error('重定向URL有误');
  }

  // 如果URL中包含?，则使用&拼接参数，否则使用?拼接参数
  const separator = redirectUri.includes('?') ? '&' : '?';
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `${redirectUri}${separator}${queryString}`;
};

export default defineComponent({
  name: 'AuthRedirect',
  components: { CloseBold },
  setup() {
    const route = useRoute();
    const error = ref(false);

    onMounted(async () => {
      try {
        // 获取当前路由参数
        const { redirect_uri, ...otherParams } = route.query;
        
        if (!redirect_uri) {
          throw new Error('缺少重定向URL参数');
        }

        // 调试日志使用更规范的格式
        console.debug('[AuthRedirect] 请求参数:', { 
          redirect_uri,
          ...otherParams 
        });
        
        // 采用dify模式，获取dify的token直接访问
        const token = Session.get('token');
        if (!token) {
          throw new Error('未获取到登录token');
        }

        const response = await loginToDify(token as string) as OAuthResponse;
        
        // 构建重定向URL
        const url = buildRedirectUrl(redirect_uri as string, {
          access_token: response.access_token,
          refresh_token: response.refresh_token
        });


         // 调试日志打印跳转URL
        console.debug('请求DifyUrl:', { url});
        // 处理重定向 - 使用location.replace避免历史记录
        window.location.replace(url);
      } catch (err) {
        error.value = true;
        console.error('授权跳转失败:', err);
        // 显示更详细的错误信息
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
          let errorMsg = err.message || '跳转失败，请检查授权参数或联系管理员';
          if (err.error === 'invalid_client') {
            errorMsg = `客户端认证失败: ${err.message}`;
          }
          loadingText.textContent = errorMsg;
          loadingText.style.color = 'red';
        }
      }
    });

    return { error };
  }
});
</script>

<style scoped>
.auth-redirect-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 18px;
  color: #67c23a; /* 绿色 */
}

.error-icon {
  font-size: 50px;
  color: #f56c6c; /* 错误红色 */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>