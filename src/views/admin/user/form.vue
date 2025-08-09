<template>
	<div class="user-form-dialog-container">
		<el-dialog 
			:close-on-click-modal="false" 
			:title="dataForm.id ? $t('common.editBtn') : $t('common.addBtn')" 
			draggable 
			v-model="visible"
			class="user-form-dialog"
			width="700px"
		>
			<el-form :model="dataForm" :rules="dataRules" label-width="90px" ref="dataFormRef" v-loading="loading">
				<el-row :gutter="20">
					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('sysuser.name')" prop="name">
							<el-input placeholder="请输入用户名" v-model="dataForm.name"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('sysuser.password')" prop="password">
							<el-input clearable placeholder="请输入密码" type="password" v-model="dataForm.password" :disabled="dataForm.id !== ''"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('sysuser.role')" prop="role_ids">
							<el-select class="w100" clearable multiple placeholder="请选择角色" v-model="dataForm.role_ids">
								<el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in roleData" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('sysuser.email')" prop="email">
							<el-input :disabled="dataForm.id !== ''" clearable placeholder="请输入邮箱" v-model="dataForm.email"></el-input>
						</el-form-item>
					</el-col>
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
import { addObj, getObjDetails, putObj, validatePhone, validateUsername } from '/@/api/admin/user';
import { list as roleList } from '/@/api/admin/role';
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';
import { rule } from '/@/utils/validate';

const { t } = useI18n();

// 定义刷新表格emit
const emit = defineEmits(['refresh']);


// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const roleData = ref<any[]>([]);
const loading = ref(false);

const dataForm = reactive({
	id: '',
	name: '',
	password: '' as String | undefined,
	email: '',
	role_ids: [] as string[],
});

const dataRules = ref({
	// 用户名校验，不能为空 、长度 5-20、不能和已有数据重复
	password: [
		{ validator: rule.overLength, trigger: 'blur' },
		{ required: true, message: '密码不能为空', trigger: 'blur' },
		{
			min: 6,
			max: 20,
			message: '用户密码长度必须介于 5 和 20 之间',
			trigger: 'blur',
		},
	],
	// 姓名校验，不能为空、只能是中文
	name: [
		{ required: true, message: '姓名不能为空', trigger: 'blur' },
		{ validator: rule.overLength, trigger: 'blur' },
		//{ validator: rule.chinese, trigger: 'blur' },
	],
	role_ids: [{ required: true, message: '角色不能为空', trigger: 'blur' }],
	email: [
		{ required: true, message: '邮箱地址不能为空', trigger: 'blur' },
		{ validator: rule.overLength, trigger: 'blur' },
		{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
	],
});

// 打开弹窗
const openDialog = async (id: string) => {
	visible.value = true;
	
	// 重置表单数据
	Object.assign(dataForm, {
		id: '',
		name: '',
		password: '',
		email: '',
		role_ids: []
	});

	nextTick(() => {
		dataFormRef.value?.resetFields();
	});

	// 加载使用的数据
	getRoleData();

	// 修改获取用户信息
	if (id) {
		dataForm.id = id;
		await getUserData(id);
		dataForm.password = '******';
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => {});
	if (!valid) return false;

	try {
		const { id, password } = dataForm;

		if (id) {
			// 清除占位符，避免提交错误的数据
		
			if (password?.includes('******')) dataForm.password = undefined;

			loading.value = true;
			await putObj(dataForm);
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

/**
 * 从服务器获取用户数据
 *
 * @async
 * @param {string} id - 用户 ID
 * @return {Promise} - 包含用户数据的 Promise 对象
 */
const getUserData = async (id: string) => {
	try {
		loading.value = true;
		const  data  = await getObjDetails(id);
		//Object.assign(dataForm, data);

		Object.assign(dataForm, {
			id: data.id,
			name: data.name,
			email: data.email,
			role_ids: data.role_ids
	    });

		if (data.role_list) {
			dataForm.role_ids = data.role_list.map((item) => item.id);
		}
	} catch (err: any) {
		useMessage().error(err.message);
	} finally {
		loading.value = false;
	}
};

// 角色数据
const getRoleData = () => {
	roleList().then((res) => {
		roleData.value = res.data;
		// 默认选择第一个
		//dataForm.role_ids = [res.data[0].id];
	});
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
.user-form-dialog {
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