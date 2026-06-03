import type { SportType } from '@/types';

export interface SportFeature {
  id: string;
  label: string;
}

export interface SportCatalogEntry {
  sport: SportType;
  label: string;
  /** Emoji glyph for quick visual recognition in chips/cards. */
  emoji: string;
  blurb: string;
  features: readonly SportFeature[];
}

/**
 * The play-types an owner can offer, each with a preset set of features/amenities
 * to toggle during venue onboarding. Keep ids stable — they're persisted in the
 * `venues.sports` jsonb.
 */
export const SPORTS_CATALOG: readonly SportCatalogEntry[] = [
  {
    sport: 'futsal',
    label: 'Futsal',
    emoji: '⚽',
    blurb: 'Indoor 5-a-side football & more',
    features: [
      { id: 'indoor', label: 'Indoor' },
      { id: 'outdoor', label: 'Outdoor' },
      { id: 'astro-turf', label: 'Astro turf' },
      { id: 'floodlights', label: 'Floodlights' },
      { id: '5-a-side', label: '5-a-side' },
      { id: '7-a-side', label: '7-a-side' },
      { id: 'changing-room', label: 'Changing room' },
      { id: 'parking', label: 'Parking' },
    ],
  },
  {
    sport: 'football',
    label: 'Football',
    emoji: '🏟️',
    blurb: 'Full-size & 7-a-side grounds',
    features: [
      { id: 'outdoor', label: 'Outdoor' },
      { id: 'natural-grass', label: 'Natural grass' },
      { id: 'astro-turf', label: 'Astro turf' },
      { id: '7-a-side', label: '7-a-side' },
      { id: '11-a-side', label: '11-a-side' },
      { id: 'floodlights', label: 'Floodlights' },
      { id: 'changing-room', label: 'Changing room' },
      { id: 'parking', label: 'Parking' },
    ],
  },
  {
    sport: 'cricket',
    label: 'Cricket',
    emoji: '🏏',
    blurb: 'Practice nets & match pitches',
    features: [
      { id: 'indoor-nets', label: 'Indoor nets' },
      { id: 'outdoor-pitch', label: 'Outdoor pitch' },
      { id: 'bowling-machine', label: 'Bowling machine' },
      { id: 'turf-wicket', label: 'Turf wicket' },
      { id: 'matting-wicket', label: 'Matting wicket' },
      { id: 'floodlights', label: 'Floodlights' },
      { id: 'changing-room', label: 'Changing room' },
      { id: 'parking', label: 'Parking' },
    ],
  },
  {
    sport: 'indoor-cricket',
    label: 'Indoor Cricket',
    emoji: '🏏',
    blurb: 'Covered nets & turf wickets',
    features: [
      { id: 'indoor-nets', label: 'Indoor nets' },
      { id: 'turf-wicket', label: 'Turf wicket' },
      { id: 'matting-wicket', label: 'Matting wicket' },
      { id: 'bowling-machine', label: 'Bowling machine' },
      { id: 'floodlights', label: 'Floodlights' },
      { id: 'changing-room', label: 'Changing room' },
      { id: 'parking', label: 'Parking' },
    ],
  },
  {
    sport: 'volleyball',
    label: 'Volleyball',
    emoji: '🏐',
    blurb: 'Indoor, outdoor & beach courts',
    features: [
      { id: 'indoor-court', label: 'Indoor court' },
      { id: 'outdoor-court', label: 'Outdoor court' },
      { id: 'beach-court', label: 'Beach court' },
      { id: 'floodlights', label: 'Floodlights' },
      { id: 'changing-room', label: 'Changing room' },
      { id: 'parking', label: 'Parking' },
    ],
  },
  {
    sport: 'basketball',
    label: 'Basketball',
    emoji: '🏀',
    blurb: 'Indoor & outdoor courts',
    features: [
      { id: 'indoor-court', label: 'Indoor court' },
      { id: 'outdoor-court', label: 'Outdoor court' },
      { id: 'full-court', label: 'Full court' },
      { id: 'half-court', label: 'Half court' },
      { id: 'floodlights', label: 'Floodlights' },
      { id: 'changing-room', label: 'Changing room' },
      { id: 'parking', label: 'Parking' },
    ],
  },
  {
    sport: 'tennis',
    label: 'Tennis',
    emoji: '🎾',
    blurb: 'Clay, hard & grass courts',
    features: [
      { id: 'clay', label: 'Clay court' },
      { id: 'hard-court', label: 'Hard court' },
      { id: 'grass', label: 'Grass court' },
      { id: 'floodlights', label: 'Floodlights' },
      { id: 'coaching', label: 'Coaching' },
      { id: 'changing-room', label: 'Changing room' },
      { id: 'parking', label: 'Parking' },
    ],
  },
  {
    sport: 'badminton',
    label: 'Badminton',
    emoji: '🏸',
    blurb: 'Indoor shuttle courts',
    features: [
      { id: 'indoor-court', label: 'Indoor court' },
      { id: 'wooden-floor', label: 'Wooden floor' },
      { id: 'synthetic-floor', label: 'Synthetic floor' },
      { id: 'coaching', label: 'Coaching' },
      { id: 'changing-room', label: 'Changing room' },
      { id: 'parking', label: 'Parking' },
    ],
  },
] as const;
