import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("AVISO: GEMINI_API_KEY não foi detectada. Defina essa variável nas configurações de ambiente ou no painel da Vercel.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for book assistance
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { title, author, passage, mode } = req.body;

    if (!title || !passage || !mode) {
      return res.status(400).json({ error: "Parâmetros 'title', 'passage' e 'mode' são obrigatórios." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Erro de Configuração", 
        details: "A chave API do Gemini (GEMINI_API_KEY) não está configurada no servidor/Vercel. Adicione-a nas variáveis de ambiente do seu projeto." 
      });
    }

    let prompt = "";
    const systemInstruction = "Você é um professor de literatura, história e filosofia extremamente brilhante, didático, altamente conciso, objetivo e direto ao ponto. Suas explicações devem ser curtas, sem rodeios ou floreios, divididas em parágrafos pequenos e de leitura confortável e ágil em telas de celular. Nunca use termos desnecessariamente prolixos e limite-se ao essencial sem sacrificar a profundidade clássica.";

    if (mode === "meaning") {
      prompt = `Analise o seguinte trecho do livro "${title}" escrito por ${author || 'Autor Desconhecido'}.
      Trecho: "${passage}"
      
      Explique de forma objetiva, direta e profunda "O que o autor quis dizer?". Seja conciso, focando no essencial em no máximo 2 ou 3 parágrafos curtos. Aborde as entrelinhas, a real intenção e o impacto prático/filosófico do pensamento de forma clara e instigante.`;
    } else if (mode === "simple") {
      prompt = `Leia o seguinte trecho do livro "${title}" escrito por ${author || 'Autor Desconhecido'}.
      Trecho: "${passage}"
      
      Explique de forma altamente simplificada, rápida e acessível o significado desse pensamento para um leitor leigo ou iniciante. Use uma analogia cotidiana curta, retire qualquer jargão técnico e resuma a mensagem fundamental de forma ultraobjetiva em no máximo 2 parágrafos breves.`;
    } else if (mode === "historical") {
      prompt = `Considere o seguinte trecho do livro "${title}" de ${author || 'Autor Desconhecido'}.
      Trecho: "${passage}"
      
      Apresente de maneira resumida e ágil o "Contexto histórico" desta passagem e da obra. O que estava ocorrendo na época ou na vida do autor que motivou essa reflexão? Vá direto ao ponto em no máximo 2 parágrafos curtos.`;
    } else {
      return res.status(400).json({ error: "Modo inválido. Escolha entre 'meaning', 'simple' ou 'historical'." });
    }

    // Call Gemini API using gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const explanation = response.text || "Não foi possível gerar uma resposta para este trecho.";
    return res.json({ explanation });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    return res.status(500).json({ 
      error: "Falha ao obter explicação do assistente inteligente.", 
      details: error.message 
    });
  }
});

// API endpoint for chatting with a specific passage ("Conversar com o trecho")
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { title, author, passage, question, history } = req.body;

    if (!title || !passage || !question) {
      return res.status(400).json({ error: "Parâmetros 'title', 'passage' e 'question' são obrigatórios." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Erro de Configuração", 
        details: "A chave API do Gemini (GEMINI_API_KEY) não está configurada no servidor/Vercel. Adicione-a nas variáveis de ambiente do seu projeto." 
      });
    }

    const systemInstruction = `Você é um mentor intelectual, filósofo e crítico literário extraordinariamente dinâmico, didático e direto. 
Seu papel é ajudar o leitor a "conversar" com o trecho de um livro de forma dialógica, instigante e rápida.
Você deve responder de maneira objetiva, clara para iniciantes e resumida em no máximo 1 ou 2 parágrafos curtos.
Evite longos discursos acadêmicos ou respostas exaustivas. Interaja de forma acolhedora, relacionando a filosofia com o cotidiano do leitor de maneira cirúrgica e enxuta.`;

    // Build discussion context
    let textContext = `Livro: "${title}"\nAutor: ${author || "Autor Desconhecido"}\nTrecho Ativo sobre o qual discutimos:\n"${passage}"\n\n`;

    if (history && history.length > 0) {
      textContext += "Histórico das reflexões anteriores na conversa:\n";
      history.forEach((msg: { sender: 'user' | 'assistant', text: string }) => {
        const speaker = msg.sender === 'user' ? 'Leitor' : 'Mentor / Livro';
        textContext += `${speaker}: ${msg.text}\n`;
      });
      textContext += "\n";
    }

    textContext += `Pergunta atual do Leitor: "${question}"\n\nResponda diretamente ao leitor sob a ótica do autor de forma instigante e acolhedora:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: textContext,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      }
    });

    const reply = response.text || "Fiquei reflexivo sobre isso, mas não consegui formular uma resposta clara.";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Erro no chat literário:", error);
    return res.status(500).json({ 
      error: "Falha ao processar conversa inteligente com o trecho.", 
      details: error.message 
    });
  }
});

// API endpoint for Kokoro & Google Neural Text-To-Speech
app.post("/api/tts/kokoro", async (req, res) => {
  try {
    const { text, voice, speed } = req.body;

    if (!text) {
      return res.status(400).json({ error: "O texto para síntese de voz é obrigatório." });
    }

    console.log(`[Neural TTS] Synthesizing text of length ${text.length} with voice ${voice || 'pt_neural'}`);

    // Strip markdown syntax from passage before reading to make speech sounds clean and realistic
    const cleanText = text.replace(/[\*\#\`\_\-\>]/g, " ").trim();

    // Determine language
    let lang = "pt-BR";
    if (voice) {
      if (voice.startsWith("pt_")) {
        lang = "pt-BR";
      } else if (voice.startsWith("af_") || voice.startsWith("am_")) {
        lang = "en-US";
      } else if (voice.startsWith("bf_") || voice.startsWith("bm_")) {
        lang = "en-GB";
      } else if (voice.startsWith("es_")) {
        lang = "es-ES";
      }
    }

    // Google Translate TTS accepts max 200 chars per request.
    const sentences = cleanText.split(/([\.\!\?;\n])\s*/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (let i = 0; i < sentences.length; i++) {
      const sentencePart = sentences[i];
      if (!sentencePart) continue;

      if (currentChunk.length + sentencePart.length > 180) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentencePart;
      } else {
        currentChunk = currentChunk ? currentChunk + " " + sentencePart : sentencePart;
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    if (chunks.length === 0) {
      chunks.push(cleanText.substring(0, 180));
    }

    console.log(`[Neural TTS] Split text into ${chunks.length} chunks for continuous streaming`);

    // Fetch all chunks concurrently
    const chunkBuffersPromises = chunks.map(async (chunkText) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunkText)}`;
      const audioResponse = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (!audioResponse.ok) {
        throw new Error(`Google TTS request failed: ${audioResponse.status}`);
      }

      const arrayBuffer = await audioResponse.arrayBuffer();
      return Buffer.from(arrayBuffer);
    });

    const buffers = await Promise.all(chunkBuffersPromises);
    const combinedBuffer = Buffer.concat(buffers);

    res.set("Content-Type", "audio/mpeg");
    return res.send(combinedBuffer);

  } catch (error: any) {
    console.error("[Neural TTS Error]:", error);
    return res.status(500).json({
      error: "A síntese de voz de IA temporariamente indisponível.",
      details: error.message || error
    });
  }
});

export default app;
