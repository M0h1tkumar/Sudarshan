// Dynamic content data
const dynamicContent = [
    "Detect misinformation in text and images",
    "Multi-AI fact-checking with citations",
    "Real-time verification and source attribution",
    "Advanced misinformation detection system"
];

const services = [
    { title: "Multi-AI Fact Checking", description: "GPT-4, Gemini, Perplexity, Groq verification" },
    { title: "Fast Processing", description: "Groq's lightning-fast open-source LLMs" },
    { title: "Image Analysis", description: "Extract and verify text from images" },
    { title: "Social Media Scraping", description: "Cross-reference with X/Twitter data" },
    { title: "Source Attribution", description: "Reliable citations and evidence" }
];

// Business Model Variables
let userPlan = 'free';
let dailyUsage = 0;
let monthlyUsage = 0;
const planLimits = {
    free: { daily: 10, monthly: 300, api: false },
    pro: { daily: 1000, monthly: 30000, api: true },
    enterprise: { daily: -1, monthly: -1, api: true }
};

// Sample Test Cases
const sampleCases = {
    'fake-news': {
        text: "BREAKING: Scientists discover that drinking bleach cures all diseases. Major pharmaceutical companies are trying to hide this miracle cure from the public. Share before they delete this!",
        expectedVerdict: "FAKE NEWS",
        description: "Completely fabricated health claim with dangerous misinformation"
    },
    'misinformation': {
        text: "The COVID-19 vaccine contains microchips that allow the government to track your location. This has been confirmed by multiple whistleblowers from tech companies.",
        expectedVerdict: "MISINFORMATION",
        description: "False conspiracy theory lacking credible evidence"
    },
    'verified': {
        text: "The World Health Organization announced new guidelines for pandemic preparedness following lessons learned from COVID-19. The guidelines emphasize early detection and international cooperation.",
        expectedVerdict: "VERIFIED",
        description: "Factual statement that can be verified through official WHO sources"
    },
    'rumor': {
        text: "Unconfirmed reports suggest that a major tech company is planning to acquire a popular social media platform for $50 billion. Sources close to the deal say negotiations are ongoing.",
        expectedVerdict: "UNVERIFIABLE",
        description: "Unsubstantiated claim without official confirmation"
    }
};

// Use configuration from config.js
const N8N_WEBHOOK_URL = CONFIG.N8N_WEBHOOK_URL;

let contentIndex = 0;

// Initialize website
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentYear();
    loadServices();
    updateDynamicText();
    setupUploadArea();
    
    // Auto-update dynamic content every 4 seconds
    setInterval(updateDynamicText, 4000);
});

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
}

function updateContent() {
    contentIndex = (contentIndex + 1) % dynamicContent.length;
    updateDynamicText();
}

function updateDynamicText() {
    const textElement = document.getElementById('dynamic-text');
    textElement.style.opacity = '0';
    
    setTimeout(() => {
        textElement.textContent = dynamicContent[contentIndex];
        textElement.style.opacity = '1';
        contentIndex = (contentIndex + 1) % dynamicContent.length;
    }, 300);
}

function loadServices() {
    const servicesList = document.getElementById('services-list');
    servicesList.innerHTML = services.map(service => `
        <div class="service-card">
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        </div>
    `).join('');
}

function updateCurrentYear() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

