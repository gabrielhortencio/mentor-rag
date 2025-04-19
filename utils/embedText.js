import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const embedText = async (text) => {
  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-ada-002",
    openAIApiKey: process.env.OPENAI_API_KEY
  });

  const res = await embeddings.embedQuery(text);
  return res;
};
