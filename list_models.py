import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Listing ALL available models:")
print("=" * 80)

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"\nModel Name: {m.name}")
        print(f"Display Name: {m.display_name}")
