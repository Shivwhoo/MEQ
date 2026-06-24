export interface QuestionOption {
  text: string;
  score: number;
}

export interface Question {
  id: string; // e.g. "q1", "q2"
  number: number;
  text: string;
  options: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    number: 1,
    text: 'What time would you get up if you were entirely free to plan your day?',
    options: [
      { text: '5:00–6:30 AM', score: 5 },
      { text: '6:30–7:45 AM', score: 4 },
      { text: '7:45–9:45 AM', score: 3 },
      { text: '9:45–11:00 AM', score: 2 },
      { text: '11:00 AM–12:00 PM', score: 1 },
      { text: '12:00 PM–5:00 AM', score: 0 },
    ],
  },
  {
    id: 'q2',
    number: 2,
    text: 'What time would you go to bed if you were entirely free to plan your evening?',
    options: [
      { text: '8:00–9:00 PM', score: 5 },
      { text: '9:00–10:15 PM', score: 4 },
      { text: '10:15 PM–12:30 AM', score: 3 },
      { text: '12:30–1:45 AM', score: 2 },
      { text: '1:45–3:00 AM', score: 1 },
      { text: '3:00 AM–8:00 PM', score: 0 },
    ],
  },
  {
    id: 'q3',
    number: 3,
    text: 'If there is a specific time at which you have to get up in the morning, to what extent do you depend on being woken up by an alarm clock?',
    options: [
      { text: 'Not at all dependent', score: 4 },
      { text: 'Slightly dependent', score: 3 },
      { text: 'Fairly dependent', score: 2 },
      { text: 'Very dependent', score: 1 },
    ],
  },
  {
    id: 'q4',
    number: 4,
    text: 'How easy do you find it to get up in the morning?',
    options: [
      { text: 'Not at all easy', score: 1 },
      { text: 'Not very easy', score: 2 },
      { text: 'Fairly easy', score: 3 },
      { text: 'Very easy', score: 4 },
    ],
  },
  {
    id: 'q5',
    number: 5,
    text: 'How alert do you feel during the first half hour after waking up?',
    options: [
      { text: 'Not at all alert', score: 1 },
      { text: 'Slightly alert', score: 2 },
      { text: 'Fairly alert', score: 3 },
      { text: 'Very alert', score: 4 },
    ],
  },
  {
    id: 'q6',
    number: 6,
    text: 'How hungry do you feel during the first half hour after waking up?',
    options: [
      { text: 'Not at all hungry', score: 1 },
      { text: 'Slightly hungry', score: 2 },
      { text: 'Fairly hungry', score: 3 },
      { text: 'Very hungry', score: 4 },
    ],
  },
  {
    id: 'q7',
    number: 7,
    text: 'During the first half hour after waking up, how tired do you feel?',
    options: [
      { text: 'Very tired', score: 1 },
      { text: 'Fairly tired', score: 2 },
      { text: 'Fairly refreshed', score: 3 },
      { text: 'Very refreshed', score: 4 },
    ],
  },
  {
    id: 'q8',
    number: 8,
    text: 'If you have no commitments the next day, what time would you go to bed compared to your usual bedtime?',
    options: [
      { text: 'Seldom or never later', score: 4 },
      { text: 'Less than one hour later', score: 3 },
      { text: '1–2 hours later', score: 2 },
      { text: 'More than two hours later', score: 1 },
    ],
  },
  {
    id: 'q9',
    number: 9,
    text: 'A friend suggests exercising between 7:00–8:00 AM. How would you perform?',
    options: [
      { text: 'Would be in good form', score: 4 },
      { text: 'Would be in reasonable form', score: 3 },
      { text: 'Would find it difficult', score: 2 },
      { text: 'Would find it very difficult', score: 1 },
    ],
  },
  {
    id: 'q10',
    number: 10,
    text: 'At what time of day do you feel tired as a result of need for sleep?',
    options: [
      { text: '8:00–9:00 PM', score: 5 },
      { text: '9:00–10:15 PM', score: 4 },
      { text: '10:15 PM–12:45 AM', score: 3 },
      { text: '12:45–2:00 AM', score: 2 },
      { text: '2:00–3:00 AM', score: 1 },
    ],
  },
  {
    id: 'q11',
    number: 11,
    text: 'For a mentally exhausting test, which time would you choose?',
    options: [
      { text: '8:00–10:00 AM', score: 4 },
      { text: '11:00 AM–1:00 PM', score: 3 },
      { text: '3:00–5:00 PM', score: 2 },
      { text: '7:00–9:00 PM', score: 1 },
    ],
  },
  {
    id: 'q12',
    number: 12,
    text: 'If you got into bed at 11:00 PM, how tired would you be?',
    options: [
      { text: 'Not at all tired', score: 1 },
      { text: 'A little tired', score: 2 },
      { text: 'Fairly tired', score: 3 },
      { text: 'Very tired', score: 4 },
    ],
  },
  {
    id: 'q13',
    number: 13,
    text: 'If you went to bed several hours later than usual, what would you most likely do?',
    options: [
      { text: 'Wake at usual time and NOT fall back asleep', score: 4 },
      { text: 'Wake at usual time and doze thereafter', score: 3 },
      { text: 'Wake at usual time but fall asleep again', score: 2 },
      { text: 'Wake later than usual', score: 1 },
    ],
  },
  {
    id: 'q14',
    number: 14,
    text: 'You must stay awake from 4:00–6:00 AM for a night watch. Which suits you best?',
    options: [
      { text: 'Would NOT go to bed until watch was over', score: 1 },
      { text: 'Take a nap before and sleep after', score: 2 },
      { text: 'Take a good sleep before and nap after', score: 3 },
      { text: 'Sleep only before watch', score: 4 },
    ],
  },
  {
    id: 'q15',
    number: 15,
    text: 'You must do two hours of hard physical work. Which time would you choose?',
    options: [
      { text: '8:00–10:00 AM', score: 4 },
      { text: '11:00 AM–1:00 PM', score: 3 },
      { text: '3:00–5:00 PM', score: 2 },
      { text: '7:00–9:00 PM', score: 1 },
    ],
  },
  {
    id: 'q16',
    number: 16,
    text: 'A friend suggests exercising between 10:00–11:00 PM. How would you perform?',
    options: [
      { text: 'Would be in good form', score: 1 },
      { text: 'Would be in reasonable form', score: 2 },
      { text: 'Would find it difficult', score: 3 },
      { text: 'Would find it very difficult', score: 4 },
    ],
  },
  {
    id: 'q17',
    number: 17,
    text: 'If you could choose your own work hours, which 5 consecutive hours would you select?',
    options: [
      { text: 'Start between 4:00–8:00 AM', score: 5 },
      { text: 'Start between 8:00–9:00 AM', score: 4 },
      { text: 'Start between 9:00 AM–2:00 PM', score: 3 },
      { text: 'Start between 2:00–5:00 PM', score: 2 },
      { text: 'Start between 5:00 PM–4:00 AM', score: 1 },
    ],
  },
  {
    id: 'q18',
    number: 18,
    text: 'At what time of day do you think you reach your "feeling best" peak?',
    options: [
      { text: '5:00–8:00 AM', score: 5 },
      { text: '8:00–10:00 AM', score: 4 },
      { text: '10:00 AM–5:00 PM', score: 3 },
      { text: '5:00–10:00 PM', score: 2 },
      { text: '10:00 PM–5:00 AM', score: 1 },
    ],
  },
  {
    id: 'q19',
    number: 19,
    text: 'Which type do you consider yourself to be?',
    options: [
      { text: 'Definitely a morning type', score: 6 },
      { text: 'Rather more a morning than evening type', score: 4 },
      { text: 'Rather more an evening than morning type', score: 2 },
      { text: 'Definitely an evening type', score: 0 },
    ],
  },
];
