<template>
  <el-dialog
    v-model="visible"
    title="技术支持"
    width="600px"
    align-center
    class="support-dialog"
  >
    <div style="text-align: center; padding: 0 20px;">
      <img 
        src="/@/assets/home/support.jpeg" 
        alt="微信二维码" 
        style="max-width: 300px; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); display: block; margin: 0 auto;"
      />
      <div style="margin-top: 20px;">
        <h3 style="color: var(--el-color-primary); margin-bottom: 10px;">加微信好友获取技术支持</h3>
        <p style="color: #666; line-height: 1.6;">
          扫描上方二维码添加微信好友<br>
          我们的技术团队将为您提供专业支持<br>
          工作日9:00-18:00在线响应
        </p>
      </div>
    </div>
    <template #footer>
      <div style="text-align: center;">
        <el-button 
          type="primary" 
          @click="visible = false"
          style="width: 120px;"
        >
          我知道了
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});
</script>