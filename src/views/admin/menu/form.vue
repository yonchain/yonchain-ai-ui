<template>
  <el-dialog 
    :title="state.ruleForm.menuId ? $t('common.editBtn') : $t('common.addBtn')" 
    width="700px"
    v-model="is_hide"
    :close-on-click-modal="false" 
    :destroy-on-close="true" 
    draggable
    class="menu-form-dialog"
  >
    <el-form ref="menuDialogFormRef" :model="state.ruleForm" :rules="dataRules" label-width="90px" v-loading="loading">
      <el-form-item :label="$t('sysmenu.menuType')" prop="menu_type">
        <el-radio-group v-model="state.ruleForm.menu_type">
          <el-radio border value="0">菜单</el-radio>
          <el-radio border value="1">按钮</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('sysmenu.parentId')" prop="parent_id">
        <el-tree-select
            v-model="state.ruleForm.parent_id"
            :data="state.parentData"
            :render-after-expand="false"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            class="w100"
            clearable
            check-strictly
            :placeholder="$t('sysmenu.inputParentIdTip')"
        >
        </el-tree-select>
      </el-form-item>
      <el-form-item :label="$t('sysmenu.name')" prop="name">
        <el-input v-model="state.ruleForm.name" clearable :placeholder="$t('sysmenu.inputNameTip')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('sysmenu.en_name')" prop="en_name">
        <el-input v-model="state.ruleForm.en_name" clearable :placeholder="$t('sysmenu.inputen_nameTip')"></el-input>
      </el-form-item>
      <el-form-item :label="$t('sysmenu.path')" prop="path" v-if="state.ruleForm.menu_type === '0'">
        <el-input v-model="state.ruleForm.path" :placeholder="$t('sysmenu.inputPathTip')"/>
      </el-form-item>
      <el-form-item :label="$t('sysmenu.permission')" prop="permission" v-if="state.ruleForm.menu_type === '1'">
        <el-input v-model="state.ruleForm.permission" maxlength="50" :placeholder="$t('sysmenu.inputPermissionTip')"/>
      </el-form-item>
      <el-form-item :label="$t('sysmenu.icon')" prop="icon" v-if="state.ruleForm.menu_type === '0'">
        <IconSelector  v-model="state.ruleForm.icon"/>
      </el-form-item>
      <el-form-item :label="$t('sysmenu.sortOrder')" prop="sort_order">
        <el-input-number v-model="state.ruleForm.sort_order" :min="0" controls-position="right"/>
      </el-form-item>
      <el-form-item :label="$t('sysmenu.embedded')" prop="is_iframe"
                    v-if="state.ruleForm.menu_type === '0' && state.ruleForm.path?.startsWith('http')">
        <el-radio-group v-model="state.ruleForm.is_iframe">
          <el-radio border :value="true">是</el-radio>
          <el-radio border :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <!--
      <el-form-item :label="$t('sysmenu.keepAlive')" prop="is_keep_alive" v-if="state.ruleForm.menu_type === '0'">
        <el-radio-group v-model="state.ruleForm.is_keep_alive">
          <el-radio border :value=true>是</el-radio>
          <el-radio border :value=false>否</el-radio>
        </el-radio-group>
      </el-form-item>-->
      <el-form-item :label="$t('sysmenu.visible')" prop="is_hide" v-if="state.ruleForm.menu_type === '0'">
        <el-radio-group v-model="state.ruleForm.is_hide">
          <el-radio border :value=false>是</el-radio>
          <el-radio border :value=true>否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
			<span class="dialog-footer">
				<el-button @click="is_hide = false">{{ $t('common.cancelButtonText') }}</el-button>
				<el-button type="primary" @click="onSubmit" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
			</span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="systemMenuDialog">
import {useI18n} from 'vue-i18n';
import {info, pageList, putObj, addObj} from '/@/api/admin/menu';
import {useMessage} from '/@/hooks/message';
import {rule} from '/@/utils/validate';
import { fa } from 'element-plus/es/locale';
// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);
const {t} = useI18n();
// 引入组件
const IconSelector = defineAsyncComponent(() => import('/@/components/IconSelector/index.vue'));

