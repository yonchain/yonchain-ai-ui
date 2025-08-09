<template>
  <el-dialog
    v-model="visible"
    title="关于"
    width="500px"
    align-center
    class="about-dialog"
  >
    <div style="text-align: center;">
      <h3 style="margin-bottom: 20px;">系统版本: {{ version }}</h3>
      <p style="color: #999;">© 2025 广州永成人工智能有限公司 版权所有</p>
    </div>
    <template #footer>
      <el-button type="primary" @click="visible = false">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import request from '/@/utils/request';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(props.modelValue);
const version = ref('');



watch(() => props.modelValue, async (val) => {
  visible.value = val;
  if (val) {
    try {
      const response = await request({
        url: '/version',
        method: 'get',
      });
      version.value = response;
    } catch (error) {
      console.error('Failed to fetch version:', error);
      version.value = '1.0.0';
    }
  }
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});
</script>