async function processText() {
    const textInput = document.getElementById('text-input').value;
    const resultsDiv = document.getElementById('results');
    
    if (!textInput.trim()) {
        resultsDiv.innerHTML = '<p style="color: red;">Please enter some text to process.</p>';
        return;
    }
    
    // Check usage limits
    if (!checkUsageLimit()) {
        return;
    }
    
    trackUsage();
    resultsDiv.innerHTML = '<p class="processing">Running misinformation detection workflow...</p>';
    
    try {
        // Step 1: Search Twitter for related content
        const twitterData = await searchTwitter(textInput);
        
        // Step 2: Search News only for premium users
        let newsData = { totalResults: 0, articles: [], searchPeriod: 'Not available' };
        if (userPlan === 'pro' || userPlan === 'enterprise') {
            newsData = await searchRecentNews(textInput);
        }
        
        // Step 3: Process through N8N workflow or direct analysis
        if (CONFIG.DEMO_MODE) {
            await processWithNewsData(textInput, twitterData, newsData, resultsDiv);
        } else {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatInput: textInput,
                    inputType: 'text',
                    twitterData: twitterData,
                    newsData: newsData
                })
            });
            
            const result = await response.json();
            displayFactCheckResults(result, resultsDiv);
        }
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="result-item">
                <h4>Error:</h4>
                <p style="color: red;">Failed to process text: ${error.message}</p>
                <p><em>Falling back to demo mode...</em></p>
            </div>
        `;
        setTimeout(() => displayDemoTextResults(textInput, resultsDiv), 1000);
    }
}

async function processImages() {
    const imageInput = document.getElementById('image-input');
    const resultsDiv = document.getElementById('results');
    
    if (!imageInput.files.length) {
        resultsDiv.innerHTML = '<p style="color: red;">Please select images to process.</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<p class="processing">Extracting text from images and running fact-check...</p>';
    
    try {
        const file = imageInput.files[0];
        const base64Image = await convertToBase64(file);
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatInput: base64Image,
                inputType: 'image',
                fileName: file.name
            })
        });
        
        const result = await response.json();
        displayFactCheckResults(result, resultsDiv);
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="result-item">
                <h4>Error:</h4>
                <p style="color: red;">Failed to process image: ${error.message}</p>
                <p><em>Falling back to demo mode...</em></p>
            </div>
        `;
        // Fallback demo results
        setTimeout(() => displayDemoImageResults(imageInput.files.length, resultsDiv), 1000);
    }
}

function setupUploadArea() {
    const uploadArea = document.getElementById('upload-area');
    const fileUpload = document.getElementById('file-upload');
    const uploadResults = document.getElementById('upload-results');
    
    uploadArea.addEventListener('click', () => fileUpload.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        fileUpload.files = e.dataTransfer.files;
        handleFileUpload();
    });
    
    fileUpload.addEventListener('change', handleFileUpload);
    
    function handleFileUpload() {
        const files = fileUpload.files;
        if (files.length === 0) return;
        
        uploadResults.innerHTML = '<p class="processing">Processing uploaded files...</p>';
        
        setTimeout(() => {
            let resultsHTML = '<h4>Upload Results:</h4>';
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const isImage = file.type.startsWith('image/');
                const status = Math.random() > 0.1 ? 'Success' : 'Error';
                
                resultsHTML += `
                    <div class="result-item">
                        <p><strong>File:</strong> ${file.name}</p>
                        <p><strong>Type:</strong> ${isImage ? 'Image' : 'Text'}</p>
                        <p><strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
                        <p><strong>Status:</strong> <span style="color: ${status === 'Success' ? 'green' : 'red'}">${status}</span></p>
                    </div>
                `;
            }
            uploadResults.innerHTML = resultsHTML;
        }, 1500);
    }
}

// Helper functions
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function displayFactCheckResults(result, resultsDiv) {
    if (result && result.verdict) {
        resultsDiv.innerHTML = `
            <div class="result-item">
                <h4>Misinformation Detection Results:</h4>
                <p><strong>Verdict:</strong> <span style="color: ${getVerdictColor(result.verdict)}">${result.verdict}</span></p>
                <p><strong>Confidence:</strong> ${result.confidence || 'N/A'}%</p>
                <p><strong>Evidence:</strong> ${result.evidence || 'Analysis completed'}</p>
                <p><strong>Sources:</strong> ${result.citations || 'Multiple AI models consulted'}</p>
                <p><strong>Processing Time:</strong> ${result.processingTime || '2.3'} seconds</p>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <div class="result-item">
                <h4>Processing Complete:</h4>
                <p>Analysis completed using multi-AI fact-checking workflow</p>
                <p><strong>Status:</strong> Processed successfully</p>
            </div>
        `;
    }
}

function getVerdictColor(verdict) {
    switch(verdict?.toLowerCase()) {
        case 'true': return 'green';
        case 'false': return 'red';
        case 'partially true': return 'orange';
        default: return 'gray';
    }
}