// 定义变量内容
const is_hide = ref(false);
const loading = ref(false);
const menuDialogFormRef = ref();
// 定义需要的数据
const state = reactive({
  ruleForm: {
    menuId: '',
    name: '',
    en_name: '',
    permission: '',
    parent_id: '',
    icon: '',
    path: '',
    sort_order: 0,
    menu_type: '0',
    is_keep_alive: false,
    is_hide: false,
    is_iframe: false,
    is_link: false,
  },
  parentData: [] as any[], // 上级菜单数据
});

// 表单校验规则
const dataRules = reactive({
  menu_type: [{required: true, message: '菜单类型不能为空', trigger: 'blur'}],
  parent_id: [{required: true, message: '上级菜单不能为空', trigger: 'blur'}],
  name: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '菜单不能为空', trigger: 'blur'}],
  path: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '路径不能为空', trigger: 'blur'}],
  icon: [{required: true, message: '图标不能为空', trigger: 'blur'}],
  permission: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '权限代码不能为空', trigger: 'blur'}],
  sort_order: [{validator: rule.overLength, trigger: 'blur'},{required: true, message: '排序不能为空', trigger: 'blur'}],
  en_name: [{validator: rule.overLength, trigger: 'blur'}],
});

// 打开弹窗
const openDialog = (type: string, row?: any) => {
 // state.ruleForm.menuId = '';
  is_hide.value = true;

  // 仅在新增操作时初始化表单数据
  if (type !== 'edit') {
    const parentId = row?.id || 'b61804f0-e99e-4c15-9f9c-0784b125888b';
    state.ruleForm = {
      menuId: '',
      name: '',
      en_name: '',
      permission: '',
      parent_id: parentId,
      icon: '',
      path: '',
      sort_order: 0,
      menu_type: '0',
      is_keep_alive: false,
      is_hide: false,
      is_iframe: false,
      is_link: false,
    };
  }

  nextTick(() => {
    menuDialogFormRef.value?.resetFields();
    // 如果是编辑操作，设置parent_id
    if (type === 'edit' && row?.id) {
      state.ruleForm.parent_id = row.id;
    }
  });

  if (row?.id && type === 'edit') {
    state.ruleForm.menuId = row.id;
    // 获取当前节点菜单信息
    getMenuDetail(row.id);
  }
  // 渲染上级菜单列表树
  getAllMenuData();
};

// 获取菜单节点的详细信息
const getMenuDetail = (id: string) => {
  info(id).then((res) => {
    Object.assign(state.ruleForm, res);
  });
};

// 从后端获取菜单信息（含层级）
const getAllMenuData = () => {
  state.parentData = [];
  pageList({
    type: '0',
  }).then((res) => {
    let menu = {
      id: 'b61804f0-e99e-4c15-9f9c-0784b125888b',
      name: '根菜单',
      children: [],
    };
    menu.children = res.data;
    state.parentData.push(menu);
  });
};

// 保存数据
const onSubmit = async () => {
  const valid = await menuDialogFormRef.value.validate().catch(() => {
  });
  if (!valid) return false;

  try {
    loading.value = true;
    state.ruleForm.is_link = state.ruleForm.path?.startsWith('http');
    state.ruleForm.menuId ? await putObj(state.ruleForm) : await addObj(state.ruleForm);
    useMessage().success(t(state.ruleForm.menuId ? 'common.editSuccessText' : 'common.addSuccessText'));
    is_hide.value = false;
    emit('refresh');
  } catch (err: any) {
    useMessage().error(err.message);
  } finally {
    loading.value = false;
  }
};

// 暴露变量 只有暴漏出来的变量 父组件才能使用
defineExpose({
  openDialog,
});
</script>

<style lang="scss" scoped>
.menu-form-dialog {
  .el-dialog__body {
    padding: 30px 35px;
    background-color: #f8fafc;
  }

  .el-dialog {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  .el-dialog__header {
    padding: 25px 35px;
    background: linear-gradient(135deg, #f6f7f9, #e9ebee);
    border-bottom: 1px solid #e4e7ed;
    margin-right: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
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