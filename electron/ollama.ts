import ollama from 'ollama'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const Importance = z.object({
    importance: z.number(),
});

const TOPIC_KEYWORDS = {
    'war': ['war', 'conflict', 'battle', 'military', 'armed forces', 'invasion', 'combat', 'warfare', 'defense', 'pentagon', 'ministry of defence', 'hostilities', 'ceasefire', 'airstrike', 'artillery', 'troop deployment', 'military exercises', 'geopolitical tension'],
    'politics': ['election', 'government', 'parliament', 'congress', 'politics', 'policy', 'legislation', 'democratic', 'republican', 'senate', 'lawmaking', 'political party', 'diplomacy', 'geopolitics', 'summit', 'treaty', 'foreign policy', 'public policy', 'governance', 'statesman', 'political debate'],
    'europe': ['europe', 'european', 'eu', 'brexit', 'nato', 'schengen', 'eurozone', 'european union', 'brussels', 'european commission', 'european parliament', 'member state', 'european council', 'uk politics', 'french politics', 'german politics'],
    'us': ['america', 'american', 'usa', 'united states', 'washington', 'white house', 'congress', 'senate', 'house of representatives', 'federal government', 'state government', 'us politics', 'biden administration', 'republican party', 'democratic party', 'supreme court'],
    'russia': ['russia', 'russian', 'moscow', 'kremlin', 'putin', 'oligarch', 'fsb', 'gazprom', 'russian federation', 'state duma', 'russian politics', 'russian economy'],
    'ukraine': ['ukraine', 'ukrainian', 'kiev', 'kyiv', 'zelensky', 'donbas', 'crimea', 'lviv', 'odessa', 'ukrainian armed forces', 'ukrainian politics', 'reconstruction'],
    'middle_east': ['israel', 'palestine', 'iran', 'gaza', 'west bank', 'tehran', 'netanyahu', 'jerusalem', 'saudi arabia', 'uae', 'turkey', 'syria', 'lebanon', 'middle east peace process', 'arab league', 'yemen', 'qatar'],
    'violence': ['violence', 'attack', 'shooting', 'bombing', 'terrorism', 'assassination', 'riot', 'mass shooting', 'hate crime', 'domestic violence', 'gang violence', 'police brutality', 'unrest', 'assault', 'extremism'],
    'disasters': ['earthquake', 'tsunami', 'hurricane', 'flood', 'wildfire', 'tornado', 'disaster', 'emergency', 'natural disaster', 'famine', 'drought', 'volcano', 'landslide', 'avalanche', 'emergency services', 'humanitarian aid', 'climate disaster'],
    'science': ['science', 'research', 'discovery', 'innovation', 'space', 'astronomy', 'physics', 'chemistry', 'biology', 'genetics', 'archaeology', 'anthropology', 'scientific study', 'research paper', 'journal', 'nasa', 'esa', 'cern'],
    'technology': ['technology', 'tech', 'innovation', 'gadget', 'smartphone', 'consumer electronics', 'artificial intelligence', 'ai', 'machine learning', 'robotics', 'cybersecurity', 'data privacy', 'startup', 'venture capital', 'silicon valley', 'big tech', 'social media', 'app', 'software', 'hardware', 'semiconductors', 'telecommunications', '5g', '6g'],
    'business_finance': ['business', 'finance', 'economy', 'stock market', 'wall street', 'investment', 'mergers and acquisitions', 'ipo', 'corporate earnings', 'unemployment', 'inflation', 'interest rates', 'federal reserve', 'central bank', 'cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'commerce', 'trade', 'supply chain', 'quarterly results', 'economic growth', 'gdp'],
    'health_medical': ['health', 'medicine', 'healthcare', 'who', 'world health organization', 'cdc', 'nhs', 'disease', 'pandemic', 'virus', 'vaccine', 'pharmaceuticals', 'biotech', 'mental health', 'nutrition', 'fitness', 'medical research', 'public health', 'hospital', 'doctor', 'patient care', 'health policy'],
    'environment_climate': ['environment', 'climate change', 'global warming', 'sustainability', 'renewable energy', 'solar power', 'wind power', 'fossil fuels', 'pollution', 'conservation', 'biodiversity', 'paris agreement', 'cop conference', 'unfccc', 'epa', 'carbon emissions', 'green technology', 'ecology'],
    'sports': ['sports', 'football', 'soccer', 'basketball', 'baseball', 'nfl', 'nba', 'mlb', 'fifa', 'world cup', 'olympics', 'tennis', 'golf', 'cricket', 'formula 1', 'esports', 'athletics', 'championship', 'tournament', 'athlete', 'team', 'match', 'game'],
    'entertainment_culture': ['entertainment', 'culture', 'movies', 'film', 'hollywood', 'cinema', 'celebrity', 'music', 'art', 'books', 'literature', 'theatre', 'broadway', 'fashion', 'food', 'travel', 'awards', 'oscars', 'grammys', 'cannes film festival', 'streaming', 'netflix', 'disney+', 'box office'],
    'education': ['education', 'school', 'university', 'college', 'student', 'teacher', 'curriculum', 'online learning', 'edtech', 'higher education', 'academic research', 'education policy', 'student debt', 'sat', 'act'],
    'crime_justice': ['crime', 'justice', 'law enforcement', 'police', 'fbi', 'doj', 'court', 'trial', 'lawsuit', 'investigation', 'fraud', 'corruption', 'human rights', 'prison', 'sentencing', 'supreme court ruling', 'legal', 'attorney', 'prosecutor'],
    'lifestyle_fashion': ['lifestyle', 'fashion', 'style', 'trends', 'beauty', 'grooming', 'skincare', 'fashion week', 'runway', 'designer', 'haute couture', 'streetwear', 'wellness', 'travel', 'foodie', 'home decor', 'interior design', 'relationships']
};

const INTERESTS = ['war', 'politics', 'europe', 'us', 'russia', 'ukraine', 'middle_east', 'violence', 'disasters'];
const NOT_INTERESTED = ['science', 'technology', 'business_finance', 'health_medical', 'environment_climate', 'sports', 'entertainment_culture', 'education', 'crime_justice', 'lifestyle_fashion'];

function createPrompt(title: string, summary: string, date: string, userInterests: string[], userNotInterests: string[]): string {
    const interestKeywords = userInterests.flatMap(interest =>
        TOPIC_KEYWORDS[interest as keyof typeof TOPIC_KEYWORDS] || []
    );

    const notInterestKeywords = userNotInterests.flatMap(notInterest =>
        TOPIC_KEYWORDS[notInterest as keyof typeof TOPIC_KEYWORDS] || []
    );

    let prompt = `Rate the importance of this news story from 0 to 100: "${title}", """${summary}""". Take into account that it was published on: ${date}.`;

    if(interestKeywords.length > 0) {
        prompt += ` Important news stories are related to: ${interestKeywords.join(', ')}.`;
    }
    if(notInterestKeywords.length > 0) {
        prompt += ` News stories that are NOT important are related to: ${notInterestKeywords.join(', ')}.`;
    }

    return prompt;
}

export async function callOllama(title: string, summary: string, date: string): Promise<number> {
    if(!title || !summary) {
        return -1;
    }
  
    const response = await ollama.chat({
        model: 'gemma3',
        messages: [{
            role: 'user',
            content: createPrompt(title, summary, date, INTERESTS, NOT_INTERESTED)
        }],
        format: zodToJsonSchema(Importance),
    });

    const importance = Importance.parse(JSON.parse(response.message.content));
    console.log(`${title}`);
    console.log(importance);
    return importance.importance;
}
