import { ReactComponent as NationEngIcon } from './icons/nation_eng.svg';
import { ReactComponent as NationEspIcon } from './icons/nation_esp.svg';
import { ReactComponent as NationItaIcon } from './icons/nation_ita.svg';
import { ReactComponent as NationJpnIcon } from './icons/nation_jpn.svg';
import { ReactComponent as NationUclIcon } from './icons/nation_ucl.svg';
import { ReactComponent as EarthIcon } from './icons/earth.svg';

export const getCsrfToken = () => {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length, cookie.length);
        }
    }
    return '';
}

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
    case 10000003: return 'FIFAワールドカップ アジア2次予選';
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
    case 10000002:
    case 10000003: return '#052667';
    case 'others': return '#888888';
    default: return'#3465FF';
  }
}

export const getTeamId = (teamCode) => {
  switch (teamCode) {
    case 'japan': return 766;
    default: return 766;
  }
}

export const getTeamName = (teamId) => {
  switch (teamId) {
    case 766: return 'サッカー日本代表';
    default: return '試合スケジュール';
  }
}

export const getTeamIcon = (teamId) => {
  switch (teamId) {
    case 766: return NationJpnIcon;
    case 'others': return EarthIcon;
    default: return EarthIcon;
  }
}

export const getTeamColor = (teamId) => {
  switch (teamId) {
    case 766: return '#052667';
    default: return'#3465FF';
  }
}

export const hexToRgba = (hex, alpha = 1) => {
  const [r, g, b] = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const getCurrentMonthAndYear = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  return { year, month };
}

// 前月の年と月を取得する関数
export const getLastMonthAndYear = () => {
  const { year: currentYear, month: currentMonth } = getCurrentMonthAndYear();

  let lastMonth = currentMonth - 1;
  let lastYear = currentYear;

  if (lastMonth === 0) {
    lastMonth = 12;
    lastYear -= 1;
  }
  return { year: lastYear, month: lastMonth };
}