const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const ModelClient = require('@azure-rest/ai-inference').default;
const { AzureKeyCredential } = require('@azure/core-auth');
const { isUnexpected } = require('@azure-rest/ai-inference');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());

// GitHub Models endpoint
const GITHUB_MODELS_ENDPOINT = "https://models.github.ai/inference";

// Model configurations
const modelConfigs = {
    'openai/gpt-4.1': {
        token: process.env.OPENAI_GPT41_TOKEN,
        type: 'openai',
        name: 'OpenAI GPT-4.1'
    },
    'xai/grok-3': {
        token: process.env.GROK3_TOKEN,
        type: 'azure',
        name: 'Grok-3'
    },
    'openai/o1': {
        token: process.env.OPENAI_O1_TOKEN,
        type: 'openai',
        name: 'OpenAI O1'
    },
    'deepseek/DeepSeek-R1': {
        token: process.env.DEEPSEEK_R1_TOKEN,
        type: 'azure',
        name: 'DeepSeek R1'
    }
};

// Create OpenAI client for OpenAI models
function createOpenAIClient(token) {
    return new OpenAI({
        baseURL: GITHUB_MODELS_ENDPOINT,
        apiKey: token
    });
}

// Create Azure client for Azure-compatible models
function createAzureClient(token) {
    return ModelClient(
        GITHUB_MODELS_ENDPOINT,
        new AzureKeyCredential(token)
    );
}

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { model, messages, temperature = 1, max_tokens = 1000 } = req.body;

        if (!model || !messages) {
            return res.status(400).json({ 
                error: 'Model and messages are required' 
            });
        }

        const config = modelConfigs[model];
        if (!config) {
            return res.status(400).json({ 
                error: `Unsupported model: ${model}` 
            });
        }

        if (!config.token) {
            return res.status(500).json({ 
                error: `No API token configured for ${config.name}` 
            });
        }

        let response;

        if (config.type === 'openai') {
            // Handle OpenAI-compatible models
            const client = createOpenAIClient(config.token);

            const completion = await client.chat.completions.create({
                model: model,
                messages: messages,
                temperature: temperature,
                max_tokens: max_tokens
            });

            response = {
                choices: completion.choices.map(choice => ({
                    message: {
                        role: choice.message.role,
                        content: choice.message.content
                    }
                })),
                usage: completion.usage
            };
        } else {
            // Handle Azure AI Inference compatible models
            const client = createAzureClient(config.token);

            const result = await client.path("/chat/completions").post({
                body: {
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    max_tokens: max_tokens
                }
            });

            if (isUnexpected(result)) {
                throw new Error(result.body.error?.message || 'Azure AI Inference error');
            }

            response = {
                choices: result.body.choices.map(choice => ({
                    message: {
                        role: choice.message.role,
                        content: choice.message.content
                    }
                })),
                usage: result.body.usage
            };
        }

        res.json(response);

    } catch (error) {
        console.error('Chat API Error:', error);

        // Handle specific error types
        if (error.message.includes('unauthorized') || error.message.includes('403')) {
            res.status(401).json({ 
                error: 'Invalid API token or insufficient permissions' 
            });
        } else if (error.message.includes('rate limit')) {
            res.status(429).json({ 
                error: 'Rate limit exceeded. Please try again later.' 
            });
        } else if (error.message.includes('timeout')) {
            res.status(408).json({ 
                error: 'Request timeout. Please try again.' 
            });
        } else {
            res.status(500).json({ 
                error: error.message || 'Internal server error' 
            });
        }
    }
});

// Model list endpoint
app.get('/api/models', (req, res) => {
    const models = Object.keys(modelConfigs).map(modelId => ({
        id: modelId,
        name: modelConfigs[modelId].name,
        type: modelConfigs[modelId].type,
        available: !!modelConfigs[modelId].token
    }));

    res.json({ models });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        models: Object.keys(modelConfigs).length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 NeuraTalk Proxy Server running on port ${PORT}`);
    console.log(`📡 GitHub Models Endpoint: ${GITHUB_MODELS_ENDPOINT}`);
    console.log(`🔧 Available models: ${Object.keys(modelConfigs).length}`);
    console.log(`\n🌐 Access your NeuraTalk app at: http://localhost:3000`);
    console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
    console.log(`\n📋 Configured models:`);

    Object.entries(modelConfigs).forEach(([modelId, config]) => {
        const status = config.token ? '✅' : '❌';
        console.log(`   ${status} ${config.name} (${modelId})`);
    });
});
