<template>
	<el-dialog :close-on-click-modal="false" :title="form.id ? $t('common.editBtn') : $t('common.addBtn')" width="700" draggable v-model="visible" class="role-form-dialog">
		<el-form :model="form" :rules="dataRules" label-width="90px" ref="dataFormRef" v-loading="loading">
			<el-form-item :label="$t('sysrole.roleName')" prop="name">
				<el-input :placeholder="$t('sysrole.please_enter_a_role_name')" clearable v-model="form.name"></el-input>
			</el-form-item>
			<el-form-item :label="$t('sysrole.roleCode')" prop="code">
				<el-input :placeholder="$t('sysrole.please_enter_the_role_Code')" :disabled="form.category === '0'" :title="form.category === '0' ? $t('sysrole.systemRoleCannotModifyCode') : ''" clearable v-model="form.code"></el-input>
			</el-form-item>
			<el-form-item :label="$t('sysrole.roleGroup')" prop="group_id">
				<el-select
					v-model="form.group_id"
					:placeholder="$t('sysrole.inputRoleGroupName')"
					:loading="loadingGroups"
					:disabled="form.category === '0'"
					clearable
					filterable
					style="width: 100%"
				>
					<el-option
						v-for="item in roleGroups"
						:key="item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>
			<el-form-item :label="$t('sysrole.roleDesc')" prop="description">
				<el-input
					:placeholder="$t('sysrole.please_enter_the_role_description')"
					maxlength="150"
					:rows="3"
					type="textarea"
					v-model="form.description"
				></el-input>
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

<script lang="ts" name="systemRoleDialog" setup>
import { rule } from '/@/utils/validate';
import { useMessage } from '/@/hooks/message';
import { addObj, getObj, putObj, validateRoleCode, validateRoleName } from '/@/api/admin/role';
import { getObjs } from '/@/api/admin/role-group';
import { useI18n } from 'vue-i18n';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const { t } = useI18n();

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);
const loadingGroups = ref(false);
const roleGroups = ref<any[]>([]);

// 监听角色组更新事件
onMounted(() => {
  window.addEventListener('roleGroupsUpdated', fetchRoleGroups);
});

onUnmounted(() => {
  window.removeEventListener('roleGroupsUpdated', fetchRoleGroups);
});

// 获取角色组数据
const fetchRoleGroups = async () => {
  try {
    loadingGroups.value = true;
    const res = await getObjs();
    roleGroups.value = res.data;
  } catch (err) {
    useMessage().error(err.message || '获取角色组失败');
  } finally {
    loadingGroups.value = false;
  }
};

// 提交表单数据
const form = reactive({
	id: '',
	name: '',
	code: '',
	description: '',
	dsScope: '',
	group_id: '',
	category: '', // 角色类别(0-系统角色，1-业务角色)
});

// 页面对应元数据
const dataForm = reactive({
	deptData: [],
	checkedDsScope: [],
	deptProps: {
		children: 'children',
		label: 'name',
		value: 'id',
	},
});

// 定义校验规则
const dataRules = ref({
	name: [
		{ required: true, message: '角色名称不能为空', trigger: 'blur' },
		{ min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateRoleName(rule, value, callback, form.id !== '');
			},
			trigger: 'blur',
		},
	],
	code: [
		{ required: true, message: '角色标识不能为空', trigger: 'blur' },
		{ min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
		//{ validator: rule.validatorCapital, trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				validateRoleCode(rule, value, callback, form.id !== '');
			},
			trigger: 'blur',
		},
	],
	description: [{ max: 128, message: '长度在 128 个字符内', trigger: 'blur' }],
	group_id: [{ required: true,message: '角色组不能为空', trigger: 'blur' }],
});

// 打开弹窗
const openDialog = (id: string) => {
	visible.value = true;
	form.id = '';

	nextTick(() => {
		dataFormRef.value.resetFields();
	});

	// 获取角色组数据（只在没有数据时刷新）
	if (!roleGroups.value.length) {
		fetchRoleGroups();
	}

	// 获取角色信息
	if (id) {
		form.id = id;
		getRoleData(id);
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => {});
	if (!valid) return false;

	// 如果是系统角色，禁止修改角色组
	if (form.category === '0' && form.id) {
		//useMessage().error(t('sysrole.systemRoleCannotModify'));
		//return false;
	}

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

// 初始化角色数据
const getRoleData = (id: string) => {
	getObj(id).then((res: any) => {
		Object.assign(form, res.data);
		if (res.data.dsScope) {
			dataForm.checkedDsScope = res.data.dsScope.split(',');
		} else {
			dataForm.checkedDsScope = [];
		}
		// 如果是系统角色，禁用角色组选择
		if (form.category === '0') {
			form.group_id = res.data.group_id;
		}
	});
};


// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
.role-form-dialog {
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
      margin-bottom: 24px;
      transition: all 0.3s ease;
      padding: 8px 12px;
      border-radius: 6px;
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
      }

      .el-input,
      .el-textarea,
      .el-select {
        .el-input__wrapper {
          border-radius: 6px;
          box-shadow: 0 0 0 1px #e2e8f0;
          transition: all 0.3s ease;
          background-color: white;
          padding: 0 12px;

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
          border-radius: 6px;
          box-shadow: 0 0 0 1px #e2e8f0;
          transition: all 0.3s ease;
          padding: 10px 12px;
          min-height: 80px;

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

      .el-button.el-button--primary {
        background: linear-gradient(135deg, #409eff, #3375b9) !important;
        border: none !important;
        color: white !important;
        box-shadow: none !important;
      }
    }
  }
}
</style>