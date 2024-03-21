require("dotenv").config();

const express = require("express");
const app = express();
const port = 4000;

const { Configuration, OpenAIApi } = require("openai");
const {ChatEntry, ChatLog, Chats} = require("./components/chatlog");
const configuration = {
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  basePATH: process.env.REACT_APP_OPENAI_BASE_URL,
}

const chats = new Chats();

const openai = new OpenAIApi(configuration);

openai.configuration.basePath = process.env.REACT_APP_OPENAI_BASE_URL ;

// adding body-parser and cors
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  if (chats.length() === 0) {
    res.status(200).json({});
  }else{
    res.status(200).json({
      'chats': [
      // for each key in the chats object, return an object with the key as chatID and the value of the key as title
      ...Object.keys(chats.getChats()).map((chatID) => {
        return {chatID: chatID, title: chats.getChat(chatID).getTitle()}})
      ]
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
  res.status(200).json({ chatID: chatID, title: chat.getTitle(), messages: chat.getMessages() });
});

app.delete("/v1/chat/:chatID", (req, res) => {
  const { chatID } = req.params;
  delete chats.delChat(chatID);
  res.status(200).json({ chatID: chatID });
});

app.post("/v1/chat/completions", async (req, res) => {
  const { message, chatID } = req.body;
  try{
    console.log("Message",message);
    console.log("ChatID",chatID);
    let chatEntry = null;
    let chat = null;
    if (!chats.getChat(chatID)) {
      chat = chats.addChat(chatID, "New chat");
      chat.setSystemPrompt("You are a helpful assistant.");
      chatEntry = chat.addEntry( message , null);
    }else{
      chat = chats.getChat(chatID);
      chatEntry = chat.addEntry(message, null);
    }
    const messages = chat.getMessages(true);
    const resp = await openai.createChatCompletion({
      model: process.env.REACT_APP_OPENAI_MODEL,
      messages: messages,
      max_tokens: 3000,
      temperature: 0.3,
    });
    if (resp.data.choices[0].message.content) {
      chatEntry.botMessage = resp.data.choices[0].message.content;
    }
    res.status(200).json({ botResponse: resp.data.choices[0].message.content });
    } catch(e) {
        console.log("Error",e.message)
        res.status(400).json({message: e.message})
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});