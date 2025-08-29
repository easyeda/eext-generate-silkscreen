// 开关状态变化事件
/* oneClickSwitch.addEventListener('change', () => {
	console.log('一键生成功能已' + (oneClickSwitch.checked ? '开启' : '关闭'));
}); */

let default_set = {};
// 初始化默认参数
if (JSON.parse(localStorage.getItem('default_set'))) {
	// 判断本地是否存储过default_set
	default_set = JSON.parse(localStorage.getItem('default_set'));
} else {
	default_set = {
		'default_Distance_X': 0, // 默认丝印X距离为（x+placeDistance,Y）
		'default_Distance_Y': 0, // 默认丝印Y距离
		// 预留	'Overall_direction': '右',
		'default_direction': `0`, // 默认丝印方向为0°
		'default_tier': 3, // 默认顶层丝印层
		'default_typeface': '黑体', // 默认字体为黑体
		'default_invert': false, // 默认反向功能
		'heightValue': 40, // 默认高度
		'default_unit': 'mil',
	};
	localStorage.setItem('default_set', JSON.stringify(default_set));
}

// 获取所有交互元素
// 获取开关元素
/* const oneClickSwitch = document.querySelector('.switch-input'); */ // 一键生成开关
const generateBtn = document.querySelector('.generate-btn'); // 生成按钮
const height = document.querySelector('.number-input');
const unit = document.querySelector('.unit-select');
const angle = document.getElementById('angle-select');
const font = document.getElementById('fontSelect');
/* const targetLayer = document.querySelectorAll('.select-input')[2]; */
const invert = document.getElementById('negation');
const fontSelect = document.getElementById('fontSelect');
/* const hint = document.querySelector('.hint'); */
/* const bulb = document.querySelector('.status'); */
const typeImg = document.getElementById('type-img');
const typeText = document.getElementById('type-text');
let fontHeight;
window.onload = function () {
	if (default_set.default_unit === 'mil') {
		fontHeight = default_set.heightValue;
		height.value = fontHeight;
	} else if (default_set.default_unit === 'mm') {
		fontHeight = default_set.heightValue * 0.0254;
		height.value = fontHeight;
	}
	// 字高
	unit.value = default_set.default_unit; // 单位
	// targetLayer.value = default_set.default_tier; // 生成层
	angle.value = default_set.default_direction; // 角度
	font.value = default_set.default_typeface; // 字体
	invert.checked = default_set.default_invert; // 反相
};

height.addEventListener('input', () => {
	fontHeight = parseInt(height.value, 10);
	if (default_set.default_unit === 'mil') {
		default_set.heightValue = fontHeight;
	}
	if (default_set.default_unit === 'mm') {
		default_set.heightValue = fontHeight * 39.3700787;
	}
	console.log('丝印高度:', default_set.heightValue);
	localStorage.setItem('default_set', JSON.stringify(default_set));
});

unit.addEventListener('change', () => {
	console.log('单位为', default_set.default_unit, 'unit', unit.value);

	if (unit.value === 'mm') {
		console.log('由mil转为mm');
		default_set.default_unit = unit.value;
		fontHeight = default_set.heightValue * 0.0254;
		height.value = fontHeight;
	}
	if (unit.value === 'mil') {
		console.log('由mm转为mil');
		default_set.default_unit = unit.value;
		fontHeight = default_set.heightValue;
		height.value = fontHeight;
	}
	console.log('单位:', default_set.default_unit);
	localStorage.setItem('default_set', JSON.stringify(default_set));
});

angle.addEventListener('change', () => {
	default_set.default_direction = angle.value;
	console.log('角度:', default_set.default_direction);
	localStorage.setItem('default_set', JSON.stringify(default_set));
});

font.addEventListener('change', () => {
	default_set.default_typeface = font.value;
	console.log('字体:', default_set.default_typeface);
	localStorage.setItem('default_set', JSON.stringify(default_set));
});

/* targetLayer.addEventListener('change', () => {
	default_set.default_tier = targetLayer.value;
	console.log('目标层:', default_set.default_tier);
	localStorage.setItem('default_set', JSON.stringify(default_set));
}); */

