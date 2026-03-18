import { GoogleGenAI } from "@google/genai";

async function generateImages() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const brideResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ text: 'A beautiful Indian bride in a traditional Marathi wedding Nauvari saree, elegant gold jewelry, smiling, professional wedding photography, luxury bokeh background, high resolution.' }],
  });

  const groomResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ text: 'A handsome Indian groom in a traditional Marathi wedding sherwani and pheta (turban), smiling, professional wedding photography, luxury bokeh background, high resolution.' }],
  });

  let brideUrl = '';
  for (const part of brideResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      brideUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  let groomUrl = '';
  for (const part of groomResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      groomUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  console.log('BRIDE_URL:' + brideUrl);
  console.log('GROOM_URL:' + groomUrl);
}

generateImages();
