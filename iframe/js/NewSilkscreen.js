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
		'default_place': '右',
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
const place = document.getElementById('place-select');
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
	place.value = default_set.default_place; // 位置
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
place.addEventListener('change', () => {
	default_set.default_place = place.value;
	console.log('方向', default_set.default_place);
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
	const new_sys_font = sys_font.filter((item) => item !== 'default');
	console.log(new_sys_font);
	// 确保sys_font获取到值
	if (new_sys_font) {
		// 清空现有的选项（如果有）
		font.innerHTML = '';
		// 遍历 sys_font 数组
		new_sys_font.forEach((font) => {
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
/* function ArrayMax(arr) {
	let max = 0;
	let k = 0;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] > max) {
			max = arr[i];
			k = i;
		}
	}
	return { max: max, k: k };
} */
/**
 * 取得全部焊盘数量对应的坐标中心点
 * @param  place-设定的相对方位
 * @param  bonding-焊盘数据
 * @param  height-字高 #单位mil
 * @returns num-包含全部焊盘对应的中心点坐标
 */
function getMid(place, bonding) {
	let num = [];
	let place_count = [];
	switch (place) {
		case '上':
			place_count = [0, 1];
			break;
		case '下':
			place_count = [0, -1];
			break;
		case '左':
			place_count = [-1, 0];
			break;
		case '右':
			place_count = [1, 0];
			break;
		default:
			place_count = [0, 0];
			break;
	}
	for (mid of bonding) {
		let mx = mid.x !== undefined ? mid.x : mid.getState_X();
		let my = mid.y !== undefined ? mid.y : mid.getState_Y();
		let x = mx + place_count[0] * 78.7;
		let y = my + place_count[1] * 78.7;
		num.push({ x, y });
	}

	// 计算焊盘中心点坐标

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

/**
 * 获取当前选中的焊盘图元（点击时实时获取，不再依赖轮询）
 * 通过器件的 getState_Pads() 建立焊盘ID集合，与选中图元取交集
 */
async function getSelectedPads() {
	const selectedIds = await eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId();
	if (!selectedIds || selectedIds.length === 0) return [];
	// 用 getAllPrimitiveId 获取所有焊盘ID
	const allPadIds = await eda.pcb_PrimitivePad.getAllPrimitiveId();
	if (!allPadIds || allPadIds.length === 0) return [];
	const padIdSet = new Set(allPadIds);
	const selectedPadIds = selectedIds.filter((id) => padIdSet.has(id));
	if (selectedPadIds.length === 0) return [];
	const pads = await eda.pcb_PrimitivePad.get(selectedPadIds);
	return pads || [];
}

generateBtn.addEventListener(
	'click',
	async () => {
		// 点击生成按钮后的动作，获取的图元必须处于高亮选择状态
		const bonding = await getSelectedPads();
		console.warn('[GenerateSilkscreen] 生成事件被触发, 选中焊盘数:', bonding.length);
		if (bonding.length === 0) {
			eda.sys_Message.showToastMessage('请先选中焊盘后再点击生成', 'warn', 3);
			return;
		}

		// 通过 API 获取所有器件，建立焊盘 primitiveId → 器件的映射
		const allComponents = await eda.pcb_PrimitiveComponent.getAll();
		const padToComponent = {};

		for (const comp of allComponents) {
			const compId = comp.getState_PrimitiveId();
			try {
				const pins = await eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId(compId);
				if (pins && pins.length > 0) {
					for (const pin of pins) {
						padToComponent[pin.getState_PrimitiveId()] = comp;
					}
				}
			} catch (e) {
				console.error('[GenerateSilkscreen] getAllPinsByPrimitiveId异常:', compId, e);
			}
		}

		const allDevices = [];
		for (const pad of bonding) {
			const padId = pad.primitiveId || (typeof pad.getState_PrimitiveId === 'function' ? pad.getState_PrimitiveId() : '');
			allDevices.push(padToComponent[padId] || null);
		}

		if (allDevices.every((d) => d === null)) {
			console.error('[GenerateSilkscreen] 未获取到焊盘父元素ID');
			eda.sys_Message.showToastMessage('未获取到焊盘父元素ID', 'error', 3);
			return;
		}

		const centralPoint = getMid(default_set.default_place, bonding);
		let skippedCount = 0;
		for (let i = 0; i < bonding.length; i++) {
			const padNet = bonding[i].net !== undefined ? bonding[i].net : bonding[i].getState_Net();
			if (!padNet || padNet === '') {
				skippedCount++;
				continue;
			}
			if (allDevices[i]) {
				default_set.default_tier = allDevices[i].getState_Layer() === 1 ? 3 : 4; // 3顶层丝印层，4底层丝印层
			}
			const padX = bonding[i].x !== undefined ? bonding[i].x : bonding[i].getState_X();
			const padY = bonding[i].y !== undefined ? bonding[i].y : bonding[i].getState_Y();
			img = stringToImage(`${padNet}`, default_set.heightValue);
			let Origin = CalcOrigin(
				// 坐标计算
				centralPoint[i].x,
				centralPoint[i].y,
				padX,
				padY,
				textWidth,
				default_set.heightValue,
				default_set.default_direction,
				Number(default_set.default_tier),
			);
			const imageBlob = base64ToBlob(img.src, 'image/png');
			const edaImage = await eda.pcb_MathPolygon.convertImageToComplexPolygon(
				imageBlob,
				textWidth,
				default_set.heightValue,
				0.3,
				0.9,
				1,
				2,
				false,
				default_set.default_invert,
			);
			eda.pcb_PrimitiveImage.create(
				Origin[0].X,
				Origin[0].Y,
				edaImage,
				Number(default_set.default_tier),
				textWidth,
				default_set.heightValue,
				default_set.default_direction,
				false,
				false,
			);
		}
		if (skippedCount > 0) {
			eda.sys_Message.showToastMessage(`已跳过 ${skippedCount} 个无网络焊盘`, 'warn', 3);
		}
		if (skippedCount === bonding.length) {
			eda.sys_Message.showToastMessage('所有选中的焊盘均无网络，无法生成丝印', 'error', 3);
		}
	},
	false,
);
