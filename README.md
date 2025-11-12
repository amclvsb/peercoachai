<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Peer Coach AI - Emotional Support Assistant</title>
    <style>
        :root {
            --primary: #2d3748;
            --secondary: #4a5568;
            --background: #f7fafc;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--background);
            margin: 0;
            padding: 20px;
        }

        .chat-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .chat-messages {
            height: 70vh;
            overflow-y: auto;
            padding: 20px;
        }

        .message {
            margin-bottom: 15px;
            display: flex;
            gap: 12px;
        }

        .user-message {
            justify-content: flex-end;
        }

        .message-content {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 12px;
        }

        .user-message .message-content {
            background: var(--primary);
            color: white;
        }

        .ai-message .message-content {
            background: var(--background);
            border: 1px solid #e2e8f0;
        }

        .input-container {
            display: flex;
            gap: 10px;
            padding: 20px;
            border-top: 1px solid #e2e8f0;
        }

        input {
            flex: 1;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
        }

        button {
            padding: 12px 24px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        button:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-messages" id="chatMessages"></div>
        <div class="input-container">
            <input type="text" id="userInput" placeholder="Share your thoughts...">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const API_KEY = 'YOUR_GOOGLE_GEMINI_API_KEY';
        const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

        async function sendMessage() {
            const userInput = document.getElementById('userInput');
            const message = userInput.value.trim();
            
            if (!message) return;

            // Clear input
            userInput.value = '';

            // Add user message
            addMessage(message, 'user');

            try {
                // Show loading state
                const loadingId = addLoadingIndicator();

                // Get AI response
                const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: message
                            }]
                        }]
                    })
                });

                const data = await response.json();
                const aiResponse = data.candidates[0].content.parts[0].text;

                // Remove loading and add AI response
                removeLoadingIndicator(loadingId);
                addMessage(aiResponse, 'ai');
            } catch (error) {
                console.error('Error:', error);
                addMessage("I'm having trouble connecting right now. Please try again later.", 'ai');
            }
        }

        function addMessage(text, sender) {
            const messagesDiv = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            
            messageDiv.innerHTML = `
                <div class="message-content">${text}</div>
            `;
            
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function addLoadingIndicator() {
            const messagesDiv = document.getElementById('chatMessages');
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message ai-message';
            loadingDiv.id = 'loading';
            loadingDiv.innerHTML = `
                <div class="message-content">...</div>
            `;
            messagesDiv.appendChild(loadingDiv);
            return 'loading';
        }

        function removeLoadingIndicator(id) {
            const element = document.getElementById(id);
            if (element) element.remove();
        }

        // Handle Enter key
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1qhbBJ8i4L3b6YUQOLwbZJRMZemR3tDPz

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
