const OpenAI = require('openai');

class ImageAnalysisService {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async analyzeImage(imageUrl) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this image for signs of manipulation, deepfakes, or misinformation. Provide verdict (AUTHENTIC/MANIPULATED/SUSPICIOUS) and confidence score." },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ]
                }],
                max_tokens: 1000
            });

            return this.parseImageAnalysis(response.choices[0].message.content);
        } catch (error) {
            console.error('Image analysis failed:', error);
            throw error;
        }
    }

    async detectDeepfake(imageUrl) {
        // Deepfake detection using specialized models
        const analysis = await this.analyzeImage(imageUrl);
        
        return {
            isDeepfake: analysis.verdict === 'MANIPULATED',
            confidence: analysis.confidence,
            indicators: analysis.indicators || []
        };
    }

    async extractText(imageUrl) {
        // OCR functionality
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: "Extract all text from this image." },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ]
                }],
                max_tokens: 500
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('OCR failed:', error);
            return null;
        }
    }

    parseImageAnalysis(response) {
        const verdictMatch = response.match(/(?:VERDICT|CLASSIFICATION):\s*(AUTHENTIC|MANIPULATED|SUSPICIOUS)/i);
        const confidenceMatch = response.match(/(?:CONFIDENCE|SCORE):\s*(\d+)/i);

        return {
            verdict: verdictMatch ? verdictMatch[1].toUpperCase() : 'SUSPICIOUS',
            confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
            analysis: response,
            timestamp: new Date().toISOString()
        };
    }

    async reverseImageSearch(imageUrl) {
        // Integrate with reverse image search APIs
        // Google Vision API, TinEye, etc.
        return {
            sources: [],
            firstSeen: null,
            similarImages: []
        };
    }
}

module.exports = ImageAnalysisService;
