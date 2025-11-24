import { Archetype, ArchetypeId, Accessory } from './types';

export const ARCHETYPES: Archetype[] = [
  {
    id: ArchetypeId.PHARAOH,
    name: 'The Pharaoh',
    description: 'Ruler of the Two Lands, adorned in gold and the Nemes headdress.',
    promptModifier: 'dressed as a powerful Ancient Egyptian Pharaoh wearing a golden Nemes headdress, a ceremonial false beard, and an ornate collar. Cinematic lighting, golden aura, photorealistic, royal palace background.',
    icon: '👑',
    color: 'from-amber-500 to-yellow-700'
  },
  {
    id: ArchetypeId.QUEEN,
    name: 'Nile Queen',
    description: 'Divine feminine power, echoing the style of Nefertiti or Cleopatra.',
    promptModifier: 'dressed as an Ancient Egyptian Queen like Nefertiti, wearing a tall blue crown (Khepresh) or vulture crown, ornate gold jewelry, bold kohl eyeliner, and fine linen. Elegant, regal, limestone temple background.',
    icon: '🪞',
    color: 'from-cyan-500 to-blue-700'
  },
  {
    id: ArchetypeId.ANUBIS,
    name: 'Avatar of Anubis',
    description: 'The jackal-headed guide of the underworld.',
    promptModifier: 'wearing a black and gold ceremonial headdress inspired by Anubis with jackal ears and gold ornaments. The person has mystical dark eye makeup and gold geometric face paint. The human face is visible and blended with the Anubis aesthetic. Dark mysterious underworld atmosphere, torchlight.',
    icon: '🐕',
    color: 'from-stone-700 to-black'
  },
  {
    id: ArchetypeId.PRIEST,
    name: 'High Priest',
    description: 'Keeper of sacred mysteries and magical rituals.',
    promptModifier: 'dressed as an Ancient Egyptian High Priest, bald head, leopard skin drape over white linen robes, holding a gold ankh. Mystical energy, incense smoke, temple sanctuary background.',
    icon: '✨',
    color: 'from-emerald-600 to-green-800'
  },
  {
    id: ArchetypeId.WARRIOR,
    name: 'Medjay Warrior',
    description: 'Elite protector of the Pharaoh.',
    promptModifier: 'dressed as an elite Egyptian Medjay warrior, wearing leather armor, holding a khopesh sword, desert sand background, intense dramatic lighting, heroic pose.',
    icon: '⚔️',
    color: 'from-red-700 to-orange-900'
  }
];

export const ACCESSORIES: Accessory[] = [
  {
    id: 'nemes',
    name: 'Nemes Headdress',
    type: 'HEAD',
    description: 'The royal striped headcloth.',
    historicalSnippet: 'The Nemes was a striped headcloth worn by pharaohs, symbolizing their power. It was often made of gold and lapis lazuli to represent the flesh and hair of the gods.',
    icon: '👑'
  },
  {
    id: 'nefertiti',
    name: 'Cap Crown',
    type: 'HEAD',
    description: 'Tall blue crown of Queen Nefertiti.',
    historicalSnippet: 'This unique flat-topped blue crown is famously associated with Queen Nefertiti. Its height and shape emphasized her status as a goddess-queen equal to the Pharaoh.',
    icon: '🧢'
  },
  {
    id: 'collar',
    name: 'Usekh Collar',
    type: 'NECK',
    description: 'Broad ornamental collar.',
    historicalSnippet: 'The Usekh collar was a broad collar worn by the elite, made of rows of beads. It was believed to offer protection and was often placed on mummies to guard them in the afterlife.',
    icon: '📿'
  },
  {
    id: 'makeup',
    name: 'Kohl & Paint',
    type: 'FACE',
    description: 'Protective eye makeup.',
    historicalSnippet: 'Both men and women wore kohl (galena) around their eyes. While beautiful, it also protected the eyes from the intense sun and desert infections.',
    icon: '👁️'
  },
  {
    id: 'anubis',
    name: 'Jackal Mask',
    type: 'FULL',
    description: 'Mask of the Guardian.',
    historicalSnippet: 'Priests would wear masks of Anubis during mummification rituals to impersonate the god of the dead, ensuring the safe passage of the soul.',
    icon: '🐺'
  }
];