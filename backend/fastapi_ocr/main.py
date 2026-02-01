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
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
