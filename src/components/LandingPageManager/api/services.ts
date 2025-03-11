import { Customer, Domain, LandingPage, PageAnalytics } from '../types';

// Mock data
const mockCustomers: Customer[] = [
    { id: '1', name: 'Customer 1', partnerId: '1' },
    { id: '2', name: 'Customer 2', partnerId: '1' },
    { id: '3', name: 'Customer 3', partnerId: '1' },
    { id: '4', name: 'HealthCo', partnerId: '1' },
    { id: '5', name: 'Fashionista Brands', partnerId: '1' },
    { id: '6', name: 'FinGuru Consultants', partnerId: '1' },
    { id: '7', name: 'TechNova Solutions', partnerId: '1' },
    { id: '8', name: 'EcoLiving Products', partnerId: '1' },
];

const mockDomains: Domain[] = [
    { id: 'domain1.com', name: 'domain1.com', customerId: '2' },
    { id: 'domain2.com', name: 'domain2.com', customerId: '2' },
    { id: 'domain3.com', name: 'domain3.com', customerId: '3' },
    { id: 'domain4.com', name: 'domain4.com', customerId: '1' },
    { id: 'domain5.com', name: 'domain5.com', customerId: '1' },
    { id: 'healthco.com', name: 'healthco.com', customerId: '4' },
    { id: 'fashionista.com', name: 'fashionista.com', customerId: '5' },
    { id: 'finguru.com', name: 'finguru.com', customerId: '6' },
    { id: 'technova.io', name: 'technova.io', customerId: '7' },
    { id: 'ecoliving.com', name: 'ecoliving.com', customerId: '8' },
];

