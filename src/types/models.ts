// Shared interfaces used across the app

export interface TraitProperty {
  trait_type: string;
  value: string;
}

export interface UINFTCollection {
  id: string;
  title: string;
  creator: string;
  logoUrl: string;
  floorPrice: number;
  items: number | string;
  bannerImage: string;
  description: string;
  owners: number;
  volume: number;
  links: {
    website: string;
    twitter: string;
    discord: string;
  };
  maxSupply?: number | string;
}

export interface UINFT {
  id: number;
  name: string;
  description: string;
  coverUrl: string;
  collection: {
    id: string;
    name: string;
  };
  owner: string;
  creator: string;
  price?: number;
  currency?: string;
  isListed: boolean;
  properties: TraitProperty[];
  royalties: number;
  createdAt: string;
  likes: number;
  views: number;
  history: Array<{
    id: number;
    type: 'mint' | 'transfer' | 'list' | 'sale' | 'offer' | 'burn';
    from: string;
    to?: string;
    price?: number;
    timestamp: string;
  }>;
}

export interface UIUserProfile {
  username: string;
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  joinedDate: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  stats: {
    followers: number;
    following: number;
    created: number;
    collected: number;
    likes: number;
  };
}


