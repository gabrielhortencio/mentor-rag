import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { embedText } from './embedText.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const loadData = async () => {
  console.log("🔍 Lendo arquivo JSON...");
  const rawData = fs.readFileSync("blocos_mentor_pablo.json", "utf-8");
  const blocos = JSON.parse(rawData);
  console.log(`✅ ${blocos.length} blocos encontrados.`);

  for (const bloco of blocos) {
    const embedding = await embedText(bloco.conteudo);
    const { error } = await supabase.from("vetor_consciencia").insert({
      conteudo: bloco.conteudo,
      embedding: embedding,
    });

    if (error) {
      console.error("❌ Erro ao inserir:", error);
    } else {
      console.log("✅ Bloco inserido com sucesso.");
    }
  }
};

loadData();
