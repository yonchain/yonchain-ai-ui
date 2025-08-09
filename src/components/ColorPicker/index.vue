<template>
	<div class="color-picker flex flex-1">
		<el-color-picker v-model="color" :predefine="predefineColors" />
		<el-input v-model="color" class="mx-[10px] flex-1" type="text" readonly />
		<el-button type="text" @click="reset">重置</el-button>
	</div>
</template>
<script lang="ts" setup>
interface Props {
	modelValue?: string;
	defaultColor?: string;
}

interface Emits {
	(event: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	defaultColor: '#409EFF',
});

const emit = defineEmits<Emits>();

const color = computed({
	get() {
		return props.modelValue;
	},
	set(value: string) {
		emit('update:modelValue', value);
	},
});

const predefineColors = ['#409EFF', '#28C76F', '#EA5455', '#FF9F43', '#01CFE8', '#4A5DFF'] as const;

const reset = () => {
	color.value = props.defaultColor;
};
</script>
