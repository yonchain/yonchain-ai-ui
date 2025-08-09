<!--
 * @Descripttion: 代码编辑器
 * @version: 1.0
 * @Author: sakuya
 * @Date: 2022年5月20日21:46:29
 * @LastEditors: 
 * @LastEditTime: 
-->

<template>
	<div class="code-editor" :style="{ height: _height }">
		<textarea ref="textarea" v-model="contentValue"></textarea>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, markRaw } from 'vue';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/idea.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/velocity/velocity';
import 'codemirror/mode/go/go';

interface Props {
	modelValue?: string;
	mode?: string;
	height?: string | number;
	options?: Record<string, any>;
	theme?: string;
	readOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	mode: 'go',
	height: 300,
	options: () => ({}),
	theme: 'idea',
	readOnly: false,
});

const emit = defineEmits(['update:modelValue']);
const textarea = ref<HTMLTextAreaElement | null>(null);
const coder = ref<any>(null);
const contentValue = ref(props.modelValue);

const _height = computed(() => {
	return Number(props.height) ? `${Number(props.height)}px` : props.height;
});

const opt = computed(() => ({
	theme: props.theme,
	styleActiveLine: true,
	lineNumbers: true,
	lineWrapping: false,
	tabSize: 4,
	indentUnit: 4,
	indentWithTabs: true,
	mode: props.mode,
	readOnly: props.readOnly,
	...props.options,
}));

watch(() => props.modelValue, (val) => {
	contentValue.value = val;
	if (val !== coder.value?.getValue()) {
		coder.value?.setValue(val);
	}
});

onMounted(() => {
	if (textarea.value) {
		coder.value = markRaw(CodeMirror.fromTextArea(textarea.value, opt.value));
		coder.value.on('change', (cm: any) => {
			contentValue.value = cm.getValue();
			emit('update:modelValue', contentValue.value);
		});
	}
});

const formatStrInJson = (strValue: string) => {
	return JSON.stringify(JSON.parse(strValue), null, 4);
};
</script>
</script>

<style scoped>
.code-editor {
	font-size: 14px;
	border: 1px solid #ddd;
	line-height: 150%;
}
.code-editor:deep(.CodeMirror) {
	height: 100%;
}
</style>
