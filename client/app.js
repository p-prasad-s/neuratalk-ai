// NeuraTalk AI Chat Application
class NeuraTalkAI {
    constructor() {
        this.currentModel = 'openai/gpt-4.1';
        this.chatHistory = [];
        this.isTyping = false;
        this.settings = {
            temperature: 1.0,
            maxTokens: 1000
        };
        
        this.models = {
            'openai/gpt-4.1': {
                name: 'OpenAI GPT-4.1',
                description: 'General Intelligence - Balanced and knowledgeable responses',
                personality: 'intelligent',
                color: '#00d4ff',
                responses: [
                    "I'd be happy to help you with that. Let me provide a comprehensive explanation...",
                    "That's an interesting question. Based on my understanding...",
                    "I can certainly assist you with this topic. Here's what I know...",
                    "Let me break this down for you in a clear and structured way...",
                    "This is a complex topic, but I'll explain it step by step..."
                ]
            },
            'xai/grok-3': {
                name: 'Grok-3',
                description: 'Creative & Witty - Humorous and engaging conversations',
                personality: 'witty',
                color: '#8b5cf6',
                responses: [
                    "Well, well! That's a delightfully intriguing question! 🤔✨",
                    "Ah, I see what you're getting at! Let me put on my thinking cap... 🎩",
                    "Interesting! You've stumbled upon a fascinating topic. Let me enlighten you with some wit!",
                    "Oh, this is fun! *adjusts virtual monocle* Let me regale you with some knowledge...",
                    "Buckle up, buttercup! We're about to dive into some seriously cool stuff! 🚀"
                ]
            },
            'openai/o1': {
                name: 'OpenAI O1',
                description: 'Reasoning Expert - Logical and analytical thinking',
                personality: 'analytical',
                color: '#ec4899',
                responses: [
                    "Let me think through this step by step:\n\n1. First, I need to analyze...\n2. Then, I should consider...\n3. Finally, I can conclude...",
                    "This requires careful reasoning. Let me break it down systematically...",
                    "I need to approach this logically. Here's my reasoning process...",
                    "Let me work through this methodically:\n\n→ Initial observation:\n→ Key factors to consider:\n→ Logical conclusion:",
                    "This is an interesting problem that requires structured thinking. Let me analyze it..."
                ]
            },
            'deepseek/DeepSeek-R1': {
                name: 'DeepSeek R1',
                description: 'Technical Specialist - Detailed technical explanations',
                personality: 'technical',
                color: '#00ff88',
                responses: [
                    "From a technical perspective, this involves several key components:\n\n• Architecture: ...\n• Implementation: ...\n• Performance considerations: ...",
                    "Let me provide a detailed technical analysis of this topic...",
                    "This is a complex technical subject. Here's a comprehensive breakdown...",
                    "Technical Implementation Details:\n\n```\nCore Components:\n- System Architecture\n- Data Flow\n- Optimization Strategies\n```",
                    "Deep technical analysis reveals multiple layers of complexity. Let me explain each component..."
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.populateModelSelector();
        this.bindEventListeners();
        this.updateModelInfo();
        this.updateModelIndicator();
        this.setupSliders();
    }
    
    populateModelSelector() {
        const modelSelector = document.getElementById('model-selector');
        if (modelSelector) {
            modelSelector.innerHTML = '';
            
            Object.keys(this.models).forEach(modelId => {
                const model = this.models[modelId];
                const option = document.createElement('option');
                option.value = modelId;
                option.textContent = `${model.name} - ${model.description.split(' - ')[1]}`;
                modelSelector.appendChild(option);
            });
            
            modelSelector.value = this.currentModel;
        }
    }
    
    bindEventListeners() {
        // Model selector
        const modelSelector = document.getElementById('model-selector');
        if (modelSelector) {
            modelSelector.addEventListener('change', (e) => {
                this.currentModel = e.target.value;
                this.updateModelInfo();
                this.updateModelIndicator();
                this.addSystemMessage(`Switched to ${this.models[this.currentModel].name}`);
            });
        }
        
        // Chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Send button
        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        // Settings button - find by text content
        const headerButtons = document.querySelectorAll('.header-controls .btn');
        headerButtons.forEach(button => {
            if (button.textContent.trim().includes('Settings')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleSettings();
                });
            }
            if (button.textContent.trim().includes('Clear')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.clearChat();
                });
            }
        });
        
        // Close settings button
        const closeSettingsButton = document.querySelector('.close-settings');
        if (closeSettingsButton) {
            closeSettingsButton.addEventListener('click', () => {
                this.toggleSettings();
            });
        }
        
