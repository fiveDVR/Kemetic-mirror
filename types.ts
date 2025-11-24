export enum ArchetypeId {
  PHARAOH = 'PHARAOH',
  QUEEN = 'QUEEN',
  ANUBIS = 'ANUBIS',
  PRIEST = 'PRIEST',
  WARRIOR = 'WARRIOR',
  SCRIBE = 'SCRIBE'
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  description: string;
  promptModifier: string;
  icon: string; // URL or emoji representation
  color: string;
}

export interface GeneratedResult {
  imageUrl: string;
  oracleText: string;
}

export type ProcessingState = 'IDLE' | 'CAPTURING' | 'TRANSMUTING' | 'CONSULTING' | 'COMPLETE' | 'ERROR';

export type AccessoryType = 'HEAD' | 'NECK' | 'FACE' | 'FULL';

export interface Accessory {
  id: string;
  name: string;
  type: AccessoryType;
  description: string;
  historicalSnippet: string;
  icon: string;
}
