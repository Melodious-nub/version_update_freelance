export interface SocialPostItem {
  id: string;
  date: Date;
  postName: string;
  postCategory: string;
  creationType: 'Automatic' | 'Manual';
  publicationPlatforms: string[];
  publicationDateTime?: Date;
  views: number | string;
  clicks: number | string;
  status: 'Draft' | 'Approved' | 'Scheduled' | 'Rejected' | 'Published';
  product?: string;
  captions?: string[];
  version?: number | string;
}

export interface SocialPostCategory {
  id: string;
  name: string;
  description?: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  isEnabled: boolean;
}