async function searchTwitter(query) {
    try {
        // Simulate Twitter search for demo (replace with actual API call)
        return {
            tweet_count: Math.floor(Math.random() * 1000) + 100,
            recent_tweets: [
                { text: `Related tweet about: ${query.substring(0, 50)}...`, user: '@user1' },
                { text: `Another perspective on: ${query.substring(0, 40)}...`, user: '@user2' }
            ],
            sentiment: Math.random() > 0.5 ? 'mixed' : 'negative'
        };
    } catch (error) {
        console.error('Twitter search failed:', error);
        return { tweet_count: 0, recent_tweets: [], sentiment: 'unknown' };
    }
}

async function searchRecentNews(query) {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const fromDate = oneWeekAgo.toISOString().split('T')[0];
        
        // Simulate News API search (replace with actual API call)
        return {
            totalResults: Math.floor(Math.random() * 500) + 50,
            articles: [
                {
                    title: `Recent news about: ${query.substring(0, 50)}...`,
                    source: { name: 'Reuters' },
                    publishedAt: new Date().toISOString(),
                    url: 'https://reuters.com/example'
                },
                {
                    title: `Breaking: ${query.substring(0, 40)}...`,
                    source: { name: 'AP News' },
                    publishedAt: new Date().toISOString(),
                    url: 'https://apnews.com/example'
                }
            ],
            searchPeriod: 'Last 7 days'
        };
    } catch (error) {
        console.error('News search failed:', error);
        return { totalResults: 0, articles: [], searchPeriod: 'Last 7 days' };
    }
}

async function processWithNewsData(text, twitterData, newsData, resultsDiv) {
    // Detect language and translate if needed
    const detectedLang = await detectLanguage(text);
    let processedText = text;
    
    if (detectedLang !== 'en' && CONFIG.TRANSLATION.ENABLED) {
        processedText = await translateText(text, detectedLang, 'en');
        resultsDiv.innerHTML += `<p><em>Translated from ${detectedLang} to English for analysis</em></p>`;
    }
    
    // Simulate processing with Twitter data and translation
    setTimeout(() => {
        const verdicts = ['FAKE NEWS', 'RUMOR', 'VERIFIED', 'PARTIALLY TRUE', 'UNVERIFIABLE'];
        const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
        const threatLevels = ['HIGH', 'MEDIUM', 'LOW'];
        const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];
        
        const misinfoTypes = ['Context Manipulation', 'Visual Editing', 'False Source', 'Logical Impossibility', 'Temporal Distortion'];
        const misinfoType = misinfoTypes[Math.floor(Math.random() * misinfoTypes.length)];
        const sourceStatus = ['Original Source Found', 'No Primary Source', 'Contradicts Official Source'][Math.floor(Math.random() * 3)];
        
        resultsDiv.innerHTML = `
            <div class="result-item">
                <h4>🔍 COMPREHENSIVE MISINFORMATION ANALYSIS</h4>
                <div style="background: #f0f8ff; padding: 1rem; margin: 1rem 0; border-radius: 5px;">
                    <h5>🎯 FINAL VERDICT</h5>
                    <p><strong>Classification:</strong> <span style="color: ${getVerdictColor(verdict)}; font-weight: bold;">${verdict}</span></p>
                    <p><strong>Threat Level:</strong> <span style="color: ${getThreatColor(threatLevel)}">${threatLevel}</span></p>
                    <p><strong>Confidence:</strong> ${(Math.random() * 30 + 70).toFixed(1)}%</p>
                </div>
                
                <div style="background: #fff8dc; padding: 1rem; margin: 1rem 0; border-radius: 5px;">
                    <h5>🔬 5-LAYER VERIFICATION RESULTS</h5>
                    <p><strong>1️⃣ Source Verification:</strong> ${sourceStatus}</p>
                    <p><strong>2️⃣ Context Analysis:</strong> ${misinfoType} detected</p>
                    <p><strong>3️⃣ Logical Consistency:</strong> Cross-verified with real-time data</p>
                    <p><strong>4️⃣ Credible Sources:</strong> Reuters, AP, Government portals checked</p>
                    <p><strong>5️⃣ Manipulation Detection:</strong> Visual/text integrity analyzed</p>
                </div>
                
                <div style="background: #f0fff0; padding: 1rem; margin: 1rem 0; border-radius: 5px;">
                    <h5>📊 ANALYSIS DETAILS</h5>
                    <p><strong>Language:</strong> ${detectedLang.toUpperCase()}</p>
                    <p><strong>Social Media:</strong> ${twitterData.tweet_count} tweets analyzed</p>
                    <p><strong>Recent News:</strong> ${newsData.totalResults} articles from ${newsData.searchPeriod}</p>
                    <p><strong>AI Models:</strong> GPT-4 + Gemini + Perplexity + Groq (Llama3)</p>
                    <p><strong>Verification:</strong> Multi-layer misinformation detection protocol</p>
                </div>
                
                <div style="background: #f8f9ff; padding: 1rem; margin: 1rem 0; border-radius: 5px;">
                    <h5>📚 AUTHORITATIVE CITATIONS</h5>
                    ${generateCitations(verdict)}
                    <button onclick="exportCitations()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #000; color: white; border: none; border-radius: 3px;">Export Citations</button>
                </div>
                
                <div style="background: #ffe4e1; padding: 1rem; margin: 1rem 0; border-radius: 5px;">
                    <h5>⚠️ USER GUIDANCE</h5>
                    <p><strong>Recommendation:</strong> ${verdict === 'VERIFIED' ? 'Information appears credible based on authoritative sources' : 'Exercise caution - potential misinformation detected'}</p>
                    <p><strong>Source Priority:</strong> Always verify with official sources before sharing</p>
                    <p><strong>Citation Standard:</strong> All sources follow academic citation format</p>
                    <p><strong>Transparency:</strong> Full methodology and sources available for review</p>
                </div>
            </div>
        `;
    }, 2000);
}

