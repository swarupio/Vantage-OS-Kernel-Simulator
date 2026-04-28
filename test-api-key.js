import { GoogleGenAI } from "@google/genai";

// Test both API keys from .env
const apiKey1 = "AIzaSyChvP_X3c9xT_axNRC89HiMKUhnbEyI2WY";
const apiKey2 = "AIzaSyCHvP_X3c9xT_axNRC89HiMKUhnbEyI2WY";

async function testKey(apiKey, label) {
  try {
    console.log(`Testing ${label}...`);
    const ai = new GoogleGenAI({ apiKey });
    
    // Try a simple generation
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: "Say hello" }] }],
    });
    
    console.log(`${label} SUCCESS:`, response.text);
    return true;
  } catch (error) {
    console.error(`${label} FAILED:`, error.message);
    return false;
  }
}

// Run tests
(async () => {
  const result1 = await testKey(apiKey1, "VITE_GEMINI_API_KEY");
  const result2 = await testKey(apiKey2, "VITE_GEMINIAPIKEY");
  
  console.log("\nResults:");
  console.log(`VITE_GEMINI_API_KEY: ${result1 ? 'WORKING' : 'FAILED'}`);
  console.log(`VITE_GEMINIAPIKEY: ${result2 ? 'WORKING' : 'FAILED'}`);
})();