const mockLandingPages: LandingPage[] = [
    {
        id: '1',
        title: 'Welcome to Our Service',
        slug: 'welcome',
        content: 'This is a sample landing page with detailed content about our services.',
        keywords: ['service', 'welcome', 'introduction'],
        imageUrl: 'https://example.com/image1.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '1',
        domainId: 'domain4.com',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-01-15T10:30:00Z',
        isAiGenerated: false,
        isDuplicated: false,
    },
    {
        id: '2',
        title: 'Special Offer',
        slug: 'special-offer',
        content: 'Limited time offer with special discounts on our premium services.',
        keywords: ['offer', 'discount', 'limited', 'premium'],
        imageUrl: 'https://example.com/image2.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '2',
        domainId: 'domain1.com',
        createdAt: '2023-02-20T14:45:00Z',
        updatedAt: '2023-02-20T14:45:00Z',
        isAiGenerated: true,
        isDuplicated: false,
    },
    {
        id: '3',
        title: 'About Our Team',
        slug: 'about-team',
        content: 'Learn more about our experienced team of professionals.',
        keywords: ['team', 'about', 'professionals', 'experience'],
        imageUrl: 'https://example.com/image3.jpg',
        status: 'under_review',
        authorId: '1',
        customerId: '3',
        domainId: 'domain3.com',
        createdAt: '2023-03-10T09:15:00Z',
        updatedAt: '2023-03-10T09:15:00Z',
        rejectionReason: 'Content contains prohibited terms. Please revise.',
        isAiGenerated: false,
        isDuplicated: false,
    },
    // New approved landing pages with realistic data
    {
        id: '4',
        title: 'Guide to Healthy Living: 10 Essential Tips',
        slug: 'healthy-living-guide',
        content:
            'Discover the secrets to maintaining a healthy lifestyle with our comprehensive guide. From nutrition to exercise, we cover everything you need to know to live your best life.',
        keywords: ['healthy living', 'wellness tips', 'nutrition guide', 'fitness advice', 'mental health'],
        imageUrl: 'https://example.com/healthy-living.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '4',
        domainId: 'healthco.com',
        createdAt: '2023-04-05T11:20:00Z',
        updatedAt: '2023-04-05T11:20:00Z',
        isAiGenerated: true,
        isDuplicated: false,
    },
    {
        id: '5',
        title: 'Discover the Latest Fashion Trends for Summer 2023',
        slug: 'summer-fashion-trends-2023',
        content:
            'Stay ahead of the curve with our curated selection of the hottest fashion trends for Summer 2023. From beachwear to evening attire, find your perfect style for every occasion.',
        keywords: ['fashion trends', 'summer style', 'trendy outfits', 'seasonal fashion', 'style guide'],
        imageUrl: 'https://example.com/fashion-trends.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '5',
        domainId: 'fashionista.com',
        createdAt: '2023-03-28T09:45:00Z',
        updatedAt: '2023-03-28T09:45:00Z',
        isAiGenerated: false,
        isDuplicated: false,
    },
    {
        id: '6',
        title: 'Expert Tips on Personal Finance Management',
        slug: 'personal-finance-tips',
        content:
            'Take control of your financial future with expert advice on budgeting, investing, and saving. Our comprehensive guide helps you make informed decisions for long-term financial security.',
        keywords: ['personal finance', 'money management', 'investment tips', 'budgeting advice', 'financial planning'],
        imageUrl: 'https://example.com/finance-tips.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '6',
        domainId: 'finguru.com',
        createdAt: '2023-02-15T14:30:00Z',
        updatedAt: '2023-02-15T14:30:00Z',
        isAiGenerated: true,
        isDuplicated: false,
    },
    {
        id: '7',
        title: 'The Ultimate Guide to Cloud Computing Solutions',
        slug: 'cloud-computing-guide',
        content:
            'Explore the benefits and applications of cloud computing for businesses of all sizes. Learn how to leverage cloud technology to improve efficiency, reduce costs, and scale your operations.',
        keywords: ['cloud computing', 'digital transformation', 'IT solutions', 'business technology', 'cloud services'],
        imageUrl: 'https://example.com/cloud-computing.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '7',
        domainId: 'technova.io',
        createdAt: '2023-05-10T10:15:00Z',
        updatedAt: '2023-05-10T10:15:00Z',
        isAiGenerated: false,
        isDuplicated: false,
    },
    {
        id: '8',
        title: 'Sustainable Living: Eco-Friendly Products for Your Home',
        slug: 'eco-friendly-home-products',
        content:
            'Transform your living space with our selection of sustainable, eco-friendly products. Reduce your carbon footprint while creating a healthier environment for you and your family.',
        keywords: ['sustainable living', 'eco-friendly products', 'green home', 'environmental impact', 'sustainable lifestyle'],
        imageUrl: 'https://example.com/eco-products.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '8',
        domainId: 'ecoliving.com',
        createdAt: '2023-04-22T13:40:00Z',
        updatedAt: '2023-04-22T13:40:00Z',
        isAiGenerated: true,
        isDuplicated: false,
    },
    {
        id: '9',
        title: 'The Complete Guide to Digital Marketing in 2023',
        slug: 'digital-marketing-guide-2023',
        content:
            'Master the latest digital marketing strategies to grow your business online. From SEO to social media, learn how to create effective campaigns that drive traffic and increase conversions.',
        keywords: ['digital marketing', 'online strategy', 'SEO tips', 'social media marketing', 'content strategy'],
        imageUrl: 'https://example.com/digital-marketing.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '7',
        domainId: 'technova.io',
        createdAt: '2023-01-30T16:20:00Z',
        updatedAt: '2023-01-30T16:20:00Z',
        isAiGenerated: false,
        isDuplicated: false,
    },
    {
        id: '10',
        title: 'Mindfulness Techniques for Stress Reduction',
        slug: 'mindfulness-stress-reduction',
        content:
            'Discover practical mindfulness techniques to reduce stress and improve your mental wellbeing. Our expert-backed methods can be easily incorporated into your daily routine.',
        keywords: ['mindfulness', 'stress reduction', 'mental health', 'meditation', 'wellness practices'],
        imageUrl: 'https://example.com/mindfulness.jpg',
        status: 'approved',
        authorId: '1',
        customerId: '4',
        domainId: 'healthco.com',
        createdAt: '2023-03-05T08:50:00Z',
        updatedAt: '2023-03-05T08:50:00Z',
        isAiGenerated: true,
        isDuplicated: false,
    },
    {
        id: '11',
        title: 'Fast Weight-Loss Expert Secrets',
        slug: 'fast-weight-loss-expert-secrets',
        content: 'Discover the secrets to rapid weight loss with our expert methods...',
        status: 'rejected',
        rejectionReason: 'Non-compliant health claims and unrealistic weight loss promises',
        keywords: ['quick weight loss', 'fast diet', 'weight loss secrets'],
        customerId: 'mock-customer-1',
        domainId: 'quickresults.com',
        isAiGenerated: false,
        authorId: '1',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-16T15:30:00Z',
        isDuplicated: false,
    },
    {
        id: '12',
        title: 'Earn Big Profits Overnight Trading',
        slug: 'earn-big-profits-overnight-trading',
        content: 'Learn how to generate massive profits through our proven trading system...',
        status: 'rejected',
        rejectionReason: 'Exaggerated earnings claims and misleading financial promises',
        keywords: ['quick profits', 'overnight trading', 'guaranteed earnings'],
        customerId: 'mock-customer-2',
        domainId: 'profitgold.com',
        isAiGenerated: true,
        authorId: '1',
        createdAt: '2024-01-17T09:00:00Z',
        updatedAt: '2024-01-18T14:20:00Z',
        isDuplicated: false,
    },
];

