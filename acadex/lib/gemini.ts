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

  // the generative language endpoint from Google AI Studio
  // Try to use a very standard URL structure
  const apiKey = process.env.GEMINI_API_KEY;
  let url = "";

  if (process.env.GEMINI_API_ENDPOINT) {
    url = process.env.GEMINI_API_ENDPOINT;
  } else {
    // try gemini-2.5-flash since 1.5 isn't available for this API key
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  }

  // Ensure the URL has the API key attached at the end
  if (!url.includes("key=")) {
    url = url.includes("?") ? `${url}&key=${apiKey}` : `${url}?key=${apiKey}`;
  }

  const prompt = `Generate a highly-polished, professional, and clean JSON array of flashcard question/answer pairs from the following note text.
The output MUST be a JSON array where each object has "q" (the question) and "a" (the answer) keys.

STRICT Formatting Requirements:
1. Questions MUST be written clearly as independent, standalone sentences. They must begin with a capital letter and end with a question mark (?).
2. Answers MUST be clear, concise (max 2 sentences), and start with a capital letter.
3. Remove ALL markdown formatting (like **bolding**, *italics*, # headers), bullet points, and emojis from both 'q' and 'a'. Use plain text only.
4. Do NOT include prefixes like "Q:", "Question:", "A:", or "Answer:" inside the string values.
5. Focus on overarching concepts and important details. The content must be extremely polished and professional.

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
      // Defensive parsing: LLMs sometimes wrap JSON in markdown code blocks
      let cleanOutput = textOutput.trim();

      // Normalize smart quotes
      cleanOutput = cleanOutput.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

      // If there's a fenced code block, try to extract the JSON portion
      if (cleanOutput.startsWith("```")) {
        const firstBracket = cleanOutput.indexOf("[");
        const lastBracket = cleanOutput.lastIndexOf("]");
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          cleanOutput = cleanOutput.substring(firstBracket, lastBracket + 1);
        } else {
          cleanOutput = cleanOutput.replace(/```(json)?/g, "").trim();
        }
      }

      // Attempt to robustly extract the first top-level JSON array while
      // respecting quoted strings (so we don't mistake brackets inside strings).
      function extractTopLevelArray(s: string) {
        const start = s.indexOf('[');
        if (start === -1) return s;
        let inString = false;
        let escape = false;
        let depth = 0;
        for (let i = start; i < s.length; i++) {
          const ch = s[i];
          if (inString) {
            if (escape) {
              escape = false;
            } else if (ch === '\\') {
              escape = true;
            } else if (ch === '"') {
              inString = false;
            }
          } else {
            if (ch === '"') {
              inString = true;
            } else if (ch === '[') {
              depth++;
            } else if (ch === ']') {
              depth--;
              if (depth === 0) {
                return s.substring(start, i + 1);
              }
            }
          }
        }
        // fallback to original string if we couldn't find a balanced array
        return s;
      }

      let candidate = extractTopLevelArray(cleanOutput);

      // Sanitize candidate by escaping literal unescaped newlines inside JSON strings
      function sanitizeJSONString(s: string) {
        let out = '';
        let inString = false;
        let escape = false;
        for (let i = 0; i < s.length; i++) {
          const ch = s[i];
          if (inString) {
            if (escape) {
              out += ch;
              escape = false;
            } else if (ch === '\\') {
              out += ch;
              escape = true;
            } else if (ch === '"') {
              out += ch;
              inString = false;
            } else if (ch === '\n') {
              out += '\\n';
            } else if (ch === '\r') {
              out += '\\r';
            } else if (ch === '\t') {
              out += '\\t';
            } else {
              out += ch;
            }
          } else {
            out += ch;
            if (ch === '"') {
              inString = true;
            }
          }
        }
        return out;
      }

      candidate = sanitizeJSONString(candidate);

      // Remove trailing commas before closing objects/arrays which LLMs sometimes insert
      candidate = candidate.replace(/,\s*(\]|\})/g, '$1');

      const parsed = JSON.parse(candidate);
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
