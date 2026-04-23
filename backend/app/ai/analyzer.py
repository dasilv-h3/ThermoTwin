import base64
import json
import os

from dotenv import load_dotenv
from groq import Groq

from app.ai.prompts import THERMAL_ANALYSIS_PROMPT

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def analyze_thermal_image(image_path: str) -> dict:
    image_base64 = encode_image(image_path)
    
    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": THERMAL_ANALYSIS_PROMPT
                    }
                ]
            }
        ],
        max_tokens=1000,
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content
    print("RAW RESPONSE:", raw)  # debug
    return json.loads(raw)