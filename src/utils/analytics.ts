export interface AnalyticsEvent {
  type: 'page_view' | 'image_view' | 'image_like' | 'image_download' | 'user_signup' | 'user_login';
  userId?: string;
  imageId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface AnalyticsFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  imageId?: string;
  category?: string;
  eventType?: string;
}

export interface AnalyticsMetrics {
  totalViews: number;
  uniqueViews: number;
  totalLikes: number;
  totalDownloads: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
}

// Analytics tracking functions
export const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp'>): void => {
  const fullEvent: AnalyticsEvent = {
    ...event,
    timestamp: new Date()
  };
  
  // Store in localStorage for demo purposes
  const events = getStoredEvents();
  events.push(fullEvent);
  localStorage.setItem('gallery_analytics_events', JSON.stringify(events));
};

export const getStoredEvents = (): AnalyticsEvent[] => {
  const stored = localStorage.getItem('gallery_analytics_events');
  return stored ? JSON.parse(stored) : [];
};

export const getAnalyticsMetrics = (filter?: AnalyticsFilter): AnalyticsMetrics => {
  const events = getStoredEvents();
  let filteredEvents = events;

  // Apply filters
  if (filter) {
    filteredEvents = events.filter(event => {
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;
      if (filter.userId && event.userId !== filter.userId) return false;
      if (filter.imageId && event.imageId !== filter.imageId) return false;
      if (filter.eventType && event.type !== filter.eventType) return false;
      return true;
    });
  }

  // Calculate metrics
  const totalViews = filteredEvents.filter(e => e.type === 'image_view').length;
  const uniqueViews = new Set(
    filteredEvents
      .filter(e => e.type === 'image_view')
      .map(e => `${e.userId}-${e.imageId}`)
  ).size;
  
  const totalLikes = filteredEvents.filter(e => e.type === 'image_like').length;
  const totalDownloads = filteredEvents.filter(e => e.type === 'image_download').length;

  return {
    totalViews,
    uniqueViews,
    totalLikes,
    totalDownloads,
    bounceRate: 0.25, // Mock data
    avgSessionDuration: 180, // Mock data in seconds
    conversionRate: 0.15 // Mock data
  };
};

export const getTopImages = (limit: number = 10, filter?: AnalyticsFilter) => {
  const events = getStoredEvents();
  let filteredEvents = events;

  if (filter) {
    filteredEvents = events.filter(event => {
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;
      return true;
    });
  }

  const imageStats = new Map<string, { views: number; likes: number; downloads: number }>();

  filteredEvents.forEach(event => {
    if (!event.imageId) return;

    if (!imageStats.has(event.imageId)) {
      imageStats.set(event.imageId, { views: 0, likes: 0, downloads: 0 });
    }

    const stats = imageStats.get(event.imageId)!;
    
    switch (event.type) {
      case 'image_view':
        stats.views++;
        break;
      case 'image_like':
        stats.likes++;
        break;
      case 'image_download':
        stats.downloads++;
        break;
    }
  });

  return Array.from(imageStats.entries())
    .map(([imageId, stats]) => ({ imageId, ...stats }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

export const getUserEngagement = (userId: string, filter?: AnalyticsFilter) => {
  const events = getStoredEvents().filter(e => e.userId === userId);
  let filteredEvents = events;

  if (filter) {
    filteredEvents = events.filter(event => {
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;
      return true;
    });
  }

  return {
    totalEvents: filteredEvents.length,
    views: filteredEvents.filter(e => e.type === 'image_view').length,
    likes: filteredEvents.filter(e => e.type === 'image_like').length,
    downloads: filteredEvents.filter(e => e.type === 'image_download').length,
    lastActivity: filteredEvents.length > 0 
      ? new Date(Math.max(...filteredEvents.map(e => e.timestamp.getTime())))
      : null
  };
};

export const getTimeSeriesData = (
  metric: 'views' | 'likes' | 'downloads' | 'signups',
  period: 'day' | 'week' | 'month',
  filter?: AnalyticsFilter
) => {
  const events = getStoredEvents();
  let filteredEvents = events;

  if (filter) {
    filteredEvents = events.filter(event => {
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;
      return true;
    });
  }

  const eventTypeMap = {
    views: 'image_view',
    likes: 'image_like',
    downloads: 'image_download',
    signups: 'user_signup'
  };

  const relevantEvents = filteredEvents.filter(e => e.type === eventTypeMap[metric]);
  
  // Group by time period
  const groupedData = new Map<string, number>();
  
  relevantEvents.forEach(event => {
    const date = new Date(event.timestamp);
    let key: string;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    groupedData.set(key, (groupedData.get(key) || 0) + 1);
  });

  return Array.from(groupedData.entries())
    .map(([date, count]) => ({ date, value: count }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const exportAnalyticsData = (filter?: AnalyticsFilter): string => {
  const events = getStoredEvents();
  let filteredEvents = events;

  if (filter) {
    filteredEvents = events.filter(event => {
      if (filter.startDate && event.timestamp < filter.startDate) return false;
      if (filter.endDate && event.timestamp > filter.endDate) return false;
      if (filter.userId && event.userId !== filter.userId) return false;
      if (filter.imageId && event.imageId !== filter.imageId) return false;
      if (filter.eventType && event.type !== filter.eventType) return false;
      return true;
    });
  }

  const csvHeader = 'Timestamp,Event Type,User ID,Image ID,Metadata\n';
  const csvRows = filteredEvents.map(event => 
    `${event.timestamp.toISOString()},${event.type},${event.userId || ''},${event.imageId || ''},"${JSON.stringify(event.metadata || {})}"`
  ).join('\n');

  return csvHeader + csvRows;
};

// Real-time analytics helpers
export const startAnalyticsSession = (): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('gallery_analytics_session', sessionId);
  
  trackEvent({
    type: 'page_view',
    metadata: { sessionId, page: window.location.pathname }
  });
  
  return sessionId;
};

export const endAnalyticsSession = (): void => {
  const sessionId = localStorage.getItem('gallery_analytics_session');
  if (sessionId) {
    trackEvent({
      type: 'page_view',
      metadata: { sessionId, action: 'session_end' }
    });
    localStorage.removeItem('gallery_analytics_session');
  }
};

export const trackImageInteraction = (imageId: string, action: 'view' | 'like' | 'download'): void => {
  const sessionId = localStorage.getItem('gallery_analytics_session');
  const userId = localStorage.getItem('gallery_current_user') 
    ? JSON.parse(localStorage.getItem('gallery_current_user')!).id 
    : undefined;

  const eventTypeMap = {
    view: 'image_view' as const,
    like: 'image_like' as const,
    download: 'image_download' as const
  };

  trackEvent({
    type: eventTypeMap[action],
    userId,
    imageId,
    metadata: { sessionId }
  });
};