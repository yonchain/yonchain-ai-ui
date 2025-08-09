/**
 * 判断两数组字符串是否相同（用于按钮权限验证），数组字符串中存在相同时会自动去重（按钮权限标识不会重复）
 * @param newArr 新数据数组
 * @param oldArr 源数据数组
 * @returns 两数组相同返回 `true`，反之则返回 `false`
 */
export function judementSameArr(newArr: unknown[] | string[], oldArr: string[]): boolean {
	const news = removeDuplicate(newArr);
	const olds = removeDuplicate(oldArr);
	
	// 如果长度不同，直接返回 false
	if (news.length !== olds.length) {
		return false;
	}
	
	// 计算匹配的元素数量
	const matchCount = news.filter(item => olds.includes(item)).length;
	
	// 如果匹配数量等于新数组长度，则两数组相同
	return matchCount === news.length;
}

/**
 * 判断两个对象是否相同
 * @param a 要比较的对象一
 * @param b 要比较的对象二
 * @returns 相同返回 true，反之则返回 false
 */
export function isObjectValueEqual<T extends Record<string, any>>(a: T, b: T): boolean {
	// 如果任一对象为空，则不相等
	if (!a || !b) return false;
	
	// 获取对象的所有属性名
	const aProps = Object.getOwnPropertyNames(a);
	const bProps = Object.getOwnPropertyNames(b);
	
	// 如果属性数量不同，则对象不相等
	if (aProps.length !== bProps.length) return false;
	
	// 逐一比较每个属性
	for (const propName of aProps) {
		// 如果 b 没有该属性，则对象不相等
		if (!b.hasOwnProperty(propName)) return false;
		
		const propA = a[propName];
		const propB = b[propName];
		
		// 如果属性值是对象，则递归比较
		if (propA instanceof Object && propB instanceof Object) {
			if (!isObjectValueEqual(propA, propB)) return false;
		} 
		// 否则直接比较值
		else if (propA !== propB) {
			return false;
		}
	}
	
	return true;
}

/**
 * 数组、数组对象去重
 * @param arr 数组内容
 * @param attr 需要去重的键值（数组对象）
 * @returns 去重后的数组
 */
export function removeDuplicate<T>(arr: T[], attr?: string): T[] {
	// 如果数组为空，直接返回
	if (!Array.isArray(arr) || arr.length === 0) {
		return arr;
	}
	
	// 如果指定了属性，按属性值去重
	if (attr) {
		const uniqueMap = new Map();
		return arr.filter(item => {
			// 如果是对象且有指定属性
			if (item && typeof item === 'object' && attr in item) {
				const key = item[attr];
				// 如果键值为空，保留
				if (!key) return true;
				
				// 如果键值不存在于 Map 中，添加并保留
				if (!uniqueMap.has(key)) {
					uniqueMap.set(key, true);
					return true;
				}
				return false;
			}
			// 非对象或没有指定属性的元素保留
			return true;
		});
	} 
	// 否则直接使用 Set 去重
	else {
		return [...new Set(arr)];
	}
}
