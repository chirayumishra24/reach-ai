/**
 * Unified AI Client
 * Central AI wrapper with multi-provider fallback (Gemini -> Groq -> NVIDIA).
 */

import { GoogleGenAI } from "@google/genai";

let _ai = null;

function getAI() {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
}

async function generateGroq(prompt, { model = "llama-3.3-70b-versatile", temperature = 0.7, maxTokens = 4096, jsonMode = false } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are an elite content strategist and AI assistant." },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {})
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateNvidia(prompt, { model = "meta/llama-3.3-70b-instruct", temperature = 0.7, maxTokens = 4096, jsonMode = false, extraBody = {} } = {}) {
  const keys = [
    process.env.NVIDIA_API_KEY,
    process.env.NVIDIA_API_KEY_2,
    process.env.NVIDIA_API_KEY_3,
  ].filter(k => k && !k.startsWith("YOUR_"));

  if (keys.length === 0) throw new Error("No valid NVIDIA_API_KEY found");

  const systemContent = jsonMode
    ? "You are an elite content strategist and AI assistant. Return ONLY valid JSON. Do NOT include markdown code blocks, explanation, or reasoning tags."
    : "You are an elite content strategist and AI assistant.";

  let lastError;

  for (const apiKey of keys) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000);

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "ReachAI/1.0",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemContent },
              { role: "user", content: prompt }
            ],
            temperature,
            max_tokens: maxTokens,
            ...extraBody,
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        if (content) return content;
      } catch (err) {
        lastError = err;
        console.warn(`NVIDIA key attempt ${attempt + 1} failed:`, err.message);
        if (attempt < 1) await sleep(1500);
      }
    }
  }

  throw lastError || new Error("All NVIDIA API keys failed");
}

/**
 * Generate content with multi-provider fallback (NVIDIA -> Groq -> Gemini).
 */
export async function generate(prompt, { tier = "pro", jsonMode = false, nvidiaModel = "meta/llama-3.3-70b-instruct", maxRetries = 1 } = {}) {
  const errors = [];

  // Provider 1: NVIDIA (Primary - Llama 3.3 for SEO/Content & DeepSeek for Research)
  const nvidiaKeys = [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2, process.env.NVIDIA_API_KEY_3].filter(k => k && !k.startsWith("YOUR_"));
  if (nvidiaKeys.length > 0) {
    try {
      const text = await generateNvidia(prompt, { model: nvidiaModel, jsonMode });
      return jsonMode ? parseJSON(text) : text;
    } catch (err) {
      console.warn("NVIDIA provider failed, falling back:", err.message);
      errors.push(`NVIDIA: ${err.message}`);
    }
  }

  // Provider 2: Groq
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("YOUR_")) {
    try {
      const groqModel = nvidiaModel.includes("deepseek") ? "deepseek-r1-distill-llama-70b" : "llama-3.3-70b-versatile";
      const text = await generateGroq(prompt, { model: groqModel, jsonMode });
      return jsonMode ? parseJSON(text) : text;
    } catch (err) {
      console.warn("Groq provider failed, falling back:", err.message);
      errors.push(`Groq: ${err.message}`);
    }
  }

  // Provider 3: Gemini
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("YOUR_")) {
    try {
      const ai = getAI();
      const model = tier === "pro" ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
      const config = { model, contents: prompt };
      if (jsonMode) {
        config.config = { responseMimeType: "application/json" };
      }
      const response = await ai.models.generateContent(config);
      const text = response.text || "";
      return jsonMode ? parseJSON(text) : text;
    } catch (err) {
      console.warn("Gemini provider failed:", err.message);
      errors.push(`Gemini: ${err.message}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}

/**
 * Generate content with multi-provider fallback (used for script generation).
 */
export async function generateGPT(prompt, { temperature = 0.7, maxTokens = 8192, nvidiaModel = "meta/llama-3.3-70b-instruct" } = {}) {
  const errors = [];

  // Provider 1: NVIDIA (Primary - Llama 3.3 70B)
  const nvidiaKeys = [process.env.NVIDIA_API_KEY, process.env.NVIDIA_API_KEY_2, process.env.NVIDIA_API_KEY_3].filter(k => k && !k.startsWith("YOUR_"));
  if (nvidiaKeys.length > 0) {
    try {
      return await generateNvidia(prompt, { model: nvidiaModel, temperature, maxTokens: Math.min(maxTokens, 4096) });
    } catch (err) {
      console.warn("NVIDIA generateGPT failed, falling back:", err.message);
      errors.push(`NVIDIA: ${err.message}`);
    }
  }

  // Provider 2: Groq (Llama 3.3 70B)
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("YOUR_")) {
    try {
      return await generateGroq(prompt, { model: "llama-3.3-70b-versatile", temperature, maxTokens: Math.min(maxTokens, 4096) });
    } catch (err) {
      console.warn("Groq generateGPT failed, falling back:", err.message);
      errors.push(`Groq: ${err.message}`);
    }
  }

  // Provider 3: Gemini
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("YOUR_")) {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite content strategist and script writer. Write production-ready scripts that are specific, human, and platform-optimized.",
          temperature,
          maxOutputTokens: maxTokens,
        }
      });
      return response.text || "";
    } catch (err) {
      console.warn("Gemini generateGPT failed:", err.message);
      errors.push(`Gemini: ${err.message}`);
    }
  }

  throw new Error(`All AI providers failed for generateGPT: ${errors.join("; ")}`);
}

/**
 * Generate for Research tasks using DeepSeek model
 */
export async function generateResearch(prompt, { tier = "pro", jsonMode = true } = {}) {
  return generate(prompt, { tier, jsonMode, nvidiaModel: "deepseek-ai/deepseek-r1" });
}

/**
 * Generate for SEO & Content generation using Llama 3.3 model
 */
export async function generateSEOContent(prompt, { tier = "pro", jsonMode = true } = {}) {
  return generate(prompt, { tier, jsonMode, nvidiaModel: "meta/llama-3.3-70b-instruct" });
}

/**
 * Generate with structured JSON output
 */
export async function generateJSON(prompt, tier = "pro", nvidiaModel = "meta/llama-3.3-70b-instruct") {
  return generate(prompt, { tier, jsonMode: true, nvidiaModel });
}

/**
 * Robust JSON parser — handles DeepSeek <think> reasoning tags and markdown blocks
 */
function parseJSON(text) {
  // Strip DeepSeek reasoning blocks <think>...</think>
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  try { return JSON.parse(cleaned); } catch {}

  const jsonBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (jsonBlock) {
    try { return JSON.parse(jsonBlock[1].trim()); } catch {}
  }

  const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch {}
  }

  throw new Error("Failed to parse AI response as JSON");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