        // Welcome screen button
        const startButton = document.querySelector('.cyber-button');
        if (startButton) {
            startButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.startChat();
            });
        }
    }
    
    setupSliders() {
        const temperatureSlider = document.getElementById('temperature-slider');
        const maxTokensSlider = document.getElementById('max-tokens-slider');
        
        if (temperatureSlider) {
            temperatureSlider.addEventListener('input', (e) => {
                this.settings.temperature = parseFloat(e.target.value);
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay) {
                    valueDisplay.textContent = this.settings.temperature.toFixed(1);
                }
            });
        }
        
        if (maxTokensSlider) {
            maxTokensSlider.addEventListener('input', (e) => {
                this.settings.maxTokens = parseInt(e.target.value);
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay) {
                    valueDisplay.textContent = this.settings.maxTokens;
                }
            });
        }
    }
    
    startChat() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const mainApp = document.getElementById('main-app');
        
        if (welcomeScreen && mainApp) {
            welcomeScreen.style.animation = 'fadeOut 0.5s ease-out forwards';
            
            setTimeout(() => {
                welcomeScreen.classList.add('hidden');
                mainApp.classList.remove('hidden');
                mainApp.style.animation = 'appSlide 0.8s ease-out';
            }, 500);
        }
    }
    
    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response
        setTimeout(() => {
            this.generateAIResponse(message);
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
    
    addMessage(content, sender, modelName = null) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message--${sender}`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let messageHTML = '';
        if (sender === 'ai' && modelName) {
            messageHTML += `<div class="message-model">${modelName}</div>`;
        }
        messageHTML += `<div class="message-content">${content}</div>`;
        messageHTML += `<div class="message-timestamp">${timestamp}</div>`;
        
        messageDiv.innerHTML = messageHTML;
        chatMessages.appendChild(messageDiv);
        
        // Smooth scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to history
        this.chatHistory.push({
            content,
            sender,
            timestamp: new Date(),
            model: sender === 'ai' ? this.currentModel : null
        });
    }
    
    addSystemMessage(content) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'welcome-message';
        messageDiv.innerHTML = `
            <div class="system-message">
                <span class="system-icon">⚡</span>
                <span>${content}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    showTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            this.isTyping = true;
            
            // Scroll to show typing indicator
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 100);
            }
        }
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.classList.add('hidden');
            this.isTyping = false;
        }
    }
    
    generateAIResponse(userMessage) {
        const model = this.models[this.currentModel];
        let response = '';
        
        // Generate contextual response based on user message
        if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
            response = this.generateGreeting();
        } else if (userMessage.toLowerCase().includes('how are you')) {
            response = this.generateStatusResponse();
        } else if (userMessage.toLowerCase().includes('what') || userMessage.toLowerCase().includes('explain')) {
            response = this.generateExplanationResponse();
        } else if (userMessage.toLowerCase().includes('help')) {
            response = this.generateHelpResponse();
        } else {
            // Random response from model's personality
            const responses = model.responses;
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Add personality-specific modifications
        response = this.addPersonalityTwist(response, userMessage);
        
        this.hideTypingIndicator();
        this.addMessage(response, 'ai', model.name);
    }
    
    generateGreeting() {
        const greetings = {
            'openai/gpt-4.1': "Hello! I'm GPT-4.1, ready to assist you with any questions or topics you'd like to explore.",
            'xai/grok-3': "Hey there, fellow human! 👋 Grok-3 here, ready to chat about literally anything under the sun (or any other star, for that matter)!",
            'openai/o1': "Greetings. I'm O1, designed for systematic reasoning and analysis. How may I assist you today?",
            'deepseek/DeepSeek-R1': "Hello! DeepSeek R1 online. I'm optimized for technical discussions and detailed analysis. What would you like to explore?"
        };
        
        return greetings[this.currentModel] || greetings['openai/gpt-4.1'];
    }
    
    generateStatusResponse() {
        const responses = {
            'openai/gpt-4.1': "I'm functioning optimally and ready to help with any questions you might have!",
            'xai/grok-3': "I'm feeling absolutely electric! ⚡ Like a digital dolphin swimming through seas of data! How are you doing?",
            'openai/o1': "System status: Operational. All reasoning modules are functioning within normal parameters.",
            'deepseek/DeepSeek-R1': "All systems operational. Processing power at 100%, ready for complex technical queries."
        };
        
        return responses[this.currentModel] || responses['openai/gpt-4.1'];
    }
    
    generateExplanationResponse() {
        const responses = {
            'openai/gpt-4.1': "I'd be happy to explain that topic. Could you be more specific about what you'd like me to clarify?",
            'xai/grok-3': "Ooh, a mystery to unravel! 🕵️ I love a good explanation request. What's got you curious today?",
            'openai/o1': "I can provide a systematic explanation. Please specify the topic you'd like me to analyze.",
            'deepseek/DeepSeek-R1': "I can provide detailed technical explanations. Please specify the subject area for comprehensive analysis."
        };
        
        return responses[this.currentModel] || responses['openai/gpt-4.1'];
    }
    
    generateHelpResponse() {
        const responses = {
            'openai/gpt-4.1': "I'm here to help! You can ask me about any topic, and I'll do my best to provide useful information.",
            'xai/grok-3': "Help is my middle name! (Well, actually it's 'Grok', but you get the idea 😄) What can I assist you with?",
            'openai/o1': "I can provide assistance through logical analysis and structured reasoning. What do you need help with?",
            'deepseek/DeepSeek-R1': "I specialize in technical assistance and detailed problem-solving. What challenge are you facing?"
        };
        
        return responses[this.currentModel] || responses['openai/gpt-4.1'];
    }
    
    addPersonalityTwist(response, userMessage) {
        const model = this.models[this.currentModel];
        
        // Add some contextual awareness
        if (userMessage.toLowerCase().includes('code') || userMessage.toLowerCase().includes('programming')) {
            if (model.personality === 'technical') {
                response += "\n\nI can provide specific implementation details, code examples, or architectural guidance if needed.";
            } else if (model.personality === 'witty') {
                response += "\n\nCoding, eh? Time to make some digital magic happen! ✨💻";
            }
        }
        
        if (userMessage.toLowerCase().includes('joke') || userMessage.toLowerCase().includes('funny')) {
            if (model.personality === 'witty') {
                response += "\n\nWhy did the AI cross the road? To get to the other site! 🤖";
            }
        }
        
        return response;
    }
    
    updateModelInfo() {
        const modelInfo = document.getElementById('model-info');
        if (modelInfo) {
            const model = this.models[this.currentModel];
            
            modelInfo.innerHTML = `
                <div class="model-name">${model.name}</div>
                <div class="model-description">${model.description}</div>
            `;
        }
    }
    
    updateModelIndicator() {
        const indicator = document.getElementById('model-indicator');
        if (indicator) {
            const model = this.models[this.currentModel];
            
            indicator.style.background = model.color;
            indicator.style.boxShadow = `0 0 10px ${model.color}`;
        }
    }
    
    toggleSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('active');
            console.log('Settings panel toggled:', settingsPanel.classList.contains('active'));
        }
    }
    
    clearChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="system-message">
                        <span class="system-icon">⚡</span>
                        <span>Chat cleared. Neural link ready for new conversations!</span>
                    </div>
                </div>
            `;
            this.chatHistory = [];
        }
    }
    
    // Utility methods
    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    // Error handling
    showError(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message message--ai';
        errorDiv.innerHTML = `
            <div class="message-content" style="color: #ff6b6b;">
                ⚠️ Error: ${message}
            </div>
            <div class="message-timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        chatMessages.appendChild(errorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing NeuraTalk AI...');
    
    window.neuraTalk = new NeuraTalkAI();
    
    // Add some CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes bounceIn {
            from { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            to { transform: scale(1); opacity: 1; }
        }
        
        .message--user {
            animation: slideInRight 0.3s ease-out;
        }
        
        .message--ai {
            animation: slideInLeft 0.3s ease-out;
        }
        
        .cyber-button {
            animation: bounceIn 0.6s ease-out 0.5s both;
        }
        
        @keyframes particleExplode {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(var(--dx), var(--dy)) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add some interactive effects
    document.addEventListener('mousemove', (e) => {
        const cursor = document.querySelector('.cursor');
        if (!cursor) {
            const cursorDiv = document.createElement('div');
            cursorDiv.className = 'cursor';
            cursorDiv.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, rgba(0,212,255,0.5) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: screen;
                transition: transform 0.1s ease;
            `;
            document.body.appendChild(cursorDiv);
        }
        
        const cursor2 = document.querySelector('.cursor');
        if (cursor2) {
            cursor2.style.left = e.clientX - 10 + 'px';
            cursor2.style.top = e.clientY - 10 + 'px';
        }
    });
    
    // Add particle effects for buttons
    document.querySelectorAll('.cyber-button, .send-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            for (let i = 0; i < 6; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: 4px;
                    height: 4px;
                    background: var(--cyber-primary);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: particleExplode 0.6s ease-out forwards;
                `;
                
                const angle = (Math.PI * 2 * i) / 6;
                const velocity = 30 + Math.random() * 20;
                
                particle.style.setProperty('--dx', Math.cos(angle) * velocity + 'px');
                particle.style.setProperty('--dy', Math.sin(angle) * velocity + 'px');
                
                button.appendChild(particle);
                
                setTimeout(() => particle.remove(), 600);
            }
        });
    });
    
    console.log('🚀 NeuraTalk AI initialized successfully!');
    console.log('🤖 Demo mode - all responses are simulated');
    console.log('💡 Switch between models to experience different AI personalities');
});