let heightValue = 40; // 默认丝印高度为35mil
const stencilSizeSlider = document.getElementById('stencil-size-slider');
const stencilSizeDisplay = document.getElementById('stencil-size');
stencilSizeDisplay.innerHTML = heightValue + 'mil';
stencilSizeSlider.addEventListener('input', () => {
	heightValue = stencilSizeSlider.value;
	stencilSizeDisplay.textContent = stencilSizeSlider.value + 'mil';
});
let default_Distance_X = 30; // 默认丝印X距离为（x+placeDistance,Y）
let default_Distance_Y = 80; // 默认丝印Y距离
let x_placeDistance = default_Distance_X; // 生成位置X轴偏移量
let y_placeDistance = default_Distance_Y; // 生成位置y轴偏移量
let Overall_direction = '右';
let default_direction = 0; // 默认丝印方向为0°
let default_tier = '顶层丝印层'; // 默认顶层丝印层
let default_oneGeneration = false; // 一键生成开关默认关闭
// 添加新的输入框和开关的事件监听器
const oneClickSwitch = document.getElementById('one-click-switch');
const xOffsetInput = document.getElementById('x-offset');
const yOffsetInput = document.getElementById('y-offset');
const stencilHeightInput = document.getElementById('stencil-height');
const stencilLayerSelect = document.getElementById('stencil-layer');
const batchSwitch = document.getElementById('batch-switch');
oneClickSwitch.addEventListener('click', () => {
	console.log('一键生成开关:', oneClickSwitch.checked);
	default_oneGeneration = oneClickSwitch.checked;
	const generateButton = document.querySelector('.generate-button');
	if (oneClickSwitch.checked) {
		generateButton.style.backgroundColor = 'gray';
		generateButton.classList.add('shake');
	} else {
		generateButton.style.backgroundColor = '#0b7dda';
		generateButton.classList.remove('shake');
	}
});
xOffsetInput.addEventListener('input', () => {
	default_Distance_X = parseInt(xOffsetInput.value, 10);
	console.log('X轴默认偏移量:', default_Distance_X);
});
yOffsetInput.addEventListener('input', () => {
	default_Distance_Y = parseInt(yOffsetInput.value, 10);
	console.log('Y轴默认偏移量:', default_Distance_Y);
});
stencilHeightInput.addEventListener('input', () => {
	heightValue = parseInt(stencilHeightInput.value, 10);
	stencilSizeDisplay.textContent = stencilHeightInput.value + 'mil';
	console.log('默认丝印高度:', heightValue);
});
stencilLayerSelect.addEventListener('change', () => {
	default_tier = stencilLayerSelect.value;
	console.log('丝印生成层:', default_tier);
});

batchSwitch.addEventListener('click', () => {
	console.log('器件批量生成功能:', batchSwitch.checked);
});

const direction = document.querySelector('.direction');
const direction_btn = document.querySelector('.direction-btn');
const direction_item = document.querySelectorAll('.direction-item');
const place = document.querySelector('.place');
const place_btn = document.querySelector('.place-btn');
const place_item = document.querySelectorAll('.place-item');
direction_btn.innerHTML = default_direction + '°';
place_btn.innerHTML = Overall_direction; // 初始化显示内容
direction_btn.addEventListener('click', (e) => {
	e.stopPropagation();
	direction.classList.toggle('active');
});
place_btn.addEventListener('click', (e) => {
	e.stopPropagation();
	place.classList.toggle('active');
});
function coordinateCalculation(angle, direction, x, y, Width, height) {
	let angleCalibration = [];
	// 丝印生成坐标函数
	let cCX;
	let cCY;
	if (angle === 0) {
		angleCalibration = [0, -Width, -0.5 * Width, 0.5 * height, height, 0];
	} else if (angle === 90) {
		angleCalibration = [0, -height, -0.5 * height, -0.5 * Width, 0, -Width];
	} else if (angle === 180) {
		angleCalibration = [Width, 0, 0.5 * Width, -0.5 * height, 0, -height];
	} else if (angle === 270) {
		angleCalibration = [height, 0, 0.5 * height, 0.5 * Width, Width, 0];
	}
	switch (direction) {
		case '右': {
			cCX = x + angleCalibration[0];
			cCY = angleCalibration[3];
			break;
		}

		case '左': {
			cCX = -x + angleCalibration[1];
			cCY = angleCalibration[3];
			break;
		}

		case '上': {
			cCX = angleCalibration[2];
			cCY = y + angleCalibration[4];
			break;
		}

		case '下': {
			cCX = angleCalibration[2];
			cCY = -y + angleCalibration[5];
			break;
		}
		default: {
			console.error('值不在正常区间!');
			break;
		}
	}
	console.log(`angle:${angle},Direction: ${direction}, cCX: ${cCX}, cCY: ${cCY}`);
	return [cCX, cCY];
}
// 处理选项点击事件
direction_item.forEach((item) => {
	item.addEventListener('click', (e) => {
		e.preventDefault(); // 阻止默认行为
		e.stopPropagation();
		direction_btn.textContent = item.textContent; // 更新方向按钮文本
		// eslint-disable-next-line radix
		default_direction = parseInt(item.textContent.replace(/[^0-9.-]+/g, '')); // 提取数字量
		direction.classList.remove('active'); // 关闭下拉菜单
		console.log(default_direction);
	});
});
// 选择选项后更新值并关闭下拉框
place_item.forEach((item) => {
	item.addEventListener('click', (e) => {
		e.preventDefault(); // 阻止默认行为
		e.stopPropagation();
		place_btn.textContent = item.textContent; // 更新位置按钮文本
		Overall_direction = item.textContent;
		place.classList.remove('active'); // 关闭下拉菜单
		console.log('放置位置:', place_btn.textContent);

		x_placeDistance = default_Distance_X; // 消除上一次选项的影响
		y_placeDistance = default_Distance_Y;
	});
});
// 点击其他地方关闭下拉菜单
window.addEventListener('click', () => {
	if (direction.classList.contains('active')) {
		direction.classList.remove('active');
	}
	if (place.classList.contains('active')) {
		place.classList.remove('active');
	}
});
let partNumber = '';
let uniqueID = '';
let X_coordinate = '';
let Y_coordinate = '';
let img;
let textWidth = 0;

