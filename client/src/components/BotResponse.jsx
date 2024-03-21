import React from "react";
// import { useState , useEffect} from "react";

const BotResponse = ({ response, chatLogRef }) => {

  return (
    <>
      <pre>
        {response}
      </pre>
    </>
  );
};

export default BotResponse;
