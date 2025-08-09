<template>
	<el-cascader :options="optionsData" :disabled="disabled" v-model="selectedOptions" @change="handleChange" />
</template>
<script setup lang="ts" name="china-area">
import { provinceAndCityData, provinceAndCityDataPlus, regionData, regionDataPlus } from '/@/utils/chinaArea';

interface Props {
	modelValue?: string;
	type?: number;
	plus?: boolean;
	disabled?: boolean;
}

interface Emits {
	(event: 'update:modelValue', value: string): void;
	(event: 'change', value: string): void;
}

const emit = defineEmits<Emits>();
const optionsData = ref<Array<{ value: string; label: string; children?: any[] }>>();
const props = withDefaults(defineProps<Props>(), {
	type: 3,
	plus: false,
	disabled: false,
});

const selectedOptions = computed({
	get: () => {
		return props.modelValue?.split(',');
	},
	set: (val: string[] | undefined) => {
		emit('update:modelValue', val?.join(',') || '');
	},
});

const handleChange = (value: string[]) => {
	emit('change', value.join(','));
};

onMounted(() => {
	const { plus, type } = props;
	if (plus) {
		optionsData.value = type === 2 ? provinceAndCityDataPlus : regionDataPlus;
	} else {
		optionsData.value = type === 2 ? provinceAndCityData : regionData;
	}
});
</script>