invert.addEventListener('click', () => {
	if (invert.checked === true) default_set.default_invert = true;
	if (invert.checked === false) default_set.default_invert = false;
	console.log('是否反向:', default_set.default_invert);
	localStorage.setItem('default_set', JSON.stringify(default_set));
});
typeImg.addEventListener('click', () => {
	console.log('图形生成选项：', typeImg.checked);
	if (typeImg.checked === true) {
		console.log('图形生成选项功能开启');
	} else if (typeImg.checked === false) {
		typeImg.checked = true;
	}
});
typeText.addEventListener('click', () => {
	if (typeText.checked === true) {
		typeText.checked = false;
	}
	console.log('文字生成选项：', typeText.checked);
	eda.sys_Message.showToastMessage(
		`您的版本为${eda.sys_Environment.getEditorCurrentVersion()}，此版本文字生成插件暂未开放，功能将在版本更新后开放`,
		'warn',
		3,
	);
});
// 获取EDA常用文字
(async function getfont() {
	const sys_font = await eda.sys_FontManager.getFontsList();
	console.log(sys_font);
	// 确保sys_font获取到值
	if (sys_font) {
		// 清空现有的选项（如果有）
		font.innerHTML = '';
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
			option.value = sys_availableFonts[i].family;
			option.textContent = sys_availableFonts[i].fullName;
			fontSelect.appendChild(option);
		}
	}
})();

/**
 * 根据设定值确认图片生成的坐标
 * @param  midX-中间的X坐标
 * @param  midY-中间的Y坐标
 * @param  getClickX-焊盘X轴坐标
 * @param  getClickY-焊盘y轴坐标
 * @param  Width-图型宽度 #单位mil
 * @param  Height-图形高度 #单位mil
 * @param  direction-旋转角度
 * @param  floor-所在层
 * @returns origin-图形生成起始点坐标-#(x,y)
 * @returns offset-图形生成起始点与原图形的偏移量-#(x,y)
 */
function CalcOrigin(midX, midY, getClickX, getClickY, Width, Height, direction, floor) {
	// 坐标计算
	let angleCalibration = [];
	// 顶层坐标计算
	if (floor === 3) {
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
	} else if (floor === 4) {
		switch (direction) {
			case '0': {
				angleCalibration = [Width / 2, Height / 2];
				break;
			}
			case '90': {
				angleCalibration = [-Height / 2, -Width / 2];
				break;
			}
			case '180': {
				angleCalibration = [-Width / 2, -Height / 2];
				break;
			}
			case '270': {
				angleCalibration = [-Height / 2, Width / 2];
				break;
			}
		}
	}

	let origin = { X: midX + angleCalibration[0], Y: midY + angleCalibration[1] }; // 计算起始点
	let offset = { offsetX: origin.X - getClickX, offsetY: origin.Y - getClickY, floor: floor }; // 计算出的偏移量
	return [origin, offset];
}

/**
 * 获取字体宽度
 * @param  str-要测宽度的字符串
 * @param  TextHeight-字高
 * @returns
 */
function getTextWidth(str, TextHeight) {
	// 创建一个canvas元素
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width5 = 500;
	canvas.height = 100;
	ctx.font = `${TextHeight}px ${default_set.default_typeface}`;
	textWidth = ctx.measureText(str).width;
	return textWidth;
}

/**
 * 取得数组内的最大值和对应的索引
 * @param  arr-数组
 * @returns max-数组的最大值
 * @returns k-最大值对应的索引
 */
function ArrayMax(arr) {
	let max = 0;
	let k = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] > max) {
			max = arr[i];
			k = i;
		}
	}
	return { max: max, k: k };
}
/**
 * 取得全部焊盘数量对应的坐标中心点
 * @param  mouse-框选时第一次鼠标点击的坐标
 * @param  mouse1-框选时第一次鼠标松开的坐标
 * @param  bonding-焊盘数据
 * @returns num-包含全部焊盘对应的中心点坐标
 */