const switchCheckbox = document.querySelector('input[type="checkbox"]');
let isSwitchOn = switchCheckbox.checked;
switchCheckbox.addEventListener('click', () => {
	// 获取最新开关状态
	isSwitchOn = switchCheckbox.checked;
	console.log(isSwitchOn);
});
window.onload = function () {
	// 获取页面元素
	partNumber = document.getElementById('part-number');
	uniqueID = document.getElementById('unique-id');
	X_coordinate = document.getElementById('x-coordinate');
	Y_coordinate = document.getElementById('y-coordinate');
};

function stringToImage(str, textHeight) {
	// 删除此前页面上有的img元素
	/* 	document.querySelector('.image_show').innerHTML = ''; */
	// 创建一个canvas元素
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	// 设置canvas的宽度和高度
	canvas.width = 600;
	canvas.height = 100;
	// 设置字体样式
	ctx.font = `${textHeight}px Arial`;
	textWidth = ctx.measureText(str).width;
	console.log('textWidth=' + textWidth);
	// 绘制文本
	ctx.fillText(str, (canvas.width - textWidth) / 2, textHeight);
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
const menuImg = document.querySelector('.menu-img');
const menuContainer = document.querySelector('.menu-container');

menuImg.addEventListener('click', () => {
	menuContainer.style.display = menuContainer.style.display === 'none' ? 'block' : 'none';
});
let runsNumber = 0;
function data_acquisition() {
	eda.pcb_Event.addMouseEventListener(
		'getClickAllData',
		'selected',
		async () => {
			runsNumber++;
			if (isSwitchOn) {
				// 功能开关判断
				const getAll_PrimitivesId = await eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId(); // 获取图元ID
				const getAll_primitives = await eda.pcb_PrimitivePad.get(getAll_PrimitivesId); // 通过ID获取图元参数
				if (getAll_primitives) {
					// 判断是否获取到图元参数
					/*  console.log(i.net);
						console.log(i.primitiveId);
						console.log(i.x);87498
						console.log(i.y); */
					partNumber.innerHTML = getAll_primitives[0].net;
					uniqueID.innerHTML = getAll_primitives[0].primitiveId;
					X_coordinate.innerHTML = getAll_primitives[0].x;
					Y_coordinate.innerHTML = getAll_primitives[0].y;
					img = stringToImage(`${partNumber.innerHTML}`, 50);
					console.log('runsNumber' + runsNumber);
					if (default_oneGeneration && runsNumber % 2 === 0) {
						console.log(heightValue);
						// 获取图片
						const imageBlob = base64ToBlob(img.src, 'image/png'); // 将图片格式从base64转换为blob
						const edaImage = await eda.pcb_MathPolygon.convertImageToComplexPolygon(
							imageBlob,
							textWidth * heightValue * 0.0215,
							heightValue,
							0.5,
							0.9,
							1,
							2,
							false,
							false,
						); // 将blob转为复杂多边形对象
						console.log('textWidth:' + textWidth, 'heightValue:' + heightValue);
						const cC = coordinateCalculation(
							default_direction,
							Overall_direction,
							x_placeDistance,
							y_placeDistance,
							textWidth * heightValue * 0.022,
							heightValue,
						);
						/* 	console.log('位置：' + Overall_direction);
								console.log('x:' + x_placeDistance);
								console.log('y:' + y_placeDistance); */
						if (default_tier === '顶层丝印层') {
							eda.pcb_PrimitiveImage.create(
								Number(X_coordinate.innerHTML) + cC[0], // X坐标
								Number(Y_coordinate.innerHTML) + cC[1], // Y坐标
								edaImage,
								EPCB_LayerId.TOP_SILKSCREEN, // 目标层
								textWidth * heightValue * 0.022, // 宽度
								heightValue, // 高度
								default_direction, // 旋转角度
								false, // 是否镜像
								false, // 是否锁定
							);
						} else if (default_tier === '底层丝印层') {
							eda.pcb_PrimitiveImage.create(
								Number(X_coordinate.innerHTML) + cC[0], // X坐标
								Number(Y_coordinate.innerHTML) + cC[1], // Y坐标
								edaImage,
								EPCB_LayerId.BOTTOM_SILKSCREEN, // 目标层
								textWidth * heightValue * 0.022, // 宽度
								heightValue, // 高度
								default_direction, // 旋转角度
								false, // 是否镜像
								false, // 是否锁定
							);
						} else {
							eda.sys_Message.showToastMessage(`层级数据异常，请联系插件管理员确认原因`, 'warn', 3);
							console.error('层级数据异常，请确认数据正确性');
						}
						console.log('生成功能执行一次');
					}
				} else {
					eda.sys_Message.showToastMessage('本插件只对属性定义为焊盘的单位有效，请选择有效焊盘！', 'warn', 2);
				}
			}
		},
		true, // 是否只执行一次
	);
}

setInterval(data_acquisition, 10);

// 定义图片生成坐标位置算法

const btn = document.querySelector('.generate-button');
btn.addEventListener('click', () => {
	if (compareVersions(version, requiredVersion)) {
		eda.sys_Message.showToastMessage(
			`您的版本为${eda.sys_Environment.getEditorCurrentVersion()}，至少需要${requiredVersion}才能正常运行该脚本，请及时更新EDA版本`,
			'warn',
			3,
		);
	}
});
btn.addEventListener('click', async () => {
	if (default_oneGeneration === false) {
		console.log(heightValue);
		// 获取图片
		const imageBlob = base64ToBlob(img.src, 'image/png'); // 将图片格式从base64转换为blob
		const edaImage = await eda.pcb_MathPolygon.convertImageToComplexPolygon(
			imageBlob, // 图像Blob文件
			100, // 图像宽度
			35, // 图像高度
			0.3, // 容差 0-1
			0.9, // 简化 0-1
			1, // 平滑 0-1.33
			2, // 祛斑 0-5
			false, // 是否白色背景
			false, // 是否反向
		); // 将blob转为复杂多边形对象
		console.log('textWidth:' + textWidth, 'heightValue:' + heightValue);
		const cC = coordinateCalculation(
			default_direction,
			Overall_direction,
			x_placeDistance,
			y_placeDistance,
			textWidth * heightValue * 0.022,
			heightValue,
		);
		/* 	console.log('位置：' + Overall_direction);
	console.log('x:' + x_placeDistance);
	console.log('y:' + y_placeDistance); */
		if (default_tier === '顶层丝印层') {
			eda.pcb_PrimitiveImage.create(
				Number(X_coordinate.innerHTML) + cC[0], // X坐标
				Number(Y_coordinate.innerHTML) + cC[1], // Y坐标
				edaImage,
				EPCB_LayerId.TOP_SILKSCREEN, // 目标层
				textWidth * heightValue * 0.022, // 宽度
				heightValue, // 高度
				default_direction, // 旋转角度
				false, // 是否镜像
				false, // 是否锁定
			);
		} else if (default_tier === '底层丝印层') {
			eda.pcb_PrimitiveImage.create(
				Number(X_coordinate.innerHTML) + cC[0], // X坐标
				Number(Y_coordinate.innerHTML) + cC[1], // Y坐标
				edaImage,
				EPCB_LayerId.BOTTOM_SILKSCREEN, // 目标层
				textWidth * heightValue * 0.022, // 宽度
				heightValue, // 高度
				default_direction, // 旋转角度
				false, // 是否镜像
				false, // 是否锁定
			);
		} else {
			eda.sys_Message.showToastMessage(`层级数据异常，请联系插件管理员确认原因`, 'warn', 3);
			console.error('层级数据异常，请确认数据正确性');
		}
	}
});
