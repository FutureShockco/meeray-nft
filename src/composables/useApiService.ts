// --- NFT Platform Types ---
// Account related
export interface Account {
  name: string;
  totalVoteWeight?: number;
  witnessPublicKey?: string;
  [key: string]: any;
}

export interface AccountList {
  success: boolean;
  data: Account[];
  total: number;
  limit: number;
  skip: number;
}

export interface AccountHistory {
  success: boolean;
  data: Transaction[];
  total: number;
  limit: number;
  skip: number;
}

export interface TokenBalance {
  symbol: string;
  amount: number;
}

export interface AccountTokens {
  success: boolean;
  account: string;
  tokens: TokenBalance[];
}

// Token related
export interface Token {
  symbol: string;
  name: string;
  issuer: string;
  precision?: number;
  [key: string]: any;
}

export interface TokenList {
  data: Token[];
  total: number;
  limit: number;
  skip: number;
}

// NFT related - API response format
export interface NFTCollection {
  symbol: string;
  name: string;
  creator: string;
  maxSupply?: number;
  mintable: boolean;
  burnable?: boolean;
  transferable?: boolean;
  creatorFee?: number;
  schema?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  createdAt: string;
  bannerImage?: string;
  [key: string]: any;
}

// UI-friendly collection format
export interface UICollection {
  id: string;
  title: string;
  creator: string;
  image: string;
  bannerImage: string;
  floorPrice: number;
  items: number;
  description: string;
  owners: number;
  volume: number;
  links: {
    website: string;
    twitter: string;
    discord: string;
  };
}

export interface NFTInstance {
  _id: string;
  collectionSymbol: string;
  instanceId: string;
  owner: string;
  properties?: Record<string, any>;
  uri?: string;
  createdAt: string;
  [key: string]: any;
}

export interface NFTMarketListing {
  _id: string;
  collectionSymbol: string;
  instanceId: string;
  seller: string;
  price: number;
  paymentTokenSymbol: string;
  paymentTokenIssuer?: string;
  listedAt: string;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
}

export interface NFTDelegation {
  nftId: string;
  delegatedTo: string;
  delegatedAt: string;
  [key: string]: any;
}

export interface NFTHistoryEntry {
  eventType: string;
  from?: string;
  to?: string;
  timestamp: string;
  transactionId: string;
  [key: string]: any;
}

// Transaction related
export interface Transaction {
  _id: string;
  sender: string;
  type: number;
  timestamp: string;
  [key: string]: any;
}

// Block related
export interface Block {
  height: number;
  hash: string;
  timestamp: number;
  [key: string]: any;
}

export interface BlockList {
  success: boolean;
  data: Block[];
  total: number;
  limit: number;
  skip: number;
}


