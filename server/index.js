require("dotenv").config();

const express = require("express");
const app = express();
const port = 4000;

const { Configuration, OpenAIApi } = require("openai");
const { ChatEntry, ChatLog, Chats } = require("./components/chatlog");
const configuration = {
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  basePATH: process.env.REACT_APP_OPENAI_BASE_URL,
};

const chats = new Chats();

const openai = new OpenAIApi(configuration);

openai.configuration.basePath = process.env.REACT_APP_OPENAI_BASE_URL;

// adding body-parser and cors
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  if (chats.length() === 0) {
    res.status(200).json({});
  } else {
    res.status(200).json({
      chats: [
        // for each key in the chats object, return an object with the key as chatID and the value of the key as title
        ...Object.keys(chats.getChats()).map((chatID) => {
          return { chatID: chatID, title: chats.getChat(chatID).getTitle() };
        }),
      ],
    });
  }
});

app.put("/v1/chat/:chatID", (req, res) => {
  const { chatID } = req.params;
  const { title } = req.body;
  const chat = chats.getChat(chatID);
  chat.setTitle(title);
  res.status(200).json({ title: title });
});

app.get("/v1/chat/:chatID", (req, res) => {
  const { chatID } = req.params;
  const chat = chats.getChat(chatID);
  if (!chat) {
    res.status(404).json({ message: "Chat not found" });
    return;
  }
  res
    .status(200)
    .json({
      chatID: chatID,
      title: chat.getTitle(),
      messages: chat.getMessages(),
    });
});

app.delete("/v1/chat/:chatID", (req, res) => {
  const { chatID } = req.params;
  delete chats.delChat(chatID);
  res.status(200).json({ chatID: chatID });
});

app.post("/v1/chat/completions", async (req, res) => {
  const { message, chatID } = req.body;

  try{
    let stream = req.body.stream || false;
    const model = req.body.model || process.env.REACT_APP_OPENAI_MODEL;
    const temperature = req.body.temperature || 0.3;
    
    console.log("Stream",stream);
    console.log("Model",model);
    console.log("Temperature",temperature);
    console.log("Message",message);
    console.log("ChatID",chatID);
    let chatEntry = null;
    let chat = null;
    if (!chats.getChat(chatID)) {
      chat = chats.addChat(chatID, "New chat");
      chat.setSystemPrompt("You are a helpful assistant.");
      chatEntry = chat.addEntry(message, null);
    } else {
      chat = chats.getChat(chatID);
      chat.setSystemPrompt("You are a helpful assistant.");
      chatEntry = chat.addEntry(message, null);
    }
    if (stream) {
      console.log("Streaming...");
      //res.redirect(303, `/v1/chat/completions/${chatID}`);
      res.status(200).json({ chatID: chatID });
    } else {
      const messages = chat.getMessages(true);
      const model = process.env.REACT_APP_OPENAI_MODEL;
      const resp = await openai.createChatCompletion({
        model: model,
        messages: messages,
        max_tokens: 3000,
        temperature: 0.3,
        stream: false,
      });
      if (resp.data.choices[0].message.content) {
        chatEntry.botMessage = resp.data.choices[0].message.content;
        res
          .status(200)
          .json({ botResponse: resp.data.choices[0].message.content });
      } else {
        res.status(200).json({ botResponse: "No response" });
      }
    }
  } catch (e) {
    console.log("Error", e.message);
    res.status(400).json({ message: e.message });
  }
});

app.get("/v1/chat/completions/:chatID",  async(req, res) => {
  res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n\n");
  const { chatID } = req.params;
  console.log("Get for ChatID", chatID);
  chat = chats.getChat(chatID);
  if (!chat) {
    res.write(JSON.stringify({ error: "Chat not found" }));
    return;
  }
  try {
    const messages = chat.getMessages(true);
    if (messages.length < 2){
      console.log("Not enough messages in chat");
      console.log("Messages", messages);
      res.write(JSON.stringify({error: "No messages in chat"}));
      return;
    }else{
      console.log("Messages", messages);
    }
    const model = process.env.REACT_APP_OPENAI_MODEL;
    const resp = await openai.createChatCompletion({
      model: model,
      messages: messages,
      max_tokens: 3000,
      temperature: temperature,
    });
    // 
    console.log("Response", resp); 
    chat.amendLastEntry(resp.data.choices[0].message.content);
    const splittedMessage = resp.data.choices[0].message.content.split(" ");
    for (let i = 0; i < splittedMessage.length - 1; i++) {
      const data = {
        id: "chatcmpl-" + chatID + "-" + i,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [
          {
            index: 0,
            delta: {
              role: "assistant",
              content: splittedMessage[i] + " ",
            },
            finish_reason: null,
          },
        ],
      };

      const jsonString = JSON.stringify(data);
      console.log("Data", jsonString);
      res.write(`data: ${jsonString}\n\n`);
      // sleep for 0.1 seconds
      (async () => await new Promise((resolve) => setTimeout(resolve, 100)))();
    }
    const data = {
      id: "chatcmpl-" + chatID + "-" + splittedMessage.length - 1,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          delta: {
            role: "assistant",
            content: splittedMessage[splittedMessage.length - 1],
          },
          finish_reason: "stop",
        },
      ],
    };
    const jsonString = JSON.stringify(data);
    console.log("Data", jsonString);
    res.write(`data: ${jsonString}\n\n`);

    res.end();
  } catch (e) {
    console.log("Error", e.message);
    res.status(400).json({ message: e.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
