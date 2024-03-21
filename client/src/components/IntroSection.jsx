import React from "react";
import '../styles/IntroSection.css';

const IntroSection = () => {
  return (
    <div className="welcome-container">
        <h1 className="header">Welcome to Your AI Companion! 👋</h1>
        <p>Hello there! I’m your AI Companion, powered by technology inspired by ChatGPT. I’m here to help you explore, learn, and get things done. Let’s embark on this journey together. Whether you have questions, need advice, or just want to chat, I'm here for you 24/7.</p>
        
        <h2 className="subheader">Here’s how we can interact:</h2>
        <ul>
            <li><strong>Ask me anything:</strong> From the depths of the ocean to the far reaches of space, I'm here to provide answers.</li>
            <li><strong>Learn something new:</strong> Curious about quantum physics? Want to master a new language? I’ve got you covered.</li>
            <li><strong>Get creative:</strong> Need help writing a story or coming up with ideas? Let’s get those creative juices flowing.</li>
            <li><strong>Solve problems:</strong> Stuck on a math problem or need coding help? I’m your go-to solution finder.</li>
        </ul>
        
        <p>To get started, simply type your question or what you're thinking about in the chat below and press enter.</p>
        
        <p>Your privacy and trust are important to us. All conversations are designed with your privacy in mind, ensuring a secure and confidential experience.</p>
        
        <div className="tip">
            🌟 <strong>Tip:</strong> You can ask me for jokes, quizzes, or even to generate a poem on a topic of your choice. Let's make this fun and educational!
        </div>
        
        <p>If you’re ready, let’s chat! What would you like to know or talk about today?</p>
    </div>
  );
};

export default IntroSection;
