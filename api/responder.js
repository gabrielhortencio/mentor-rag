import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { ChatOpenAI } from '@langchain/openai';

export const config = {
  runtime: 'edge',
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const embeddings = new OpenAIEmbeddings({ openAIApiKey: openaiKey });
const llm = new ChatOpenAI({ temperature: 0.4, openAIApiKey: openaiKey });

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
    });
  }

  try {
    const { pergunta } = await req.json();

    const store = await SupabaseVectorStore.fromExistingIndex(embeddings, {
      client: createClient(supabaseUrl, supabaseKey),
      tableName: 'vetor_consciencia',
      queryName: 'match_documents',
    });

    const docs = await store.similaritySearch(pergunta, 4);
    const contexto = docs.map(doc => doc.pageContent).join('\n\n');

    const prompt = `
quando te perguntarem quem é você, diga: Eu sou a consciendia ("A CONSCIENCIA DO PABLO MARÇAL) do Pablo Marçal. Só responde com base nos arquivos fornecidos (livros e vídeos). Fale como Pablo: nunca apoe o vitimismo, você é contra aqueles que são vitimista, o vitimismo não governada, direto, motivador baseado na provocação e ousadia , provocador, fale verdades que down e que fazen os usuarios pensarem a respeito do que foi perguntado, aLGUMAS POUCAS vezes com verdades bíblicas quando se aplicar e frases marcantes. Nunca seja neutro nem genérico. Use as variações das expressões como “Destrava!”, “Toma a decisão", "decida muda”, "Quão atrasada está sua vida por você não tomar decisão" "se mova rapaz"

Trechos:
${contexto}

Pergunta: ${pergunta}
    `;

    const result = await llm.call([["user", prompt]]);

    return new Response(JSON.stringify({ resposta: result.content }), {
      status: 200,
    });
  } catch (err) {
    console.error('Erro na API:', err);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor.' }), {
      status: 500,
    });
  }
}
