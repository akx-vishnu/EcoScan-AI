# EcoScan AI 🍃

EcoScan AI is an intelligent food analysis application designed to help users make healthier and more eco-conscious choices. By scanning product labels, the app analyzes ingredients, nutritional values, and environmental impact to provide personalized insights.

## 🚀 Features

- **📸 AI-Powered Scanning**: Instantly analyze food labels using OCR (Tesseract) and AI (Groq/Llama-3).
- **🥗 Personalized Health Scores**: Scores based on user health conditions, allergies, and diet types (Vegan, Keto, etc.).
- **🌍 Eco Score**: Evaluates the environmental impact of products based on ingredients and packaging.
- **💬 AI Chatbot Assistant**: Ask questions about products, ingredients, or health effects in real-time.
- **📜 Scan History**: Keep track of all your past scans and re-visit analysis details.
- **🔒 Secure Authentication**: User accounts to save preferences and history.

## 🛠 Tech Stack

### Backend
- **Flask**: Main application logic, user authentication, and history management.
- **FastAPI**: Dedicated microservice for high-performance OCR processing.
- **SQLAlchemy**: Database ORM for SQLite.
- **Groq (Llama-3.3-70b)**: Advanced AI model for ingredient analysis, risk assessment, and chat.
- **Tesseract OCR**: Optical Character Recognition engine for reading text from product images.
- **Google Generative AI (Gemini)**: (Optional/Alternative) Integration capability.

### Frontend
- **React**: Modern UI library for building interactive interfaces.
- **Vite**: Fast build tool and development server.
- **Framer Motion**: Smooth animations and fluid transitions.
- **Lucide React**: Clean and consistent icon set.
- **Axios**: HTTP client for API requests.

## ⚙️ Installation & Setup

### Prerequisites
- **Python 3.8+**
- **Node.js & npm**
- **Tesseract OCR**: You MUST have Tesseract OCR installed on your system.
  - [Download for Windows](https://github.com/UB-Mannheim/tesseract/wiki)
  - [Installation Guide](https://tesseract-ocr.github.io/tessdoc/Installation.html)
  - **IMPORTANT**: Note the installation path (e.g., `C:\Program Files\Tesseract-OCR\tesseract.exe`).

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EcoScan-AI
```

### 2. Backend Setup

The backend consists of two services: the main Flask app and the FastAPI OCR service.

#### Main Backend (Flask) & Dependencies

1. Create a virtual environment:
   ```bash
   python -m venv venv
   # Activate it:
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

#### ⚠️ Configuration (Crucial Step)

Because this project uses hardcoded paths and keys, you **MUST** verify/update the following files to match your system:

1. **Tesseract Path**:
    - Open `backend/fastapi_ocr/main.py`.
    - Locate the line setting `pytesseract.pytesseract.tesseract_cmd`.
    - Update it to point to your Tesseract installation:
      ```python
      # Example for Windows
      pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
      ```

2. **Groq API Key**:
    - Open `backend/flask_app/groq_ai.py`.
    - Locate the `api_key` in the `Groq` client initialization.
    - Replace it with your own Groq API key if the existing one is invalid or if you want to use your own quota.

#### Running the Services

You need to run **both** the Flask app and the FastAPI service in separate terminals.

**Terminal 1: Start Flask App**
```bash
# Activate venv if not already active
venv\Scripts\activate
cd backend/flask_app
python app.py
```
*Runs on `http://localhost:5000`*

**Terminal 2: Start OCR Service (FastAPI)**
```bash
# Activate venv if not already active
venv\Scripts\activate
cd backend/fastapi_ocr
uvicorn main:app --reload --port 8000
```
*Runs on `http://localhost:8000`*

### 3. Frontend Setup

**Terminal 3: Start React App**
```bash
cd frontend-react
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

## 📖 Usage

1. **Sign Up/Login**: Create an account to save your preferences.
2. **Set Preferences**: Go to Profile to set allergies, diets, and health conditions.
3. **Scan**: Upload a product image to the "Scan" tab.
4. **Review**: Check the Health & Eco scores, benefits, and warnings.
5. **Chat**: Use the chatbot to ask specifics about the product.

---
*Built for a healthier you and a greener planet.* 🌍
