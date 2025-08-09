userinfo.vue:1 [Vue warn]: Failed to resolve component: el-icon-top-right<template>
  <el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onHandleCommandClick">
    <span class="layout-navbars-breadcrumb-user-link">
      <img :src="baseURL + userInfos.user.avatar_url" class="layout-navbars-breadcrumb-user-link-photo mr5" />
      {{ userInfos.user.username }}
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="personal">
          <el-icon><ele-User /></el-icon>
          {{ $t('user.dropdown2') }}
        </el-dropdown-item>
        <el-dropdown-item command="layout">
          <el-icon><ele-Setting /></el-icon>
          主题设置
        </el-dropdown-item>
        <el-dropdown-item command="help">
          <el-icon><ele-Document /></el-icon>
          帮助文档
          <el-icon class="ml-auto"><ele-TopRight /></el-icon>
        </el-dropdown-item>
        <el-dropdown-item command="github">
          <el-icon><ele-Star /></el-icon>
          GitHub
          <el-icon class="ml-auto"><ele-TopRight /></el-icon>
        </el-dropdown-item>
        <el-dropdown-item command="support">
          <el-icon><ele-Service /></el-icon>
          支持
        </el-dropdown-item>
        <el-dropdown-item command="about">
          <el-icon><ele-InfoFilled /></el-icon>
          关于
        </el-dropdown-item>
        <el-dropdown-item divided command="logOut">
          <el-icon><ele-SwitchButton /></el-icon>
          {{ $t('user.dropdown5') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  
  <!-- 弹窗组件 -->
  <AboutDialog v-model="aboutDialogVisible" />
  <SupportDialog v-model="supportDialogVisible" />
  <PersonalDialog v-model="personalDialogVisible" />
</template>

<script setup lang="ts">
import { logout } from '/@/api/login';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useUserInfo } from '/@/stores/userInfo';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import mittBus from '/@/utils/mitt';
import { Session, Local } from '/@/utils/storage';
import { useRouter } from 'vue-router';
import { useMessage } from '/@/hooks/message';
import { formatAxis } from '/@/utils/formatTime';

// 定义props
const props = defineProps({
  userInfos: {
    type: Object,
    required: true
  },
  baseURL: {
    type: String,
    required: true
  }
});

const { t } = useI18n();
const router = useRouter();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 弹窗显示状态
const aboutDialogVisible = ref(false);
const supportDialogVisible = ref(false);
const personalDialogVisible = ref(false);

// 下拉菜单点击时
const onHandleCommandClick = (path: string) => {
  if (path === 'logOut') {
    ElMessageBox({
      closeOnClickModal: false,
      closeOnPressEscape: false,
      title: t('user.logOutTitle'),
      message: t('user.logOutMessage'),
      showCancelButton: true,
      confirmButtonText: t('user.logOutConfirm'),
      cancelButtonText: t('user.logOutCancel'),
      buttonSize: 'default',
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true;
          instance.confirmButtonText = t('user.logOutExit');
          setTimeout(() => {
            done();
            setTimeout(() => {
              instance.confirmButtonLoading = false;
            }, 300);
          }, 700);
        } else {
          done();
        }
      },
    })
      .then(async () => {
        // 关闭全部的标签页
        mittBus.emit('onCurrentContextmenuClick', Object.assign({}, { contextMenuClickId: 3, ...router }));
        // 调用注销token接口
        await logout();
        // 清除缓存/token等
        Session.clear();
        // 使用 reload 时，不需要调用 resetRoute() 重置路由
        window.location.reload();
      })
      .catch(() => {});
  } else if (path === 'personal') {
    // 打开个人页面
    personalDialogVisible.value = true;
  } else if (path === 'layout') {
    // 布局配置
    mittBus.emit('openSetingsDrawer');
  } else if (path === 'help') {
    useMessage().success('开发中,敬请期待。');
    // 帮助文档
   // window.open('https://help.example.com', '_blank', 'noopener,noreferrer');
  } else if (path === 'github') {
    // GitHub
    window.open('https://github.com/yonchain/dify4j.git', '_blank', 'noopener,noreferrer');
  } else if (path === 'support') {
    // 支持
    supportDialogVisible.value = true;
  } else if (path === 'about') {
    // 关于
    aboutDialogVisible.value = true;
  }
};

// 引入组件
const AboutDialog = defineAsyncComponent(() => import('./about.vue'));
const SupportDialog = defineAsyncComponent(() => import('./support.vue'));
const PersonalDialog = defineAsyncComponent(() => import('/@/views/admin/user/personal.vue'));
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user-link {
  height: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 0 10px;
  border-radius: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &-photo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    margin: 2px 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
}

:deep(.el-dropdown-menu) {
  padding: 8px 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 580px;
  
  .el-dropdown-menu__item {
    padding: 10px 16px;
    margin: 2px 0;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    
    &:not(.is-divided):hover {
      background-color: rgba(64, 158, 255, 0.08);
      color: var(--el-color-primary);
    }
    
    .el-icon {
      margin-right: 10px;
      font-size: 16px;
      
      &.ml-auto {
        margin-left: auto;
        margin-right: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
    
    &.is-divided {
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid var(--el-border-color-light);
    }
  }
}
</style>