function getMid(mouse, mouse1, bonding, height) {
	let num = [];
	const midMouseX = (mouse.x + mouse1.x) / 2;
	const midMouseY = (mouse.y + mouse1.y) / 2;
	let bondingMidX = 0;
	let bondingMidY = 0;
	if (bonding.length > 1) {
		bondingMidX = (bonding[0].x + bonding[bonding.length - 1].x) / 2;
		bondingMidY = (bonding[0].y + bonding[bonding.length - 1].y) / 2;
	} else if (bonding.length === 1) {
		bondingMidX = bonding[0].x;
		bondingMidY = bonding[0].y;
	} else {
		console.error('未获取到焊盘数据');
		return 0;
	}

	let directional_sign = 0;
	let relative_position = 0;
	if (Math.abs(midMouseX - bondingMidX) >= Math.abs(midMouseY - bondingMidY)) {
		directional_sign = 1;
		relative_position = mouse.x > mouse1.x ? 1 : -1;
		console.log('检测到目标位置为水平方向对齐焊盘,directional_sign=', directional_sign);
	} else if (Math.abs(midMouseX - bondingMidX) < Math.abs(midMouseY - bondingMidY)) {
		directional_sign = 2;
		relative_position = mouse.x > mouse1.x ? 1 : -1;
		console.log('检测到目标位置为垂直方向对齐焊盘,directional_sign=', directional_sign);
	} else {
		console.error('焊盘对对齐参数计算异常');
		return 0;
	}
	let ArrayWidth = [];
	for (let item of bonding) {
		ArrayWidth.push(getTextWidth(item.net, height));
	}
	const paddingMax = ArrayMax(ArrayWidth);
	console.log('ArrayWidth', ArrayWidth, 'paddingMax', paddingMax);

	if (directional_sign === 1) {
		// 水平方向对齐焊盘
		for (let i = 0; i < bonding.length; i++) {
			num[i] = {};
			num[i].x = bonding[i].x + (midMouseX - bondingMidX) + (relative_position * (paddingMax.max - ArrayWidth[i])) / 2;
			num[i].y = bonding[i].y;
		}
	} else if (directional_sign === 2) {
		// 垂直方向对齐焊盘
		for (let i = 0; i < bonding.length; i++) {
			num[i] = {};
			num[i].x = bonding[i].x;
			num[i].y = bonding[i].y + (midMouseY - bondingMidY) + (relative_position * (paddingMax.max - ArrayWidth[i])) / 2;
		}
	} else {
		console.error('焊盘对对齐参数计算异常,directional_sign', directional_sign);
		return 0;
	}
	return num;
}

/**
 * 筛除非焊盘元素
 * @param A-被选择的元素ID
 * @param B-所有焊盘的ID
 * @returns 被选择的焊盘ID
 */
function data_filtering(A, B) {
	let getClickPrimitiveId = [];
	for (const primitive of B) {
		if (A.includes(primitive)) {
			getClickPrimitiveId.push(primitive);
		}
	}
	return getClickPrimitiveId;
}

/**
 * 生成base64格式图形文件
 * @param str -要转换的字符
 * @param textHeight -字高 #单位mil
 * @returns img-图形变量base64格式
 */
function stringToImage(str, textHeight) {
	getTextWidth(str, textHeight);
	// 创建一个canvas元素
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	// 设置canvas的宽度和高度
	canvas.width = textWidth;
	canvas.height = textHeight;
	// 设置字体样式
	ctx.font = `${textHeight}px ${default_set.default_typeface}`;
	console.log('textWidth=' + textWidth);
	// 绘制文本
	ctx.fillText(str, 0, textHeight * 0.79);
	const imgValue = canvas.toDataURL('image/png');
	let img = new Image();
	img.src = imgValue;
	console.log(img.src);
	/* 	document.querySelector('.image_show').appendChild(img); */
	return img;
}
/**
 * 将图片格式从base64转换为blob
 * @param base64 -base64格式的图形
 * @param contentType -表示Blob要存放的媒体类型
 * @returns blob-#size：二进制字节数 #type：媒体类型
 */
function base64ToBlob(base64, contentType) {
	const base64Message = base64.split(',')[1]; // 去除
	const byteCharacters = atob(base64Message); // 解码
	let byteArrays = [];
	for (let i = 0; i < byteCharacters.length; i++) {
		byteArrays.push(byteCharacters.charCodeAt(i));
	}
	const blob = new Blob([new Uint8Array(byteArrays)], { type: contentType });
	console.log(blob);
	return blob;
}

// 一键生成开关的逻辑判断
/* let intervalId;
oneClickSwitch.addEventListener('click', () => {
	console.log('一键生成开关:', oneClickSwitch.checked);
	default_oneGeneration = oneClickSwitch.checked;
	oneClickSwitch.checked ? (generateBtn.classList = 'state') : (generateBtn.classList = 'generate-btn');
	if (oneClickSwitch.checked) {
		console.log('offset', offset);
		intervalId = setInterval(data_acquisition, 100);
	} else {
		clearInterval(intervalId);
	}
}); */

