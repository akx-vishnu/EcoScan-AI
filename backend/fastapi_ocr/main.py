from fastapi import FastAPI, File, UploadFile
from PIL import Image
import pytesseract
import io

app = FastAPI()

@app.post("/ocr")
async def extract_text(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))

    text = pytesseract.image_to_string(image)

    return {
        "raw_text": text
    }
import os
from dotenv import load_dotenv

load_dotenv()

# Set Tesseract path from environment variable, falling back gracefully or needing check if distinct per OS
tesseract_path = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