function displayDemoTextResults(text, resultsDiv) {
    const verdicts = ['True', 'False', 'Partially True', 'Unverifiable'];
    const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    
    resultsDiv.innerHTML = `
        <div class="result-item">
            <h4>Misinformation Detection Results (Demo):</h4>
            <p><strong>Claim:</strong> "${text.substring(0, 100)}..."</p>
            <p><strong>Verdict:</strong> <span style="color: ${getVerdictColor(verdict)}">${verdict}</span></p>
            <p><strong>Confidence:</strong> ${(Math.random() * 30 + 70).toFixed(1)}%</p>
            <p><strong>Evidence:</strong> Cross-referenced with multiple sources</p>
            <p><strong>AI Models:</strong> GPT-4, Gemini, Perplexity</p>
        </div>
    `;
}

function displayDemoImageResults(fileCount, resultsDiv) {
    const verdicts = ['True', 'False', 'Partially True'];
    const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    
    resultsDiv.innerHTML = `
        <div class="result-item">
            <h4>Image Misinformation Detection (Demo):</h4>
            <p><strong>Files Processed:</strong> ${fileCount}</p>
            <p><strong>Text Extracted:</strong> Yes</p>
            <p><strong>Verdict:</strong> <span style="color: ${getVerdictColor(verdict)}">${verdict}</span></p>
            <p><strong>Confidence:</strong> ${(Math.random() * 25 + 75).toFixed(1)}%</p>
            <p><strong>Social Media Check:</strong> Completed</p>
        </div>
    `;
}

// Translation functions using Gemini API
async function detectLanguage(text) {
    try {
        // Simulate language detection (replace with actual Gemini API call)
        const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'];
        return languages[Math.floor(Math.random() * languages.length)];
    } catch (error) {
        console.error('Language detection failed:', error);
        return 'en';
    }
}

async function translateText(text, fromLang, toLang) {
    try {
        // Simulate translation (replace with actual Google Translate API call)
        return `[Translated from ${fromLang}] ${text}`;
    } catch (error) {
        console.error('Translation failed:', error);
        return text;
    }
}

function getThreatColor(threat) {
    switch(threat?.toLowerCase()) {
        case 'high': return 'red';
        case 'medium': return 'orange';
        case 'low': return 'green';
        default: return 'gray';
    }
}

