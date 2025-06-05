/**
 * chat.js
 * Handles the advanced chat widget functionality for the Hope JEE website
 */

document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Create Chat Widget Elements ---
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';

    const chatButton = document.createElement('div');
    chatButton.className = 'chat-button';
    // Consider adding a notification dot later if needed
    chatButton.innerHTML = '<i class="fas fa-comment-dots"></i>';

    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window'; // Initially hidden via CSS

    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatHeader.innerHTML = `
        <div class="header-info">
            <div class="header-title">Hopejee</div>
            <div class="header-status"><i class="far fa-clock"></i> Within 3 hours</div>
        </div>
        <button class="close-chat" aria-label="Close Chat"><i class="fas fa-times"></i></button>
    `;

    const chatMessages = document.createElement('div');
    chatMessages.className = 'chat-messages';
    // Add ARIA attributes for accessibility
    chatMessages.setAttribute('role', 'log');
    chatMessages.setAttribute('aria-live', 'polite');


    const chatInputContainer = document.createElement('div');
    chatInputContainer.className = 'chat-input-container';
    chatInputContainer.innerHTML = `
        <input type="text" class="chat-input" placeholder="Message..." aria-label="Chat message input">
        <button class="send-button" aria-label="Send Message"><i class="fas fa-paper-plane"></i></button>
    `;

    // --- 2. Assemble Chat Window ---
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatMessages);
    chatWindow.appendChild(chatInputContainer);

    // --- 3. Assemble Chat Widget ---
    chatWidget.appendChild(chatButton);
    chatWidget.appendChild(chatWindow);

    // --- 4. Append to Body ---
    document.body.appendChild(chatWidget);

    // --- 5. Get References to Dynamic Elements ---
    const chatInput = chatWidget.querySelector('.chat-input');
    const sendButton = chatWidget.querySelector('.send-button');
    const closeButton = chatWidget.querySelector('.close-chat');

    // --- 6. Event Listeners ---
    chatButton.addEventListener('click', toggleChatWindow);
    closeButton.addEventListener('click', toggleChatWindow);
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow Shift+Enter for newline (though input is single line now)
            e.preventDefault(); // Prevent default Enter behavior (like form submission)
            handleSendMessage();
        }
    });

    // --- 7. Initial Bot Message ---
    addBotMessage('Hi there 👋 How can we help?');

    // --- 8. Core Functions ---

    function toggleChatWindow() {
        const isActive = chatWindow.classList.toggle('active');
        chatButton.classList.toggle('active'); // Optional: Style button when chat is open
        if (isActive) {
            chatInput.focus(); // Focus input when opening
            // Optional: Clear notification dot if implemented
        }
    }

    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message !== '') {
            addUserMessage(message);
            chatInput.value = '';
            chatInput.focus();
            // Show typing indicator before processing
            showTypingIndicator();
            // Process the message and get a response
            processMessage(message);
        }
    }

    function addUserMessage(message) {
        // Basic sanitization: prevent rendering raw HTML tags entered by user
        const sanitizedMessage = message.replace(/</g, "<").replace(/>/g, ">");
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.textContent = sanitizedMessage;
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

    function addBotMessage(message, isHTML = false) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        if (isHTML) {
            // Be cautious with isHTML. Only use for trusted, controlled HTML content.
            messageElement.innerHTML = message;
        } else {
            messageElement.textContent = message;
        }
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }

     function showTypingIndicator() {
        let indicator = chatMessages.querySelector('.typing-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'message bot-message typing-indicator';
            indicator.innerHTML = '<span>.</span><span>.</span><span>.</span>'; // Simple CSS animated dots
            chatMessages.appendChild(indicator);
            scrollToBottom();
        }
    }

    function removeTypingIndicator() {
        const indicator = chatMessages.querySelector('.typing-indicator');
        if (indicator) {
            chatMessages.removeChild(indicator);
        }
    }


    // --- 9. Advanced Message Processing Logic ---
    function processMessage(message) {
        const lowerMessage = message.toLowerCase();
        let response = '';
        let isHTMLResponse = false;
        let delay = 800 + Math.random() * 500; // Simulate variable thinking time

        // --- Define Keywords and Responses ---
        // Use more specific checks and combine keywords logically

        // --- Greetings & Basic Interaction ---
        if (/\b(hello|hi|hey|yo|wassup|hola)\b/.test(lowerMessage)) {
            response = 'Hey there! How can I assist you with the Hope JEE guide today?';
        }
        else if (/\b(thank you|thanks|thx|appreciate it)\b/.test(lowerMessage)) {
            response = 'You\'re very welcome! Happy to help. Anything else I can clarify?';
        }
        else if (/\b(bye|goodbye|see ya|later)\b/.test(lowerMessage)) {
            response = 'Alright! Best of luck with your JEE prep. Feel free to return if you have more questions!';
        }

        // --- Core Product Information ---
        else if (/\b(what is this|about.*product|about.*guide|tell me about|what do you sell|explain.*hope jee)\b/.test(lowerMessage)) {
            response = `Hope JEE offers an <strong>AI-Powered JEE Pattern Guide</strong>. It's a study material delivered as a <strong>PDF</strong>. We use AI to analyze over 20 years of past JEE papers to identify recurring question patterns and high-probability topics. The goal is to help you focus your study efforts more effectively.`;
            isHTMLResponse = true;
        }
        else if (/\b(how.*work|ai work|pattern.*analysis|prediction method|accuracy.*explained)\b/.test(lowerMessage)) {
            response = `Our AI system processes historical JEE question papers (20+ years data, focused analysis on recent 3-5 years). It identifies statistical trends in: <br>
            <ul>
                <li><strong>Topic Distribution:</strong> Which subjects/topics appear more frequently.</li>
                <li><strong>Question Patterns:</strong> Common structures or types of questions asked.</li>
            </ul>
            Based on this, it generates <strong>practice questions</strong> highlighting these high-probability areas. Our internal lab tests on past papers (2020-2023) show a <strong>70-85% historical pattern match rate</strong> for topic coverage.`;
            isHTMLResponse = true;
        }
        else if (/\b(who.*for|target audience|students|benefit)\b/.test(lowerMessage)) {
            response = 'This guide is specifically for JEE aspirants who want a data-driven edge. It\'s for students who are tired of generic advice and want to strategically focus their preparation on patterns observed in previous exams. It helps prioritize study time.';
        }

        // --- Accuracy & Disclaimers ---
        else if (/\b(accurate|accuracy rate|reliable|prediction.*true)\b/.test(lowerMessage)) {
            response = `The <strong>70-85% accuracy</strong> mentioned refers to our AI's historical success rate in matching topic distribution patterns found in past papers (specifically 2020-2023) during our internal lab testing. <br>
            <strong>IMPORTANT:</strong> This is NOT a guarantee of future exam content or your personal score. It's a statistical analysis to guide your study focus. Exam content can always change.`;
            isHTMLResponse = true;
        }
        else if (/\b(guarantee|sure.*pass|rank|score|get.*iit|admission|success rate)\b/.test(lowerMessage)) {
            response = `<strong>No guarantees</strong> are made regarding exam success, scores, ranks, or admissions. The guide provides AI-generated <strong>practice questions</strong> based on historical patterns to help you prepare efficiently.<br>
            Success depends heavily on your individual effort, understanding, and many other factors. Our materials are a tool, not a magic bullet.`;
            isHTMLResponse = true;
        }
        else if (/\b(actual.*questions|leak|real paper|same questions)\b/.test(lowerMessage)) {
            response = `No, definitely not. Our guide contains <strong>AI-GENERATED PRACTICE QUESTIONS ONLY</strong> based on observed historical patterns. It does <strong>NOT</strong> contain actual, leaked, or predicted future JEE questions. Any similarity to real exam questions is purely coincidental and based on the AI identifying common educational patterns.`;
            isHTMLResponse = true;
        }
        else if (/\b(umair khan|razorpay|payment name)\b/.test(lowerMessage)) {
            response = `The name 'Umair Khan' you see is our verified Razorpay merchant account - this is completely normal and actually GOOD for you because:<br>
            <ul>
                <li>✅ <strong>Trusted & Secure</strong>: Razorpay is India's leading payment gateway (used by 8M+ businesses) with bank-level security</li>
                <li>✅ <strong>100% Safe</strong>: Your card/PayTM/UPI details are fully encrypted and never shared with us</li>
            </ul>`;
            isHTMLResponse = true;
        }

        // --- Product Format ---
        else if (/\b(format|what.*get|delivery|pdf|download.*link)\b/.test(lowerMessage)) {
            response = `The guide is delivered as a <strong>downloadable PDF file</strong>. It contains comprehensive practice materials based on our AI analysis of JEE patterns.`;
            isHTMLResponse = true;
        }

        // --- Support ---
        else if (/\b(problem|issue|help|support|contact)\b/.test(lowerMessage)) {
            response = `If you need assistance, please use our <a href="contact.html" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Contact Form</a> to reach our support team.`;
            isHTMLResponse = true;
        }

        // --- Fallback Response ---
        else {
            response = `That's an interesting question! While I can answer queries about the AI guide and its features, I might not have the specific details for that. Could you perhaps rephrase? Or use our <a href="contact.html" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Contact Form</a> to reach our team directly.`;
            isHTMLResponse = true;
            delay = 600;
        }
        // --- Send the Response After Delay ---
        setTimeout(() => {
            removeTypingIndicator(); // Remove typing dots
            addBotMessage(response, isHTMLResponse); // Add the actual response
        }, delay);
    }

    // --- 10. Utility Functions ---
    function scrollToBottom() {
        // Using requestAnimationFrame for smoother scrolling after DOM updates
        requestAnimationFrame(() => {
             // Small delay sometimes helps ensure layout is complete before scrolling
             setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
             }, 50);
        });
    }
});