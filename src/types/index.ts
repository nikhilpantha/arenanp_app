export interface Venue {
  id: string;
  name: string;
  location: string;
  sport: string;
  pricePerHour: number;
  rating?: number;
  imageUrl?: string;
}

export interface League {
  id: string;
  name: string;
  sport: string;
  startsAt: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startsAt: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
}

export interface Profile {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}
