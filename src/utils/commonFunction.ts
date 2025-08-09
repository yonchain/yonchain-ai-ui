// 通用函数
import useClipboard from 'vue-clipboard3';
import { ElMessage } from 'element-plus';
import { formatDate } from '/@/utils/formatTime';
import { useI18n } from 'vue-i18n';

export default function () {
	const { t } = useI18n();
	const { toClipboard } = useClipboard();

	// 百分比格式化
	const percentFormat = (row: EmptyArrayType, column: number, cellValue: string) => {
		return cellValue ? `${cellValue}%` : '-';
	};
	// 列表日期时间格式化
	const dateFormatYMD = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		try {
			return formatDate(new Date(cellValue), 'YYYY-mm-dd');
		} catch (error) {
			console.error('Date formatting error:', error);
			return '-';
		}
	};
	// 列表日期时间格式化
	const dateFormatYMDHMS = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		try {
			return formatDate(new Date(cellValue), 'YYYY-mm-dd HH:MM:SS');
		} catch (error) {
			console.error('Date formatting error:', error);
			return '-';
		}
	};
	// 列表日期时间格式化
	const dateFormatHMS = (row: EmptyArrayType, column: number, cellValue: string) => {
		if (!cellValue) return '-';
		try {
			let time = 0;
			if (typeof row === 'number') time = row;
			if (typeof cellValue === 'number') time = cellValue;
			return formatDate(new Date(time * 1000), 'HH:MM:SS');
		} catch (error) {
			console.error('Time formatting error:', error);
			return '-';
		}
	};
	// 小数格式化
	const scaleFormat = (value: string | number = '0', scale: number = 4) => {
		try {
			const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;
			return Number.isNaN(numValue) ? '0' : numValue.toFixed(scale);
		} catch (error) {
			console.error('Number formatting error:', error);
			return '0';
		}
	};
	// 小数格式化（保留2位小数）
	const scale2Format = (value: string | number = '0') => {
		return scaleFormat(value, 2);
	};
	// 点击复制文本
	const copyText = (text: string) => {
		return new Promise((resolve, reject) => {
			if (!text) {
				ElMessage.warning(t('layout.copyTextEmpty'));
				reject(new Error('Empty text'));
				return;
			}
			
			try {
				// 复制
				toClipboard(text)
					.then(() => {
						// 复制成功的提示
						ElMessage.success(t('layout.copyTextSuccess'));
						resolve(text);
					})
					.catch((e) => {
						// 复制失败
						console.error('Copy failed:', e);
						ElMessage.error(t('layout.copyTextError'));
						reject(e);
					});
			} catch (e) {
				// 复制过程中出现异常
				console.error('Copy exception:', e);
				ElMessage.error(t('layout.copyTextError'));
				reject(e);
			}
		});
	};
	return {
		percentFormat,
		dateFormatYMD,
		dateFormatYMDHMS,
		dateFormatHMS,
		scaleFormat,
		scale2Format,
		copyText,
	};
}
