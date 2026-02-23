import type { Devotional, ReadingPlan, ReadingPlanDay } from '../types';

export const todayDevotional: Devotional = {
  id: '1',
  title: 'The Shepherd\'s Voice',
  scripture: 'John 10:27-28',
  scriptureText:
    'My sheep listen to my voice; I know them, and they follow me. I give them eternal life, and they shall never perish; no one will snatch them out of my hand.',
  body: 'In the stillness of the morning, before the noise of the day floods in, there is an invitation — to listen. Not to the anxious chatter of our own minds, but to the voice of the One who knows us fully and loves us completely. Today, let us practice the art of holy listening.\n\nThe shepherd does not shout over the noise. He speaks quietly, intimately — because he knows his sheep will recognize his voice. In a culture that rewards speed and volume, this is a counter-cultural invitation. Slow down. Turn off the noise. And listen for the voice that calls you by name.\n\nWhat might God be saying to you today that you\'ve been too busy to hear?',
  reflectQuestions: [
    'What "noise" in your life makes it hardest to hear God\'s voice?',
    'When was a time you clearly sensed God\'s leading? What made that moment different?',
    'What is one practical step you can take today to create more quiet space for listening?',
  ],
  prayer: 'Lord, in the rush of this day, slow me down. Quiet the noise — both outside and within. Help me to recognize your voice above all others, and give me the courage to follow where you lead. I trust that you know me fully, and that your hands hold me securely. Amen.',
  date: '2026-02-23',
  readTimeMinutes: 5,
  author: 'Pastor James',
};

export const readingPlan: ReadingPlan = {
  id: '1',
  name: 'Gospel of John',
  totalDays: 21,
  description: 'A 21-day journey through the Gospel of John',
  days: [
    { day: 1, passage: 'John 1' },
    { day: 2, passage: 'John 2' },
    { day: 3, passage: 'John 3' },
    { day: 4, passage: 'John 4' },
    { day: 5, passage: 'John 5' },
    { day: 6, passage: 'John 6:1–40' },
    { day: 7, passage: 'John 6:41–71' },
    { day: 8, passage: 'John 7' },
    { day: 9, passage: 'John 8' },
    { day: 10, passage: 'John 9' },
    { day: 11, passage: 'John 10' },
    { day: 12, passage: 'John 11' },
    { day: 13, passage: 'John 12' },
    { day: 14, passage: 'John 13' },
    { day: 15, passage: 'John 14' },
    { day: 16, passage: 'John 15' },
    { day: 17, passage: 'John 16' },
    { day: 18, passage: 'John 17' },
    { day: 19, passage: 'John 18' },
    { day: 20, passage: 'John 19' },
    { day: 21, passage: 'John 20–21' },
  ],
};

export const getPlanById = (id: string): ReadingPlan | undefined =>
  [readingPlan].find((p) => p.id === id);

export const getPlanDay = (planId: string, dayNumber: number): ReadingPlanDay | undefined => {
  const plan = getPlanById(planId);
  return plan?.days.find((d) => d.day === dayNumber);
};

