<template>
	<div class="layout-padding ai-app-index" ref="containerRef" @scroll="handleScroll">
		<div class="layout-padding-auto layout-padding-view">
			<el-row v-show="showSearch">
				<el-form ref="queryRef" :inline="true" :model="queryForm" class="query-form">
					<el-form-item class="mode-filter">
						<el-radio-group v-model="queryForm.mode" @change="handleModeChange">
							<el-radio-button label="">
								<el-icon><Menu /></el-icon>
								<span>全部</span>
							</el-radio-button>
							<el-radio-button 
								v-for="mode in modeData" 
								:key="mode.value" 
								:label="mode.value"
							>
								<el-icon>
									<component :is="getModeIcon(mode.value)" />
								</el-icon>
								<span>{{ mode.label }}</span>
							</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item prop="name" class="search-input">
						<el-input 
							v-model="queryForm.name" 
							:placeholder="$t('common.search')" 
							clearable 
							prefix-icon="search"
							class="search-box"
							@keyup.enter="handleSearch"
						/>
					</el-form-item>
				</el-form>
			</el-row>
			<ul class="app-list">
				<el-empty 
					v-if="appList.length === 0 && !loading" 
					description="暂无数据" 
					class="w-full"
				/>
				<li v-for="item in appList" :key="item.id" @click="openAppDetail(item.id)">
					<div class="flex">
						<p class="profile flex-c">{{ item.app?.name ? item.app.name.split('')[0] : '-' }}</p>
						<div class="w-full flex-1">
							<p class="app-name">{{ item.app?.name || '-' }}</p>
							<el-tag 
								type="success" 
								effect="dark" 
								class="mt-[8px] font-medium"
							>
								{{ getModeLabel(item.app?.mode) }}
							</el-tag>
						</div>
					</div>
					<div class="mt-[12px] text-[#677182]">{{ item.app?.description || '-' }}</div>
				</li>
				<li v-if="loading" class="loading-more">
					<el-icon class="is-loading"><Loading /></el-icon>
					<div class="mt-2">加载中...</div>
				</li>
				<li v-if="!loading && !noMoreData" class="load-more-btn" @click="loadMore">
					<el-button type="primary" size="large" plain>
						<el-icon class="mr-1"><ArrowDown /></el-icon>
						点击加载更多
					</el-button>
					<div class="scroll-hint mt-2">
						<el-icon><ArrowDown /></el-icon>
						<span>向下滚动自动加载</span>
					</div>
				</li>
				
			</ul>
		</div>
	</div>
</template>

<script lang="ts" name="systemUser" setup>
import { getInstalledApps } from '/@/api/app/installed-apps';
import { onMounted, ref, onUnmounted, watch } from 'vue';
import { debounce } from 'lodash-es';
import { ArrowDown } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const openAppDetail = (installedAppId: string) => {
  //跳转到Dify平台应用详情页
  window.open(`/auth/dify/redirect?redirect_uri={difyBaseUrl}/explore/installed/${installedAppId}`, '_blank');
};

// 查询表单
const showSearch = ref(true);
const queryForm = ref({
  name: '',
  mode: ''
});

// 处理搜索输入(带防抖)
const handleSearch = debounce(() => {
  page.value = 1;
  appList.value = [];
  noMoreData.value = false;
  loadMore();
}, 300);

// 处理模式切换(立即执行)
const handleModeChange = () => {
  handleSearch.cancel(); // 取消可能存在的防抖延迟
  page.value = 1;
  appList.value = [];
  noMoreData.value = false;
  loadMore();
};

// 监听搜索输入变化
watch(() => queryForm.value.name, (newVal) => {
  if (newVal !== undefined) {
    handleSearch();
  }
});

// 定义变量内容
const containerRef = ref<HTMLElement>();
const loading = ref(false);
const noMoreData = ref(false);
const page = ref(1);
const limit = 12;

const appList = ref<any[]>([]);

const modeData = ref([
	{ label: '智能体', value: 'agent-chat' },
	{ label: '聊天助手', value: 'chat' },
	{ label: '文本生成', value: 'completion' },
	{ label: '聊天工作流', value: 'advanced-chat' },
	{ label: '工作流', value: 'workflow' }
]);

// 获取模式对应的图标
const getModeIcon = (mode: string) => {
	const iconMap: Record<string, string> = {
		'chat': 'ChatDotRound',
		'agent-chat': 'User',
		'completion': 'Document',
		'advanced-chat': 'ChatRound',
		'workflow': 'Connection'
	};
	return iconMap[mode] || 'Menu';
};

// 获取模式对应的中文标签
const getModeLabel = (mode: string) => {
	const found = modeData.value.find(item => item.value === mode);
	return found ? found.label : mode;
};

const loadMore = async () => {
	// 防止重复加载
	if (loading.value || noMoreData.value) {

		return;
	}
	

	loading.value = true;
	
	try {
		const res = await getInstalledApps({ 
			page: page.value, 
			limit,
			name: queryForm.value.name,
			mode: queryForm.value.mode
		});
		

		
		// 检查返回的数据结构
		if (!res || !res.data || !Array.isArray(res.data) || res.data.length === 0) {

			noMoreData.value = true;
			return;
		}
		
		// 如果返回的数据少于请求的数量，说明没有更多数据了
		if (res.data.length < limit) {

			noMoreData.value = true;
		}
		
		// 将新数据添加到列表中
		const oldLength = appList.value.length;
		appList.value = [...appList.value, ...res.data];

		
		// 增加页码
		page.value++;
		
		// 如果当前内容不足以滚动，且还有更多数据，则继续加载
		if (containerRef.value) {
			const { scrollHeight, clientHeight } = containerRef.value;

			
			// 如果内容高度小于或等于容器高度，并且还有更多数据，则继续加载
			if (scrollHeight <= clientHeight && !noMoreData.value) {

				// 使用setTimeout避免递归调用导致的堆栈溢出
				setTimeout(() => loadMore(), 100);
			}
		}
	} catch (error) {
		console.error('加载数据失败:', error);
		// 显示错误提示
		ElMessage.error('加载数据失败，请稍后重试');
	} finally {
		loading.value = false;
	}
};