export function useApiService() {
  // Get runtime config in Nuxt 3 way
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.example.com';

  // Use globalThis.$fetch if available (Nuxt 3), otherwise fallback to fetch
  const fetcher = typeof globalThis !== 'undefined' && typeof (globalThis as any).$fetch === 'function'
    ? (url: string) => (globalThis as any).$fetch(url)
    : async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    };
  // --- Account Endpoints ---
  const getAccount = (account: string) => fetcher(`${API_BASE}/accounts/${account}`) as Promise<{ success: boolean; account: Account }>;
  const getAccounts = (params?: { limit?: number; offset?: number; hasToken?: string; isWitness?: string; sortBy?: string; sortDirection?: string }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.hasToken) query.append('hasToken', params.hasToken);
    if (params?.isWitness) query.append('isWitness', params.isWitness);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDirection) query.append('sortDirection', params.sortDirection);
    return fetcher(`${API_BASE}/accounts?${query.toString()}`) as Promise<AccountList>;
  };
  const getAccountHistory = (account: string, params?: { limit?: number; offset?: number; type?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.type) query.append('type', params.type.toString());
    return fetcher(`${API_BASE}/accounts/${account}/transactions?${query.toString()}`) as Promise<AccountHistory>;
  };
  const getAccountTokens = (account: string) => fetcher(`${API_BASE}/accounts/${account}/tokens`) as Promise<AccountTokens>;

  // --- Token Endpoints ---
  const getTokens = (params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/tokens?${query.toString()}`) as Promise<TokenList>;
  };
  const getToken = (symbol: string) => fetcher(`${API_BASE}/tokens/${symbol}`) as Promise<Token>;
  const getTokenDetails = (symbol: string) =>
    fetcher(`${API_BASE}/tokens/${symbol}`) as Promise<Token>;
  const searchTokensByName = (name: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/tokens/name/${name}?${query.toString()}`) as Promise<TokenList>;
  };

  // --- NFT Collection Endpoints ---
  const getNftCollections = (params?: {
    limit?: number;
    offset?: number;
    creator?: string;
    allowDelegation?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    nameSearch?: string;
    sortBy?: string;
    sortDirection?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.creator) query.append('creator', params.creator);
    if (params?.allowDelegation !== undefined) query.append('allowDelegation', params.allowDelegation.toString());
    if (params?.createdAfter) query.append('createdAfter', params.createdAfter);
    if (params?.createdBefore) query.append('createdBefore', params.createdBefore);
    if (params?.nameSearch) query.append('nameSearch', params.nameSearch);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDirection) query.append('sortDirection', params.sortDirection);
    return fetcher(`${API_BASE}/nfts/collections?${query.toString()}`) as Promise<{ data: NFTCollection[]; total: number; limit: number; skip: number }>;
  };
  const getNftCollection = (symbol: string) => fetcher(`${API_BASE}/nfts/collections/${symbol}`) as Promise<NFTCollection>;
  const getNftCollectionsByCreator = (creator: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/nfts/collections/creator/${creator}?${query.toString()}`) as Promise<{ data: NFTCollection[]; total: number; limit: number; skip: number }>;
  };

  // --- NFT Instance Endpoints ---
  const getNftInstances = (params?: {
    limit?: number;
    offset?: number;
    collectionSymbol?: string;
    owner?: string;
    createdAfter?: string;
    createdBefore?: string;
    metadataKey?: string;
    metadataValue?: string;
    sortBy?: string;
    sortDirection?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.collectionSymbol) query.append('collectionSymbol', params.collectionSymbol);
    if (params?.owner) query.append('owner', params.owner);
    if (params?.createdAfter) query.append('createdAfter', params.createdAfter);
    if (params?.createdBefore) query.append('createdBefore', params.createdBefore);
    if (params?.metadataKey) query.append('metadataKey', params.metadataKey);
    if (params?.metadataValue) query.append('metadataValue', params.metadataValue);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDirection) query.append('sortDirection', params.sortDirection);
    return fetcher(`${API_BASE}/nfts/instances?${query.toString()}`) as Promise<{ data: NFTInstance[]; total: number; limit: number; skip: number }>;
  };
  const getNftInstancesByCollection = (collectionSymbol: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/nfts/instances/collection/${collectionSymbol}?${query.toString()}`) as Promise<{ data: NFTInstance[]; total: number; limit: number; skip: number }>;
  };
  const getNftInstancesByOwner = (owner: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/nfts/instances/owner/${owner}?${query.toString()}`) as Promise<{ data: NFTInstance[]; total: number; limit: number; skip: number }>;
  };
  const getNftInstance = (nftId: string) => fetcher(`${API_BASE}/nfts/instances/id/${nftId}`) as Promise<NFTInstance>;
  const getNftInstanceHistory = (nftId: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/nfts/instances/id/${nftId}/history?${query.toString()}`) as Promise<{ data: NFTHistoryEntry[]; total: number; limit: number; skip: number }>;
  };
  const getNftInstanceDelegations = (nftId: string) => fetcher(`${API_BASE}/nfts/instances/id/${nftId}/delegations`) as Promise<NFTDelegation>;
  const getNftInstancesDelegatedTo = (userName: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/nfts/instances/delegatedto/${userName}?${query.toString()}`) as Promise<{ data: NFTInstance[]; total: number; limit: number; skip: number }>;
  };

  // --- NFT Marketplace Endpoints ---
  const getNftMarketListings = (params?: {
    limit?: number;
    offset?: number;
    collectionSymbol?: string;
    seller?: string;
    priceMin?: number;
    priceMax?: number;
    paymentSymbol?: string;
    sortBy?: string;
    sortDirection?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.collectionSymbol) query.append('collectionSymbol', params.collectionSymbol);
    if (params?.seller) query.append('seller', params.seller);
    if (params?.priceMin) query.append('priceMin', params.priceMin.toString());
    if (params?.priceMax) query.append('priceMax', params.priceMax.toString());
    if (params?.paymentSymbol) query.append('paymentSymbol', params.paymentSymbol);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDirection) query.append('sortDirection', params.sortDirection);
    return fetcher(`${API_BASE}/nfts/listings?${query.toString()}`) as Promise<{ data: NFTMarketListing[]; total: number; limit: number; skip: number }>;
  };
  const getNftMarketListing = (nftId: string) => fetcher(`${API_BASE}/nfts/listings/nft/${nftId}`) as Promise<NFTMarketListing>;
  const getNftMarketListingsBySeller = (seller: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/nfts/listings/seller/${seller}?${query.toString()}`) as Promise<{ data: NFTMarketListing[]; total: number; limit: number; skip: number }>;
  };
  const getNftMarketListingsByCollection = (collectionSymbol: string, params?: { limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    return fetcher(`${API_BASE}/nfts/listings/collection/${collectionSymbol}?${query.toString()}`) as Promise<{ data: NFTMarketListing[]; total: number; limit: number; skip: number }>;
  };

  // --- Block Endpoints ---
  const getBlocks = (params?: {
    limit?: number;
    offset?: number;
    hasTransactionType?: number;
    minTimestamp?: number;
    maxTimestamp?: number;
    sortDirection?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.hasTransactionType) query.append('hasTransactionType', params.hasTransactionType.toString());
    if (params?.minTimestamp) query.append('minTimestamp', params.minTimestamp.toString());
    if (params?.maxTimestamp) query.append('maxTimestamp', params.maxTimestamp.toString());
    if (params?.sortDirection) query.append('sortDirection', params.sortDirection);
    return fetcher(`${API_BASE}/blocks?${query.toString()}`) as Promise<BlockList>;
  };
  const getLatestBlock = () => fetcher(`${API_BASE}/blocks/latest`) as Promise<{ success: boolean; block: Block }>;
  const getBlockByHeight = (height: number) => fetcher(`${API_BASE}/blocks/height/${height}`) as Promise<{ success: boolean; block: Block }>;
  const getBlockByHash = (hash: string) => fetcher(`${API_BASE}/blocks/hash/${hash}`) as Promise<{ success: boolean; block: Block }>;
  const getBlockTransactions = (height: number) => fetcher(`${API_BASE}/blocks/${height}/transactions`) as Promise<{ success: boolean; blockHeight: number; transactions: Transaction[] }>;

  // --- External Price Data ---
  const getSteemPrice = () => fetcher(`https://min-api.cryptocompare.com/data/price?fsym=STEEM&tsyms=USD`) as Promise<{ USD: number }>;

  return {
    // Account Management
    getAccount,
    getAccounts,
    getAccountHistory,
    getAccountTokens,

    // Token Management
    getTokens,
    getToken,
    getTokenDetails,
    searchTokensByName,

    // NFT Collections
    getNftCollections,
    getNftCollection,
    getNftCollectionsByCreator,

    // NFT Instances
    getNftInstances,
    getNftInstancesByCollection,
    getNftInstancesByOwner,
    getNftInstance,
    getNftInstanceHistory,
    getNftInstanceDelegations,
    getNftInstancesDelegatedTo,

    // NFT Marketplace
    getNftMarketListings,
    getNftMarketListing,
    getNftMarketListingsBySeller,
    getNftMarketListingsByCollection,

    // Blockchain Data
    getBlocks,
    getLatestBlock,
    getBlockByHeight,
    getBlockByHash,
    getBlockTransactions,

    getSteemPrice,
  };
}
