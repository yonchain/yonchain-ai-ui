<template>
	<el-pagination
		@size-change="sizeChangeHandle"
		@current-change="currentChangeHandle"
		:pager-count="5"
		:page-sizes="props.pageSizes"
		:current-page="props.current"
		background
		:page-size="props.size"
		:layout="props.layout"
		:total="props.total"
		class="pagination-container"
	>
	</el-pagination>
</template>

<script setup lang="ts" name="pagination">
const emit = defineEmits(['sizeChange', 'currentChange']);

const props = defineProps({
	current: {
		type: Number,
		default: 1,
	},
	size: {
		type: Number,
		default: 10,
	},
	total: {
		type: Number,
		default: 0,
	},
	pageSizes: {
		type: Array as () => number[],
		default: () => {
			return [1, 10, 20, 50, 100, 200];
		},
	},
	layout: {
		type: String,
		default: 'total, sizes, prev, pager, next, jumper',
	},
});
// 分页改变
const sizeChangeHandle = (val: number) => {
	emit('sizeChange', val);
};
// 分页改变
const currentChangeHandle = (val: number) => {
	emit('currentChange', val);
};
</script>

<style lang="scss" scoped>
// 定义颜色变量
$primary-color: #409eff;
$text-secondary: #677182;
$border-color: #e4e7ed;

.pagination-container {
  position: absolute;
  bottom: 20px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 14px 0;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.number) {
    width: 36px;
    height: 36px;
    margin: 0 4px;
    border-radius: 8px;
    transition: all 0.2s ease;
    color: $text-secondary;
    
    &:hover {
      color: $primary-color;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba($primary-color, 0.2);
    }
    
    &.active {
      background: $primary-color;
      color: white;
      font-weight: 500;
    }
  }
  
  :deep(.el-pager li:not(.active)) {
    &:hover {
      color: $primary-color;
    }
  }
  
  :deep(.el-input__inner) {
    border-radius: 8px;
    border-color: $border-color;
    transition: all 0.2s ease;
    
    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }
  }
  
  :deep(.el-select .el-input) {
    width: 100px;
  }
  
  :deep(.el-pagination__jump) {
    color: $text-secondary;
    margin-left: 12px;
  }
  
  :deep(.el-pagination__total) {
    margin-right: 12px;
    color: $text-secondary;
  }
}
</style>