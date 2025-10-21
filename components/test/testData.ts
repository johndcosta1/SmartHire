// FIX: Import React to use React.ReactElement type.
import React from 'react';

export interface TestQuestion {
  id: string;
  section: 'Reasoning' | 'Mathematics' | 'Work Behaviour' | 'Personality' | 'Color Identification';
  text: string | React.ReactElement;
  options: { key: string; text: string; isCorrect?: boolean }[];
}

const plateStyle: React.CSSProperties = {
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '3.5rem',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  border: '1px solid #444',
  margin: '1rem auto 0',
};

const basicColorStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'inline-block',
  verticalAlign: 'middle',
  border: '1px solid #555',
  marginRight: '10px',
};


export const TEST_QUESTIONS: TestQuestion[] = [
  // Section 1: Basic Reasoning
  {
    id: 'q1',
    section: 'Reasoning',
    text: 'All roses are flowers. Some flowers fade quickly. Therefore:',
    options: [
      { key: 'A', text: 'All roses fade quickly' },
      { key: 'B', text: 'Some roses may fade quickly', isCorrect: true },
      { key: 'C', text: 'No roses fade' },
      { key: 'D', text: 'Roses are not flowers' },
    ],
  },
  {
    id: 'q2',
    section: 'Reasoning',
    text: 'Which number completes the series: 2, 4, 8, 16, ___',
    options: [
      { key: 'A', text: '20' },
      { key: 'B', text: '24' },
      { key: 'C', text: '32', isCorrect: true },
      { key: 'D', text: '64' },
    ],
  },
  {
    id: 'q3',
    section: 'Reasoning',
    text: 'Choose the odd one out: Apple, Banana, Mango, Potato',
    options: [
      { key: 'A', text: 'Apple' },
      { key: 'B', text: 'Banana' },
      { key: 'C', text: 'Mango' },
      { key: 'D', text: 'Potato', isCorrect: true },
    ],
  },
  {
    id: 'q4',
    section: 'Reasoning',
    text: 'If 12 pencils cost ₹48, how many pencils can you buy for ₹96?',
    options: [
      { key: 'A', text: '20' },
      { key: 'B', text: '22' },
      { key: 'C', text: '24', isCorrect: true },
      { key: 'D', text: '26' },
    ],
  },
  {
    id: 'q5',
    section: 'Reasoning',
    text: 'Ravi is older than Sita but younger than Mohan. Who is the youngest?',
    options: [
      { key: 'A', text: 'Ravi' },
      { key: 'B', text: 'Sita', isCorrect: true },
      { key: 'C', text: 'Mohan' },
      { key: 'D', text: 'Cannot say' },
    ],
  },
  // Section 2: Mathematics
  { id: 'q6', section: 'Mathematics', text: '45 + 27 =', options: [{ key: 'A', text: '62' }, { key: 'B', text: '72', isCorrect: true }, { key: 'C', text: '68' }, { key: 'D', text: '75' }], },
  { id: 'q7', section: 'Mathematics', text: '250 – 175 =', options: [{ key: 'A', text: '65' }, { key: 'B', text: '70' }, { key: 'C', text: '75', isCorrect: true }, { key: 'D', text: '80' }], },
  { id: 'q8', section: 'Mathematics', text: '16 × 5 =', options: [{ key: 'A', text: '70' }, { key: 'B', text: '75' }, { key: 'C', text: '80', isCorrect: true }, { key: 'D', text: '85' }], },
  { id: 'q9', section: 'Mathematics', text: '900 – 375 =', options: [{ key: 'A', text: '515' }, { key: 'B', text: '520' }, { key: 'C', text: '525', isCorrect: true }, { key: 'D', text: '530' }], },
  { id: 'q10', section: 'Mathematics', text: '25 × 8 =', options: [{ key: 'A', text: '180' }, { key: 'B', text: '190' }, { key: 'C', text: '200', isCorrect: true }, { key: 'D', text: '210' }], },
  { id: 'q11', section: 'Mathematics', text: 'A bag contains 24 apples. You give 8 to a friend and buy 12 more. How many apples do you have now?', options: [{ key: 'A', text: '26' }, { key: 'B', text: '28' }, { key: 'C', text: '32', isCorrect: true }, { key: 'D', text: '30' }], },
  { id: 'q12', section: 'Mathematics', text: 'You spend ₹125 on food, ₹200 on transport, and ₹175 on shopping. You had ₹800 in total. How much remains?', options: [{ key: 'A', text: '₹250' }, { key: 'B', text: '₹275' }, { key: 'C', text: '₹300', isCorrect: true }, { key: 'D', text: '₹350' }], },
  { id: 'q13', section: 'Mathematics', text: 'Multiply first, then add: 6 × 7 + 8 =', options: [{ key: 'A', text: '48' }, { key: 'B', text: '56' }, { key: 'C', text: '50', isCorrect: true }, { key: 'D', text: '58' }], },
  { id: 'q14', section: 'Mathematics', text: 'A worker earns ₹1,200 per week. How much does he earn in 8 weeks?', options: [{ key: 'A', text: '₹9,000' }, { key: 'B', text: '₹9,400' }, { key: 'C', text: '₹9,600', isCorrect: true }, { key: 'D', text: '₹9,800' }], },
  { id: 'q15', section: 'Mathematics', text: 'A shop sells 35 pens at ₹20 each. How much does the shop collect?', options: [{ key: 'A', text: '₹600' }, { key: 'B', text: '₹650' }, { key: 'C', text: '₹700', isCorrect: true }, { key: 'D', text: '₹750' }], },
  // Section 3: Work Behaviour
  { id: 'q16', section: 'Work Behaviour', text: 'If you finish your work early, you should:', options: [{ key: 'A', text: 'Relax and wait for others' }, { key: 'B', text: 'Ask for more work', isCorrect: true }, { key: 'C', text: 'Leave without informing' }, { key: 'D', text: 'Check your phone' }], },
  { id: 'q17', section: 'Work Behaviour', text: 'Your co-worker makes a mistake. You will:', options: [{ key: 'A', text: 'Ignore it' }, { key: 'B', text: 'Correct them politely', isCorrect: true }, { key: 'C', text: 'Report them immediately' }, { key: 'D', text: 'Make fun of them' }], },
  { id: 'q18', section: 'Work Behaviour', text: 'When you’re late to work, you should:', options: [{ key: 'A', text: 'Hide it' }, { key: 'B', text: 'Inform your supervisor honestly', isCorrect: true }, { key: 'C', text: 'Blame traffic' }, { key: 'D', text: 'Avoid talking about it' }], },
  { id: 'q19', section: 'Work Behaviour', text: 'How do you prefer to work?', options: [{ key: 'A', text: 'Alone' }, { key: 'B', text: 'In a team', isCorrect: true }, { key: 'C', text: 'Only with supervision' }, { key: 'D', text: 'Randomly' }], },
  { id: 'q20', section: 'Work Behaviour', text: 'If a customer or colleague is rude, you should:', options: [{ key: 'A', text: 'Be rude back' }, { key: 'B', text: 'Stay calm and polite', isCorrect: true }, { key: 'C', text: 'Walk away silently' }, { key: 'D', text: 'Argue' }], },
  // Section 4: Personality
  { id: 'q21', section: 'Personality', text: 'I feel happiest when:', options: [{ key: 'A', text: 'Helping others' }, { key: 'B', text: 'Achieving something', isCorrect: true }, { key: 'C', text: 'Relaxing quietly' }, { key: 'D', text: 'Having fun with people' }], },
  { id: 'q22', section: 'Personality', text: 'When faced with a problem, I:', options: [{ key: 'A', text: 'Panic' }, { key: 'B', text: 'Think calmly', isCorrect: true }, { key: 'C', text: 'Wait for others' }, { key: 'D', text: 'Ignore it' }], },
  { id: 'q23', section: 'Personality', text: 'I handle stress by:', options: [{ key: 'A', text: 'Taking a short break', isCorrect: true }, { key: 'B', text: 'Complaining' }, { key: 'C', text: 'Shouting' }, { key: 'D', text: 'Ignoring everyone' }], },
  { id: 'q24', section: 'Personality', text: 'People describe me as:', options: [{ key: 'A', text: 'Calm', isCorrect: true }, { key: 'B', text: 'Energetic' }, { key: 'C', text: 'Kind' }, { key: 'D', text: 'Funny' }], },
  { id: 'q25', section: 'Personality', text: 'I prefer work that is:', options: [{ key: 'A', text: 'Routine' }, { key: 'B', text: 'Fast and active', isCorrect: true }, { key: 'C', text: 'Relaxed' }, { key: 'D', text: 'Frequently changing' }], },
  { id: 'q26', section: 'Personality', text: 'I stay motivated when:', options: [{ key: 'A', text: 'I’m praised' }, { key: 'B', text: 'I’m challenged' }, { key: 'C', text: 'I have a clear plan', isCorrect: true }, { key: 'D', text: 'I work with others' }], },
  { id: 'q27', section: 'Personality', text: 'I make decisions by:', options: [{ key: 'A', text: 'Thinking logically', isCorrect: true }, { key: 'B', text: 'Following my feelings' }, { key: 'C', text: 'Asking others' }, { key: 'D', text: 'Waiting for someone else' }], },
  { id: 'q28', section: 'Personality', text: 'I enjoy working with:', options: [{ key: 'A', text: 'People', isCorrect: true }, { key: 'B', text: 'Numbers' }, { key: 'C', text: 'Machines' }, { key: 'D', text: 'Ideas' }], },
  { id: 'q29', section: 'Personality', text: 'When someone disagrees with me, I:', options: [{ key: 'A', text: 'Listen and discuss', isCorrect: true }, { key: 'B', text: 'Argue' }, { key: 'C', text: 'Walk away' }, { key: 'D', text: 'Ignore them' }], },
  { id: 'q30', section: 'Personality', text: 'I prefer a boss who is:', options: [{ key: 'A', text: 'Strict' }, { key: 'B', text: 'Supportive' }, { key: 'C', text: 'Friendly' }, { key: 'D', text: 'Fair', isCorrect: true }], },
  // Section 5: Color Identification
  {
    id: 'q31',
    section: 'Color Identification',
    text: React.createElement('div', { style: { width: '100%', textAlign: 'center' } },
        React.createElement('p', { style: { fontSize: '1.25rem', marginBottom: '1rem' } }, 'What number do you see in the circle below?'),
        React.createElement('div', { style: { ...plateStyle, backgroundColor: '#D2B48C' } },
            React.createElement('span', { style: { color: '#BC8F8F' } }, '74')
        )
    ),
    options: [
      { key: 'A', text: '74', isCorrect: true },
      { key: 'B', text: '21' },
      { key: 'C', text: 'I see nothing' },
      { key: 'D', text: '47' },
    ],
  },
  {
    id: 'q32',
    section: 'Color Identification',
    text: React.createElement('div', { style: { width: '100%', textAlign: 'center' } },
        React.createElement('p', { style: { fontSize: '1.25rem', marginBottom: '1rem' } }, 'What number do you see in the circle below?'),
        React.createElement('div', { style: { ...plateStyle, backgroundColor: '#b0a18f' } },
            React.createElement('span', { style: { color: '#a0927d' } }, '29')
        )
    ),
    options: [
      { key: 'A', text: '29', isCorrect: true },
      { key: 'B', text: '70' },
      { key: 'C', text: 'I see nothing' },
      { key: 'D', text: '92' },
    ],
  },
  {
    id: 'q33',
    section: 'Color Identification',
    text: React.createElement('div', { style: { width: '100%', textAlign: 'center' } },
        React.createElement('p', { style: { fontSize: '1.25rem', marginBottom: '1rem' } }, 'What number do you see in the circle below?'),
        React.createElement('div', { style: { ...plateStyle, backgroundColor: '#93c572' } },
            React.createElement('span', { style: { color: '#addfad' } }, '5')
        )
    ),
    options: [
      { key: 'A', text: '5', isCorrect: true },
      { key: 'B', text: '2' },
      { key: 'C', text: 'I see nothing' },
      { key: 'D', text: '6' },
    ],
  },
  {
    id: 'q34',
    section: 'Color Identification',
    text: React.createElement('div', { style: { width: '100%', textAlign: 'center' } },
        React.createElement('p', { style: { fontSize: '1.25rem', marginBottom: '1rem' } }, 'What number do you see in the circle below?'),
        React.createElement('div', { style: { ...plateStyle, backgroundColor: '#f0a1a1' } },
            React.createElement('span', { style: { color: '#c0c0c0' } }, '8')
        )
    ),
    options: [
      { key: 'A', text: '8', isCorrect: true },
      { key: 'B', text: '3' },
      { key: 'C', text: 'I see nothing' },
      { key: 'D', text: '6' },
    ],
  },
  {
    id: 'q35',
    section: 'Color Identification',
    text: React.createElement('div', { style: { width: '100%', textAlign: 'center' } },
        React.createElement('p', { style: { fontSize: '1.25rem', marginBottom: '1rem' } }, 'What number do you see in the circle below?'),
        React.createElement('div', { style: { ...plateStyle, backgroundColor: '#fabd92' } },
            React.createElement('span', { style: { color: '#d2b48c' } }, '6')
        )
    ),
    options: [
      { key: 'A', text: '6', isCorrect: true },
      { key: 'B', text: '5' },
      { key: 'C', text: 'I see nothing' },
      { key: 'D', text: '9' },
    ],
  },
  {
    id: 'q36',
    section: 'Color Identification',
    text: React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
      React.createElement('div', { style: { ...basicColorStyle, backgroundColor: '#FF0000' } }),
      'What color is this circle?'
    ),
    options: [
      { key: 'A', text: 'Red', isCorrect: true },
      { key: 'B', text: 'Green' },
      { key: 'C', text: 'Blue' },
      { key: 'D', text: 'Yellow' }
    ],
  },
  {
    id: 'q37',
    section: 'Color Identification',
    text: React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
      React.createElement('div', { style: { ...basicColorStyle, backgroundColor: '#008000' } }),
      'What color is this circle?'
    ),
    options: [
      { key: 'A', text: 'Green', isCorrect: true },
      { key: 'B', text: 'Red' },
      { key: 'C', text: 'Blue' },
      { key: 'D', text: 'Orange' }
    ],
  },
  {
    id: 'q38',
    section: 'Color Identification',
    text: React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
      React.createElement('div', { style: { ...basicColorStyle, backgroundColor: '#0000FF' } }),
      'What color is this circle?'
    ),
    options: [
      { key: 'A', text: 'Blue', isCorrect: true },
      { key: 'B', text: 'Yellow' },
      { key: 'C', text: 'Green' },
      { key: 'D', text: 'Red' }
    ],
  },
  {
    id: 'q39',
    section: 'Color Identification',
    text: React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
      React.createElement('div', { style: { ...basicColorStyle, backgroundColor: '#FFFF00' } }),
      'What color is this circle?'
    ),
    options: [
      { key: 'A', text: 'Yellow', isCorrect: true },
      { key: 'B', text: 'Orange' },
      { key: 'C', text: 'Blue' },
      { key: 'D', text: 'Green' }
    ],
  },
  {
    id: 'q40',
    section: 'Color Identification',
    text: React.createElement('div', { style: { display: 'flex', alignItems: 'center' } },
      React.createElement('div', { style: { ...basicColorStyle, backgroundColor: '#FFA500' } }),
      'What color is this circle?'
    ),
    options: [
      { key: 'A', text: 'Orange', isCorrect: true },
      { key: 'B', text: 'Yellow' },
      { key: 'C', text: 'Red' },
      { key: 'D', text: 'Blue' }
    ],
  },
];