class NewsAPIService {
    constructor() {
        this.apiKey = process.env.NEWS_API_KEY;
        this.baseUrl = 'https://newsapi.org/v2';
    }

    async searchNews(query, options = {}) {
        const params = new URLSearchParams({
            q: query,
            apiKey: this.apiKey,
            language: options.language || 'en',
            sortBy: options.sortBy || 'relevancy',
            pageSize: options.pageSize || 10
        });

        const response = await fetch(`${this.baseUrl}/everything?${params}`);
        const data = await response.json();

        if (data.status !== 'ok') throw new Error(data.message);

        return data.articles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
            publishedAt: article.publishedAt,
            author: article.author
        }));
    }

    async verifyAgainstNews(claim) {
        try {
            const articles = await this.searchNews(claim, { pageSize: 5 });
            
            const sources = articles.map(a => ({
                title: a.title,
                source: a.source,
                url: a.url,
                publishedAt: a.publishedAt,
                relevance: this.calculateRelevance(claim, a.title + ' ' + a.description)
            }));

            return {
                found: sources.length > 0,
                sources: sources.sort((a, b) => b.relevance - a.relevance),
                totalSources: sources.length
            };
        } catch (error) {
            console.error('News verification failed:', error);
            return { found: false, sources: [], error: error.message };
        }
    }

    calculateRelevance(claim, text) {
        const claimWords = claim.toLowerCase().split(' ').filter(w => w.length > 3);
        const textLower = text.toLowerCase();
        
        let matches = 0;
        claimWords.forEach(word => {
            if (textLower.includes(word)) matches++;
        });

        return (matches / claimWords.length) * 100;
    }

    async getTopHeadlines(category = 'general', country = 'us') {
        const params = new URLSearchParams({
            category,
            country,
            apiKey: this.apiKey,
            pageSize: 20
        });

        const response = await fetch(`${this.baseUrl}/top-headlines?${params}`);
        const data = await response.json();

        return data.articles || [];
    }

    async getTrendingTopics() {
        const headlines = await this.getTopHeadlines();
        const topics = this.extractTopics(headlines);
        
        return topics.slice(0, 10);
    }

    extractTopics(articles) {
        const topicCounts = {};
        
        articles.forEach(article => {
            const words = (article.title + ' ' + article.description)
                .toLowerCase()
                .split(/\W+/)
                .filter(w => w.length > 5);
            
            words.forEach(word => {
                topicCounts[word] = (topicCounts[word] || 0) + 1;
            });
        });

        return Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => ({ topic, count }));
    }
}

module.exports = NewsAPIService;
