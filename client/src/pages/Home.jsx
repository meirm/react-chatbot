import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
import Avatar from "../components/Avatar";
import BotResponse from "../components/BotResponse";
import Error from "../components/Error";
import IntroSection from "../components/IntroSection";
import Loading from "../components/Loading";
import NavContent from "../components/NavContent";
import SvgComponent from "../components/SvgComponent";

const Home = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [chatID, setChatID] = useState(createNewChatID());
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [err, setErr] = useState(false);
  const [responseFromAPI, setResponseFromAPI] = useState(false);

  function createNewChatID(){
    return (Math.round(Math.random() * 1000 + 1)).toString();
  };
  async function selectChat(chatID){
    if (chatID === null){
      chatID = createNewChatID();
      setChatID(chatID);
      if (chatHistory && chatHistory.length > 0){
        // move the new chat to the top of the list
        setChatHistory((previousHistory)=>{return [{chatID: chatID, title: "New Chat"}, ...previousHistory]});
      }else{
        setChatHistory([{chatID: chatID, title: "New Chat"}]);
      }
    }else{
      if (chatID === "__top__"){
        // if the chatID is __top__ then we are selecting the top chat in the list
        if (chatHistory && chatHistory.length > 0){
          chatID = chatHistory[0].chatID;
        }else{
          chatID = createNewChatID();
          setChatHistory([{chatID: chatID, title: "New Chat"}]);
        }
      }else{
        setChatID(chatID);
        // reorder. move the selected chat to the top of the list
        const chatIndex = chatHistory.findIndex((chat)=>chat.chatID === chatID);
        const selectedChat = chatHistory[chatIndex];
        chatHistory.splice(chatIndex, 1);
        setChatHistory((previousHistory)=>{return [selectedChat, ...previousHistory]});
      }
    }
    console.log("Selecting chatID:", chatID);
    setShowMenu(false);
    setChatLog([]);
    //pull the chat history from the server
    await fetchChatLog(chatID);  
  };

  async function fetchChatLog(chatID) {
    try {
      console.log("Fetching chat log for chatID:", chatID);
      const response = await fetch("http://127.0.0.1:4000/v1/chat/" + chatID);
      const data = await response.json();
      // we need to parse the incoming messages from [{role: "user", content: "message"}, {role: "assistant", content: "message"
      // to [{chatPrompt: "message", botMessage: "message"},...]
      const chatLog = [];
      data.messages.map((message) => {
        if (message.role === "user") {
          chatLog.push({ chatPrompt: message.content });
        } else {
          chatLog[chatLog.length - 1].botMessage = message.content;
        }
        return null;
      });
      setChatLog(chatLog);
      console.log(data);
    } catch (err) {
      setErr(err);
      console.log(err);
    }
  }
  const chatLogRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!responseFromAPI) {
      if (inputPrompt.trim() !== "") {
        // Set responseFromAPI to true before making the fetch request
        setResponseFromAPI(true);
        setChatLog([...chatLog, { chatPrompt: inputPrompt }]);
        callAPI();

        // hide the keyboard in mobile devices
        e.target.querySelector("input").blur();
      }

      async function callAPI() {
        try {
          // const response = await fetch("http://127.0.0.1:4000/v1/chat/completions", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ message: inputPrompt, chatID: chatID, stream: true }),
          // });
          // const data = await response.json();
          const response = await axios.post("http://127.0.0.1:4000/v1/chat/completions/", {
            message: inputPrompt,
            chatID: chatID,
            stream: true
          });
          let newChatLog = chatLog;
          newChatLog.push(
            {
              chatPrompt: inputPrompt,
              botMessage: "",
            })
          console.log("Response", response);
        
          const eventSource = new EventSource(`http://127.0.0.1:4000/v1/chat/completions/${chatID}`);

        eventSource.onmessage = function(event) {
          const data = JSON.parse(event.data);
          console.log("Data",data);
          // we need to edit the last chatbot message to append the new chunk
          
            if (newChatLog[newChatLog.length - 1]["botMessage"] === undefined) {
              newChatLog[newChatLog.length - 1]["botMessage"] = "";
            }
            newChatLog[newChatLog.length - 1]["botMessage"] += data.choices[0].delta.content;
            setChatLog(newChatLog);
            if (data.choices[0].finish_reason === "stop") {
              eventSource.close();
            }
          
          
          eventSource.onerror = function(err) {
            console.error("EventSource failed:", err);
            setErr(err);
          };
        };
          setErr(false);
        } catch (err) {
          setErr(err);
          console.log(err);
        }
        //  Set responseFromAPI back to false after the fetch request is complete
        setResponseFromAPI(false);
      }
    }

    setInputPrompt("");
  };

  async function fetchChatHistory() {
    try {
      const response = await fetch("http://127.0.0.1:4000/");
      const data = await response.json();
      setChatHistory(data.chats);
      console.log(data);
    } catch (err) {
      setErr(err);
      console.log(err);
    }
  }

  useEffect(() => {
    fetchChatHistory();
  },[]);


  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    return () => {};
  }, []);

  return (
    <>
      <header>
        <div className="menu">
          <button onClick={() => setShowMenu(true)}>
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="#d9d9e3"
              strokeLinecap="round"
            >
              <path d="M21 18H3M21 12H3M21 6H3" />
            </svg>
          </button>
        </div>
        <h1>TalkBot</h1>
      </header>

      {showMenu && (
        <nav>
          <div className="navItems">
            <NavContent
              selectChat={selectChat}
              chatHistory={chatHistory}
              setChatLog={setChatLog}
              setShowMenu={setShowMenu}
              setChatID={setChatID}
            />
          </div>
          <div className="navCloseIcon">
            <svg
              fill="#fff"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              xmlSpace="preserve"
              stroke="#fff"
              width={42}
              height={42}
              onClick={() => setShowMenu(false)}
            >
              <path d="m53.691 50.609 13.467-13.467a2 2 0 1 0-2.828-2.828L50.863 47.781 37.398 34.314a2 2 0 1 0-2.828 2.828l13.465 13.467-14.293 14.293a2 2 0 1 0 2.828 2.828l14.293-14.293L65.156 67.73c.391.391.902.586 1.414.586s1.023-.195 1.414-.586a2 2 0 0 0 0-2.828L53.691 50.609z" />
            </svg>
          </div>
        </nav>
      )}

      <aside className="sideMenu">
        <NavContent
          selectChat={selectChat}
          chatHistory={chatHistory}
          setChatLog={setChatLog}
          setShowMenu={setShowMenu}
          setChatID={setChatID}
        />
      </aside>

      <section className="chatBox">
        {chatLog.length > 0 ? (
          <div className="chatLogWrapper">
            {chatLog.length > 0 &&
              chatLog.map((chat, idx) => (
                <div
                  className="chatLog"
                  key={idx}
                  ref={chatLogRef}
                  id={`navPrompt-${idx}`}
                >
                  <div className="chatPromptMainContainer">
                    <div className="chatPromptWrapper">
                      <Avatar bg="#5437DB" className="userSVG">
                        <svg
                          stroke="currentColor"
                          fill="none"
                          strokeWidth={1.9}
                          viewBox="0 0 24 24"
                          // strokeLinecap="round"
                          // strokeLinejoin="round"
                          className="h-6 w-6"
                          height={40}
                          width={40}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx={12} cy={7} r={4} />
                        </svg>
                      </Avatar>
                      <div id="chatPrompt">{chat.chatPrompt}</div>
                    </div>
                  </div>

                  <div className="botMessageMainContainer">
                    <div className="botMessageWrapper">
                      <Avatar bg="#11a27f" className="openaiSVG">
                        <SvgComponent w={41} h={41} />
                      </Avatar>
                      {chat.botMessage ? (
                        <div id="botMessage">
                          <BotResponse
                            response={chat.botMessage}
                            chatLogRef={chatLogRef}
                          />
                        </div>
                      ) : err ? (
                        <Error err={err} />
                      ) : (
                        <Loading />
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <IntroSection />
        )}

        <form onSubmit={handleSubmit}>
          <div className="inputPromptWrapper">
            <input
              name="inputPrompt"
              id=""
              className="inputPrompttTextarea"
              type="text"
              rows="1"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              autoFocus
            ></input>
            <button aria-label="form submit" type="submit">
              <svg
                fill="#ADACBF"
                width={15}
                height={20}
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#212023"
                strokeWidth={0}
              >
                <title>{"submit form"}</title>
                <path
                  d="m30.669 1.665-.014-.019a.73.73 0 0 0-.16-.21h-.001c-.013-.011-.032-.005-.046-.015-.02-.016-.028-.041-.05-.055a.713.713 0 0 0-.374-.106l-.05.002h.002a.628.628 0 0 0-.095.024l.005-.001a.76.76 0 0 0-.264.067l.005-.002-27.999 16a.753.753 0 0 0 .053 1.331l.005.002 9.564 4.414v6.904a.75.75 0 0 0 1.164.625l-.003.002 6.259-4.106 9.015 4.161c.092.043.2.068.314.068H28a.75.75 0 0 0 .747-.695v-.002l2-27.999c.001-.014-.008-.025-.008-.039l.001-.032a.739.739 0 0 0-.073-.322l.002.004zm-4.174 3.202-14.716 16.82-8.143-3.758zM12.75 28.611v-4.823l4.315 1.992zm14.58.254-8.32-3.841c-.024-.015-.038-.042-.064-.054l-5.722-2.656 15.87-18.139z"
                  stroke="none"
                />
              </svg>
            </button>
          </div>
        </form>
      </section>
    </>
  );
};

export default Home;