const mockAnalytics: Record<string, PageAnalytics> = {
    '1': {
        pageId: '1',
        pageViews: 1250,
        clicks: 320,
        adViews: 1500,
        conversions: 45,
        ctr: 21.33,
        conversionValue: 2250,
        dimensions: {
            device: { Mobile: 750, Desktop: 450, Tablet: 50 },
            browser: { Chrome: 600, Safari: 400, Firefox: 150, Edge: 100 },
            country: { US: 800, UK: 200, Canada: 150, Australia: 100 },
        },
    },
    '2': {
        pageId: '2',
        pageViews: 850,
        clicks: 210,
        adViews: 1000,
        conversions: 30,
        ctr: 24.71,
        conversionValue: 1500,
        dimensions: {
            device: { Mobile: 500, Desktop: 300, Tablet: 50 },
            browser: { Chrome: 400, Safari: 300, Firefox: 100, Edge: 50 },
            country: { US: 500, UK: 150, Canada: 100, Australia: 100 },
        },
    },
    '3': {
        pageId: '3',
        pageViews: 450,
        clicks: 85,
        adViews: 600,
        conversions: 12,
        ctr: 18.89,
        conversionValue: 600,
        dimensions: {
            device: { Mobile: 250, Desktop: 150, Tablet: 50 },
            browser: { Chrome: 200, Safari: 150, Firefox: 50, Edge: 50 },
            country: { US: 300, UK: 50, Canada: 50, Australia: 50 },
        },
    },
    // Analytics for new landing pages
    '4': {
        pageId: '4',
        pageViews: 3200,
        clicks: 980,
        adViews: 3500,
        conversions: 145,
        ctr: 30.63,
        conversionValue: 7250,
        dimensions: {
            device: { Mobile: 1800, Desktop: 1200, Tablet: 200 },
            browser: { Chrome: 1500, Safari: 1000, Firefox: 400, Edge: 300 },
            country: { US: 2000, UK: 500, Canada: 400, Australia: 300 },
        },
    },
    '5': {
        pageId: '5',
        pageViews: 2800,
        clicks: 720,
        adViews: 3000,
        conversions: 95,
        ctr: 25.71,
        conversionValue: 4750,
        dimensions: {
            device: { Mobile: 1600, Desktop: 1000, Tablet: 200 },
            browser: { Chrome: 1300, Safari: 900, Firefox: 350, Edge: 250 },
            country: { US: 1700, UK: 450, Canada: 350, Australia: 300 },
        },
    },
    '6': {
        pageId: '6',
        pageViews: 4500,
        clicks: 1350,
        adViews: 4800,
        conversions: 210,
        ctr: 30.0,
        conversionValue: 10500,
        dimensions: {
            device: { Mobile: 2500, Desktop: 1700, Tablet: 300 },
            browser: { Chrome: 2200, Safari: 1400, Firefox: 600, Edge: 300 },
            country: { US: 2800, UK: 700, Canada: 600, Australia: 400 },
        },
    },
    '7': {
        pageId: '7',
        pageViews: 3800,
        clicks: 950,
        adViews: 4000,
        conversions: 180,
        ctr: 25.0,
        conversionValue: 9000,
        dimensions: {
            device: { Mobile: 2000, Desktop: 1500, Tablet: 300 },
            browser: { Chrome: 1800, Safari: 1200, Firefox: 500, Edge: 300 },
            country: { US: 2300, UK: 600, Canada: 500, Australia: 400 },
        },
    },
    '8': {
        pageId: '8',
        pageViews: 2500,
        clicks: 625,
        adViews: 2700,
        conversions: 85,
        ctr: 25.0,
        conversionValue: 4250,
        dimensions: {
            device: { Mobile: 1400, Desktop: 900, Tablet: 200 },
            browser: { Chrome: 1200, Safari: 800, Firefox: 300, Edge: 200 },
            country: { US: 1500, UK: 400, Canada: 350, Australia: 250 },
        },
    },
    '9': {
        pageId: '9',
        pageViews: 5200,
        clicks: 1560,
        adViews: 5500,
        conversions: 260,
        ctr: 30.0,
        conversionValue: 13000,
        dimensions: {
            device: { Mobile: 2800, Desktop: 2100, Tablet: 300 },
            browser: { Chrome: 2500, Safari: 1600, Firefox: 700, Edge: 400 },
            country: { US: 3200, UK: 800, Canada: 700, Australia: 500 },
        },
    },
    '10': {
        pageId: '10',
        pageViews: 3100,
        clicks: 775,
        adViews: 3300,
        conversions: 120,
        ctr: 25.0,
        conversionValue: 6000,
        dimensions: {
            device: { Mobile: 1700, Desktop: 1200, Tablet: 200 },
            browser: { Chrome: 1500, Safari: 1000, Firefox: 400, Edge: 200 },
            country: { US: 1900, UK: 500, Canada: 400, Australia: 300 },
        },
    },
    '11': {
        pageId: '11',
        pageViews: 0,
        clicks: 0,
        adViews: 0,
        conversions: 0,
        ctr: 0,
        conversionValue: 0,
        dimensions: {
            device: { Mobile: 0, Desktop: 0, Tablet: 0 },
            browser: { Chrome: 0, Safari: 0, Firefox: 0, Edge: 0 },
            country: { US: 0, UK: 0, Canada: 0, Australia: 0 },
        },
    },
    '12': {
        pageId: '12',
        pageViews: 0,
        clicks: 0,
        adViews: 0,
        conversions: 0,
        ctr: 0,
        conversionValue: 0,
        dimensions: {
            device: { Mobile: 0, Desktop: 0, Tablet: 0 },
            browser: { Chrome: 0, Safari: 0, Firefox: 0, Edge: 0 },
            country: { US: 0, UK: 0, Canada: 0, Australia: 0 },
        },
    },
};

