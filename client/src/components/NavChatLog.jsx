import React, {useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faCancel, faClose } from '@fortawesome/free-solid-svg-icons';

const NavChatLog = ({ selectChat, chatID, title }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  
const handleSelectChat = () => {
    selectChat(chatID);
  }

  const handleDelete = async () => {
    try {
      await fetch(`http://127.0.0.1:4000/v1/chat/${chatID}`, {
        method: "DELETE",
      });
      selectChat("__top__");
    }catch(err){
      console.log(err);
    }
  };

  const handleRename = async (e) => {
    // e.preventDefault();
    const newTitle = e.target.querySelector("input").value;
    try {
      await fetch(`http://127.0.0.1:4000/v1/chat/${chatID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      setIsEditing(false);
    }catch(err){
      console.log(err);
    }
  }

  if (isEditing){    
    //FIXME: cancel button not working
    return (
      <div className="navChatLog">
      <form onSubmit={handleRename}>
        <input type="text" defaultValue={title} />
        <button type="submit"><FontAwesomeIcon icon={faSave} /></button>
        <button type="cancel" onClick={()=>setIsEditing(false)}><FontAwesomeIcon icon={faCancel} /></button> 
      </form>
      </div>
    );
  }


  return (
    <div className="navChatLog" onClick={handleSelectChat}>
    <div className="chatLogHeader">
        <p>{chatID} - {title}</p>
        {showMenu && (
            <div className="chatLogMenu">
            <div className="chatLogButtons">
                  
                  <button onClick={()=>setIsEditing(true)}>
                      <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={()=>handleDelete()}>
                      <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button onClick={()=>setShowMenu(false)}><FontAwesomeIcon icon={faClose}/></button>
              </div>
                
            </div>
        )}
        {!showMenu && (
            <button onClick={()=>setShowMenu(true)}>...</button>
        )}
        
    </div>
</div>
  );
};

export default NavChatLog;
