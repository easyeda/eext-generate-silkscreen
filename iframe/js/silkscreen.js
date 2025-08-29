// 格式转换
function stringToImage(str, textHeight) {
	// 删除此前页面上有的img元素
	/* 	document.querySelector('.image_show').innerHTML = ''; */
	// 创建一个canvas元素
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	// 设置canvas的宽度和高度
	canvas.width = textWidth;
	canvas.height = textHeight;
	// 设置字体样式
	ctx.font = `${textHeight}px ${default_Object.default_typeface}`;
	// 绘制文本
	ctx.fillText(str, 0, textHeight * 0.85);
	// 将canvas内容展示在页面上
	const imgValue = canvas.toDataURL('image/png');
	let img = new Image();
	img.src = imgValue;
	console.log(img.src);
	/* 	document.querySelector('.image_show').appendChild(img); */
	return img;
}
// 将图片格式从base64转换为blob
function base64ToBlob(base64, contentType) {
	const base64Message = base64.split(',')[1]; // 去除
	const byteCharacters = atob(base64Message);
	let byteArrays = [];
	for (let i = 0; i < byteCharacters.length; i++) {
		byteArrays.push(byteCharacters.charCodeAt(i));
	}
	const blob = new Blob([new Uint8Array(byteArrays)], { type: contentType });
	console.log(blob);
	return blob;
}
/**
 * 根据设定值确认图片生成的坐标
 * @param  midX-中间的X坐标
 * @param  midY-中间的Y坐标
 * @param  getClickX-焊盘X轴坐标
 * @param  getClickY-焊盘y轴坐标
 * @param  Width-图型宽度 #单位mil
 * @param  Height-图形高度 #单位mil
 * @param  direction-旋转角度
 * @returns origin-图形生成起始点坐标-#(x,y)
 * @returns offset-图形生成起始点与原图形的偏移量-#(x,y)
 */
function CalcOrigin(midX, midY, getClickX, getClickY, Width, Height, direction) {
	// 坐标计算
	let angleCalibration = [];
	switch (direction) {
		case '0': {
			angleCalibration = [-Width / 2, Height / 2];
			break;
		}
		case '90': {
			angleCalibration = [-Height / 2, -Width / 2];
			break;
		}
		case '180': {
			angleCalibration = [Width / 2, -Height / 2];
			break;
		}
		case '270': {
			angleCalibration = [Height / 2, Width / 2];
			break;
		}
	}
	let origin = { X: midX + angleCalibration[0], Y: midY + angleCalibration[1] }; // 计算起始点
	let offset = { offsetX: origin.X - getClickX, offsetY: origin.Y - getClickY }; // 计算出的偏移量
	return [origin, offset];
}

/**
 * 取得全部焊盘数量对应的坐标中心点
 * @param  mouse-框选时第一次鼠标点击的坐标
 * @param  mouse1-框选时第一次鼠标松开的坐标
 * @param  length-获取的焊盘数列长度
 * @return num-包含全部焊盘对应的中心点坐标
 */
function getMid(mouse, mouse1, length) {
	let num = [];
	let X_differenceAbsolute = mouse.x - mouse1.x > 0 ? mouse.x - mouse1.x : -(mouse.x - mouse1.x);
	let Y_differenceAbsolute = mouse.y - mouse1.y > 0 ? mouse.y - mouse1.y : -(mouse.y - mouse1.y);
	if (X_differenceAbsolute >= Y_differenceAbsolute) {
		// 横向放置
		console.log('检测到横向方向放置', 'x轴差距绝对值：', X_differenceAbsolute, 'y轴差距绝对值：', Y_differenceAbsolute);
		let difference = (mouse.x - mouse1.x) / length;
		for (let i = 0; i < length; i++) {
			num[i] = {};
			num[i].x = (mouse.x - difference * i + (mouse.x - difference * (i + 1))) / 2;
			num[i].y = (mouse.y + mouse1.y) / 2;
		}
	} else if (X_differenceAbsolute < Y_differenceAbsolute) {
		console.log('检测到纵向放置');
		let difference = (mouse.y - mouse1.y) / length;
		for (let j = 0; j < length; j++) {
			num[j] = {};
			num[j].x = (mouse.x + mouse1.x) / 2;
			num[j].y = (mouse.y - difference * j + (mouse.y - difference * (j + 1))) / 2;
		}
	}
	return num;
}
/**
 * 获取字体宽度
 * @param  str-要测宽度的字符串
 * @param  TextHeight-字体高
 * @returns
 */
function getTextWidth(str, TextHeight) {
	// 创建一个canvas元素
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width5 = 500;
	canvas.height = 100;
	ctx.font = `${TextHeight}px ${default_Object.default_typeface}`;
	textWidth = ctx.measureText(str).width;
	return textWidth;
}

let default_Object = {};
// 初始化默认参数
if (JSON.parse(localStorage.getItem('default_Object'))) {
	// 判断本地是否存储过default_Object
	default_Object = JSON.parse(localStorage.getItem('default_Object'));
} else {
	default_Object = {
		'default_direction': '0', // 默认丝印旋转角度为0°
		'default_tier': '3', // 默认顶层丝印层
		'default_typeface': 'Arial', // 默认字体为Arial
		'default_invert': false, // 默认反向功能
		'heightValue': 40, // 默认高度
	};
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
}
const customSlider = document.getElementById('customSlider');
const sliderHeight = document.getElementById('sliderHeight');

