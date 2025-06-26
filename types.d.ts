
// Define the response type for matches
interface Match {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  tournament: string;
  category: string;
  isLive: boolean;
  date: string;
}

interface MatchesResponse {
  matches: Match[];
  count: number;
  error?: string;
}

interface UpcomingMatch {
  away: {
    id: string
    name: string
  },
  home: {
    id: string
    name: string
  }
  status: {
    utcTime: string
  }
}

interface UserReturns {
  id: string, 
  email: string, 
  name: string,
  profileImage: string
  publicKey: PublicKey;
  // encryptedProvider: string;
  balance: number
}