// Simulate API delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API functions
export const fetchCustomers = async (partnerId?: string): Promise<Customer[]> => {
    await delay(500);
    if (partnerId) {
        return mockCustomers.filter((c) => c.partnerId === partnerId);
    }
    return mockCustomers;
};

export const fetchDomains = async (customerId: string): Promise<Domain[]> => {
    await delay(500);
    return mockDomains.filter((d) => d.customerId === customerId);
};

export const fetchLandingPages = async (searchTerm?: string, partnerId?: string, customerId?: string, domainId?: string): Promise<LandingPage[]> => {
    await delay(500);

    let filteredPages = [...mockLandingPages];

    // Filter by partner ID if provided
    if (partnerId) {
        // In a real app, we'd filter by partner ID directly
        // For the mock, we'll assume all pages are accessible to the partner
    }

    // Filter by customer ID if provided
    if (customerId) {
        filteredPages = filteredPages.filter((page) => page.customerId === customerId);
    }

    // Filter by domain ID if provided
    if (domainId) {
        filteredPages = filteredPages.filter((page) => page.domainId === domainId);
    }

    // Filter by search term if provided
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredPages = filteredPages.filter(
            (page) =>
                page.title.toLowerCase().includes(term) ||
                page.content.toLowerCase().includes(term) ||
                page.keywords.some((keyword) => keyword.toLowerCase().includes(term))
        );
    }

    return filteredPages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const fetchLandingPage = async (id: string): Promise<LandingPage | null> => {
    await delay(500);
    return mockLandingPages.find((p) => p.id === id) || null;
};

export const createLandingPage = async (page: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<LandingPage> => {
    await delay(1000);
    const newPage: LandingPage = {
        ...page,
        id: `${mockLandingPages.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    mockLandingPages.unshift(newPage);
    return newPage;
};

export const updateLandingPage = async (id: string, updates: Partial<LandingPage>): Promise<LandingPage> => {
    await delay(1000);
    const index = mockLandingPages.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Page not found');

    const updatedPage = {
        ...mockLandingPages[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };
    mockLandingPages[index] = updatedPage;
    return updatedPage;
};

export const generateAiContent = async (
    prompt: string
): Promise<{
    title: string;
    content: string;
    keywords: string[];
    imageUrl: string;
}> => {
    await delay(2000);
    return {
        title: `AI Generated: ${prompt.substring(0, 20)}...`,
        content: `This is AI generated content based on your prompt: "${prompt}". It includes detailed information about the topic with relevant facts and engaging descriptions.`,
        keywords: prompt
            .split(' ')
            .filter((word) => word.length > 3)
            .slice(0, 5),
        imageUrl: 'https://example.com/ai-generated-image.jpg',
    };
};

export const fetchPageAnalytics = async (pageId: string): Promise<PageAnalytics> => {
    await delay(1000);
    const analytics = mockAnalytics[pageId];
    if (!analytics) {
        // Return empty analytics if none exist
        return {
            pageId,
            pageViews: 0,
            clicks: 0,
            adViews: 0,
            conversions: 0,
            ctr: 0,
            conversionValue: 0,
            dimensions: {
                device: {},
                browser: {},
                country: {},
            },
        };
    }
    return analytics;
};

// Utility function to find the top performing landing page based on conversion value
export const findTopPerformingPage = async (): Promise<string> => {
    await delay(300);

    // Get all approved landing pages
    const approvedPages = mockLandingPages.filter((page) => page.status === 'approved');

    if (approvedPages.length === 0) {
        return '';
    }

    // Find the page with the highest conversion value
    let topPageId = '';
    let highestConversionValue = 0;

    Object.entries(mockAnalytics).forEach(([pageId, analytics]) => {
        // Check if this page is in the approved pages
        const isApproved = approvedPages.some((page) => page.id === pageId);

        if (isApproved && analytics.conversionValue > highestConversionValue) {
            highestConversionValue = analytics.conversionValue;
            topPageId = pageId;
        }
    });

    return topPageId;
};
