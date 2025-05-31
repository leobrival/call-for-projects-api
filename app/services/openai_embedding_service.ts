import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

export default class OpenAIEmbeddingService {
  async getEmbedding(content: string): Promise<number[]> {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: content,
    })
    return embedding
  }
}
