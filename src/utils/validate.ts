/**
 * 判断是否为空
 * @param val 数据
 * @returns 是否为空
 */
export const validateNull = (val: any): boolean => {
	// 布尔值和数字类型不视为空
	if (typeof val === 'boolean' || typeof val === 'number') {
		return false;
	}
	
	// 数组类型判断
	if (Array.isArray(val)) {
		return val.length === 0;
	} 
	// 对象类型判断
	else if (val instanceof Object) {
		return Object.keys(val).length === 0;
	} 
	// 其他类型判断
	else {
		return val === 'null' || val == null || val === 'undefined' || val === undefined || val === '';
	}
};

export interface ValidationRule {
	field?: string;
	fullField?: string;
	type?: string;
	required?: boolean;
	pattern?: RegExp;
	min?: number;
	max?: number;
	len?: number;
	message?: string;
	trigger?: string;
	validator?: (rule: ValidationRule, value: any, callback: (error?: Error) => void) => void;
	regExp?: string;
	errorMsg?: string;
}

export const rule = {
	/**
	 * 检查输入内容长度是否超过限制
	 * @param rule 验证规则
	 * @param value 输入值
	 * @param callback 回调函数
	 */
	overLength(rule: ValidationRule, value: any, callback: (error?: Error) => void): void {
		if (value?.length > 255) {
			callback(new Error('输入内容过长，请重新输入'));
		} else {
			callback();
		}
	},
	/**
	 * 校验 请输入中文、英文、数字包括下划线
	 * 名称校验
	 * @param rule 验证规则
	 * @param value 输入值
	 * @param callback 回调函数
	 */
	validatorNameCn(rule: ValidationRule, value: any, callback: (error?: Error) => void): void {
		// 中文、英文、数字、下划线的正则表达式
		const pattern = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
		if (value && !pattern.test(value)) {
			callback(new Error('请输入中文、英文、数字包括下划线'));
		} else {
			callback();
		}
	},
	
	/**
	 * 校验 请输入大写英文、下划线
	 * 名称校验
	 * @param rule 验证规则
	 * @param value 输入值
	 * @param callback 回调函数
	 */
	validatorCapital(rule: ValidationRule, value: any, callback: (error?: Error) => void): void {
		// 大写英文、下划线的正则表达式
		const pattern = /^[A-Z_]+$/;
		if (value && !pattern.test(value)) {
			callback(new Error('请输入大写英文、下划线'));
		} else {
			callback();
		}
	},

	/**
	 * 校验 请输入小写英文、下划线
	 * 名称校验
	 * @param rule 验证规则
	 * @param value 输入值
	 * @param callback 回调函数
	 */
	validatorLowercase(rule: ValidationRule, value: any, callback: (error?: Error) => void): void {
		// 小写英文、下划线的正则表达式
		const pattern = /^[a-z_]+$/;
		if (value && !pattern.test(value)) {
			callback(new Error('请输入小写英文、下划线'));
		} else {
			callback();
		}
	},

	/**
	 * 校验 请输入小写英文
	 * 名称校验
	 * @param rule 验证规则
	 * @param value 输入值
	 * @param callback 回调函数
	 */
	validatorLower(rule: ValidationRule, value: any, callback: (error?: Error) => void): void {
		// 小写英文的正则表达式
		const pattern = /^[a-z]+$/;
		if (value && !pattern.test(value)) {
			callback(new Error('请输入小写英文'));
		} else {
			callback();
		}
	},

	/**
	 * 校验首尾空白字符的正则表达式
	 * @param rule 验证规则
	 * @param value 输入值
	 * @param callback 回调函数
	 */
	checkSpace(rule: ValidationRule, value: any, callback: (error?: Error) => void): void {
		// 非空格结尾的正则表达式
		const pattern = /[^\s]+$/;
		if (!pattern.test(value)) {
			callback(new Error('请输入非空格信息'));
		} else {
			callback();
		}
	},

	/**
	 * 校验手机号
	 * @param rule 验证规则
	 * @param value 输入值
	 * @param callback 回调函数
	 */
	validatePhone(rule: ValidationRule, value: any, callback: (error?: Error) => void): void {
		// 手机号码的正则表达式
		const pattern = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
		
		// 如果包含 **** 表示是脱敏手机号，直接通过
		if (value && value.indexOf('****') >= 0) {
			callback();
			return;
		}

		if (value && !pattern.test(value)) {
			callback(new Error('请输入合法手机号'));
		} else {
			callback();
		}
	},

	/* 数字 */
	number(rule, value, callback) {
		validateFn('number', rule, value, callback, '包含非数字字符');
	},

	/* 字母 */
	letter(rule, value, callback) {
		validateFn('letter', rule, value, callback, '包含非字母字符');
	},

	/* 字母和数字 */
	letterAndNumber(rule, value, callback) {
		validateFn('letterAndNumber', rule, value, callback, '只能输入字母或数字');
	},

	/* 手机号码 */
	mobilePhone(rule, value, callback) {
		validateFn('mobilePhone', rule, value, callback, '手机号码格式有误');
	},

	/* 字母开头，仅可包含数字 */
	letterStartNumberIncluded(rule, value, callback) {
		validateFn('letterStartNumberIncluded', rule, value, callback, '必须以字母开头，可包含数字');
	},

	/* 禁止中文输入 */
	noChinese(rule, value, callback) {
		validateFn('noChinese', rule, value, callback, '不可输入中文字符');
	},

	/* 必须中文输入 */
	chinese(rule, value, callback) {
		validateFn('chinese', rule, value, callback, '只能输入中文字符');
	},

	/* 电子邮箱 */
	email(rule, value, callback) {
		validateFn('email', rule, value, callback, '邮箱格式有误');
	},

	/* URL网址 */
	url(rule, value, callback) {
		validateFn('url', rule, value, callback, 'URL格式有误');
	},

	regExp(rule, value, callback) {
		if (validateNull(value) || value.length <= 0) {
			callback();
			return;
		}

		const pattern = new RegExp(rule.regExp);

		if (!pattern.test(value)) {
			const errTxt = rule.errorMsg || 'invalid value';
			callback(new Error(errTxt));
		} else {
			callback();
		}
	},
};