export const recentDevotionals: Devotional[] = [
  {
    id: '2',
    title: 'Strength in Stillness',
    scripture: 'Psalm 46:10',
    scriptureText: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.',
    body: 'In a world that never stops moving, God invites us to a radical act — stillness. Not the stillness of inaction, but the stillness of deep trust. It is the stillness of a child resting in a parent\'s arms, knowing they are held.\n\nOur culture tells us that productivity equals worth. But the psalmist says something shocking: be still. Stop striving. Cease fighting. And in that stillness, discover who God truly is.\n\nStillness is not passive — it is the most active form of faith. It says, "I trust you enough to stop trying to control the outcome."',
    reflectQuestions: [
      'What area of your life do you find it hardest to "be still" and trust God with?',
      'How does our culture\'s obsession with busyness conflict with God\'s invitation to stillness?',
    ],
    prayer: 'Father, teach me the discipline of stillness. When my heart races with anxiety and my hands reach to control, remind me that you are God and I am not. Let me rest in your sovereignty today. Amen.',
    date: '2026-02-22',
    readTimeMinutes: 4,
    author: 'Pastor James',
  },
  {
    id: '3',
    title: 'Rooted in Love',
    scripture: 'Ephesians 3:17-18',
    scriptureText:
      'So that Christ may dwell in your hearts through faith. And I pray that you, being rooted and established in love, may have power, together with all the Lord\'s holy people, to grasp how wide and long and high and deep is the love of Christ.',
    body: 'The deepest roots grow in the richest soil. And the richest soil for the human soul is love. Paul\'s prayer for the Ephesians is not that they would achieve more, know more, or do more — but that they would be rooted in love.\n\nA tree with deep roots can weather any storm. It doesn\'t fear the wind because its foundation is secure. When our identity is rooted in Christ\'s love rather than our own performance, we become unshakable.\n\nToday, let the love of Christ be the ground you stand on — not your accomplishments, not others\' opinions, not your own self-assessment.',
    reflectQuestions: [
      'What are you most tempted to root your identity in besides God\'s love?',
      'How does understanding the depth of Christ\'s love change the way you see yourself?',
      'Who in your life needs to be reminded of God\'s unconditional love this week?',
    ],
    prayer: 'Jesus, plant me deep in the soil of your love. When the storms come — and they will — let me stand firm because my roots reach down into something eternal. Free me from the need to prove myself, and let your love be enough. Amen.',
    date: '2026-02-21',
    readTimeMinutes: 6,
    author: 'Pastor Sarah',
  },
  {
    id: '4',
    title: 'Walking by Faith',
    scripture: '2 Corinthians 5:7',
    scriptureText: 'For we live by faith, not by sight.',
    body: 'Faith is not the absence of doubt — it is the courage to move forward despite it. Paul reminds us that the Christian life is fundamentally a journey of trust, not certainty.\n\nWe live in a culture that demands proof before commitment. But faith asks us to step into the unknown, trusting that the ground will be there when our foot lands. Abraham left his homeland. Peter stepped onto the water. Mary said "yes" before she understood.\n\nThe life of faith is not a life without questions. It is a life where our trust in God is bigger than our need for answers.',
    reflectQuestions: [
      'Where in your life is God asking you to step forward in faith right now?',
      'How do you distinguish between healthy doubt and destructive unbelief?',
    ],
    prayer: 'God of the unknown, give me the courage to walk forward even when I cannot see the path. Strengthen my faith — not by removing my questions, but by deepening my trust in your goodness. I choose to follow, even when I don\'t fully understand. Amen.',
    date: '2026-02-20',
    readTimeMinutes: 5,
    author: 'Pastor James',
  },
  {
    id: '5',
    title: 'The Potter\'s Hands',
    scripture: 'Isaiah 64:8',
    scriptureText:
      'Yet you, Lord, are our Father. We are the clay, you are the potter; we are all the work of your hand.',
    body: 'Surrender is not weakness. It is the bravest act of trust — placing ourselves in the Potter\'s hands. The clay does not argue with the potter about its shape. It yields, trusts, and becomes.\n\nIsaiah reminds Israel — and us — of a fundamental truth: we are not self-made. We are God-shaped. Every pressure, every turn of the wheel, every moment in the fire is part of a design we cannot yet see.\n\nThe hardest part of being clay is the waiting. The shaping takes time. The firing is hot. But the Potter\'s hands are steady, skilled, and kind.',
    reflectQuestions: [
      'What area of your life do you find hardest to surrender to God\'s shaping?',
      'How does viewing hardship as "the potter\'s wheel" change your perspective on current struggles?',
      'What might God be forming in you through this current season?',
    ],
    prayer: 'Father, I am the clay — you are the Potter. I surrender the parts of my life I\'ve been gripping too tightly. Shape me into what you see when you look at me. Give me patience in the process and trust in your hands. Amen.',
    date: '2026-02-19',
    readTimeMinutes: 4,
    author: 'Pastor Sarah',
  },
];

export const allDevotionals: Devotional[] = [todayDevotional, ...recentDevotionals];

export const getDevotionalById = (id: string): Devotional | undefined =>
  allDevotionals.find((d) => d.id === id);
