import {
  Church,
  User,
  Devotional,
  JournalEntry,
  Prayer,
  SharedReflection,
  DevotionalCompletion,
} from '../types';

export const mockChurch: Church = {
  id: 'church-1',
  name: 'Grace Community Church',
  inviteCode: 'GRACE2026',
  createdBy: 'user-pastor-1',
  memberCount: 87,
  createdAt: '2026-01-01T00:00:00Z',
};

export const mockUser: User = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  churchId: 'church-1',
  churchName: 'Grace Community Church',
  role: 'member',
  streakCount: 12,
  longestStreak: 21,
  lastActiveDate: '2026-02-07',
  joinedAt: '2026-01-15T00:00:00Z',
  notificationTime: '07:00',
};

const today = new Date();
const formatDate = (daysAgo: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const mockDevotionals: Devotional[] = [
  {
    id: 'dev-1',
    churchId: 'church-1',
    authorId: 'user-pastor-1',
    authorName: 'Pastor David Kim',
    scriptureRef: 'Philippians 3:4-10',
    scriptureText:
      'Though I myself have reasons for such confidence. If someone else thinks they have reasons to put confidence in the flesh, I have more: circumcised on the eighth day, of the people of Israel, of the tribe of Benjamin, a Hebrew of Hebrews; in regard to the law, a Pharisee; as for zeal, persecuting the church; as for righteousness based on the law, faultless.\n\nBut whatever were gains to me I now consider loss for the sake of Christ. What is more, I consider everything a loss because of the surpassing worth of knowing Christ Jesus my Lord, for whose sake I have lost all things. I consider them garbage, that I may gain Christ and be found in him, not having a righteousness of my own that comes from the law, but that which is through faith in Christ — the righteousness that comes from God on the basis of faith. I want to know Christ — yes, to know the power of his resurrection and participation in his sufferings, becoming like him in his death.',
    reflection:
      "Think about the riskiest thing you've ever done. Maybe it was a career change, a big move, or a leap of faith in a relationship. Now imagine counting everything you've accomplished — your degrees, your reputation, your security — as garbage.\n\nThat's exactly what Paul did. He had the ultimate spiritual résumé: born into the right family, educated by the best teachers, zealous beyond measure. By every human measure, he had made it.\n\nBut then he met Jesus. And everything changed.\n\nPaul doesn't just say he gave up those things reluctantly. He says he considers them garbage — the Greek word is actually much stronger — compared to knowing Christ. This isn't the language of sacrifice; it's the language of someone who found something so valuable that everything else pales in comparison.\n\nThe question for us today isn't whether we're willing to give things up for Jesus. It's whether we've truly seen how surpassingly worthy He is. When we catch a glimpse of who Christ really is, surrender stops feeling like loss and starts feeling like the only reasonable response.",
    prayerPrompt:
      "Tell God what you're worried about losing by following Him boldly. Then ask Jesus for the courage to surrender those things, trusting that knowing Him is worth more than anything you could hold onto.",
    publishedAt: formatDate(0),
    status: 'published',
    questions: [
      {
        id: 'q-1',
        devotionalId: 'dev-1',
        text: 'What are you afraid of losing if you boldly follow Jesus?',
        order: 1,
      },
      {
        id: 'q-2',
        devotionalId: 'dev-1',
        text: "How does Paul's example encourage you to surrender those fears?",
        order: 2,
      },
    ],
  },
  {
    id: 'dev-2',
    churchId: 'church-1',
    authorId: 'user-pastor-1',
    authorName: 'Pastor David Kim',
    scriptureRef: 'Psalm 23:1-6',
    scriptureText:
      'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name\'s sake.\n\nEven though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.\n\nYou prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows. Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.',
    reflection:
      "There's a reason Psalm 23 is the most beloved passage in the Bible. It's not just beautiful poetry — it's a radical declaration of trust in the middle of real life.\n\nDavid doesn't write this from a place of comfort. He's a shepherd-turned-king who has been hunted, betrayed, and broken. He knows what the darkest valley looks like. And yet he says, \"I will fear no evil.\"\n\nNotice something crucial: David doesn't say God removes the dark valley. He says God walks through it with him. The shepherd doesn't eliminate danger — he provides presence.\n\nThis is the heart of our faith. We don't follow a God who promises an easy life. We follow a God who promises Himself. And His presence changes everything about how we face our valleys.\n\nToday, whatever valley you're walking through — financial stress, relational pain, health concerns, spiritual doubt — the Shepherd is with you. Not ahead of you, not behind you, but right beside you.",
    prayerPrompt:
      "Name the valley you're walking through right now. Ask the Good Shepherd to make His presence real to you today. Thank Him that you don't walk alone.",
    publishedAt: formatDate(1),
    status: 'published',
    questions: [
      {
        id: 'q-3',
        devotionalId: 'dev-2',
        text: "What 'dark valley' are you currently walking through or have recently walked through?",
        order: 1,
      },
      {
        id: 'q-4',
        devotionalId: 'dev-2',
        text: "How have you experienced God's presence in difficult times?",
        order: 2,
      },
      {
        id: 'q-5',
        devotionalId: 'dev-2',
        text: 'What does it mean to you that God prepares a table "in the presence of your enemies"?',
        order: 3,
      },
    ],
  },
  {
    id: 'dev-3',
    churchId: 'church-1',
    authorId: 'user-pastor-1',
    authorName: 'Pastor David Kim',
    scriptureRef: 'Romans 12:1-2',
    scriptureText:
      'Therefore, I urge you, brothers and sisters, in view of God\'s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God — this is your true and proper worship. Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is — his good, pleasing and perfect will.',
    reflection:
      "Paul starts with \"therefore\" — which means everything he's about to say is rooted in everything he's already said. Eleven chapters of theology about God's grace, mercy, and faithfulness now lead to one practical response: give Him your whole life.\n\nBut notice the language. Paul doesn't say \"try harder.\" He says \"be transformed.\" The Greek word is metamorphoo — it's where we get metamorphosis. This isn't behavior modification; it's a complete renovation of how you think.\n\nThe world has a pattern — a mold it's constantly trying to press you into. Social media tells you what success looks like. Culture tells you what happiness requires. But Paul says there's a different way: let God renew your mind, and you'll discover that His will isn't a burden — it's good, pleasing, and perfect.\n\nTransformation starts in the mind. What are you feeding your thoughts today? What voices are shaping your perspective? The daily choice to engage with God's Word is the most practical step toward the renewed mind Paul describes.",
    prayerPrompt:
      'Ask God to show you one area where your thinking has been shaped more by the world than by His Word. Invite Him to begin transforming your mind in that area today.',
    publishedAt: formatDate(2),
    status: 'published',
    questions: [
      {
        id: 'q-6',
        devotionalId: 'dev-3',
        text: "What 'patterns of this world' do you find hardest to resist in your daily life?",
        order: 1,
      },
      {
        id: 'q-7',
        devotionalId: 'dev-3',
        text: 'What does offering yourself as a "living sacrifice" look like practically for you this week?',
        order: 2,
      },
    ],
  },
  {
    id: 'dev-4',
    churchId: 'church-1',
    authorId: 'user-pastor-1',
    authorName: 'Pastor David Kim',
    scriptureRef: 'Matthew 6:25-34',
    scriptureText:
      '"Therefore I tell you, do not worry about your life, what you will eat or drink; or about your body, what you will wear. Is not life more than food, and the body more than clothes? Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?\n\nCan any one of you by worrying add a single hour to your life?\n\nAnd why do you worry about clothes? See how the flowers of the field grow. They do not labor or spin. Yet I tell you that not even Solomon in all his splendor was dressed like one of these.\n\nIf that is how God clothes the grass of the field, which is here today and tomorrow is thrown into the fire, will he not much more clothe you — you of little faith? So do not worry, saying, \'What shall we eat?\' or \'What shall we drink?\' or \'What shall we wear?\' For the pagans run after all these things, and your heavenly Father knows that you need them. But seek first his kingdom and his righteousness, and all these things will be given to you as well. Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own."',
    reflection:
      "Jesus doesn't say \"Don't worry\" because our problems aren't real. He says it because our Father is real — and He knows what we need.\n\nThis passage is one of the most practical things Jesus ever said. He looks at the birds and the flowers — creatures that don't have savings accounts or career plans — and says, \"Your Father takes care of them. Do you really think He'll forget about you?\"\n\nThe antidote to worry isn't willpower. It's worship. \"Seek first his kingdom\" isn't just a spiritual platitude — it's a reorientation of priorities. When God's kingdom is first, our anxieties find their proper place: not gone, but governed by a bigger reality.\n\nNotice Jesus says \"each day has enough trouble of its own.\" He's honest about the fact that life is hard. But He's also saying: don't borrow tomorrow's trouble today. Live in the grace that's sufficient for this moment.",
    prayerPrompt:
      "Write down the thing you're most worried about right now. Then, honestly tell God about it. Ask Him to help you seek His kingdom first today, trusting that He knows what you need.",
    publishedAt: formatDate(3),
    status: 'published',
    questions: [
      {
        id: 'q-8',
        devotionalId: 'dev-4',
        text: 'What are you most anxious about right now? Be specific.',
        order: 1,
      },
      {
        id: 'q-9',
        devotionalId: 'dev-4',
        text: 'How does Jesus\' invitation to "seek first his kingdom" challenge your current priorities?',
        order: 2,
      },
    ],
  },
  {
    id: 'dev-5',
    churchId: 'church-1',
    authorId: 'user-pastor-1',
    authorName: 'Pastor David Kim',
    scriptureRef: 'James 1:2-4',
    scriptureText:
      'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete, not lacking anything.',
    reflection:
      "\"Consider it pure joy\" — James must be kidding, right? Joy in trials?\n\nBut James isn't talking about pretending everything is fine. He's talking about a perspective shift that comes from understanding what God is doing in our suffering. Trials test our faith. That testing produces perseverance. And perseverance makes us mature and complete.\n\nGod isn't wasting your pain. Every difficulty you face is an opportunity for your faith to grow roots. Like a tree that grows stronger in the wind, your character is being formed by the very things that feel like they're breaking you.\n\nThe key word here is \"let.\" Let perseverance finish its work. We have a choice when trials come: we can resist the process, or we can lean into it, trusting that God is making us into the people He created us to be.\n\nWhat trial are you in the middle of right now? What if, instead of asking \"Why?\" you asked \"What are You building in me?\"",
    prayerPrompt:
      'Ask God to give you eyes to see what He might be producing in you through your current challenges. Pray for the faith to "consider it joy" — not because the trial is good, but because the God behind it is.',
    publishedAt: formatDate(4),
    status: 'published',
    questions: [
      {
        id: 'q-10',
        devotionalId: 'dev-5',
        text: 'What current trial could God be using to develop perseverance in your life?',
        order: 1,
      },
      {
        id: 'q-11',
        devotionalId: 'dev-5',
        text: 'How does knowing the purpose of trials change how you respond to them?',
        order: 2,
      },
    ],
  },
  {
    id: 'dev-6',
    churchId: 'church-1',
    authorId: 'user-pastor-1',
    authorName: 'Pastor David Kim',
    scriptureRef: 'Ephesians 2:8-10',
    scriptureText:
      'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast. For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.',
    reflection:
      "Grace and works — two words that have caused more theological arguments than almost anything else in Scripture. But Paul puts them together in a way that's both simple and profound.\n\nFirst, the foundation: you are saved by grace through faith. Period. Full stop. You can't earn it, achieve it, or deserve it. It's a gift. And gifts aren't gifts if you pay for them.\n\nBut here's where it gets beautiful: you are God's handiwork. The Greek word is poiema — it's where we get \"poem.\" You are God's masterpiece, His work of art. And this masterpiece was created for a purpose: good works that God prepared in advance.\n\nDo you see the order? Grace comes first. Identity comes from God, not from what you do. But out of that secure identity flows a life of purpose. You don't do good works to be loved. You do them because you already are.\n\nThis changes everything about how we approach each day. We don't perform for God's approval. We live from His approval, walking into the good works He's already prepared for us.",
    prayerPrompt:
      'Thank God for His grace — that your salvation is a gift, not an achievement. Ask Him to reveal one "good work" He has prepared for you today.',
    publishedAt: formatDate(5),
    status: 'published',
    questions: [
      {
        id: 'q-12',
        devotionalId: 'dev-6',
        text: 'Do you tend to live as if God\'s love depends on your performance? How does "grace through faith" challenge that?',
        order: 1,
      },
      {
        id: 'q-13',
        devotionalId: 'dev-6',
        text: 'What does it mean to you personally that you are God\'s "handiwork" or "poem"?',
        order: 2,
      },
    ],
  },
  {
    id: 'dev-7',
    churchId: 'church-1',
    authorId: 'user-pastor-1',
    authorName: 'Pastor David Kim',
    scriptureRef: 'Psalm 1:1-3',
    scriptureText:
      'Blessed is the one who does not walk in step with the wicked or stand in the way that sinners take or sit in the company of mockers, but whose delight is in the law of the Lord, and who meditates on his law day and night.\n\nThat person is like a tree planted by streams of water, which yields its fruit in season and whose leaf does not wither — whatever they do prospers.',
    reflection:
      "The very first psalm gives us a picture of two paths: one that leads to flourishing, and one that leads to ruin. And the difference between them is simpler than we might think.\n\nThe blessed person — the one who flourishes — isn't described by what they achieve. They're described by what they love. Their delight is in God's Word. They don't just read it out of obligation; they meditate on it. They chew on it. They come back to it throughout the day.\n\nAnd the result? They're like a tree planted by streams of water. Not a tree trying to survive in a desert, constantly searching for nourishment. A tree with roots deep in an endless supply of life.\n\nThis is what you're doing right now by engaging with this devotional. You're planting your roots by the stream. You're choosing the path of the blessed. And the promise is that in the right season, fruit will come.\n\nDon't rush the seasons. Keep your roots in the water. The fruit will come.",
    prayerPrompt:
      'Ask God to deepen your delight in His Word. Pray that this daily devotional habit would become a stream of living water in your life, producing fruit in every season.',
    publishedAt: formatDate(6),
    status: 'published',
    questions: [
      {
        id: 'q-14',
        devotionalId: 'dev-7',
        text: "What does it look like practically to 'delight in the law of the Lord' in your daily routine?",
        order: 1,
      },
      {
        id: 'q-15',
        devotionalId: 'dev-7',
        text: 'Are there "streams of water" in your life right now that are nourishing your faith? What are they?',
        order: 2,
      },
    ],
  },
];

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'je-1',
    userId: 'user-1',
    devotionalId: 'dev-2',
    questionId: 'q-3',
    content:
      "I've been walking through a season of uncertainty at work. Not sure if my contract will be renewed, and it's been weighing on me heavily.",
    isShared: false,
    createdAt: formatDate(1),
    updatedAt: formatDate(1),
  },
  {
    id: 'je-2',
    userId: 'user-1',
    devotionalId: 'dev-2',
    questionId: 'q-4',
    content:
      "Looking back, even in the hardest seasons, God has always provided. I remember when we almost lost our home 3 years ago and He opened a door we never expected. I need to remember that He's the same God now.",
    isShared: false,
    createdAt: formatDate(1),
    updatedAt: formatDate(1),
  },
  {
    id: 'je-3',
    userId: 'user-1',
    devotionalId: 'dev-3',
    questionId: 'q-6',
    content:
      'Social media comparison is a big one for me. I find myself measuring my life against highlight reels and feeling inadequate. Also the pressure to achieve more, earn more, be more.',
    isShared: true,
    createdAt: formatDate(2),
    updatedAt: formatDate(2),
  },
];

