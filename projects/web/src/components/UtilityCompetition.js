import { ReactComponent as NationEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as NationEspIcon } from '../icons/nation_esp.svg';
import { ReactComponent as NationItaIcon } from '../icons/nation_ita.svg';
import { ReactComponent as NationJpnIcon } from '../icons/nation_jpn.svg';
import { ReactComponent as EarthIcon } from '../icons/earth.svg';

export const getDefaultCompetitionId = (currentUser) => {
  return currentUser && currentUser.support_team_competition ? currentUser.support_team_competition : 2021;
}

export const getDefaultSeasonId = (currentUser) => {
  return currentUser && currentUser.support_team_season ? currentUser.support_team_season : 1564;
}

export const getCompetitionName = (competitionId) => {
  switch (competitionId) {
    case 2021: return 'プレミアリーグ';
    case 2014: return 'ラ・リーガ';
    case 2019: return 'セリエA';
    case 2119: return 'Jリーグ';
    case 10000001: return '国際親善試合';
    case 10000002: return 'キリンチャレンジカップ';
    default: return 'マッチアップ';
  }
}

export const getCompetitionType = (competitionId) => {
  return (competitionId === 10000001 || competitionId === 10000002) ? 'エキシビション' : 'マッチデイ';
}

export const getCompetitionIcon = (competitionId) => {
  switch (competitionId) {
    case 2021: return NationEngIcon;
    case 2014: return NationEspIcon;
    case 2019: return NationItaIcon;
    case 2119: return NationJpnIcon;
    default: return EarthIcon;
  }
}

export const getCompetitionColor = (competitionId) => {
  switch (competitionId) {
    case 2021: return '#38003c';
    case 2014: return '#FF4B44';
    case 2019: return '#171D8D';
    case 2119: return '#000000';
    case (10000001 || 10000002) : return '#052667';
    default: return'#3465FF';
  }
}