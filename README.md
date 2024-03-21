# ChatBot App

A conversational AI app inspired by OpenAI's GPT-3 language model, built with Create React App.

![Screenshot](images/screenshot.png)

## Features

- Natural language processing and understanding
- Context-aware responses
- Ability to converse on a variety of topics
- React-based front-end for easy user interaction
- Node.js back-end for communication with the OpenAI API

## Requirements

- Node JS
- npm
- [Create Open AI account](https://www.openai.com/signup/) (Optional)

## Setup

1. Clone the repository

```
git clone https://github.com/meirm/react-chatbot.git
```

2. Install client dependencies

```
cd client
npm install
```

3. Install server dependencies

```
cd server
npm install
```

4. Get your Open AI API key from [Open AI API Key](https://platform.openai.com/account/api-keys)

5. Environment Variable Setup

- Go to server folder and copy file env.example to .env file in root of server folder and edit it.
- Go to client folder and copy file env.example to .env file in root of server folder and edit it.


6. Configure Firebase 
- Go to [firbase console](https://console.firebase.google.com/) & click on add project, follow the guidelines to create new firebase project
- Once project is created you'll see the config file generated for you. If you do not find the config file, see the Project Overview section on the left panel. Just click the gear icon     which is at the right of Project Overview, there you'll see the Project Setting. 
- Click on the Project Setting, scroll to the bottom there you'll see "Your apps" section. You need to select web with <mark> </> </mark> symbols. Click on the icon and follow along to add firebase to your web app. Once you'll have your config file update your firebase.config file in the client/src folder. 

## Usage

1. Start the client

```
cd client
npm start
```

2. Start the server

```
cd server
node index.js
```

- Check if your client application run on port 3000 with the development environment configuration, so in your browser just go to http://localhost:3000

- Check if your server application run on port 4000

## Contribution

All contributions are welcome. Feel free to open an issue or create a pull request. And I will be more than happy for sponsors.

[<a href="https://www.buymeacoffee.com/meirmichanie" target="_blank"><img src="./client/public/buymeacoffee.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 200px !important;" ></a>](https://www.buymeacoffee.com/meirmichanie)

## Credits

Based on the original code from Sushant Dhimal.

https://github.com/dhiant/react-chatGPT-clone.git

forked on March 20th 2024

## License

[License](LICENSE)