export const mockPrayers: Prayer[] = [
  {
    id: 'prayer-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    devotionalId: 'dev-2',
    content:
      "Lord, I'm walking through uncertainty at work and I'm scared. But You are my shepherd, and I choose to trust that You see me and You're with me in this valley. Help me not to fear evil, because You are with me. Amen.",
    isRequest: false,
    isAnswered: false,
    isShared: false,
    createdAt: formatDate(1),
    prayingCount: 0,
  },
  {
    id: 'prayer-2',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    devotionalId: 'dev-4',
    content:
      "God, I'm giving You my anxiety about finances this month. I know You feed the birds and clothe the flowers. Help me seek Your kingdom first today, trusting that You know exactly what I need.",
    isRequest: true,
    isAnswered: false,
    isShared: true,
    createdAt: formatDate(3),
    prayingCount: 5,
  },
  {
    id: 'prayer-3',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    devotionalId: 'dev-6',
    content:
      "Thank You, Father, that my salvation isn't something I have to earn. I confess that I've been living like Your love depends on my performance. Help me rest in Your grace today. Show me the good work You've prepared for me.",
    isRequest: false,
    isAnswered: false,
    isShared: false,
    createdAt: formatDate(5),
    prayingCount: 0,
  },
];

export const mockSharedReflections: SharedReflection[] = [
  {
    id: 'sr-1',
    userId: 'user-2',
    userName: 'Michael Torres',
    devotionalId: 'dev-1',
    scriptureRef: 'Philippians 3:4-10',
    content:
      'This passage hit me hard today. I\'ve been holding onto my career identity so tightly, as if losing my title would mean losing myself. But Paul reminds me that knowing Christ is worth more than any résumé. Time to let go and hold on to what matters.',
    createdAt: formatDate(0),
    reactions: { praying: 3, amen: 8, thanks: 2 },
  },
  {
    id: 'sr-2',
    userId: 'user-3',
    userName: 'Rachel Kim',
    devotionalId: 'dev-1',
    scriptureRef: 'Philippians 3:4-10',
    content:
      "I'm afraid of losing financial security if I follow God's call to ministry. But reading about Paul counting everything as loss... I'm starting to see that what I'd gain is so much greater. Please pray for me as I discern this decision.",
    createdAt: formatDate(0),
    reactions: { praying: 12, amen: 5, thanks: 1 },
  },
  {
    id: 'sr-3',
    userId: 'user-4',
    userName: 'James Wright',
    devotionalId: 'dev-2',
    scriptureRef: 'Psalm 23:1-6',
    content:
      "Walking through the loss of my mom this month. Psalm 23 has been my anchor. \"Even though I walk through the darkest valley, I will fear no evil, for you are with me.\" He hasn't left me. He won't leave me.",
    createdAt: formatDate(1),
    reactions: { praying: 24, amen: 15, thanks: 8 },
  },
  {
    id: 'sr-4',
    userId: 'user-5',
    userName: 'Amanda Chen',
    devotionalId: 'dev-3',
    scriptureRef: 'Romans 12:1-2',
    content:
      "The idea that transformation starts in the mind has been so freeing for me. I've been trying to change my behavior without changing my thinking. No wonder it hasn't worked! Starting today, I'm going to be more intentional about what I feed my mind.",
    createdAt: formatDate(2),
    reactions: { praying: 2, amen: 11, thanks: 4 },
  },
  {
    id: 'sr-5',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    devotionalId: 'dev-3',
    scriptureRef: 'Romans 12:1-2',
    content:
      'Social media comparison is a big one for me. I find myself measuring my life against highlight reels and feeling inadequate. Also the pressure to achieve more, earn more, be more. Grateful for the reminder that God calls us to be transformed, not conformed.',
    createdAt: formatDate(2),
    reactions: { praying: 4, amen: 7, thanks: 3 },
  },
];

export const mockCompletions: DevotionalCompletion[] = [
  { devotionalId: 'dev-2', completedAt: formatDate(1), hasJournal: true, hasPrayer: true, hasShared: false },
  { devotionalId: 'dev-3', completedAt: formatDate(2), hasJournal: true, hasPrayer: false, hasShared: true },
  { devotionalId: 'dev-4', completedAt: formatDate(3), hasJournal: false, hasPrayer: true, hasShared: false },
  { devotionalId: 'dev-5', completedAt: formatDate(4), hasJournal: true, hasPrayer: false, hasShared: false },
  { devotionalId: 'dev-6', completedAt: formatDate(5), hasJournal: true, hasPrayer: true, hasShared: false },
  { devotionalId: 'dev-7', completedAt: formatDate(6), hasJournal: true, hasPrayer: false, hasShared: false },
];
