const express = require("express");
const app = express();
const fs = require("fs");
const PORT = process.env.PORT || 3000;

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCCmac2TAQ30N4EHVxetB0qVoSqIwWtgZU");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(express.json());

// Basic route
app.get("/", async (_req, res) => {
  //   res.send("Hello, Node.js!");

  const prompt = "website for a small business in react";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  res.send(result.response.text());
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/chat", async (_req, res) => {
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });
  let result = await chat.sendMessage("hii");
  console.log(result.response.text());
  //   result = await chat.sendMessage("How many paws are in my house?");
  //   console.log(result.response.text());
});

app.get("/image", async (_req, res) => {
  function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }

  const prompt = "Describe how this product might be manufactured.";
  // Note: The only accepted mime types are some image types, image/*.
  const imagePart = fileToGenerativePart("./download.jpeg", "image/*");

  const result = await model.generateContent([prompt, imagePart]);
  console.log(result.response.text());
  res.json(result.response.text());
});

app.get("/stream", async (_req, res) => {
  const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContentStream(prompt);

  // Print text as it comes in.
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  res.json((await result.response).text);
});

app.get("/chat-stream", async (_req, res) => {
    const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
      });
      let result = await chat.sendMessageStream("I have 2 dogs in my house.");
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText);
      }
      result = await chat.sendMessageStream("How many paws are in my house?");
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText);
      }
    });