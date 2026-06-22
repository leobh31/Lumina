import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Client } from "@gradio/client";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
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

      let prompt = "";
      const systemInstruction = "Você é um professor acadêmico de literatura, história e filosofia extremamente brilhante, sensível, erudito e didático.";

      if (mode === "meaning") {
        prompt = `Analise o seguinte trecho do livro "${title}" escrito por ${author || 'Autor Desconhecido'}.
        Trecho: "${passage}"
        
        Explique em profundidade "O que o autor quis dizer?" com esse trecho. Aborde as entrelinhas, as metáforas, a intenção intelectual do autor e o impacto existencial ou filosófico desse pensamento. Formate a resposta de forma fluida, dividida em parágrafos elegantes e fáceis de ler no Kindle.`;
      } else if (mode === "simple") {
        prompt = `Leia o seguinte trecho do livro "${title}" escrito por ${author || 'Autor Desconhecido'}.
        Trecho: "${passage}"
        
        Explique de forma simplificada, acessível e cativante o significado desse pensamento para um iniciante completo. Use analogias ricas e cotidianas, retire o tecnicismo ou jargão excessivo e resuma a mensagem fundamental de modo amigável e esclarecedor.`;
      } else if (mode === "historical") {
        prompt = `Considere o seguinte trecho do livro "${title}" de ${author || 'Autor Desconhecido'}.
        Trecho: "${passage}"
        
        Apresente o "Contexto histórico" desta passagem e da respectiva obra. O que estava ocorrendo na sociedade, correntes intelectuais da época ou na própria vida do autor que impulsionou esse tipo de reflexão clássica? Explique as origens históricas dessa visão.`;
      } else {
        return res.status(400).json({ error: "Modo inválido. Escolha entre 'meaning', 'simple' ou 'historical'." });
      }

      // Call Gemini API
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

      const systemInstruction = `Você é um mentor intelectual, filósofo e crítico literário extraordinariamente sensível e erudito. 
Seu papel é ajudar o leitor a "conversar" com o trecho de um livro de forma dialógica e direta.
Você deve responder à pergunta do leitor de maneira profunda, mas conversacional, interpretando a questão SEMPRE através das lentes intelectuais do livro, do autor e do trecho específico fornecido.
Caso o leitor pergunte sobre aplicações contemporâneas (como por exemplo "Isso se aplica à ansiedade moderna?"), ligue os argumentos do autor de forma criativa, filosófica e profunda com o cotidiano do leitor.`;

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

  // API endpoint for Kokoro Text-To-Speech
  app.post("/api/tts/kokoro", async (req, res) => {
    try {
      const { text, voice, speed } = req.body;

      if (!text) {
        return res.status(400).json({ error: "O texto para síntese de voz é obrigatório." });
      }

      console.log(`[Kokoro TTS] Synthesizing text of length ${text.length} with voice ${voice || 'af_bella'}`);

      // Strip markdown syntax from passage before reading to make speech sounds clean and realistic
      const cleanText = text.replace(/[\*\#\`\_\-\>]/g, " ").trim();

      // Connect to the high-quality fffiloni/kokoro-tts space
      const gradioClient = await Client.connect("fffiloni/kokoro-tts");

      // Predict takes parameters: Text (str), Voice (str), Speed (num)
      const result = await gradioClient.predict(0, [
        cleanText,
        voice || "af_bella",
        speed || 1.1 // Slightly faster for high-fidelity interactive audiobooks
      ]);

      // Parse output
      if (result && result.data && result.data[0]) {
        const fileData = result.data[0] as { url?: string; name?: string; path?: string };
        let audioUrl = fileData.url || "";

        if (audioUrl) {
          // If the URL returned by Gradio is a relative file path (like "file=/tmp/gradio/abc.wav"), prepend the domain path
          if (!audioUrl.startsWith("http")) {
            const cleanPath = audioUrl.startsWith("/") ? audioUrl.substring(1) : audioUrl;
            audioUrl = `https://fffiloni-kokoro-tts.hf.space/${cleanPath}`;
          }

          console.log(`[Kokoro TTS] Fetching compiled audio from HuggingFace cache: ${audioUrl}`);

          // Fetch the WAV direct audio content from HuggingFace CDN
          const audioResponse = await fetch(audioUrl);
          if (!audioResponse.ok) {
            throw new Error(`Falha ao baixar áudio gerado pelo Kokoro (Status: ${audioResponse.status})`);
          }

          const arrayBuffer = await audioResponse.arrayBuffer();
          res.set("Content-Type", "audio/wav");
          return res.send(Buffer.from(arrayBuffer));
        }
      }

      throw new Error("Resposta de áudio vazia ou formato inválido retornado pelo Kokoro Space.");
    } catch (error: any) {
      console.error("[Kokoro TTS Error]:", error);
      return res.status(500).json({
        error: "A síntese de voz de IA temporariamente indisponível.",
        details: error.message || error
      });
    }
  });

  // Vite middleware setup for Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
