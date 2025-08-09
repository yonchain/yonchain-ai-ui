<!-- excel 导入组件 -->
<template>
	<el-dialog 
		:title="prop.title" 
		v-model="state.upload.open" 
		:close-on-click-modal="false" 
		draggable
		class="excel-upload-dialog"
		width="650px"
	>
		<el-upload
			ref="uploadRef"
			:limit="1"
			accept=".xlsx, .xls"
			:headers="headers"
			:action="baseURL + other.adaptationUrl(url)"
			:disabled="state.upload.isUploading"
			:on-progress="handleFileUploadProgress"
			:on-success="handleFileSuccess"
			:on-error="handleFileError"
			:auto-upload="false"
			drag
			class="excel-uploader"
		>
			<div class="upload-content">
				<el-icon class="upload-icon"><Upload /></el-icon>
				<div class="el-upload__text">
					{{ $t('excel.operationNotice') }}
					<em class="upload-highlight">{{ $t('excel.clickUpload') }}</em>
				</div>
				<el-progress 
					v-if="state.upload.isUploading" 
					:percentage="state.upload.percentage" 
					:stroke-width="6" 
					type="dashboard"
					class="upload-progress"
				/>
			</div>
			<template #tip>
				<div class="el-upload__tip">
					<el-alert type="info" :closable="false" class="format-tip">
						<template #title>
							<span class="format-text">{{ $t('excel.fileFormat') }}</span>
							<el-link 
								v-if="tempUrl"
								type="primary" 
								:underline="false" 
								class="download-link"
								@click="downExcelTemp"
							>
								<el-icon class="download-icon"><Download /></el-icon>
								{{ $t('excel.downloadTemplate') }}
							</el-link>
						</template>
					</el-alert>
				</div>
			</template>
		</el-upload>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="state.upload.open = false">{{ $t('common.cancelButtonText') }}</el-button>
				<el-button type="primary" :loading="state.upload.isUploading" @click="submitFileForm">
					<el-icon v-if="!state.upload.isUploading"><Upload /></el-icon>
					{{ $t('common.confirmButtonText') }}
				</el-button>
			</div>
		</template>
	</el-dialog>

	<!--校验失败错误数据-->
	<el-dialog 
		:title="$t('excel.validationFailureData')" 
		v-model="state.errorVisible"
		class="error-dialog"
		width="750px"
	>
		<el-alert type="error" :closable="false" class="error-alert">
			<template #title>
				<i class="el-icon-warning-outline"></i> {{ $t('excel.importFailed') }}
			</template>
		</el-alert>
		<el-table :data="state.errorData" class="error-table" border stripe>
			<el-table-column property="lineNum" :label="$t('excel.lineNumbers')" width="100" align="center"></el-table-column>
			<el-table-column property="errors" :label="$t('excel.misDescription')" show-overflow-tooltip>
				<template v-slot="scope">
					<div class="error-tags">
						<el-tag 
							type="danger" 
							effect="dark"
							v-for="error in scope.row.errors" 
							:key="error"
							class="error-tag"
						>{{ error }}</el-tag>
					</div>
				</template>
			</el-table-column>
		</el-table>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="state.errorVisible = false">{{ $t('common.closeButtonText') || '关闭' }}</el-button>
				<el-button type="primary" @click="retryUpload">{{ $t('excel.retryUpload') || '重新上传' }}</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts" name="upload-excel">
import { useMessage } from '/@/hooks/message';
import other from '/@/utils/other';
import { Session } from '/@/utils/storage';
import { Upload, Download } from '@element-plus/icons-vue';

const emit = defineEmits(['sizeChange', 'refreshDataList']);
const prop = defineProps({
	url: {
		type: String,
	},
	title: {
		type: String,
	},
	tempUrl: {
		type: String,
	},
});

const uploadRef = ref();

const state = reactive({
	errorVisible: false,
	errorData: [],
	dialog: {
		title: '',
		isShowDialog: false,
	},
	upload: {
		open: false,
		isUploading: false,
		percentage: 0,
		fileName: '',
	},
});

/**
 * 下载模板文件
 */
const downExcelTemp = () => {
	other.downBlobFile(other.adaptationUrl(prop.tempUrl), {}, 'temp.xlsx');
};

/**
 * 上传进度条变化事件
 * @param {any} event - 上传进度事件
 * @param {any} file - 上传的文件
 */
const handleFileUploadProgress = (event: any, file: any) => {
	state.upload.isUploading = true;
	state.upload.percentage = Math.floor(event.percent);
	state.upload.fileName = file.name;
};

