export interface OffendedGroup {
  name: string;
  icon: string;
  reason: string;
}

export interface Microaggression {
  element: string;
  trigger: string;
  severity: 'moderate' | 'high' | 'critical' | 'apocalyptic';
}

export interface FakeTweet {
  author: string;
  handle: string;
  verified: boolean;
  avatar: string;
  text: string;
  retweets: string;
  likes: string;
  time: string;
}

export interface OffenseAnalysis {
  brandOrTitle: string;
  toxicityScore: number;
  statusStamp: string;
  outrageSummary: string;
  offendedGroups: OffendedGroup[];
  microaggressions: Microaggression[];
  fakeTweet: FakeTweet;
  marketerAdvice: string;
  hashtags: string[];
}

export interface CaseChronicle {
  whatHappened: string;
  whyOutraged: string;
  aftermath: string;
}

export interface PresetCase {
  id: string;
  title: string;
  brand: string;
  year: string;
  location?: string;
  description: string;
  image: string;
  tag?: string;
  chronicle?: CaseChronicle;
  analysis: OffenseAnalysis;
}
