import traceback
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps
import shutil


def add_watermark_image(
    input_image_path: str, output_image_path: str, watermark_text: str, opacity: int
):
    # Open the input image
    image = Image.open(input_image_path)
    image = ImageOps.exif_transpose(image)
    # Crop the image if its height or width exceeds 1500 pixels
    if image.height > 1200 or image.width > 1200:
        image.thumbnail((1200, 1200))

    white_background = Image.new("RGBA", image.size, "WHITE")

    # Create a transparent layer the same size as the image
    watermark = Image.new("RGBA", image.size, (0, 0, 0, 0))

    # Select a font and font size
    font = ImageFont.truetype("Inter-Regular.ttf", (int)(image.height / 26))

    # Create a drawing object
    draw = ImageDraw.Draw(watermark)

    # Calculate the position to place the watermark at the bottom right corner
    text_width, text_height = draw.textsize(watermark_text, font)

    y = text_height * 2
    while y < image.height:
        x = y % (image.width / 3)
        while x < image.width:
            draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, opacity))
            x = (int)(image.width / 2.5) + x
        y += text_height * 3

    # Combine the image with the watermark layer
    watermarkedImage = Image.alpha_composite(white_background, Image.alpha_composite(image.convert("RGBA"), watermark))

    # Save the watermarked image as JPEG
    watermarkedImage.convert("RGB").save(output_image_path)


def unzip_input_files():
    try:
        for root, dirs, files in os.walk("input"):
            for file_name in files:
                # Check if the file has an image extension
                if file_name.lower().endswith(".zip"):
                    # Construct the full path to the zip file
                    zip_file_path = os.path.join(root, file_name)
                    # Calculate the relative path from the input folder
                    relative_path = os.path.relpath(zip_file_path, "input")

                    print("Unzipping file:", relative_path)

                    os.makedirs(
                        os.path.dirname("input/" + os.path.splitext(relative_path)[0]),
                        exist_ok=True,
                    )
                    shutil.unpack_archive(
                        zip_file_path, "input/" + os.path.splitext(relative_path)[0]
                    )
    except Exception as e:
        traceback.print_exc()


def filter_images():
    try:
        for root, dirs, files in os.walk("input"):
            for file_name in files:
                # Check if the file has an image extension
                if file_name.lower().endswith((".jpg", ".jpeg", ".png")):
                    # Construct the full path to the image file
                    image_path = os.path.join(root, file_name)
                    # Calculate the relative path from the input folder
                    relative_path = os.path.relpath(image_path, "input")

                    print("Copy image to filter folder:", relative_path)
                    os.makedirs(
                        os.path.dirname("filter_input/" + relative_path), exist_ok=True
                    )
                    shutil.copy2(image_path, "filter_input/" + relative_path)
    except Exception as e:
        traceback.print_exc()


def add_watermark():
    try:
        for root, dirs, files in os.walk("filter_input"):
            for file_name in files:
                # Check if the file has an image extension
                if file_name.lower().endswith((".jpg", ".jpeg", ".png")):
                    # Construct the full path to the image file
                    image_path = os.path.join(root, file_name)
                    # Calculate the relative path from the input folder
                    relative_path = os.path.relpath(image_path, "filter_input")

                    # Process the image (replace this with your own logic)
                    print("Processing image:", relative_path)
                    os.makedirs(
                        os.path.dirname("output/" + relative_path), exist_ok=True
                    )
                    add_watermark_image(
                        "filter_input/" + relative_path,
                        "output/" + os.path.splitext(relative_path)[0] + ".jpg",
                        "racool.pro",
                        80,
                    )
    except Exception as e:
        traceback.print_exc()


unzip_input_files()
filter_images()
add_watermark()
