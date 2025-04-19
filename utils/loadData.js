import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { embedText } from './embedText.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const loadData = async () => {
  const rawData = fs.readFileSync("blocos_mentor_pablo.json", "utf-8");
  const blocos = JSON.parse(rawData);

  for (const bloco of blocos) {
    const embedding = await embedText(bloco.conteudo);
    await supabase.from("vetor_consciencia").insert({
      conteudo: bloco.conteudo,
      embedding: embedding,
    });
  }
};
