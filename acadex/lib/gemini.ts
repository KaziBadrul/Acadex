// lib/gemini.ts

// Simple helper that calls the Gemini LLM endpoint.  The implementation below
// uses environment variables for the API key and endpoint.  You'll need to
// replace the placeholders with actual values in your `.env.local` file.

export interface QAPair {
  q: string;
  a: string;
}

export async function generateQAFromText(text: string): Promise<QAPair[]> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("Gemini API key not configured");
    return [];
  }

  // the generative language endpoint from Google AI Studio – you can keep
  // the full URL in GEMINI_API_ENDPOINT or default to a known model
  // Ensure endpoint is clean and append API key
  let baseUrl = process.env.GEMINI_API_ENDPOINT || "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
  // Force v1 instead of v1beta for model support
  baseUrl = baseUrl.replace('/v1beta/', '/v1/');
  // Remove any existing key if present in the endpoint string
  baseUrl = baseUrl.split('?')[0];
  const url = `${baseUrl}?key=${process.env.GEMINI_API_KEY}`;

  const prompt = `Generate a JSON array of question/answer pairs from the following note text.
The output MUST be a JSON array where each object has "q" (the question) and "a" (the answer) keys.
Keep questions concise and answers informative.

Note text:
${text}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Gemini API error (${res.status}):`, errText);
      return [];
    }

    const data = await res.json();

    // Gemini 1.5 format: data.candidates[0].content.parts[0].text
    let textOutput: string = "";
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      textOutput = data.candidates[0].content.parts[0].text;
    } else {
      console.warn("Unexpected Gemini response format:", JSON.stringify(data));
      return [];
    }

    try {
      const parsed = JSON.parse(textOutput);
      if (Array.isArray(parsed)) {
        return parsed as QAPair[];
      }
      // If it's an object with a field that is the array
      if (typeof parsed === 'object' && parsed !== null) {
        const possibleArray = Object.values(parsed).find(v => Array.isArray(v));
        if (possibleArray) return possibleArray as QAPair[];
      }
    } catch (err) {
      console.error("Failed to parse Gemini output as JSON", err, textOutput);
    }
  } catch (err) {
    console.error("Error calling Gemini API", err);
  }

  return [];
}
