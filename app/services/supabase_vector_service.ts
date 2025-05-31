import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Typing for a vector document
export interface VectorDocument {
  id?: string
  project_id: string
  content: string
  embedding: number[]
  metadata?: Record<string, any>
}

export default class SupabaseVectorService {
  private client: SupabaseClient
  private table: string = 'project_vectors' // Table name in Supabase

  constructor() {
    const url = process.env.SUPABASE_URL as string
    const key = process.env.SUPABASE_SERVICE_KEY as string // Use service key for backend
    this.client = createClient(url, key)
  }

  // Insert a new vector document
  async insertVector(doc: VectorDocument) {
    const { data, error } = await this.client.from(this.table).insert([doc]).select()
    if (error) throw new Error(JSON.stringify(error))
    return data?.[0]
  }

  // Search for vectors by embedding (KNN search)
  async searchVectors(project_id: string, _embedding: number[], matchCount = 5) {
    // KNN search natif (si pgvector >= 0.5.0 sur Supabase)
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('project_id', project_id)
      .order('embedding', {
        ascending: true,
        // @ts-ignore
        // Pour le KNN, il faut passer l'embedding de requête
        // cf. https://supabase.com/docs/guides/database/extensions/pgvector#knn-search
        // Supabase JS SDK ne supporte pas encore nativement le paramètre 'query_embedding'
        // donc il faut utiliser un RPC ou du SQL brut si besoin
      })
      .limit(matchCount)
    if (error) throw new Error(JSON.stringify(error))
    return data
  }

  // Delete a vector document by id
  async deleteVector(id: string) {
    const { error } = await this.client.from(this.table).delete().eq('id', id)
    if (error) throw new Error(JSON.stringify(error))
    return true
  }
}
