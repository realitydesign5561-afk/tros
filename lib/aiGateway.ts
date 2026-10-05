// lib/aiGateway.ts
export interface ProviderConfig {
  name: string
  apiKey: string
}

export function getProviderClient(config: ProviderConfig) {
  // Return a standardized client based on the provider name
  return {
    generateImage: async ({ prompt }: { prompt: string }) => {
      if (config.name.toLowerCase() === 'openai') {
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({ prompt, model: 'dall-e-3', size: '1024x1024' })
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`OpenAI Image API error: ${res.status} - ${errorText}`)
        }
        const data = await res.json()
        return { url: data.data[0].url }
      }
      throw new Error(`Image provider ${config.name} not supported by AI Gateway`)
    },
    generate: async ({ model, messages, stream }: any) => {
      if (config.name.toLowerCase() === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({ model, messages, stream })
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`OpenAI API error: ${res.status} - ${errorText}`)
        }
        return res.json()
      }

      if (config.name.toLowerCase() === 'gemini') {
        // Simple mapping for Gemini API
        // For production, you'd want a more robust mapping of messages to Gemini's format.
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages.map((m: any) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            }))
          })
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Gemini API error: ${res.status} - ${errorText}`)
        }
        const data = await res.json()
        
        // Map back to OpenAI standard format for the gateway response
        return {
          choices: [
            { message: { role: 'assistant', content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '' } }
          ]
        }
      }

      throw new Error(`Provider ${config.name} not supported by AI Gateway`)
    },
    countTokens: (input: string | any[]) => {
      // Very naive token counting (1 token ~= 4 chars)
      const text = typeof input === 'string' ? input : JSON.stringify(input)
      return Math.ceil(text.length / 4)
    }
  }
}
