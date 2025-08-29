/* eslint-disable tsdoc/syntax */
import * as eda from '@jlceda/pro-api-types';

interface silkscreen_object {
	'default_direction': number;
	'default_tier': 3 | 4;
	'default_typeface': string;
	'default_invert': boolean;
	'heightValue': number;
	'default_unit': 'mil' | 'mm';
	'default_Distance_X'?: number;
	'default_Distance_Y'?: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Window {
	queryLocalFonts?: () => Promise<FontData[]>;
}

interface FontData {
	postscriptName: string;
	fullName: string;
	family: string;
	style: string;
}
interface Font {
	postscriptName: string;
	fullName: string;
	family: string;
	style: string;
}
interface coord {
	x: number;
	y: number;
}
// 获取开关元素
const oneClickSwitch = document.querySelector('.switch-input') as HTMLInputElement; // 一键生成开关
const generateBtn = document.querySelector('.generate-btn') as HTMLElement; // 生成按钮

// 开关状态变化事件
oneClickSwitch.addEventListener('change', () => {
	console.log('一键生成功能已' + (oneClickSwitch.checked ? '开启' : '关闭'));
});

let default_Object: silkscreen_object;
// 初始化默认参数
if (JSON.parse(localStorage.getItem('default_Object') as string) as silkscreen_object) {
	// 判断本地是否存储过default_Object
	default_Object = JSON.parse(localStorage.getItem('default_Object') as string);
} else {
	default_Object = {
		'default_direction': 0, // 默认丝印方向为0°
		'default_tier': 3, // 默认顶层丝印层
		'default_typeface': '黑体', // 默认字体为Arial
		'default_invert': false, // 默认反向功能
		'heightValue': 40, // 默认高度
		'default_unit': 'mil',
		'default_Distance_X': 0, // 默认丝印X距离为（x+placeDistance,Y）
		'default_Distance_Y': 0, // 默认丝印Y距离
	};
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
}

// 获取表单元素
const height = document.querySelector('.number-input') as HTMLInputElement;
const unit = document.querySelector('.unit-select') as HTMLInputElement;
const angle = document.querySelector('.select-input') as HTMLInputElement;
const font = document.querySelectorAll('.select-input')[1] as HTMLInputElement;
const targetLayer = document.querySelectorAll('.select-input')[2] as HTMLInputElement;
const invert = document.querySelectorAll('.select-input')[3] as HTMLInputElement;
const fontSelect = document.getElementById('fontSelect') as HTMLElement;
const hint = document.querySelector('.hint') as HTMLElement;
let fontHeight;
window.onload = function () {
	if (default_Object.default_unit === 'mil') {
		fontHeight = default_Object.heightValue;
		height.value = fontHeight;
	} else if (default_Object.default_unit === 'mm') {
		fontHeight = default_Object.heightValue * 0.0254;
		height.value = fontHeight;
	}
	// 字高
	unit.value = default_Object.default_unit; // 单位
	targetLayer.value = String(default_Object.default_tier); // 生成层
	angle.value = `${default_Object.default_direction}°`; // 角度
	font.value = default_Object.default_typeface; // 字体
	if (default_Object.default_invert) {
		invert.value = 'true';
	} else {
		invert.value = 'false';
	} // 反相
};

height.addEventListener('input', () => {
	fontHeight = parseInt(height.value, 10);
	if (default_Object.default_unit === 'mil') {
		default_Object.heightValue = fontHeight;
	}
	if (default_Object.default_unit === 'mm') {
		default_Object.heightValue = fontHeight * 39.3700787;
	}
	console.log('丝印高度:', default_Object.heightValue);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});

unit.addEventListener('change', () => {
	console.log('单位为', default_Object.default_unit, 'unit', unit.value);

	if (unit.value === 'mm') {
		console.log('由mil转为mm');
		default_Object.default_unit = unit.value;
		fontHeight = default_Object.heightValue * 0.0254;
		height.value = fontHeight;
	}
	if (unit.value === 'mil') {
		console.log('由mm转为mil');
		default_Object.default_unit = unit.value;
		fontHeight = default_Object.heightValue;
		height.value = fontHeight;
	}
	console.log('单位:', default_Object.default_unit);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});

angle.addEventListener('change', () => {
	default_Object.default_direction = parseFloat(angle.value.replace('°', ''));
	console.log('角度:', default_Object.default_direction);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});

font.addEventListener('change', () => {
	default_Object.default_typeface = font.value;
	console.log('字体:', default_Object.default_typeface);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});

targetLayer.addEventListener('change', () => {
	default_Object.default_tier = Number(targetLayer.value) as 3 | 4;
	console.log('目标层:', default_Object.default_tier);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
});

invert.addEventListener('change', () => {
	if (invert.value === 'true') default_Object.default_invert = true;
	if (invert.value === 'false') default_Object.default_invert = false;
	console.log('是否反向:', default_Object.default_invert);
	localStorage.setItem('default_Object', JSON.stringify(default_Object));
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

let sys_availableFonts: Font[];
(async function logFontData() {
	if (!window.queryLocalFonts) {
		console.error('queryLocalFonts API 不可用');
		sys_availableFonts = [];
	} else {
		// 获取系统字体
		try {
			sys_availableFonts = await window.queryLocalFonts();
		} catch (err) {
			console.error(err.name, err.message);
			sys_availableFonts = [];
		}
		if (sys_availableFonts.length) {
			for (let i = 0; i <= sys_availableFonts.length; i++) {
				const option = document.createElement('option');
				option.value = sys_availableFonts[i].fullName;
				option.textContent = sys_availableFonts[i].fullName;
				fontSelect.appendChild(option);
			}
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
 * @returns origin-图形生成起始点坐标-#(x,y)
 * @returns offset-图形生成起始点与原图形的偏移量-#(x,y)
 */
function CalcOrigin(
	midX: number,
	midY: number,
	getClickX: number,
	getClickY: number,
	Width: number,
	Height: number,
	direction: number,
): [coord, { offsetX: number; offsetY: number }] {
	// 坐标计算
	let angleCalibration: number[];
	switch (direction) {
		case 0: {
			angleCalibration = [-Width / 2, Height / 2];
			break;
		}
		case 90: {
			angleCalibration = [-Height / 2, -Width / 2];
			break;
		}
		case 180: {
			angleCalibration = [Width / 2, -Height / 2];
			break;
		}
		case 270: {
			angleCalibration = [Height / 2, Width / 2];
			break;
		}
		default: {
			angleCalibration = [];
		}
	}
	let origin = { x: midX + angleCalibration[0], y: midY + angleCalibration[1] }; // 计算起始点
	let offset = { offsetX: origin.x - getClickX, offsetY: origin.x - getClickY }; // 计算出的偏移量
	return [origin, offset];
}

/**
 * 取得全部焊盘数量对应的坐标中心点
 * @param  mouse-框选时第一次鼠标点击的坐标
 * @param  mouse1-框选时第一次鼠标松开的坐标
 * @param  length-获取的焊盘数列长度
 * @return num-包含全部焊盘对应的中心点坐标
 */

function getMid(mouse: coord | undefined, mouse1: coord | undefined, length: number): coord[] {
	let num: { x: number; y: number }[] = [];
	if (mouse === undefined || mouse1 === undefined) {
		console.error('mouse 或 mouse1 未定义');
		return num; // 返回空数组或其他适当的默认值
	}
	let X_differenceAbsolute = mouse.x - mouse1.x > 0 ? mouse.x - mouse1.x : -(mouse.x - mouse1.x);
	let Y_differenceAbsolute = mouse.y - mouse1.y > 0 ? mouse.y - mouse1.y : -(mouse.y - mouse1.y);
	if (X_differenceAbsolute >= Y_differenceAbsolute) {
		// 横向放置
		console.log('检测到横向方向放置', 'x轴差距绝对值：', X_differenceAbsolute, 'y轴差距绝对值：', Y_differenceAbsolute);
		let difference = (mouse.x - mouse1.x) / length;
		for (let i = 0; i < length; i++) {
			num[i].x = (mouse.x - difference * i + (mouse.x - difference * (i + 1))) / 2;
			num[i].y = (mouse.y + mouse1.y) / 2;
		}
	} else if (X_differenceAbsolute < Y_differenceAbsolute) {
		console.log('检测到纵向放置');
		let difference = (mouse.y - mouse1.y) / length;
		for (let j = 0; j < length; j++) {
			num[j].x = (mouse.x + mouse1.x) / 2;
			num[j].y = (mouse.y - difference * j + (mouse.y - difference * (j + 1))) / 2;
		}
	}
	return num;
}

/**
 * 筛除非焊盘元素
 * @param A-被选择的元素ID
 * @param B-所有焊盘的ID
 * @returns 被选择的焊盘ID
 */
function data_filtering(A: string[], B: string[]) {
	let getClickPrimitiveId: string[] = [];
	for (const primitive of B) {
		if (A.includes(primitive)) {
			getClickPrimitiveId.push(primitive);
		}
	}
	return getClickPrimitiveId;
}

/**
 * 获取字体宽度
 * @param  str-要测宽度的字符串
 * @param  TextHeight-字体高低
 * @returns
 */
function getTextWidth(str: string, TextHeight: number): number | false {
	// 创建一个canvas元素
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width = 500;
	canvas.height = 100;
	if (!ctx) {
		console.error('2D绘图上下文无法创建');
		return false;
	}
	ctx.font = `${TextHeight}px ${default_Object.default_typeface}`;
	textWidth = ctx.measureText(str).width;
	return textWidth;
}

/**
 * 生成base64格式图形文件
 * @param str -要转换的字符
 * @param textHeight -字高 #单位mil
 * @returns img-图形变量base64格式
 */
function stringToImage(str: string, TextHeight: number): HTMLImageElement | false {
	// 创建一个canvas元素
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	// 设置canvas的宽度和高度
	canvas.width = textWidth;
	canvas.height = TextHeight * 0.85;
	if (!ctx) {
		console.error('2D绘图上下文无法创建');
		return false;
	}
	// 设置字体样式
	ctx.font = `${TextHeight}px ${default_Object.default_typeface}`;
	console.log('textWidth=' + TextHeight);
	// 绘制文本
	ctx.fillText(str, 0, TextHeight * 0.79);
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
type image = 'image/png' | 'image/jpeg' | 'image/svg' | 'image/apng' | 'image/avif' | 'image/svg+xml' | 'image/webp';
function base64ToBlob(base64: string, contentType: image): Blob {
	const base64Message = base64.split(',')[1]; // 去除
	const byteCharacters = atob(base64Message); // 解码
	let byteArrays: number[] = [];
	for (let i = 0; i < byteCharacters.length; i++) {
		byteArrays.push(byteCharacters.charCodeAt(i));
	}
	const blob = new Blob([new Uint8Array(byteArrays)], { type: contentType });
	console.log(blob);
	return blob;
}

// 一键生成开关的逻辑判断
let intervalId;
oneClickSwitch.addEventListener('click', () => {
	console.log('一键生成开关:', oneClickSwitch.checked);
	oneClickSwitch.checked ? (generateBtn.classList = 'state') : (generateBtn.classList = 'generate-btn');
	if (oneClickSwitch.checked) {
		console.log('offset', offset);
		intervalId = setInterval(data_acquisition, 100);
	} else {
		clearInterval(intervalId);
	}
});

let img;
let textWidth: number;

// 获取全部焊盘的ID
let AllPrimitive: Array<string> = [];
(async function get() {
	AllPrimitive = (await eda.pcb_PrimitivePad.getAllPrimitiveId()) as Array<string>;
})();

let getAll_primitives: Array<IPCB_PrimitivePad> = []; // 通过焊盘id获取的焊盘参数
let getAll_PrimitivesId: Array<string>; // 被选择的图元ID
let offset: { offsetX: number; offsetY: number };
/**
 * 获取框选中焊盘图元的参数
 */
async function getSilkscreen(): Promise<void> {
	getAll_PrimitivesId = await eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId(); // 获取受选图元ID
	const getClickPrimitiveId = data_filtering(getAll_PrimitivesId, AllPrimitive); // 将过滤后的焊盘id暂存于此
	getAll_primitives = await eda.pcb_PrimitivePad.get(getClickPrimitiveId);
}
setInterval(getSilkscreen, 10); // 循环获取图元参数

generateBtn.addEventListener('click', async () => {
	// 点击生成按钮后的动作，获取的图元必须处于高亮选择状态
	const bonding = getAll_primitives;
	console.log('生成事件被触发', bonding);
	if (!oneClickSwitch.checked && bonding.length > 0) {
		// 一键生成功能未开启
		let MouseNum: 0 | 1 | 2 = 0; // 点击次数
		let Mouse: Array<coord | undefined> = []; // 点击时的坐标
		// 获取图片
		eda.sys_Message.showToastMessage('请框选生成范围', ESYS_ToastMessageType.INFO, 3);
		hint.style.display = 'flex';
		eda.pcb_Event.addMouseEventListener(
			'getClickData1',
			'selected',
			async () => {
				Mouse[MouseNum] = await eda.pcb_SelectControl.getCurrentMousePosition();
				if (Mouse.length === 1) MouseNum++;
				if (Mouse.length === 2) {
					console.log(Mouse);
					const centralPoint = getMid(Mouse[0], Mouse[1], bonding.length);
					console.log(centralPoint);
					for (let i = 0; i < bonding.length; i++) {
						getTextWidth(`${bonding[i].getState_Net()}`, 50);
						img = stringToImage(`${bonding[i].getState_Net()}`, 50);
						console.log(
							'Mouse[0]:',
							Mouse[0],
							'Mouse[1]:',
							Mouse[1],
							'bonding:',
							bonding[i].getState_X(),
							bonding[i].getState_Y(),
							'宽：',
							textWidth * default_Object.heightValue * 0.0225,
							'高:',
							default_Object.heightValue,
							'角度:',
							default_Object.default_direction,
						);
						let Origin = CalcOrigin(
							// 坐标计算
							centralPoint[i].x,
							centralPoint[i].y,
							bonding[i].getState_X(),
							bonding[i].getState_Y(),
							textWidth * default_Object.heightValue * 0.0225,
							default_Object.heightValue,
							default_Object.default_direction,
						);
						offset = Origin[1];
						console.log('起始点Origin[0]:', Origin[0]);
						console.log('偏移量Origin[1]:', Origin[1]);
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
						if (edaImage === undefined) {
							console.error('无法获取edaImage参数'); // 假设 default_Object.defaultPolygon 是一个有效的默认值
						} else {
							eda.pcb_PrimitiveImage.create(
								// 生成
								Origin[0].x, // X坐标
								Origin[0].y, // Y坐标
								edaImage,
								Number(default_Object.default_tier), // 目标层
								textWidth * default_Object.heightValue * 0.0225, // 宽度
								default_Object.heightValue, // 高度
								default_Object.default_direction, // 旋转角度
								false, // 是否镜像
								false, // 是否锁定
							);
						}

						hint.style.display = 'none';
					}
					eda.pcb_Event.removeEventListener(`getClickData1`); // 完成后移除事件
				}
			},
			false, // 不只执行一次
		);
	}
});

let runNum = 0;
/**
 * 利用上次手动生成的相对位置快速生成丝印
 */
function data_acquisition(): void {
	eda.pcb_Event.addMouseEventListener(
		'getClickData1',
		'selected',
		async () => {
			let ID = await eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId(); // 获取受选图元ID
			let bonding = await eda.pcb_PrimitivePad.get(ID);
			if (Object.keys(offset).length > 0 && bonding.length > 0) {
				img = stringToImage(`${bonding[0].getState_Net()}`, 50);
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
				if (runNum === 0) {
					if (edaImage === undefined) {
						console.error('无法获取edaImage参数'); // 假设 default_Object.defaultPolygon 是一个有效的默认值
					} else {
						eda.pcb_PrimitiveImage.create(
							// 生成
							bonding[0].getState_X() + offset.offsetX, // X坐标
							bonding[0].getState_Y() + offset.offsetY, // Y坐标
							edaImage,
							Number(default_Object.default_tier), // 目标层
							textWidth * default_Object.heightValue * 0.0225, // 宽度
							default_Object.heightValue, // 高度
							default_Object.default_direction, // 旋转角度
							false, // 是否镜像
							false, // 是否锁定
						);
					}
					runNum++;
				} else {
					runNum = 0;
				}
			} else {
				console.error('offset未获取到数据，请至少执行一次', offset);
			}
		},
		true,
	);
}
