# 1.1.6

### 新增

- 新增文字丝印生成模式，使用 `pcb_PrimitiveString.create()` API 直接创建文本图元
- 提升EDA兼容版本 ^3.0.0

### 优化

- 丝印偏移量改为动态计算，通过 `getState_Pad()` 获取焊盘实际宽高，移除固定 78.7mil
- 文字居中对齐模式（alignMode=5 CENTER），生成位置更准确

# 1.1.5

### 修复

- 修复焊盘丝印生成功能失效的问题
- 选中焊盘无网络时添加提示
- 改用 `pcb_PrimitiveComponent.getAllPinsByPrimitiveId()` 建立焊盘到器件的映射

# 1.1.4

更换logo

# 1.1.0

首个版本
