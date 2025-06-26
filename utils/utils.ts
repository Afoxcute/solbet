import axios, { AxiosError, AxiosRequestConfig, } from "axios";
import crypto from "crypto";

export type APIResponse = {
  success: boolean;
  data?: LiveGame | any;
  error?: unknown;
};

export type LiveGame = {
  status: string;
  response: {
    live: any[]
  }
}

export function formatString(str: string) {
  const lowercaseStr = str.toLowerCase();

  if (lowercaseStr.includes(' ')) {
    return lowercaseStr.replace(/ /g, '-');
  }

  return lowercaseStr;
}

export function reverseFormatString(formattedStr: string) {
  let changedString: string;
  if (formattedStr.includes('-')) {
    const spacedStr = formattedStr.replace(/-/g, ' ');

    changedString = spacedStr.replace(/\b\w/g, char => char.toUpperCase())
    return changedString;
  }

  changedString = formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1)
  if (changedString === 'Ucl') {
    return changedString.toUpperCase()
  } else {
    return changedString;

  }
}


export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTomorrowDate = (): string => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // move one day forward
  return today.toISOString().split('T')[0];
};

export function formatNumberInThousands(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
};

export async function externalGetTeamInfoApi(teamName: string): Promise<APIResponse> {
  const apiKey = process.env.NEXT_PUBLIC_LIVE_FOOTBALL_KEY;
  const apiHost = process.env.NEXT_PUBLIC_FOOTBALL_TEAM_INFO_HOST;

  if (!apiKey || !apiHost) {
    return {
      success: false,
      error: 'Missing API credentials in environment variables.'
    };
  }

  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `https://api-football-v1.p.rapidapi.com/v3/teams`,
    params: {
      name: teamName,
      season: 2024,
    },
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost
    }
  };

  try {
    const { data, status } = await axios.request(options);

    return {
      success: status === 200,
      data
    };
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error('Axios error:', err.message);
      return {
        success: false,
        error: err.message
      };
    }

    console.error('Unknown error:', err);
    return {
      success: false,
      error: err
    };
  }
}

export async function externalFootballApi(endpoint: string): Promise<APIResponse> {
  const apiKey = process.env.NEXT_PUBLIC_LIVE_FOOTBALL_KEY;
  const apiHost = process.env.NEXT_PUBLIC_LIVE_FOOTBALL_HOST;

  if (!apiKey || !apiHost) {
    return {
      success: false,
      error: 'Missing API credentials in environment variables.',
    };
  }

  const options: AxiosRequestConfig = {
    method: 'GET',
    url: `https://free-api-live-football-data.p.rapidapi.com/${endpoint}`,
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
    },
  };

  let retries = 3;
  while (retries > 0) {
    try {
      const { data, status } = await axios.request(options);
      return {
        success: status === 200,
        data,
      };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = parseInt(err.response.headers['retry-after'] || '1', 10);
          console.warn(`Rate limited. Retrying in ${retryAfter} seconds...`);
          await new Promise((res) => setTimeout(res, retryAfter * 1000));
          retries--;
          continue;
        }

        console.error('Axios error:', err.message);
        return {
          success: false,
          error: err.message,
        };
      }

      console.error('Unknown error:', err);
      return {
        success: false,
        error: 'An unexpected error occurred.',
      };
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded due to rate limiting.',
  };
}

const ALGORITHM = "aes-256-cbc";
// Fix: Add default value if environment variable is missing
const SECRET = crypto.createHash('sha256')
  .update(process.env.NEXT_PUBLIC_COOKIE_SECRET || 'default-secret-key')
  .digest();

// Fix: Create IV function instead of using a global variable
function createIV() {
  return crypto.randomBytes(16);
}

export function encryptData(text: string): string {
  try {
    const iv = createIV();
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    // Return a fallback or throw an error depending on your needs
    return '';
  }
}

export function decryptData(encryptedText: string): string {
  try {
    // Validate input format
    if (!encryptedText || !encryptedText.includes(':')) {
      return '';
    }
    
    const [ivHex, dataHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    // Return a fallback or throw an error depending on your needs
    return '';
  }
}

export function formatDateToBritish(rawDate: string): {date: string, time: string} {
  const date = new Date(rawDate);

  // Format: "10 May 2025"
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Format: "14:00"
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    date: formattedDate,
    time: formattedTime
  }
}

export function getTheLeagueId(game: any) {
  const splitted = game.pageUrl.split('#')[1]

  return splitted.slice(0, 2)
}

const premierLeagueTeams = new Set([
  "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Chelsea",
  "Crystal Palace", "Everton", "Fulham", "Ipswich", "Leicester City", "Liverpool",
  "Man City", "Man United", "Newcastle", "Nottm Forest", "Southampton", "Tottenham",
  "West Ham", "Wolves"
]);

const laLigaTeams = new Set([
  "Athletic", "Atlético", "Barcelona", "Betis", "Celta",
  "Espanyol", "Getafe", "Girona", "Las Palmas", "Leganés", "Mallorca", "Osasuna",
  "Rayo", "Madrid", "Sociedad", "Sevilla", "Valencia",
  "Valladolid", "Villarreal"
]);

export function getLeague(teamA: string, teamB: string): "Premier League" | "La Liga" | "Champions League" {
  const inPremier = premierLeagueTeams.has(teamA) && premierLeagueTeams.has(teamB);
  const inLaLiga = laLigaTeams.has(teamA) && laLigaTeams.has(teamB);

  if (inPremier) return "Premier League";
  if (inLaLiga) return "La Liga";
  return "Champions League";
}

let temp = 0

export function generateNumber(): number {
  temp += 1
  return 100 + temp;
}
