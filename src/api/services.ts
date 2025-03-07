import { Customer, Domain, LandingPage, PageAnalytics } from '../types';

// Mock data
const mockCustomers: Customer[] = [
  { id: '1', name: 'Customer 1', partnerId: '1' },
  { id: '2', name: 'Customer 2', partnerId: '1' },
  { id: '3', name: 'Customer 3', partnerId: '1' },
];

const mockDomains: Domain[] = [
  { id: 'domain1.com', name: 'domain1.com', customerId: '2' },
  { id: 'domain2.com', name: 'domain2.com', customerId: '2' },
  { id: 'domain3.com', name: 'domain3.com', customerId: '3' },
  { id: 'domain4.com', name: 'domain4.com', customerId: '1' },
  { id: 'domain5.com', name: 'domain5.com', customerId: '1' },
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
    content: 'Limited time special offer for our premium services.',
    keywords: ['offer', 'special', 'discount'],
    imageUrl: 'https://example.com/image2.jpg',
    status: 'under_review',
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
    title: 'Product Launch',
    slug: 'product-launch',
    content: 'Announcing our new product line with enhanced features.',
    keywords: ['product', 'launch', 'new'],
    imageUrl: 'https://example.com/image3.jpg',
    status: 'rejected',
    authorId: '1',
    customerId: '3',
    domainId: 'domain3.com',
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2023-03-10T09:15:00Z',
    rejectionReason: 'Content contains prohibited terms. Please revise.',
    isAiGenerated: false,
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
      device: { 'Mobile': 750, 'Desktop': 450, 'Tablet': 50 },
      browser: { 'Chrome': 600, 'Safari': 400, 'Firefox': 150, 'Edge': 100 },
      country: { 'US': 800, 'UK': 200, 'Canada': 150, 'Australia': 100 },
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
      device: { 'Mobile': 500, 'Desktop': 300, 'Tablet': 50 },
      browser: { 'Chrome': 400, 'Safari': 300, 'Firefox': 100, 'Edge': 50 },
      country: { 'US': 500, 'UK': 150, 'Canada': 100, 'Australia': 100 },
    },
  },
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export const fetchCustomers = async (partnerId?: string): Promise<Customer[]> => {
  await delay(500);
  if (partnerId) {
    return mockCustomers.filter(c => c.partnerId === partnerId);
  }
  return mockCustomers;
};

export const fetchDomains = async (customerId: string): Promise<Domain[]> => {
  await delay(500);
  return mockDomains.filter(d => d.customerId === customerId);
};

export const fetchLandingPages = async (searchTerm?: string): Promise<LandingPage[]> => {
  await delay(800);
  if (!searchTerm) return mockLandingPages;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return mockLandingPages.filter(page => 
    page.title.toLowerCase().includes(lowerSearchTerm) ||
    page.content.toLowerCase().includes(lowerSearchTerm) ||
    page.keywords.some(k => k.toLowerCase().includes(lowerSearchTerm))
  );
};

export const fetchLandingPage = async (id: string): Promise<LandingPage | null> => {
  await delay(500);
  return mockLandingPages.find(p => p.id === id) || null;
};

export const createLandingPage = async (page: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<LandingPage> => {
  await delay(1000);
  const newPage: LandingPage = {
    ...page,
    id: `${mockLandingPages.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockLandingPages.push(newPage);
  return newPage;
};

export const updateLandingPage = async (id: string, updates: Partial<LandingPage>): Promise<LandingPage> => {
  await delay(1000);
  const index = mockLandingPages.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Page not found');
  
  const updatedPage = {
    ...mockLandingPages[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  mockLandingPages[index] = updatedPage;
  return updatedPage;
};

export const duplicateLandingPage = async (
  pageId: string, 
  customerId: string, 
  domainId: string
): Promise<LandingPage> => {
  await delay(1000);
  const sourcePage = mockLandingPages.find(p => p.id === pageId);
  if (!sourcePage) throw new Error('Source page not found');
  
  const newPage: LandingPage = {
    ...sourcePage,
    id: `${mockLandingPages.length + 1}`,
    title: `${sourcePage.title} (Copy)`,
    slug: `${sourcePage.slug}-copy`,
    customerId,
    domainId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDuplicated: true,
    originalPageId: pageId,
    // If the original was approved and we're not changing content, bypass compliance
    status: sourcePage.status === 'approved' ? 'approved' : 'under_review',
  };
  
  mockLandingPages.push(newPage);
  return newPage;
};

export const generateAiContent = async (prompt: string): Promise<{
  title: string;
  content: string;
  keywords: string[];
  imageUrl: string;
}> => {
  await delay(2000);
  return {
    title: `AI Generated: ${prompt.substring(0, 20)}...`,
    content: `This is AI generated content based on your prompt: "${prompt}". It includes detailed information about the topic with relevant facts and engaging descriptions.`,
    keywords: prompt.split(' ').filter(word => word.length > 3).slice(0, 5),
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