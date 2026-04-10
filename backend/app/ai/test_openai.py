import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def test_basic_inference():
    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": "Réponds juste 'Groq Vision opérationnel ✅' pour confirmer."
            }
        ],
        max_tokens=50
    )
    print(response.choices[0].message.content)

if __name__ == "__main__":
    test_basic_inference()