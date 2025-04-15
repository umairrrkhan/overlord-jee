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
        <h3>Hope JEE Assistant</h3>
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
        <input type="text" class="chat-input" placeholder="Ask about the guide..." aria-label="Chat message input">
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
    addBotMessage('Hi there! 👋 I\'m the Hope JEE Assistant. Ask me anything about our AI-powered JEE pattern guide!');

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
            response = `Hope JEE offers an <strong>AI-Powered JEE Pattern Guide</strong>. It's a study material delivered as a <strong>PDF</strong>. We use AI to analyze over 10 years of past JEE papers to identify recurring question patterns and high-probability topics. The goal is to help you focus your study efforts more effectively.`;
            isHTMLResponse = true;
        }
        else if (/\b(how.*work|ai work|pattern.*analysis|prediction method|accuracy.*explained)\b/.test(lowerMessage)) {
            response = `Our AI system processes historical JEE question papers (10+ years data, focused analysis on recent 3-5 years). It identifies statistical trends in: <br>
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

        // --- Accuracy, Guarantees & Disclaimers (CRITICAL) ---
        else if (/\b(accurate|accuracy rate|reliable|prediction.*true)\b/.test(lowerMessage)) {
            response = `The <strong>70-85% accuracy</strong> mentioned refers to our AI's historical success rate in matching topic distribution patterns found in past papers (specifically 2020-2023) during our internal lab testing. <br>
            <strong>IMPORTANT:</strong> This is NOT a guarantee of future exam content or your personal score. It's a statistical analysis to guide your study focus. Exam content can always change.`;
            isHTMLResponse = true;
        }
         else if (/\b(guarantee|sure.*pass|rank|score|get.*iit|admission|success rate)\b/.test(lowerMessage)) {
            response = `<strong>Absolutely NO GUARANTEES</strong> are made regarding exam success, scores, ranks, or admissions. The guide provides AI-generated <strong>practice questions</strong> based on historical patterns to help you prepare efficiently.<br>
            Success depends heavily on your individual effort, understanding, and many other factors. Our materials are a tool, not a magic bullet. Please see our Terms of Service for full details. All sales are final.`;
            isHTMLResponse = true;
        }
         else if (/\b(actual.*questions|leak|real paper|same questions)\b/.test(lowerMessage)) {
             response = `No, definitely not. Our guide contains <strong>AI-GENERATED PRACTICE QUESTIONS ONLY</strong> based on observed historical patterns. It does <strong>NOT</strong> contain actual, leaked, or predicted future JEE questions. Any similarity to real exam questions is purely coincidental and based on the AI identifying common educational patterns. Selling or claiming to have actual questions is illegal and unethical.`;
             isHTMLResponse = true;
         }

        // --- Pricing, Purchase & Payment ---
        else if (/\b(price|cost|fee|how much|pricing)\b/.test(lowerMessage)) {
            response = `The Hope JEE AI Pattern Guide is available for a one-time purchase of <strong>₹999</strong>. This gives you the current PDF guide and includes access to future updates if any are released.`;
            isHTMLResponse = true;
        }
        else if (/\b(buy|purchase|get.*guide|order|how to pay|payment.*options|upi|card)\b/.test(lowerMessage)) {
            response = `Buying is simple! Here's how:
            <ol>
                <li>Click the 'Buy Now' or 'purchase now' button on the website, or use this secure link: <a href="https://rzp.io/rzp/9LUqtNBe" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Purchase Guide (₹999)</a></li>
                <li>You'll be taken to our secure Razorpay gateway.</li>
                <li>Complete the payment using UPI, Credit/Debit Card, Net Banking, or Wallets.</li>
                <li>After successful payment, you'll instantly receive an email with the download link for the PDF guide.</li>
            </ol>
            Make sure to enter your email address correctly!`;
            isHTMLResponse = true;
        }

        // --- Product Format & Delivery ---
        else if (/\b(format|what.*get|delivery|pdf|download.*link)\b/.test(lowerMessage)) {
            response = `You receive the guide as a <strong>downloadable PDF file</strong> immediately after purchase. An email containing a secure, one-time download link will be sent to the email address you provide during checkout. Please save the PDF file once downloaded.`;
            isHTMLResponse = true;
        }
         else if (/\b(updates|future versions)\b/.test(lowerMessage)) {
            response = `The ₹999 purchase includes the current version of the AI Pattern Guide. While we aim to provide updates if significant pattern shifts are detected or new analyses are performed, the frequency and availability of future updates are not guaranteed with the initial purchase.`;
        }

        // --- Troubleshooting ---
        else if (/\b(download failed|didn.*t receive|no email|link.*work|expired link|problem|issue|access.*guide|can.*t open)\b/.test(lowerMessage)) {
            response = `Sorry you're facing issues! Let's troubleshoot:
            <ol>
                <li><strong>Check Spam/Junk Folder:</strong> The email with the download link might have landed there. Please check thoroughly.</li>
                <li><strong>Correct Email:</strong> Ensure you entered the correct email address during purchase.</li>
                <li><strong>One-Time Link:</strong> The download link is typically for one-time use for security. Make sure you saved the PDF after clicking the link initially.</li>
                <li><strong>Contact Support:</strong> If you've checked the above and still have problems, please use the <a href="contact.html" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Contact Form</a> on our website. Provide your purchase email and transaction ID (if possible) so we can assist you quickly.</li>
            </ol>`;
            isHTMLResponse = true;
        }

        // --- Policy Questions ---
        else if (/\b(refund|return|money back|cancel order|dissatisfied)\b/.test(lowerMessage)) {
            response = `Please be aware of our strict <strong>NO REFUNDS</strong> policy. Due to the immediate digital delivery of the PDF guide, all sales are final and non-refundable once the purchase is completed. This is clearly stated in our <a href="terms.html" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Terms of Service</a>. We encourage you to ask any questions you have *before* purchasing.`;
            isHTMLResponse = true;
        }
        else if (/\b(terms|policy|tos|rules)\b/.test(lowerMessage)) {
            response = `You can find our full Terms of Service, which outline usage rights, disclaimers, our no-refund policy, and other important details, right here: <a href="terms.html" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Terms of Service</a>.`;
            isHTMLResponse = true;
        }
         else if (/\b(privacy|data collection|safe|secure)\b/.test(lowerMessage)) {
             response = `We take privacy seriously. We only collect minimal data needed for your purchase and delivery (Name, Email, Purchase History). Payments are handled securely via Razorpay, and we don't store your card details. Our approach is detailed in the Privacy section of our <a href="terms.html" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Terms of Service</a>.`;
             isHTMLResponse = true;
         }

        // --- Website Specifics ---
        else if (/\b(proof|testimonials|reviews|results|worked for others)\b/.test(lowerMessage)) {
            response = `Yes! Check out the "Proof It Works" section (<a href="#testimonials" style="color: var(--accent-color); text-decoration: underline;">click here</a>) on the main page. You'll find testimonials from students who found the focused approach helpful for their preparation. Remember, individual results vary!`;
            isHTMLResponse = true;
        }
        else if (/\b(domain.*banned|fuckjee.in|website.*issue|why.*new domain)\b/.test(lowerMessage)) {
            response = 'You\'re right, our previous domain (fuckJee.in) encountered issues and was unfortunately banned. We\'ve moved to this new domain to ensure continued access to the guide for students. Thanks for sticking with us!';
        }

        // --- Fallback Response ---
        else {
            response = `That's an interesting question! While I can answer queries about the AI guide, its features, pricing, purchase, delivery (PDF), and policies, I might not have the specific details for that. Could you perhaps rephrase? Or, if it's a complex issue, the <a href="contact.html" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Contact Form</a> is the best way to reach the human team.`;
            isHTMLResponse = true; // Allow link in fallback
            delay = 600; // Faster response for fallback
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

// --- Add CSS for Typing Indicator (in your chat.css or styles.css) ---
/*
.typing-indicator span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: var(--accent-color); // Or choose a suitable color
    border-radius: 50%;
    margin: 0 2px;
    opacity: 0;
    animation: typing 1s infinite;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.1s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.2s; }

@keyframes typing {
    0%, 100% { opacity: 0; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-3px); }
}

.chat-button.active { // Example style for active button
    box-shadow: 0 0 15px var(--accent-color);
}
*/