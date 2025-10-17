// Google Analytics Integration Service
export interface GoogleAnalyticsConfig {
  accountId: string;
  propertyId: string;
  measurementId: string;
  accessToken?: string;
}

export interface AnalyticsData {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
  returningUsers: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  trafficSources: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
  userCountries: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
}

export class GoogleAnalyticsService {
  private config: GoogleAnalyticsConfig | null = null;
  private isConnected = false;
  private accessToken: string | null = null;

  constructor() {
    // Load saved configuration from localStorage
    this.loadConfig();
  }

  private loadConfig() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('google_analytics_config');
      const token = localStorage.getItem('google_analytics_token');
      if (saved && token) {
        this.config = JSON.parse(saved);
        this.accessToken = token;
        this.isConnected = true;
      }
    }
  }

  async connect(config: GoogleAnalyticsConfig, accessToken?: string): Promise<boolean> {
    try {
      // Validate the configuration
      if (!config.accountId || !config.propertyId || !config.measurementId) {
        throw new Error('Missing required Google Analytics configuration');
      }

      // For mock data mode, we don't need to validate credentials
      // Just validate the format
      const isValid = this.validateDemoCredentials(config, '');
      
      if (isValid) {
        this.config = config;
        this.accessToken = null; // Not using access token for mock data
        this.isConnected = true;
        
        // Save configuration to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('google_analytics_config', JSON.stringify(config));
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to connect to Google Analytics:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.config = null;
    this.accessToken = null;
    this.isConnected = false;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_analytics_config');
      localStorage.removeItem('google_analytics_token');
    }
  }

  isGoogleAnalyticsConnected(): boolean {
    return this.isConnected && this.config !== null;
  }

  getConfig(): GoogleAnalyticsConfig | null {
    return this.config;
  }

  private async validateCredentials(config: GoogleAnalyticsConfig, accessToken: string): Promise<boolean> {
    try {
      // Validate credential format and structure
      if (!this.isValidCredentialFormat(config, accessToken)) {
        throw new Error('Invalid credential format. Please check your Account ID, Property ID, and Access Token.');
      }

      // Simulate API validation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, we'll validate against known good credentials
      const isValidDemoCredentials = this.validateDemoCredentials(config, accessToken);
      
      if (!isValidDemoCredentials) {
        throw new Error('Invalid credentials. Please verify your Account ID, Property ID, and Access Token.');
      }

      console.log('✅ Google Analytics credentials validated successfully (Demo Mode)');
      return true;
    } catch (error) {
      console.error('❌ Google Analytics credential validation failed:', error);
      throw error;
    }
  }

  private isValidCredentialFormat(config: GoogleAnalyticsConfig, accessToken: string): boolean {
    // Validate Account ID format (should be numeric)
    if (!config.accountId || !/^\d+$/.test(config.accountId)) {
      return false;
    }

    // Validate Property ID format (should be numeric)
    if (!config.propertyId || !/^\d+$/.test(config.propertyId)) {
      return false;
    }

    // Validate Measurement ID format (should start with G-)
    if (!config.measurementId || !/^G-[A-Z0-9]+$/.test(config.measurementId)) {
      return false;
    }

    // Validate Access Token format (should be a valid OAuth token)
    if (!accessToken || !/^ya29\./.test(accessToken)) {
      return false;
    }

    return true;
  }

  private validateDemoCredentials(config: GoogleAnalyticsConfig, accessToken: string): boolean {
    // Accept the demo credentials or any valid format
    const validAccountIds = ['54516992', '213025502']; // Demo account IDs
    const validPropertyIds = ['213025502', '123456789']; // Demo property IDs
    const validMeasurementIds = ['G-PRT33XGJNS', 'G-XXXXXXXXXX']; // Demo measurement IDs

    return (
      validAccountIds.includes(config.accountId) ||
      validPropertyIds.includes(config.propertyId) ||
      validMeasurementIds.includes(config.measurementId) ||
      // Also accept any properly formatted credentials for demo purposes
      (config.accountId.length >= 8 && config.propertyId.length >= 8 && config.measurementId.length >= 10)
    );
  }

  async fetchAnalyticsData(config?: GoogleAnalyticsConfig): Promise<AnalyticsData | null> {
    const currentConfig = config || this.config;
    
    if (!currentConfig) {
      throw new Error('Google Analytics not connected');
    }

    try {
      console.log('🔄 Fetching Google Analytics data (Demo Mode)...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate dynamic mock data based on current time and config
      const analyticsData = this.generateDynamicMockData(currentConfig);
      
      console.log('✅ Google Analytics data fetched successfully (Demo Mode):', analyticsData);
      return analyticsData;
    } catch (error) {
      console.error('❌ Failed to fetch Google Analytics data:', error);
      throw error;
    }
  }

  private generateDynamicMockData(config: GoogleAnalyticsConfig): AnalyticsData {
    // Generate realistic data with some randomness based on current time
    const now = new Date();
    const timeSeed = now.getHours() + now.getMinutes();
    const dayOfWeek = now.getDay();
    
    // Base values with time-based variations
    const baseActiveUsers = 12000 + (timeSeed * 50) + (dayOfWeek * 200);
    const baseSessions = baseActiveUsers * 1.3;
    const basePageViews = baseSessions * 2.1;
    
    // Generate realistic variations
    const activeUsers = Math.floor(baseActiveUsers + (Math.random() - 0.5) * 1000);
    const sessions = Math.floor(baseSessions + (Math.random() - 0.5) * 500);
    const pageViews = Math.floor(basePageViews + (Math.random() - 0.5) * 2000);
    const newUsers = Math.floor(activeUsers * (0.4 + Math.random() * 0.2));
    const returningUsers = activeUsers - newUsers;
    
    // Generate top pages based on your screenshots
    const topPages = [
      { page: 'Home', views: Math.floor(pageViews * 0.25 + Math.random() * 1000) },
      { page: 'Google Merch Shop', views: Math.floor(pageViews * 0.15 + Math.random() * 500) },
      { page: 'New | Google Merch...', views: Math.floor(pageViews * 0.12 + Math.random() * 400) },
      { page: 'Men\'s / Unisex | Goo...', views: Math.floor(pageViews * 0.08 + Math.random() * 300) },
      { page: 'Sale | Google Merch...', views: Math.floor(pageViews * 0.06 + Math.random() * 200) }
    ].sort((a, b) => b.views - a.views);

    // Generate traffic sources
    const trafficSources = [
      { source: 'Direct', sessions: Math.floor(sessions * 0.35), percentage: 35.1 },
      { source: 'Organic Search', sessions: Math.floor(sessions * 0.28), percentage: 27.6 },
      { source: 'Unassigned', sessions: Math.floor(sessions * 0.19), percentage: 19.5 },
      { source: 'Paid Search', sessions: Math.floor(sessions * 0.12), percentage: 11.9 },
      { source: 'Email', sessions: Math.floor(sessions * 0.03), percentage: 3.0 },
      { source: 'Referral', sessions: Math.floor(sessions * 0.03), percentage: 3.0 }
    ];

    // Generate user countries
    const userCountries = [
      { country: 'United States', users: Math.floor(activeUsers * 0.57), percentage: 57.1 },
      { country: 'India', users: Math.floor(activeUsers * 0.07), percentage: 7.1 },
      { country: 'Canada', users: Math.floor(activeUsers * 0.06), percentage: 6.1 },
      { country: 'Japan', users: Math.floor(activeUsers * 0.04), percentage: 4.2 },
      { country: 'Taiwan', users: Math.floor(activeUsers * 0.03), percentage: 3.7 },
      { country: 'South Korea', users: Math.floor(activeUsers * 0.03), percentage: 3.7 },
      { country: 'Singapore', users: Math.floor(activeUsers * 0.02), percentage: 2.6 }
    ];

    return {
      activeUsers,
      sessions,
      pageViews,
      bounceRate: Math.round((45.2 + (Math.random() - 0.5) * 10) * 10) / 10,
      avgSessionDuration: Math.round(180 + (Math.random() - 0.5) * 60),
      newUsers,
      returningUsers,
      topPages,
      trafficSources,
      userCountries
    };
  }

  private async fetchMetric(config: GoogleAnalyticsConfig, metricName: string, accessToken: string): Promise<number> {
    try {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;
      
      const requestBody = {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: metricName }]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${metricName}`);
      }

      const data = await response.json();
      const value = data.rows?.[0]?.metricValues?.[0]?.value;
      return value ? parseInt(value) : 0;
    } catch (error) {
      console.error(`Error fetching ${metricName}:`, error);
      return 0;
    }
  }

  private async fetchTopPages(config: GoogleAnalyticsConfig, accessToken: string): Promise<Array<{ page: string; views: number }>> {
    try {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;
      
      const requestBody = {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }],
        dimensions: [{ name: 'pageTitle' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top pages');
      }

      const data = await response.json();
      return data.rows?.map((row: any) => ({
        page: row.dimensionValues?.[0]?.value || 'Unknown',
        views: parseInt(row.metricValues?.[0]?.value || '0')
      })) || [];
    } catch (error) {
      console.error('Error fetching top pages:', error);
      return [];
    }
  }

  private async fetchTrafficSources(config: GoogleAnalyticsConfig, accessToken: string): Promise<Array<{ source: string; sessions: number; percentage: number }>> {
    try {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;
      
      const requestBody = {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'sessions' }],
        dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 6
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch traffic sources');
      }

      const data = await response.json();
      const totalSessions = data.rows?.reduce((sum: number, row: any) => 
        sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1;

      return data.rows?.map((row: any) => {
        const sessions = parseInt(row.metricValues?.[0]?.value || '0');
        return {
          source: row.dimensionValues?.[0]?.value || 'Unknown',
          sessions,
          percentage: (sessions / totalSessions) * 100
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
      return [];
    }
  }

  private async fetchUserCountries(config: GoogleAnalyticsConfig, accessToken: string): Promise<Array<{ country: string; users: number; percentage: number }>> {
    try {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;
      
      const requestBody = {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'country' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 7
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user countries');
      }

      const data = await response.json();
      const totalUsers = data.rows?.reduce((sum: number, row: any) => 
        sum + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 1;

      return data.rows?.map((row: any) => {
        const users = parseInt(row.metricValues?.[0]?.value || '0');
        return {
          country: row.dimensionValues?.[0]?.value || 'Unknown',
          users,
          percentage: (users / totalUsers) * 100
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching user countries:', error);
      return [];
    }
  }

  private async fetchAvgSessionDuration(config: GoogleAnalyticsConfig, accessToken: string): Promise<number> {
    try {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;
      
      const requestBody = {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'averageSessionDuration' }]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch average session duration');
      }

      const data = await response.json();
      const value = data.rows?.[0]?.metricValues?.[0]?.value;
      return value ? parseFloat(value) : 0;
    } catch (error) {
      console.error('Error fetching average session duration:', error);
      return 0;
    }
  }

  private calculateBounceRate(sessions: number, pageViews: number): number {
    if (sessions === 0) return 0;
    // Simplified bounce rate calculation
    return Math.max(0, Math.min(100, ((sessions - pageViews) / sessions) * 100));
  }

  // Real Google Analytics API implementation would look like this:
  /*
  private async makeAnalyticsRequest(endpoint: string, params: any): Promise<any> {
    const url = `https://analyticsreporting.googleapis.com/v4/reports:batchGet?key=${this.config!.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAccessToken()}`
      },
      body: JSON.stringify({
        reportRequests: [{
          viewId: this.config!.propertyId,
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: params.metrics,
          dimensions: params.dimensions
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return response.json();
  }
  */
}

// Singleton instance
export const googleAnalyticsService = new GoogleAnalyticsService();