/**
 * 上传失败事件处理
 * @param {any} error - 错误信息
 */
const handleFileError = (error: any) => {
	state.upload.isUploading = false;
	state.upload.percentage = 0;
	useMessage().error('上传失败: ' + (error.message || '数据格式不合法!'));
	state.upload.open = false;
};

/**
 * 上传成功事件处理
 * @param {any} response - 上传成功的响应结果
 */
const handleFileSuccess = (response: any) => {
	state.upload.isUploading = false;
	state.upload.percentage = 100;
	state.upload.open = false;
	uploadRef.value.clearFiles();

	// 校验失败
	if (response.code === 1) {
		useMessage().error({
			message: '导入失败，以下数据不合法',
			duration: 5000,
			showClose: true,
		});
		state.errorVisible = true;
		state.errorData = response.data;
		uploadRef.value.clearFiles();
		// 刷新表格
		emit?.('refreshDataList');
	} else {
		useMessage().success({
			message: response.message ? response.message : '导入成功',
			duration: 3000,
			showClose: true,
		});
		// 刷新表格
		emit?.('refreshDataList');
	}
};

/**
 * 提交表单，触发上传
 */
const submitFileForm = () => {
	uploadRef.value.submit();
};

/**
 * 重新尝试上传
 */
const retryUpload = () => {
	state.errorVisible = false;
	state.upload.isUploading = false;
	state.upload.percentage = 0;
	state.upload.open = true;
};

/**
 * 显示上传文件对话框，并清除上传信息
 */
const show = () => {
	state.upload.isUploading = false;
	state.upload.percentage = 0;
	state.upload.fileName = '';
	state.upload.open = true;
};

/**
 * 计算请求头部信息
 */
const headers = computed(() => {
	return {
		Authorization: 'Bearer ' + Session.getToken(),
		'TENANT-ID': Session.getTenant(),
	};
});

// 暴露变量
defineExpose({
	show,
});
</script>

<style scoped lang="scss">
.excel-upload-dialog {
  :deep(.el-dialog__body) {
    padding: 25px 30px;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 30px;
    margin-right: 0;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  :deep(.el-dialog__footer) {
    padding: 15px 30px 25px;
    border-top: 1px solid var(--el-border-color-light);
  }
}

.excel-uploader {
  width: 100%;
  
  :deep(.el-upload-dragger) {
    width: 100%;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 2px dashed var(--el-border-color);
    transition: all 0.3s;
    
    &:hover {
      border-color: var(--el-color-primary);
      background-color: rgba(var(--el-color-primary-rgb), 0.08);
      transform: translateY(-3px);
      box-shadow: 0 10px 20px -8px rgba(0, 0, 0, 0.12);
    }
  }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.upload-icon {
  font-size: 56px;
  color: var(--el-color-primary);
  margin-bottom: 18px;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.1);
  }
}

.el-upload__text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 13px;
  text-align: center;
  line-height: 1.6;
  
  .upload-highlight {
    color: var(--el-color-primary);
    font-weight: bold;
    font-style: normal;
    font-size: 15px;
  }
}

.upload-progress {
  margin-top: 20px;
  width: 160px;
}

.el-upload__tip {
  width: 100%;
  margin-top: 20px;
  
  .format-tip {
    margin: 0;
    padding: 12px 16px;
    border-radius: 8px;
    background-color: rgba(var(--el-color-info-rgb), 0.1);
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    :deep(.el-alert__content) {
      padding: 0;
    }
  }
  
  .format-text {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
  
  .download-link {
    margin-left: 12px;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    transition: all 0.2s;
    
    &:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }
    
    .download-icon {
      margin-right: 6px;
      font-size: 16px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 15px;
  
  :deep(.el-button) {
    padding: 12px 24px;
    font-size: 15px;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

.error-dialog {
  :deep(.el-dialog__body) {
    padding: 25px 30px;
  }
  
  .error-alert {
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 8px;
    
    :deep(.el-alert__title) {
      font-size: 15px;
      font-weight: 500;
    }
  }
  
  .error-table {
    margin: 15px 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    :deep(.el-table__header) {
      font-weight: 600;
      background-color: rgba(var(--el-color-primary-rgb), 0.1);
    }
    
    :deep(.el-table__row) {
      transition: background-color 0.3s;
      
      &:hover {
        background-color: rgba(var(--el-color-primary-rgb), 0.05);
      }
    }
  }
  
  .error-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .error-tag {
      margin: 0;
      padding: 0 10px;
      height: 28px;
      line-height: 28px;
      font-size: 13px;
    }
  }
}
</style>
