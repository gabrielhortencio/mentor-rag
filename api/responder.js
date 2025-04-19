import { createClient } from '@supabase/supabase-js';
import { OpenAI } from "langchain/llms/openai";
import { embedText } from '../utils/embedText.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { pergunta } = req.body;
  const embedding = await embedText(pergunta);

  const { data } = await supabase.rpc("match_vectors", {
    query_embedding: embedding,
    match_threshold: 0.75,
    match_count: 5,
  });

  const context = data.map(d => d.conteudo).join("\n---\n");

  const model = new OpenAI({
    temperature: 0.7,
    modelName: "gpt-4",
    openAIApiKey: process.env.OPENAI_API_KEY
  });

  const resposta = await model.call(
    `Responda com base no conteúdo abaixo como se fosse Pablo Marçal:\n\n${context}\n\nPergunta: ${pergunta}`
  );

  res.status(200).json({ resposta });
}
