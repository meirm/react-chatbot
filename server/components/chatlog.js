// We need the following classes:
// - ChatLog: The main class for the chat log.
// - Chats: The main class that holds a collection of ChatLog objects.

class ChatEntry {
    constructor(chatPrompt, botMessage) {
        this.chatPrompt = chatPrompt;
        this.botMessage = botMessage;
    }
    getChatPrompt() {
        return this.chatPrompt;
    }

    getBotMessage() {
        return this.botMessage;
    }

    setChatPrompt(chatPrompt) {
        this.chatPrompt = chatPrompt;
    }

    setBotMessage(botMessage) {
        this.botMessage = botMessage;
    }
}

class ChatLog {
    constructor() {
        this.title = "New Chat";
        this.entries = [];
        this.model = "llama2:chat";
        this.systemPrompt = "You are a helpful assistant.";
    }

    setModel(model) {
        this.model = model;
    }

    getModel() {
        return this.model;
    }

    setSystemPrompt(systemPrompt) {
        this.systemPrompt = systemPrompt;
    }

    getSystemPrompt() {
        return this.systemPrompt;
    }

    addEntry(chatPrompt, botMessage) {
        const chatEntry = new ChatEntry(chatPrompt, botMessage);
        this.entries.push(chatEntry);
        return chatEntry;
    }

    getEntries() {
        return this.entries;
    }

    getMessages(includeSystemPrompt = false){
        // return as array of dict with role and content
        const messages = [];
        if (includeSystemPrompt)
            messages.push({role: "system", content: this.systemPrompt});
        this.entries.map((entry) => {
            messages.push({role: "user", content: entry.getChatPrompt()});
            if (entry.getBotMessage())
                messages.push({role: "assistant", content: entry.getBotMessage()});
        });
        return messages;
    }

    length() {
        return this.entries.length;
    }

    setTitle(title) {
        this.title = title;
    }

    getTitle() {
        return this.title;
    }
}

class Chats {
    constructor() {
        this.chats = {};
    }
    addChat(chatID, title) {
        this.chats[chatID] = new ChatLog();
        return this.chats[chatID];
    }

    delChat(chatID) {
        delete this.chats[chatID];
        return chatID;
    }

    getChat(chatID) {
         if (this.chats[chatID]) {
            return this.chats[chatID];
        }else{
            return this.addChat(chatID, "New Chat");
        }
    }
    getChats() {
        return this.chats;
    }
    length() {
        return Object.keys(this.chats).length;
    }
}

module.exports = { ChatEntry, ChatLog, Chats };