sliderHeight.innerHTML = default_Object.heightValue + 'mil';
customSlider.addEventListener('input', () => {
	default_Object.heightValue = customSlider.value;
	sliderHeight.textContent = customSlider.value + 'mil';
});

// 添加新的输入框和开关的事件监听器
const net = document.getElementById('input-net'); // 文字输入
const angle = document.getElementById('direction-select'); // 角度
const stencilLayerSelect = document.getElementById('stencil-layer'); // 丝印生成层选项
const fontSelect = document.getElementById('font-select'); // 字体选择
const invertSwitch = document.getElementById('invert-switch'); // 反向开关
const btn = document.querySelector('.generate-button'); // 生成按钮
const tips = document.querySelector('.tips');
// 读取参数并展示在页面上

window.onload = function () {
	stencilLayerSelect.value = default_Object.default_tier; // 生成层
	invertSwitch.checked = default_Object.default_invert; // 反相
	customSlider.value = default_Object.heightValue; // 字高
	fontSelect.value = default_Object.default_typeface; // 字体
};

// 获取EDA常用文字
(async function font() {
	const sys_font = await eda.sys_FontManager.getFontsList();
	// 确保 fontSelect 存在
	if (fontSelect) {
		// 清空现有的选项（如果有）
		fontSelect.innerHTML = '';
		// 遍历 sys_font 数组
		sys_font.forEach((font) => {
			// 创建一个新的 <option> 元素
			const option = document.createElement('option');
			// 设置 <option> 的 value 和 textContent
			option.value = font;
			option.textContent = font;
			// 将 <option> 元素添加到 <select> 元素中
			fontSelect.appendChild(option);
		});
	}
})();
let sys_availableFonts = [];
(async function logFontData() {
	// 获取系统字体
	try {
		sys_availableFonts = await window.queryLocalFonts();
	} catch (err) {
		console.error(err.name, err.message);
	}
	if (sys_availableFonts) {
		for (let i = 0; i <= sys_availableFonts.length; i++) {
			const option = document.createElement('option');
			option.value = sys_availableFonts[i].fullName;
			option.textContent = sys_availableFonts[i].fullName;
			fontSelect.appendChild(option);
		}
	}
})();

stencilLayerSelect.addEventListener('change', () => {
	default_Object.default_tier = stencilLayerSelect.value;
	console.log('丝印生成层:', default_Object.default_tier);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});
fontSelect.addEventListener('change', () => {
	default_Object.default_typeface = fontSelect.value;
	console.log('字体样式', default_Object.default_typeface);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});
invertSwitch.addEventListener('click', () => {
	console.log('反相开关:', invertSwitch.checked);
	default_Object.default_invert = invertSwitch.checked;
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});
angle.addEventListener('change', () => {
	default_Object.default_direction = angle.value;
	console.log('旋转角度:', default_Object.default_direction);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});
let textWidth = 0;

btn.addEventListener('click', async () => {
	const text = net.value;
	let MouseNum = 0; // 点击次数
	let Mouse = []; // 点击时的坐标
	// 获取图片
	eda.sys_Message.showToastMessage('请框选生成范围', 'info', 3);
	tips.style.display = 'flex';
	eda.pcb_Event.addMouseEventListener(
		'outImg',
		'selected',
		async () => {
			Mouse[MouseNum] = await eda.pcb_SelectControl.getCurrentMousePosition();
			if (Mouse.length === 1) MouseNum++;
			if (Mouse.length === 2) {
				console.log(Mouse);
				eda.pcb_Event.removeEventListener(`outImg`); // 完成后移除事件
				const centralPoint = getMid(Mouse[0], Mouse[1], 1);
				console.log(centralPoint);
				getTextWidth(`${text}`, 50);
				const img = stringToImage(`${text}`, 50);
				console.log(
					'Mouse[0]:',
					Mouse[0],
					'Mouse[1]:',
					Mouse[1],
					'宽：',
					textWidth,
					'高:',
					default_Object.heightValue,
					'角度:',
					default_Object.default_direction,
				);
				let Origin = CalcOrigin(
					// 坐标计算
					centralPoint[0].x,
					centralPoint[0].y,
					0,
					0,
					textWidth * default_Object.heightValue * 0.0225,
					default_Object.heightValue,
					default_Object.default_direction,
				);
				console.log('起始点Origin[0]:', Origin[0]);
				const imageBlob = base64ToBlob(img.src, 'image/png'); // 将图片格式从base64转换为blob
				const edaImage = await eda.pcb_MathPolygon.convertImageToComplexPolygon(
					// 将blob转为复杂多边形对象
					imageBlob, // 图像Blob文件
					100, // 图像宽度
					35, // 图像高度
					0.3, // 容差 0-1
					0.9, // 简化 0-1
					1, // 平滑 0-1.33
					2, // 祛斑 0-5
					false, // 是否白色背景
					default_Object.default_invert, // 是否反向
				);
				eda.pcb_PrimitiveImage.create(
					// 生成
					Origin[0].X, // X坐标
					Origin[0].Y, // Y坐标
					edaImage,
					Number(default_Object.default_tier), // 目标层
					textWidth * default_Object.heightValue * 0.0225, // 宽度
					default_Object.heightValue, // 高度
					default_Object.default_direction, // 旋转角度
					false, // 是否镜像
					false, // 是否锁定
				);
				tips.style.display = 'none';
			}
		},
		false, // 不只执行一次
	);
});
