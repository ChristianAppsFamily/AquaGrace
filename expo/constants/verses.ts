export interface Verse {
  text: string;
  reference: string;
}

export const DAILY_VERSES: Verse[] = [
  { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "He leads me beside still waters. He restores my soul.", reference: "Psalm 23:2-3" },
  { text: "This is the day that the Lord has made; let us rejoice and be glad in it.", reference: "Psalm 118:24" },
  { text: "Cast your burden on the Lord, and he will sustain you.", reference: "Psalm 55:22" },
  { text: "Be still, and know that I am God.", reference: "Psalm 46:10" },
  { text: "I can do all things through him who strengthens me.", reference: "Philippians 4:13" },
  { text: "The Lord is my light and my salvation; whom shall I fear?", reference: "Psalm 27:1" },
  { text: "Trust in the Lord with all your heart, and do not lean on your own understanding.", reference: "Proverbs 3:5" },
  { text: "Create in me a clean heart, O God, and renew a right spirit within me.", reference: "Psalm 51:10" },
  { text: "God is our refuge and strength, a very present help in trouble.", reference: "Psalm 46:1" },
  { text: "I praise you, for I am fearfully and wonderfully made.", reference: "Psalm 139:14" },
  { text: "The Lord is near to the brokenhearted and saves the crushed in spirit.", reference: "Psalm 34:18" },
  { text: "Your word is a lamp to my feet and a light to my path.", reference: "Psalm 119:105" },
  { text: "Delight yourself in the Lord, and he will give you the desires of your heart.", reference: "Psalm 37:4" },
  { text: "Wait for the Lord; be strong, and let your heart take courage.", reference: "Psalm 27:14" },
  { text: "Bless the Lord, O my soul, and all that is within me, bless his holy name!", reference: "Psalm 103:1" },
  { text: "The steadfast love of the Lord never ceases; his mercies never come to an end.", reference: "Lamentations 3:22" },
  { text: "Come to me, all who labor and are heavy laden, and I will give you rest.", reference: "Matthew 11:28" },
  { text: "For you formed my inward parts; you knitted me together in my mother's womb.", reference: "Psalm 139:13" },
  { text: "He gives power to the faint, and to him who has no might he increases strength.", reference: "Isaiah 40:29" },
  { text: "The Lord bless you and keep you; the Lord make his face shine on you.", reference: "Numbers 6:24-25" },
  { text: "Taste and see that the Lord is good! Blessed is the man who takes refuge in him!", reference: "Psalm 34:8" },
  { text: "My soul thirsts for God, for the living God.", reference: "Psalm 42:2" },
  { text: "He restores my soul. He leads me in paths of righteousness for his name's sake.", reference: "Psalm 23:3" },
  { text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.", reference: "Psalm 23:4" },
  { text: "How precious is your steadfast love, O God! The children of mankind take refuge in the shadow of your wings.", reference: "Psalm 36:7" },
  { text: "The Lord is my strength and my shield; in him my heart trusts, and I am helped.", reference: "Psalm 28:7" },
  { text: "O Lord, you have searched me and known me!", reference: "Psalm 139:1" },
  { text: "Make a joyful noise to the Lord, all the earth! Serve the Lord with gladness!", reference: "Psalm 100:1-2" },
  { text: "The Lord is gracious and merciful, slow to anger and abounding in steadfast love.", reference: "Psalm 145:8" },
  { text: "As a deer pants for flowing streams, so pants my soul for you, O God.", reference: "Psalm 42:1" },
];

export function getDailyVerse(): Verse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
