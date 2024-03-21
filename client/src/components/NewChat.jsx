import React from "react";

const NewChat = ({selectChat, setChatLog, setShowMenu, setChatID }) => {
  return (
    <div
      className="sideMenuButton"
      onClick={() => {
        selectChat(null);
        setShowMenu(false);
      }}
    >
      <span>+</span>
      New chat
    </div>
  );
};

export default NewChat;
