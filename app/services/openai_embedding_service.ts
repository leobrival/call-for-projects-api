import { OpenAI } from 'openai'

export default class OpenAIEmbeddingService {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async getEmbedding(content: string): Promise<number[]> {
    const resp = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    })
    return resp.data[0].embedding
  }
}