let img;
let textWidth = 0;

// 获取全部焊盘的ID
let AllPrimitive = [];
(async function get() {
	AllPrimitive = await eda.pcb_PrimitivePad.getAllPrimitiveId();
})();

let getAll_primitives = []; // 通过焊盘id获取的焊盘参数
let getAll_PrimitivesId = []; // 被选择的图元ID
/* let offset = {}; */
/**
 * 获取框选中焊盘图元的参数
 */
async function getSilkscreen() {
	getAll_PrimitivesId = await eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId(); // 获取受选图元ID
	getClickPrimitiveId = data_filtering(getAll_PrimitivesId, AllPrimitive); // 将过滤后的焊盘id暂存于此
	getAll_primitives = await eda.pcb_PrimitivePad.get(getClickPrimitiveId);
	/* 	if (getAll_primitives.length > 0) {
		bulb.style.backgroundColor = '#07c400';
	} else {
		bulb.style.backgroundColor = '#666';
	} */
}
setInterval(getSilkscreen, 10); // 循环获取图元参数

generateBtn.addEventListener('click', async () => {
	// 点击生成按钮后的动作，获取的图元必须处于高亮选择状态
	const bonding = getAll_primitives;
	console.log('生成事件被触发', bonding);
	if (/* !oneClickSwitch.checked && */ bonding.length > 0) {
		// 一键生成功能未开启
		let MouseNum = 0; // 点击次数
		let Mouse = []; // 点击时的坐标
		// 获取图片
		eda.sys_Message.showToastMessage('请框选生成范围', 'info', 3);
		const result = bonding
			.map((str) => {
				match = str.primitiveId.match(/^[a-z]{1,2}[0-9]{1,4}/);
				/* console.log(match); */
				// 如果匹配成功返回捕获组内容，否则返回null
				return match ? match[0] : null;
			})
			.filter((item) => item !== null);
		if (result.length === 0) {
			console.error('未获取到焊盘父元素ID');
			eda.sys_Message.showToastMessage('未获取到焊盘父元素ID', 'error', 3);
			return;
		}
		console.log(result);
		const allDevices = await eda.pcb_PrimitiveComponent.get(result); // 获取焊盘对应的器件信息
		console.log(allDevices);

		eda.pcb_Event.addMouseEventListener(
			'generate',
			'selected',
			async () => {
				Mouse[MouseNum] = await eda.pcb_SelectControl.getCurrentMousePosition();
				if (Mouse.length === 1) MouseNum++;
				if (Mouse.length === 2) {
					console.log(Mouse);
					eda.pcb_Event.removeEventListener(`generate`); // 完成后移除事件
					const centralPoint = getMid(Mouse[0], Mouse[1], bonding, default_set.heightValue);
					console.log(centralPoint);
					for (let i = 0; i < bonding.length; i++) {
						if (bonding[i].net === '') continue; // 去掉空焊盘
						default_set.default_tier = allDevices[i].layer === 1 ? 3 : 4; // 3顶层丝印层，4底层丝印层
						img = stringToImage(`${bonding[i].net}`, default_set.heightValue);
						console.log(
							'Mouse[0]:',
							Mouse[0],
							'Mouse[1]:',
							Mouse[1],
							'bonding:',
							bonding[i].x,
							bonding[i].y,
							'宽：',
							textWidth,
							'高:',
							default_set.heightValue,
							'角度:',
							default_set.default_direction,
						);
						let Origin = CalcOrigin(
							// 坐标计算
							centralPoint[i].x,
							centralPoint[i].y,
							bonding[i].x,
							bonding[i].y,
							textWidth,
							default_set.heightValue,
							default_set.default_direction,
							Number(default_set.default_tier),
						);
						offset = Origin[1];
						/* 						console.log('起始点Origin[0]:', Origin[0]);
						console.log('偏移量Origin[1]:', Origin[1]); */
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
							default_set.default_invert, // 是否反向
						);
						eda.pcb_PrimitiveImage.create(
							// 生成
							Origin[0].X, // X坐标
							Origin[0].Y, // Y坐标
							edaImage,
							Number(default_set.default_tier), // 目标层
							textWidth, // 宽度
							default_set.heightValue, // 高度
							default_set.default_direction, // 旋转角度
							false, // 是否镜像
							false, // 是否锁定
						);
					}
				}
			},
			false, // 不只执行一次
		);
	}
});

