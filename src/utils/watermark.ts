// 页面添加水印效果
const WATERMARK_ID = '1.23452384164.123412416';

/**
 * 设置水印
 * @param text 水印文本内容
 * @returns 水印元素ID
 */
const setWatermark = (text: string): string => {
	// 如果已存在水印，先移除
	const existingWatermark = document.getElementById(WATERMARK_ID);
	if (existingWatermark) {
		document.body.removeChild(existingWatermark);
	}

	// 创建 canvas 元素
	const canvas = document.createElement('canvas');
	canvas.width = 200;
	canvas.height = 130;
	
	// 获取 canvas 上下文并设置水印样式
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	ctx.rotate((-20 * Math.PI) / 180);
	ctx.font = '12px Vedana';
	ctx.fillStyle = 'rgba(200, 200, 200, 0.30)';
	ctx.textBaseline = 'middle';
	ctx.fillText(text, canvas.width / 10, canvas.height / 2);
	
	// 创建水印容器
	const watermarkDiv = document.createElement('div');
	watermarkDiv.id = WATERMARK_ID;
	watermarkDiv.style.pointerEvents = 'none';
	watermarkDiv.style.top = '0px';
	watermarkDiv.style.left = '0px';
	watermarkDiv.style.position = 'fixed';
	watermarkDiv.style.zIndex = '10000000';
	watermarkDiv.style.width = `${document.documentElement.clientWidth}px`;
	watermarkDiv.style.height = `${document.documentElement.clientHeight}px`;
	watermarkDiv.style.background = `url(${canvas.toDataURL('image/png')}) left top repeat`;
	
	// 添加到页面
	document.body.appendChild(watermarkDiv);
	
	return WATERMARK_ID;
};

/**
 * 页面水印工具
 * @method set 设置水印
 * @method remove 删除水印
 */
const watermark = {
	/**
	 * 设置水印
	 * @param text 水印文本内容
	 */
	set: (text: string): void => {
		let id = setWatermark(text);
		// 确保水印被正确设置
		if (!document.getElementById(id)) {
			id = setWatermark(text);
		}
	},
	
	/**
	 * 删除水印
	 */
	remove: (): void => {
		const watermarkElement = document.getElementById(WATERMARK_ID);
		if (watermarkElement) {
			document.body.removeChild(watermarkElement);
		}
	},
};

// 导出方法
export default watermark;