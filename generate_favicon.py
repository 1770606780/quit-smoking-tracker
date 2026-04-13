from PIL import Image, ImageDraw, ImageFont

# 创建一个 32x32 的白色背景图像
img = Image.new('RGBA', (32, 32), (255, 255, 255, 255))
draw = ImageDraw.Draw(img)

# 绘制一个绿色的圆形作为背景
draw.ellipse([(4, 4), (28, 28)], fill=(0, 150, 100, 255))

# 尝试添加文字，使用默认字体
try:
    font = ImageFont.load_default()
    # 绘制一个禁止符号（X）
    draw.line([(8, 8), (24, 24)], fill=(255, 255, 255, 255), width=3)
    draw.line([(24, 8), (8, 24)], fill=(255, 255, 255, 255), width=3)
except Exception as e:
    print(f"Font error: {e}")
    # 如果字体加载失败，只绘制圆形

# 保存为 favicon.png
img.save('favicon.png')
print("Favicon generated successfully!")