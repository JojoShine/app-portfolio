#!/usr/bin/env python3
from PIL import Image
import os

# 图片路径
input_path = '/Users/tbtparent/Projects/app-portfolio/frontend/src/modules/haironghuiqi/assets/home/logo.png'
output_path = '/Users/tbtparent/Projects/app-portfolio/frontend/src/modules/haironghuiqi/assets/home/logo_cropped.png'

# 打开图片
img = Image.open(input_path)
width, height = img.size

print(f"原始图片尺寸: {width} x {height}")

# 根据图片内容，左侧logo大约占宽度的20%
# 裁剪左侧logo部分
logo_width = int(width * 0.20)  # 取左侧20%
logo_area = (0, 0, logo_width, height)
logo_img = img.crop(logo_area)

# 保存裁剪后的图片
logo_img.save(output_path, 'PNG')

print(f"裁剪后的logo尺寸: {logo_img.size}")
print(f"已保存至: {output_path}")