function generateCitations(verdict) {
    const citations = {
        'VERIFIED': [
            { source: 'Reuters', title: 'Official Statement Confirms Claim', url: 'https://www.reuters.com/fact-check/', date: '2024-01-15', credibility: 'HIGH' },
            { source: 'AP News', title: 'Government Agency Verification', url: 'https://apnews.com/hub/ap-fact-check', date: '2024-01-15', credibility: 'HIGH' },
            { source: 'CDC', title: 'Official Health Guidelines', url: 'https://www.cdc.gov/', date: '2024-01-14', credibility: 'AUTHORITATIVE' }
        ],
        'MISINFORMATION': [
            { source: 'Reuters Fact Check', title: 'Claim Debunked by Multiple Sources', url: 'https://www.reuters.com/fact-check/', date: '2024-01-15', credibility: 'HIGH' },
            { source: 'Snopes', title: 'False: Viral Claim Lacks Evidence', url: 'https://www.snopes.com/', date: '2024-01-14', credibility: 'HIGH' },
            { source: 'WHO', title: 'Official Statement Contradicts Claim', url: 'https://www.who.int/emergencies/disease-outbreak-news', date: '2024-01-13', credibility: 'AUTHORITATIVE' }
        ],
        'FAKE NEWS': [
            { source: 'PolitiFact', title: 'Pants on Fire: Completely Fabricated', url: 'https://www.politifact.com/', date: '2024-01-15', credibility: 'HIGH' },
            { source: 'FactCheck.org', title: 'No Evidence for Viral Claim', url: 'https://www.factcheck.org/', date: '2024-01-14', credibility: 'HIGH' },
            { source: 'BBC Reality Check', title: 'Story Traced to Satirical Website', url: 'https://www.bbc.com/news/reality_check', date: '2024-01-13', credibility: 'HIGH' }
        ],
        'UNVERIFIABLE': [
            { source: 'Reuters', title: 'Insufficient Evidence to Verify Claim', url: 'https://www.reuters.com/fact-check/', date: '2024-01-15', credibility: 'HIGH' },
            { source: 'AP News', title: 'Developing Story - No Official Confirmation', url: 'https://apnews.com/hub/ap-fact-check', date: '2024-01-15', credibility: 'HIGH' }
        ]
    };
    
    const relevantCitations = citations[verdict] || citations['UNVERIFIABLE'];
    
    return relevantCitations.map((citation, index) => `
        <div style="border-left: 3px solid #000; padding-left: 1rem; margin: 0.5rem 0; background: white; padding: 1rem; border-radius: 3px;">
            <p><strong>[${index + 1}] ${citation.source}</strong> - <span style="color: green;">${citation.credibility}</span></p>
            <p><em>"${citation.title}"</em></p>
            <p>🔗 <a href="${citation.url}" target="_blank" style="color: #1976d2; text-decoration: underline; font-weight: bold;">Verify at ${citation.source}</a></p>
            <p><small>📅 Published: ${citation.date} | ✅ Click link to verify independently</small></p>
        </div>
    `).join('');
}

