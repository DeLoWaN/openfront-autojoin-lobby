/**
 * AutoJoinEngine - Core matching logic for auto-join
 *
 * Responsibilities:
 * - Determine if a lobby matches user criteria
 * - Pure logic with no side effects
 * - Handles both FFA and Team game modes
 * - Supports capacity filtering
 */

import type { Lobby } from '@/types/game';
import type { AutoJoinCriteria } from './AutoJoinTypes';
import {
  getLobbyGameMode,
  getLobbyTeamConfig,
  getLobbyCapacity,
  getPlayersPerTeam,
} from './AutoJoinHelpers';

export class AutoJoinEngine {
  /**
   * Check if lobby matches any of the provided criteria
   *
   * @param lobby - Lobby to check
   * @param criteriaList - List of criteria to match against
   * @returns True if lobby matches at least one criteria
   */
  matchesCriteria(lobby: Lobby, criteriaList: AutoJoinCriteria[]): boolean {
    if (!lobby || !lobby.gameConfig || !criteriaList || criteriaList.length === 0) {
      return false;
    }

    const gameCapacity = getLobbyCapacity(lobby);
    const lobbyMode = getLobbyGameMode(lobby);

    for (const criteria of criteriaList) {
      let matches = false;

      // Check game mode match
      if (criteria.gameMode === 'FFA' && lobbyMode === 'FFA') {
        matches = true;
      } else if (criteria.gameMode === 'Team' && lobbyMode === 'Team') {
        // For Team mode, check team count if specified
        if (criteria.teamCount !== null && criteria.teamCount !== undefined) {
          const playerTeams = getLobbyTeamConfig(lobby);

          if (criteria.teamCount === 'Duos' && playerTeams !== 'Duos') {
            continue;
          }
          if (criteria.teamCount === 'Trios' && playerTeams !== 'Trios') {
            continue;
          }
          if (criteria.teamCount === 'Quads' && playerTeams !== 'Quads') {
            continue;
          }
          if (typeof criteria.teamCount === 'number' && playerTeams !== criteria.teamCount) {
            continue;
          }
        }
        matches = true;
      }

      // If game mode matches, check capacity constraints
      if (matches) {
        if (criteria.gameMode === 'FFA') {
          // FFA: check total max players
          if (gameCapacity === null) {
            return true; // No capacity info, accept
          }

          if (criteria.minPlayers !== null && gameCapacity < criteria.minPlayers) {
            continue; // Too few players
          }
          if (criteria.maxPlayers !== null && gameCapacity > criteria.maxPlayers) {
            continue; // Too many players
          }
        } else if (criteria.gameMode === 'Team') {
          // Team: check players per team
          const playerTeams = getLobbyTeamConfig(lobby);
          const playersPerTeam = getPlayersPerTeam(playerTeams, gameCapacity);

          if (playersPerTeam === null) {
            return true; // No player count info, accept
          }

          if (criteria.minPlayers !== null && playersPerTeam < criteria.minPlayers) {
            continue; // Too few players per team
          }
          if (criteria.maxPlayers !== null && playersPerTeam > criteria.maxPlayers) {
            continue; // Too many players per team
          }
        }

        return true; // All checks passed
      }
    }

    return false; // No criteria matched
  }
}
