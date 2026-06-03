import type { Team } from '@/types';

// TODO(backend): teams, member game counts and history come from the API.
export const TEAMS: Team[] = [
  {
    id: 'tm1',
    name: 'Thunderbolts FC',
    totalGames: 42,
    members: [
      { id: 'p1', name: 'Ramesh Karki', phone: '9801234567', gamesPlayed: 9 },
      { id: 'p2', name: 'Sita Maharjan', phone: '9807654321', gamesPlayed: 10 },
      { id: 'p3', name: 'Arjun Thapa', gamesPlayed: 3 },
    ],
    history: [
      { id: 'g1', date: '12 May', sport: 'futsal', court: 'Court 1', result: 'Won 5–3' },
      { id: 'g2', date: '5 May', sport: 'futsal', court: 'Court 2', result: 'Lost 2–4' },
      { id: 'g3', date: '28 Apr', sport: 'futsal', court: 'Court 1' },
    ],
  },
  {
    id: 'tm2',
    name: 'Lalitpur Smashers',
    totalGames: 18,
    members: [
      { id: 'p4', name: 'Nisha Rai', gamesPlayed: 5 },
      { id: 'p5', name: 'Bibek Shrestha', phone: '9843009988', gamesPlayed: 19 },
    ],
    history: [
      { id: 'g4', date: '10 May', sport: 'badminton', court: 'Court 1' },
      { id: 'g5', date: '3 May', sport: 'badminton', court: 'Court 1', result: 'Won 21–18' },
    ],
  },
];

export function getTeam(id: string): Team | null {
  return TEAMS.find((t) => t.id === id) ?? null;
}
