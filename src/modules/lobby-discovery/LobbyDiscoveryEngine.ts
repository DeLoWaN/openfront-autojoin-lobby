/**
 * LobbyDiscoveryEngine - core matching logic for notify-only discovery.
 */

import type { Lobby } from '@/types/game';
import type { DiscoveryCriteria } from './LobbyDiscoveryTypes';
import {
  getLobbyGameMode,
  getLobbyTeamConfig,
  getLobbyCapacity,
  getPlayersPerTeam,
} from './LobbyDiscoveryHelpers';

export class LobbyDiscoveryEngine {
  matchesCriteria(lobby: Lobby, criteriaList: DiscoveryCriteria[]): boolean {
    if (!lobby || !lobby.gameConfig || !criteriaList || criteriaList.length === 0) {
      return false;
    }

    if (getLobbyGameMode(lobby) !== 'Team') {
      return false;
    }

    if (lobby.gameConfig.playerTeams === 'Humans Vs Nations') {
      return false;
    }

    const gameCapacity = getLobbyCapacity(lobby);
    const lobbyTeamConfig = getLobbyTeamConfig(lobby);
    const playersPerTeam = getPlayersPerTeam(lobbyTeamConfig, gameCapacity);

    for (const criteria of criteriaList) {
      if (criteria.gameMode !== 'Team') {
        continue;
      }

      if (criteria.teamCount !== null && criteria.teamCount !== undefined) {
        if (criteria.teamCount !== lobbyTeamConfig) {
          continue;
        }
      }

      if (playersPerTeam !== null) {
        if (criteria.minPlayers !== null && playersPerTeam < criteria.minPlayers) {
          continue;
        }
        if (criteria.maxPlayers !== null && playersPerTeam > criteria.maxPlayers) {
          continue;
        }
      }

      return true;
    }

    return false;
  }
}
