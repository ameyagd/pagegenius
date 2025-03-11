import { delay } from './services';

// Sample keyword suggestions based on different categories
const keywordSuggestions = {
    bathtub: [
        'Bathtub Safety Features for Senior Citizens',
        'Best Bathtub Accessibility Options for Seniors',
        'Ideal Size and Design Bathtub Tips',
        'Water Temperature Control in Senior Bathtubs',
        'Easy Maintenance Bathtubs for Seniors',
    ],
    health: [
        'Health Benefits of Regular Exercise',
        'Nutritional Tips for Better Health',
        'Mental Health Wellness Strategies',
        'Preventive Health Care Measures',
        'Health Supplements Guide',
    ],
    finance: [
        'Personal Finance Management Tips',
        'Investment Strategies for Beginners',
        'Retirement Planning Essentials',
        'Tax Saving Strategies',
        'Debt Management Solutions',
    ],
    technology: [
        'Latest Technology Trends',
        'Digital Transformation Solutions',
        'Cloud Computing Benefits',
        'Cybersecurity Best Practices',
        'AI and Machine Learning Applications',
    ],
    fashion: [
        'Seasonal Fashion Trends',
        'Sustainable Fashion Choices',
        'Fashion Accessories Guide',
        'Style Tips for Different Body Types',
        'Budget-Friendly Fashion Ideas',
    ],
    home: ['Home Improvement Ideas', 'Interior Design Trends', 'Sustainable Home Solutions', 'Smart Home Technology Guide', 'Home Organization Tips'],
    default: ['Essential Tips and Tricks', 'Comprehensive Guide', 'Best Practices', 'Expert Recommendations', 'Ultimate Resource'],
};

/**
 * Generates keyword suggestions based on the provided content or title
 * @param content The content or title to generate keywords from
 * @returns Promise with an array of keyword suggestions
 */
export const generateKeywords = async (content: string): Promise<string[]> => {
    // Simulate API delay
    await delay(1000);

    // Convert content to lowercase for easier matching
    const lowerContent = content.toLowerCase();

    // Determine which category the content belongs to
    if (lowerContent.includes('bathtub') || lowerContent.includes('bath') || lowerContent.includes('bathroom')) {
        return keywordSuggestions.bathtub;
    } else if (lowerContent.includes('health') || lowerContent.includes('wellness') || lowerContent.includes('fitness')) {
        return keywordSuggestions.health;
    } else if (lowerContent.includes('finance') || lowerContent.includes('money') || lowerContent.includes('investment')) {
        return keywordSuggestions.finance;
    } else if (lowerContent.includes('tech') || lowerContent.includes('digital') || lowerContent.includes('computer')) {
        return keywordSuggestions.technology;
    } else if (lowerContent.includes('fashion') || lowerContent.includes('style') || lowerContent.includes('clothing')) {
        return keywordSuggestions.fashion;
    } else if (lowerContent.includes('home') || lowerContent.includes('house') || lowerContent.includes('interior')) {
        return keywordSuggestions.home;
    } else {
        return keywordSuggestions.default;
    }
};
