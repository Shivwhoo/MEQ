export interface ScoreInterpretation {
  category: string;
  description: string;
  minScore: number;
  maxScore: number;
}

export const INTERPRETATIONS: ScoreInterpretation[] = [
  {
    category: 'Definitely Morning Type',
    minScore: 70,
    maxScore: 86,
    description: 'You have a strong preference for early mornings. You naturally wake up early feeling alert and refreshed. Your physical and mental peak performance occurs in the morning hours, making you highly productive early in the day.',
  },
  {
    category: 'Moderately Morning Type',
    minScore: 59,
    maxScore: 69,
    description: 'You lean towards morning hours for most activities. You generally find it easy to wake up and feel reasonably alert. Your cognitive and physical peak peaks in the morning or early afternoon.',
  },
  {
    category: 'Intermediate Type',
    minScore: 42,
    maxScore: 58,
    description: 'Your biological rhythm is balanced. You are flexible and can adapt relatively easily to both early morning schedules and late evening activities, maintaining stable performance throughout the day.',
  },
  {
    category: 'Moderately Evening Type',
    minScore: 31,
    maxScore: 41,
    description: 'You prefer late afternoon and evening hours for peak physical and mental activity. You may feel sluggish in the early morning, but your energy and focus increase as the day progresses.',
  },
  {
    category: 'Definitely Evening Type',
    minScore: 16,
    maxScore: 30,
    description: 'You are a strong night owl. You feel most creative, alert, and active late in the evening or at night. Early mornings are very challenging, and you perform best when aligned with a late schedule.',
  },
];

export function getChronotypeInterpretation(score: number): ScoreInterpretation {
  const interpretation = INTERPRETATIONS.find(
    (item) => score >= item.minScore && score <= item.maxScore
  );
  if (interpretation) return interpretation;
  
  // Fallbacks
  if (score < 16) return INTERPRETATIONS[INTERPRETATIONS.length - 1];
  return INTERPRETATIONS[0];
}
