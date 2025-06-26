import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { externalFootballApi, externalGetTeamInfoApi, formatDate, getTomorrowDate } from '@/utils/utils';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { TRPCError } from '@trpc/server';

export const gameRouter = createTRPCRouter({
  popularLeagues: baseProcedure
    .query(async (opts) => {
      return await externalFootballApi('football-popular-leagues')
    }),

  getTeamInfo: baseProcedure
    .input(z.object({
      name: z.string()
  })).query(async ({input}) => {
      try {
      const {error, success, data} = await externalGetTeamInfoApi(input.name)
      if (success === false) {
        // return new Error(error)
      } 

      if (success === true){
        return data
      }
    } catch(error) {
      if (error instanceof AxiosError) {
        console.log("Error from fetching the info")
        toast.error("Error from fetching the info")
      }
    }
  }),

  liveMatches: baseProcedure
    .query(async () => {
      try {
        const allowedLeagueIds = [47, 87, 42];
        const allLiveGames = await externalFootballApi('football-current-live')
        const response = allLiveGames?.data?.response?.live || [];
        const filteredGames = response.filter((game: any) => allowedLeagueIds.includes(game.leagueId));
        return filteredGames;
      } catch(error) {
        console.error('Error fetching live matches:', error);
        return [];
      }
    }),

  getParticularLiveMatches: baseProcedure
    .input(z.object({
      home: z.string(),
      away: z.string(),
  }))
    .query(async ({input}) => {
      const {home, away} = input
      const allowedLeagueIds = [47, 87, 42];
        const allLiveGames = await externalFootballApi('football-current-live')
        console.log({allLiveGames})
        const filteredGames = allLiveGames.data.response.live.filter((game: any) => allowedLeagueIds.includes(game.leagueId))
        const particularGames = filteredGames.find((g: any) => g.home.name.toLowercase() === home && g.away.name.toLowercase() === away)

        // return allLiveGames.data.response.live;
        return particularGames;
    }),

  getAllFixturesByName: baseProcedure
    .input(z.object({
      homeName: z.string(),
      away: z.string()
  }))
    .query(async ({input}) => {
      const {homeName, away} = input
      const allowedLeagueIds = [47, 87, 42];
      const allLiveGames = await externalFootballApi('football-current-live')
      const filteredGames = allLiveGames.data.response.live.filter((game: any) => allowedLeagueIds.includes(game.leagueId)).filter((game: any) => game.home.name === homeName && game.home.name === away)

      // return allLiveGames.data.response.live;
      return filteredGames;
  }),

  getAllFixtures: baseProcedure
    .query(async () => {
      try {
        const allFixtures = [];
        const [premierLeagueGames, championsGames, laligaGames] = await Promise.all([
          externalFootballApi('football-get-all-matches-by-league?leagueid=47').catch(() => ({ data: { response: { matches: [] } } })),
          externalFootballApi('football-get-all-matches-by-league?leagueid=42').catch(() => ({ data: { response: { matches: [] } } })),
          externalFootballApi('football-get-all-matches-by-league?leagueid=87').catch(() => ({ data: { response: { matches: [] } } }))
        ]);

        const filteredPremierLeagueGames = premierLeagueGames?.data?.response?.matches?.filter((match: any) => match?.status?.started === false) || [];
        const filteredUCLGames = championsGames?.data?.response?.matches?.filter((match: any) => match?.status?.started === false) || [];
        const filteredLaLigaGames = laligaGames?.data?.response?.matches?.filter((match: any) => match?.status?.started === false) || [];

        allFixtures.push(...filteredPremierLeagueGames, ...filteredUCLGames, ...filteredLaLigaGames);
        return allFixtures;
      } catch (error) {
        console.error('Error fetching fixtures:', error);
        return [];
      }
    }),

  getFixturesForPremierLeague: baseProcedure
    .query(async () => {
      const games = await externalFootballApi('football-get-all-matches-by-league?leagueid=47')
      const filteredGames = games.data.response.matches.filter((match: any) => match.status.started === false)

      return filteredGames;
    }),

  getFixturesForLaLiga: baseProcedure
    .query(async () => {
      const games = await externalFootballApi('football-get-all-matches-by-league?leagueid=87')
      const filteredGames = games.data.response.matches.filter((match: any) => match.status.started === false)

      return filteredGames;

    }),

  getFixturesForUCL: baseProcedure
    .query(async () => {
      const games = await externalFootballApi('football-get-all-matches-by-league?leagueid=42')
      const filteredGames = games.data.response.matches.filter((match: any) => match.status.started === false)

      return filteredGames;
    }),

});
export type AppRouter = typeof gameRouter;
