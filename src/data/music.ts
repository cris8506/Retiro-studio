import { OFFICIAL_PLAYLISTS as RAW_PLAYLISTS } from '../../shared/music.js';
import type { MusicTrack as SharedMusicTrack } from '../../shared/music.js';

export interface MusicTrack extends SharedMusicTrack {}

export const OFFICIAL_PLAYLISTS: MusicTrack[] = RAW_PLAYLISTS;
