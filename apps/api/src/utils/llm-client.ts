interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMRequest {
  systemPrompt: string;
  conversationHistory: Message[];
  modelName: string;
}

interface LLMResponse {
  content: string;
  isJson: boolean;
}

export class LLMClient {
  private openaiApiKey: string;
  private geminiApiKey: string;
  private anthropicApiKey: string;
  private xaiApiKey: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
    this.xaiApiKey = process.env.XAI_API_KEY || '';
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const { systemPrompt, conversationHistory, modelName } = request;

    // Combine system prompt with conversation history
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory
    ];

    if (modelName.toLowerCase().includes('gpt') || modelName.toLowerCase().includes('openai')) {
      return this.callOpenAI(messages, modelName);
    } else if (modelName.toLowerCase().includes('gemini')) {
      return this.callGemini(messages, modelName);
    } else if (modelName.toLowerCase().includes('claude') || modelName.toLowerCase().includes('anthropic')) {
      return this.callAnthropic(messages, modelName);
    } else if (modelName.toLowerCase().includes('grok') || modelName.toLowerCase().includes('xai')) {
      return this.callXAI(messages, modelName);
    } else {
      throw new Error(`Unsupported model: ${modelName}`);
    }
  }

  private async callOpenAI(messages: Message[], modelName: string): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.mapOpenAIModel(modelName),
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return {
      content,
      isJson: this.isValidJson(content)
    };
  }

  private async callGemini(messages: Message[], modelName: string): Promise<LLMResponse> {
    // Gemini uses different message format - system message goes into systemInstruction
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    // Convert to Gemini format
    const geminiMessages = conversationMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestBody: any = {
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    if (systemMessage) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessage.content }]
      };
    }

    const modelPath = this.mapGeminiModel(modelName);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelPath}:generateContent?key=${this.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    return {
      content,
      isJson: this.isValidJson(content)
    };
  }

  private async callAnthropic(messages: Message[], modelName: string): Promise<LLMResponse> {
    // Anthropic separates system message from conversation
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const requestBody: any = {
      model: this.mapAnthropicModel(modelName),
      max_tokens: 2048,
      temperature: 0.7,
      messages: conversationMessages
    };

    if (systemMessage) {
      requestBody.system = systemMessage.content;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    return {
      content,
      isJson: this.isValidJson(content)
    };
  }

  private async callXAI(messages: Message[], modelName: string): Promise<LLMResponse> {
    // X AI uses OpenAI-compatible API format
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.mapXAIModel(modelName),
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      let errorDetail = '';
      try { 
        errorDetail = JSON.stringify(await response.json()); 
      } catch { 
        errorDetail = await response.text().catch(() => '');
      }
      throw new Error(`X AI ${response.status}: ${response.statusText} ${errorDetail}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return {
      content,
      isJson: this.isValidJson(content)
    };
  }

  private mapOpenAIModel(modelName: string): string {
    const modelMap: Record<string, string> = {
      'gpt-4o': 'gpt-4o',
      'gpt-4': 'gpt-4',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'o3-mini': 'o3-mini',
      'o3': 'o3',
    };

    return modelMap[modelName] || modelName;
  }

  private mapGeminiModel(modelName: string): string {
    const modelMap: Record<string, string> = {
      'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash',
      'gemini-pro': 'gemini-pro',
    };

    return modelMap[modelName] || modelName;
  }

  private mapAnthropicModel(modelName: string): string {
    const modelMap: Record<string, string> = {
      'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022': 'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229': 'claude-3-opus-20240229',
      'claude-3-sonnet-20240229': 'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307': 'claude-3-haiku-20240307',
    };

    return modelMap[modelName] || modelName;
  }

  private mapXAIModel(modelName: string): string {
    const modelMap: Record<string, string> = {
      'grok-4': 'grok-4',
      'grok-1.5': 'grok-1.5',
      'grok-1': 'grok-1',
      'grok-1.5-vision-beta': 'grok-1.5-vision-beta',
    };

    return modelMap[modelName] || modelName;
  }

  private isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}

// Convenience function for quick usage
export async function generateLLMResponse(
  systemPrompt: string,
  conversationHistory: Message[],
  modelName: string
): Promise<LLMResponse> {
  const client = new LLMClient();
  return client.generate({ systemPrompt, conversationHistory, modelName });
}