/**
 * 获取正则表达式
 * @param validatorName 验证器名称
 * @returns 对应的正则表达式字符串
 */

export const getRegExp = function (validatorName) {
	const commonRegExp = {
		number: '^[-]?\\d+(\\.\\d+)?$',
		letter: '^[A-Za-z]+$',
		letterAndNumber: '^[A-Za-z0-9]+$',
		mobilePhone: '^[1][3-9][0-9]{9}$',
		letterStartNumberIncluded: '^[A-Za-z]+[A-Za-z\\d]*$',
		noChinese: '^[^\u4e00-\u9fa5]+$',
		chinese: '^[\u4e00-\u9fa5]+$',
		email: '^([-_A-Za-z0-9.]+)@([_A-Za-z0-9]+\\.)+[A-Za-z0-9]{2,3}$',
		url: '(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]'
	};
	return commonRegExp[validatorName];
};

const validateFn = (
	validatorName: string, 
	rule: ValidationRule, 
	value: any, 
	callback: (error?: Error) => void, 
	defaultErrorMsg: string
): void => {
	// 如果值为空，直接通过验证
	if (validateNull(value) || value.length <= 0) {
		callback();
		return;
	}

	try {
		const regExpStr = getRegExp(validatorName);
		if (!regExpStr) {
			console.error(`未找到验证器: ${validatorName}`);
			callback(new Error('验证规则不存在'));
			return;
		}
		
		const reg = new RegExp(regExpStr);
		
		if (!reg.test(value)) {
			const errTxt = rule.errorMsg || defaultErrorMsg;
			callback(new Error(errTxt));
		} else {
			callback();
		}
	} catch (error) {
		console.error('验证过程出错:', error);
		callback(new Error('验证过程出错'));
	}
};