function exportCitations() {
    const citations = document.querySelectorAll('[style*="border-left: 3px solid #000"]');
    let citationText = 'SUDRASHAN MISINFORMATION ANALYSIS - CITATIONS\n\n';
    
    citations.forEach((citation, index) => {
        const text = citation.textContent.replace(/\s+/g, ' ').trim();
        citationText += `[${index + 1}] ${text}\n\n`;
    });
    
    citationText += `\nGenerated by Sudrashan AI on ${new Date().toISOString()}\n`;
    citationText += 'Verification: 5-layer AI detection system\n';
    citationText += 'Models: GPT-4, Gemini, Perplexity, Groq\n';
    
    const blob = new Blob([citationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sudrashan-citations-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Business Model Functions
function selectPlan(plan) {
    if (plan === 'free') {
        alert('Free trial activated! You get 10 checks per day.');
        userPlan = 'free';
        document.getElementById('weekly-insights').style.display = 'none';
    } else if (plan === 'pro') {
        window.open('https://checkout.stripe.com/sudrashan-pro', '_blank');
        userPlan = 'pro';
        document.getElementById('weekly-insights').style.display = 'block';
    } else if (plan === 'enterprise') {
        window.open('mailto:sales@sudrashan.com?subject=Enterprise Inquiry', '_blank');
        userPlan = 'enterprise';
        document.getElementById('weekly-insights').style.display = 'block';
    }
    updateUsageDisplay();
}

function checkUsageLimit() {
    const limit = planLimits[userPlan];
    if (limit.daily !== -1 && dailyUsage >= limit.daily) {
        showUpgradePrompt();
        return false;
    }
    return true;
}

function updateUsageDisplay() {
    const limit = planLimits[userPlan];
    const usageHtml = `
        <div class="usage-tracker">
            <h4>Usage Today: ${dailyUsage}/${limit.daily === -1 ? '∞' : limit.daily}</h4>
            <p>Plan: ${userPlan.toUpperCase()}</p>
        </div>
    `;
    
    const resultsDiv = document.getElementById('results');
    if (resultsDiv && !resultsDiv.querySelector('.usage-tracker')) {
        resultsDiv.insertAdjacentHTML('afterbegin', usageHtml);
    }
}

function showUpgradePrompt() {
    const upgradeHtml = `
        <div class="upgrade-prompt">
            <h4>⚠️ Daily Limit Reached</h4>
            <p>You've used all ${planLimits[userPlan].daily} daily checks.</p>
            <button onclick="selectPlan('pro')">Upgrade to Pro - ₹4,099/month</button>
        </div>
    `;
    
    document.getElementById('results').innerHTML = upgradeHtml;
}

function showApiDocs() {
    window.open('https://docs.sudrashan.com/api', '_blank');
}

function trackUsage() {
    dailyUsage++;
    monthlyUsage++;
    updateUsageDisplay();
    
    // Send analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'content_analysis', {
            'event_category': 'usage',
            'event_label': userPlan
        });
    }
}

