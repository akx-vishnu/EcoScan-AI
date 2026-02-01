import os
from dotenv import load_dotenv
from groq import Groq
import json
import traceback

# Load environment variables from .env
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set")

groq_client = Groq(
    api_key=GROQ_API_KEY
)

def analyze_product_risk(ocr_text, user_prefs):
    """
    Analyze product risk, extract data, and compute scores using Groq (llama-3.3-70b-versatile).
    Combines structuring, risk analysis, and scoring in one efficient prompt.
    """
    if not ocr_text or ocr_text == "OCR failed: Unable to extract text. Please try again.":
        return {"raw_text": ocr_text.lower(), "error": "OCR failed"}

    # Comprehensive Prompt
    prompt = (
        f"You are an expert AI Food Risk Analyst. "
        f"Analyze the following OCR text from a food product label and the user's health preferences. "
        f"Provide a COMPLETE risk analysis and structured data extraction in valid JSON format. "
        f"Use the model 'llama-3.3-70b-versatile'. "
        f"\n\nUSER PREFERENCES:\n{json.dumps(user_prefs, indent=2)}\n\n"
        f"OCR TEXT:\n{ocr_text}\n\n"
        f"INSTRUCTIONS:\n"
        f"1. Extract Product Details: Name, description, ingredients (with percentage if available), nutritional facts per 100g/serving.\n"
        f"2. Analyze Ingredients: Identify allergens, additives, and compatibility with the user's diet (e.g., Vegan, Keto).\n"
        f"3. Personalize Risk: Compare ingredients against User Preferences (Health Conditions, Allergies, Ingredients to Avoid).\n"
        f"4. Compute Scores (0-100):\n"
        f"   - health_score: STRICTLY based on the personalized risk assessment. If the product contains User's allergens or conflicts with health conditions, the score MUST be low (0-40). If it fits the diet perfectly, it can be high.\n"
        f"   - eco_score: Estimate environmental impact based on ingredients/packaging hints (0-100).\n"
        f"5. Generate Verdicts: 'safe', 'warning', or 'avoid'.\n"
        f"6. Provide 3-4 short, specific 'nutritional_benefits' and 'personalized_notes' (warnings/benefits).\n"
        f"7. Explain the Eco Score: Provide a specific sentence on WHY this eco score was given (e.g., 'High footprint due to palm oil' or 'Sustainable packaging detected').\n"
        f"8. Output strictly valid JSON matching the schema below. No markdown formatting.\n\n"
        f"JSON SCHEMA:\n"
        f"{{\n"
        f"  \"product_name\": \"string\",\n"
        f"  \"product_description\": \"string\",\n"
        f"  \"ingredients\": [{{ \"name\": \"string\", \"percentage\": \"string\", \"allergen\": boolean }}],\n"
        f"  \"nutritional_facts\": {{ \"calories\": \"val\", \"protein\": \"val\", \"carbs\": \"val\", \"sugar\": \"val\", \"fat\": \"val\", \"fiber\": \"val\", \"salt\": \"val\" }},\n"
        f"  \"health_score\": integer,\n"
        f"  \"eco_score\": integer,\n"
        f"  \"eco_score_reasoning\": \"string\",\n"
        f"  \"verdict\": \"safe | warning | avoid\",\n"
        f"  \"nutritional_benefits\": [\"string\"],\n"
        f"  \"personalized_notes\": [\"string\"],\n"
        f"  \"detected_allergens\": [\"string\"],\n"
        f"  \"other_info\": {{ \"brand\": \"string\", \"origin\": \"string\", \"certifications\": [\"string\"] }},\n"
        f"  \"reasoning\": \"string (brief summary of why this score/verdict)\"\n"
        f"}}"
    )

    messages = [
        {"role": "system", "content": "You are a precise and helpful food safety AI assistant. Always return valid JSON."},
        {"role": "user", "content": prompt}
    ]

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.3, # Lower temperature for consistent JSON
            max_completion_tokens=2000,
            top_p=1,
            stream=False
        )
        
        json_str = completion.choices[0].message.content.strip()
        # Clean up if model adds markdown backticks
        if json_str.startswith("```json"):
            json_str = json_str[7:]
        if json_str.endswith("```"):
            json_str = json_str[:-3]
            
        print(f"Raw JSON from Groq: {json_str[:500]}...")
        
        if json_str:
            data = json.loads(json_str)
            data['raw_text'] = ocr_text.lower() # Include raw text for fallback
            return data
        else:
            print("No JSON content received.")
            return {"raw_text": ocr_text.lower(), "error": "Empty response"}
            
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        print(f"Full traceback: {traceback.format_exc()}")
        return {"raw_text": ocr_text.lower(), "error": str(e)}

def chat_with_groq(user_text, context):
    """Handle chatbot interaction using Groq."""
    if not user_text.strip():
        return "Ask me something about the product, eco-score or ingredients!"

    messages = [
        {
            "role": "system",
            "content": (
                f"You are EcoScan Assistant, a helpful food safety expert. "
                f"Context: {context}. "
                f"Instructions: "
                f"1. If the user says 'hi', 'hello', or greets you, reply naturally and briefly offering help (e.g., 'Hi! Ask me about this product.'). "
                f"2. If the user asks about the product, ingredients, or health/eco scores, use the provided context to answer. "
                f"3. Keep responses short (1-2 sentences). No markdown."
            )
        },
        {
            "role": "user",
            "content": user_text
        }
    ]

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_completion_tokens=300,
            top_p=1,
            stream=True
        )

        reply_parts = []
        for chunk in completion:
            delta = chunk.choices[0].delta.content
            if delta:
                reply_parts.append(delta)

        reply = "".join(reply_parts).strip()

        if not reply:
            reply = "I couldn't generate a response. Try rephrasing your question."

    except Exception as e:
        print(f"Groq API Exception: {e}")
        reply = "Something broke, but I'm pretending everything is fine."

    return reply