// 滚动加载处理
const handleScroll = () => {
	// 检查是否有容器引用
	if (!containerRef.value) return;
	
	// 获取滚动容器的滚动位置信息
	const container = containerRef.value;
	const scrollBottom = container.scrollTop + container.clientHeight;
	const threshold = container.scrollHeight - 300; // 增大触发阈值到300px

	
	// 当滚动到接近底部时加载更多
	if (scrollBottom >= threshold && !loading.value && !noMoreData.value) {

		loadMore();
	}
};

onMounted(() => {
	// 初始加载数据
	loadMore();
	
	// 设置一个短暂延迟，确保DOM已完全渲染
	setTimeout(() => {
		// 确保滚动事件被正确监听
		if (containerRef.value) {

			// 使用捕获阶段监听滚动事件，确保能捕获到所有滚动
			containerRef.value.addEventListener('scroll', handleScroll, { passive: true, capture: true });
			
			// 初始检查是否需要加载更多
			handleScroll();
		}
		
		// 监听窗口大小变化
		window.addEventListener('resize', () => {

			// 窗口大小变化时检查是否需要加载更多
			setTimeout(handleScroll, 200);
		});
	}, 500);
});

onUnmounted(() => {
	// 移除所有事件监听
	if (containerRef.value) {
		containerRef.value.removeEventListener('scroll', handleScroll, { capture: true });
	}
	window.removeEventListener('resize', handleScroll);
});
</script>

<style lang="scss" scoped>
.query-form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
  
  .mode-filter {
    flex: 1;
    :deep(.el-radio-group) {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    :deep(.el-radio-button) {
      margin-right: 0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      .el-radio-button__inner {
        border-radius: 8px !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
        background-color: var(--el-bg-color);
        border: 1px solid var(--el-border-color-light);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        
        .el-icon {
          font-size: 16px;
          transition: color 0.3s ease;
        }
        
        &:hover {
          color: var(--el-color-primary);
          border-color: var(--el-color-primary-light-5);
          background-color: var(--el-color-primary-light-9);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.15);
        }
      }
      
      &.is-active .el-radio-button__inner {
        color: white;
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.25);
        transform: translateY(-1px);
        
        .el-icon {
          color: white;
        }
      }
    }
  }
  
      .search-input {
      width: 360px;
      :deep(.el-input-group__append) {
        background-color: var(--el-color-primary);
        border: none;
        border-radius: 0 6px 6px 0;
        .el-button {
          color: white;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          &:hover {
            background-color: var(--el-color-primary-light-3);
          }
          .el-icon {
            font-size: 18px;
          }
        }
      }
      .search-box {
        :deep(.el-input__inner) {
          border-radius: 6px 0 0 6px;
          border-right: none;
          &:focus {
            border-color: var(--el-color-primary-light-5);
          }
        }
      }
    }
}

.ai-app-index {
	height: 100vh;
	overflow-y: auto;
	padding: 16px;
	position: relative;
	
	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-5px);
		}
		60% {
			transform: translateY(-3px);
		}
	}
	
	.app-list {
		display: grid;
		grid-template-columns: repeat(4, minmax(280px, 1fr));
		gap: 16px;
		margin-top: 4px;
		
		li {
			padding: 20px;
			border-radius: 12px;
			background: var(--el-bg-color);
			box-shadow: var(--el-box-shadow-light);
			transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
			border: 1px solid var(--el-border-color-light);
			cursor: pointer;
			height: 200px;
			display: flex;
			flex-direction: column;
			overflow: hidden;
			
			&:hover {
				transform: translateY(-4px);
				box-shadow: var(--el-box-shadow);
				border-color: var(--el-color-primary);
			}

			.profile {
				width: 60px;
				height: 60px;
				background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
				font-size: 24px;
				font-weight: bold;
				color: #fff;
				border-radius: 50%;
				margin-right: 16px;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2);
				transition: all 0.3s ease;
			}

			.app-name {
				font-size: 18px;
				font-weight: 600;
				color: var(--el-text-color-primary);
				margin-bottom: 8px;
				line-height: 1.4;
			}
			
			&.loading-more {
				grid-column: 1 / -1;
				text-align: center;
				color: var(--el-text-color-secondary);
				padding: 24px 0;
				background: transparent;
				border: none;
				box-shadow: none;
			}
			
			&.load-more-btn {
				grid-column: 1 / -1;
				text-align: center;
				padding: 16px 0;
				background: transparent;
				border: none;
				box-shadow: none;
				cursor: pointer;
				
				.el-button {
					padding: 10px 24px;
					font-size: 16px;
					transition: all 0.3s ease;
					
					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2);
					}
				}
				
				.scroll-hint {
					color: var(--el-color-primary);
					font-size: 15px;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 6px;
					opacity: 0.9;
					animation: bounce 2s infinite;
					font-weight: 500;
					text-shadow: 0 1px 2px rgba(0,0,0,0.05);
					
					.el-icon {
						font-size: 16px;
					}
				}
			}
		}
	}
	
	.query-form {
		background: var(--el-bg-color);
		padding: 16px;
		border-radius: 12px;
		margin-bottom: 8px;
		
		.search-input {
			.el-input {
				width: 280px;
			}
		}
	}
}
</style>