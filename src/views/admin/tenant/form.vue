<template>
	<div class="tenant-form-dialog-container">
		<el-dialog 
			:close-on-click-modal="false" 
			:title="dataForm.id ? $t('common.editBtn') : $t('common.addBtn')" 
			draggable 
			v-model="visible"
			class="tenant-form-dialog"
			width="700px"
		>
			<el-form :model="dataForm" :rules="dataRules" label-width="100px" ref="dataFormRef" v-loading="loading">
				<el-row :gutter="20">
					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('tenant.name')" prop="name">
							<el-input placeholder="请输入租户名称" v-model="dataForm.name"></el-input>
						</el-form-item>
					</el-col>

					<!-- <el-col :span="24" class="mb20">
						<el-form-item :label="$t('tenant.tenantDescription')" prop="description">
							<el-input :rows="2" type="textarea" placeholder="请输入租户描述" v-model="dataForm.description"></el-input>
						</el-form-item>
					</el-col> -->
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
					<el-button @click="onSubmit" type="primary" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" name="systemUserDialog" setup>
import { addObj, getObj, putObj } from '/@/api/admin/tenant';
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';

const { t } = useI18n();

// 定义刷新表格emit
const emit = defineEmits(['refresh']);

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

const dataForm = reactive({
	id: '',
	description: '',
	name: '',
});

const dataRules = ref({
	name: [{ required: true, message: '租户名称不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = async (id: string) => {
	visible.value = true;
	dataForm.id = '';

	// 重置表单数据
	nextTick(() => {
		dataFormRef.value?.resetFields();
	});

	// 修改获取用户信息
	if (id) {
		dataForm.id = id;
		const res = await getObj(id);
		dataForm.name = res.name;
		dataForm.description = res.description;
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

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
.tenant-form-dialog {
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