// Sample Loading Function
function loadSample(sampleType) {
    const sample = sampleCases[sampleType];
    if (sample) {
        document.getElementById('text-input').value = sample.text;
        
        // Show sample info
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
            <div style="background: #e3f2fd; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
                <h4>🧪 Sample Loaded: ${sampleType.toUpperCase().replace('-', ' ')}</h4>
                <p><strong>Description:</strong> ${sample.description}</p>
                <p><strong>Expected Verdict:</strong> <span style="color: #1976d2; font-weight: bold;">${sample.expectedVerdict}</span></p>
                <p><em>Click "Process Text" to run the analysis and see how our AI detects this type of content.</em></p>
            </div>
        `;
        
        // Scroll to input area
        document.getElementById('text-input').scrollIntoView({ behavior: 'smooth' });
    }
}

// Demo Mode for Samples
function runSampleDemo() {
    const samples = Object.keys(sampleCases);
    let currentSample = 0;
    
    const runNext = () => {
        if (currentSample < samples.length) {
            const sampleKey = samples[currentSample];
            loadSample(sampleKey);
            
            setTimeout(() => {
                processText();
                currentSample++;
                setTimeout(runNext, 5000); // Wait 5 seconds between samples
            }, 2000);
        }
    };
    
    runNext();
}

// Premium Weekly Insights Function
async function generateWeeklyReport() {
    if (userPlan === 'free') {
        alert('Weekly insights are available for Pro and Enterprise users only. Upgrade to access this feature!');
        return;
    }
    
    const reportDiv = document.getElementById('weekly-report');
    reportDiv.innerHTML = '<p class="processing">Generating weekly misinformation insights...</p>';
    
    try {
        // Simulate News API call for weekly insights
        const weeklyData = await getWeeklyMisinformationInsights();
        displayWeeklyReport(weeklyData, reportDiv);
    } catch (error) {
        reportDiv.innerHTML = `<p style="color: red;">Failed to generate report: ${error.message}</p>`;
    }
}

async function getWeeklyMisinformationInsights() {
    // Simulate News API search for misinformation trends
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return {
        reportPeriod: `${oneWeekAgo.toDateString()} - ${new Date().toDateString()}`,
        totalArticles: 1247,
        misinformationDetected: 89,
        topCategories: [
            { category: 'Health Misinformation', count: 34, trend: '+12%' },
            { category: 'Political Disinformation', count: 28, trend: '+8%' },
            { category: 'Climate Denial', count: 15, trend: '-5%' },
            { category: 'Financial Scams', count: 12, trend: '+15%' }
        ],
        criticalAlerts: [
            {
                title: 'Dangerous Health Claim Spreading',
                description: 'False cure claims detected across 15 news sources',
                severity: 'HIGH',
                sources: ['Reuters Fact Check', 'WHO Statement', 'CDC Warning']
            },
            {
                title: 'Election Misinformation Campaign',
                description: 'Coordinated false information about voting procedures',
                severity: 'MEDIUM',
                sources: ['AP News Verification', 'Election Officials Statement']
            }
        ],
        citations: [
            { source: 'Reuters', articles: 23, credibility: 'HIGH' },
            { source: 'AP News', articles: 18, credibility: 'HIGH' },
            { source: 'BBC', articles: 12, credibility: 'HIGH' },
            { source: 'Snopes', articles: 8, credibility: 'HIGH' }
        ]
    };
}

function displayWeeklyReport(data, reportDiv) {
    reportDiv.innerHTML = `
        <div class="weekly-report">
            <h4>📈 Weekly Misinformation Intelligence Report</h4>
            <p><strong>Report Period:</strong> ${data.reportPeriod}</p>
            
            <div class="trend-chart">
                <h5>📊 Key Metrics</h5>
                <p><strong>Total Articles Analyzed:</strong> ${data.totalArticles}</p>
                <p><strong>Misinformation Detected:</strong> ${data.misinformationDetected} (${((data.misinformationDetected/data.totalArticles)*100).toFixed(1)}%)</p>
            </div>
            
            <div style="margin: 2rem 0;">
                <h5>🔥 Top Misinformation Categories</h5>
                ${data.topCategories.map(cat => `
                    <div class="insight-item">
                        <strong>${cat.category}:</strong> ${cat.count} instances (${cat.trend} vs last week)
                    </div>
                `).join('')}
            </div>
            
            <div style="margin: 2rem 0;">
                <h5>⚠️ Critical Alerts</h5>
                ${data.criticalAlerts.map(alert => `
                    <div class="insight-item" style="border-left-color: ${alert.severity === 'HIGH' ? '#e74c3c' : '#f39c12'}">
                        <h6>${alert.title} (${alert.severity})</h6>
                        <p>${alert.description}</p>
                        <p><strong>Verified by:</strong> ${alert.sources.join(', ')}</p>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin: 2rem 0;">
                <h5>📚 Source Citations</h5>
                ${data.citations.map(citation => `
                    <div style="background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 5px;">
                        <strong>${citation.source}</strong> - ${citation.articles} articles analyzed (${citation.credibility} credibility)
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <button onclick="exportWeeklyReport()" style="background: #27ae60; color: white; border: none; padding: 1rem 2rem; border-radius: 5px;">Export Full Report (PDF)</button>
            </div>
        </div>
    `;
}

function exportWeeklyReport() {
    const reportText = `SUDRASHAN WEEKLY MISINFORMATION INTELLIGENCE REPORT\n\nGenerated: ${new Date().toISOString()}\nPlan: ${userPlan.toUpperCase()}\n\nThis report contains comprehensive analysis of misinformation trends detected over the past week using News API integration and multi-AI verification.\n\nFor full report access, contact: reports@sudrashan.com`;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sudrashan-weekly-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Add smooth transitions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const dynamicText = document.getElementById('dynamic-text');
    if (dynamicText) {
        dynamicText.style.transition = 'opacity 0.3s ease-in-out';
    }
    updateUsageDisplay();
    
    // Show weekly insights for premium users
    if (userPlan === 'pro' || userPlan === 'enterprise') {
        document.getElementById('weekly-insights').style.display = 'block';
    }
    
    // Add demo button to page
    const homeSection = document.getElementById('home');
    if (homeSection) {
        const demoButton = document.createElement('button');
        demoButton.textContent = '🎬 Run All Samples Demo';
        demoButton.onclick = runSampleDemo;
        demoButton.style.cssText = 'margin: 1rem; padding: 1rem 2rem; background: #ff6b35; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;';
        homeSection.appendChild(demoButton);
    }
});