import React from "react";
import NavLinksContainer from "./NavLinksContainer";
import NavChatLog from "./NavChatLog";
import NewChat from "./NewChat";

const NavContent = ({ selectChat, chatHistory, setChatLog, setShowMenu, setChatID }) => {
  return (
    <>
    <NewChat selectChat={selectChat} setChatLog={setChatLog} setShowMenu={setShowMenu} setChatID={setChatID} />
    <div className="navPromptWrapper">
      {chatHistory && chatHistory.map((chat, idx) => {
        return chat.chatID && (
          <NavChatLog selectChat={selectChat} title={chat.title} chatID={chat.chatID} key={idx} />
        );
      })}
    </div>
    <NavLinksContainer chatLog={chatHistory} setChatLog={setChatLog} setChatID={setChatID}/>
  </>
  
  );
};

export default NavContent;
