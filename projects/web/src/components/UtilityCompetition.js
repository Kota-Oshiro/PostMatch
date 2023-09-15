import { ReactComponent as NationEngIcon } from '../icons/nation_eng.svg';
import { ReactComponent as NationEspIcon } from '../icons/nation_esp.svg';
import { ReactComponent as NationItaIcon } from '../icons/nation_ita.svg';
import { ReactComponent as NationJpnIcon } from '../icons/nation_jpn.svg';
import { ReactComponent as NationUclIcon } from '../icons/nation_ucl.svg';
import { ReactComponent as EarthIcon } from '../icons/earth.svg';

export const getDefaultCompetitionId = (currentUser) => {
  return currentUser && currentUser.support_team_competition ? currentUser.support_team_competition : 2021;
}

export const getSingleCompetitionId = (competitionCode) => {
  switch (competitionCode) {
    case 'premier-league': return 2021;
    case 'la-liga': return 2014;
    case 'serie-a': return 2019;
    case 'j1-league': return 2119;
    case 'champions-league': return 2001;
    default: return 2021;
  }
}

export const getCompetitionName = (competitionId) => {
  switch (competitionId) {
    case 2021: return 'プレミアリーグ';
    case 2014: return 'ラ・リーガ';
    case 2019: return 'セリエA';
    case 2119: return 'J1リーグ';
    case 2001: return 'チャンピオンズリーグ';
    case 10000001: return '国際親善試合';
    case 10000002: return 'キリンチャレンジカップ';
    case 'others': return 'その他';
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
    case 2001: return NationUclIcon;
    case 'others': return EarthIcon;
    default: return EarthIcon;
  }
}

export const getCompetitionColor = (competitionId) => {
  switch (competitionId) {
    case 2021: return '#38003c';
    case 2014: return '#FF4B44';
    case 2019: return '#171D8D';
    case 2119: return '#000000';
    case 2001: return '#091442';
    case 10000001:
    case 10000002: return '#052667';
    case 'others': return '#888888';
    default: return'#3465FF';
  }
}