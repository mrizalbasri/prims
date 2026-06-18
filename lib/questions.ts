import { SectionType, QuestionDifficulty } from '@prisma/client';

/**
 * Question bank structure for objective sections
 */
export interface QuestionData {
  sectionType: SectionType;
  difficulty: QuestionDifficulty;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  metadata?: {
    audioUrl?: string;
    topic?: string;
    skill?: string;
  };
}

/**
 * Prompt structure for writing and speaking sections
 */
export interface PromptData {
  sectionType: SectionType;
  promptText: string;
  rubric?: {
    criteria: string[];
    maxScore: number;
    scoringGuide: string;
  };
}

/**
 * Sample Vocabulary Questions
 */
export const vocabularyQuestions: QuestionData[] = [
  {
    sectionType: SectionType.VOCABULARY,
    difficulty: QuestionDifficulty.EASY,
    questionText: 'Choose the word that best completes the sentence: "The professor gave a very _____ explanation of the complex theory."',
    options: ['clear', 'unclear', 'confusing', 'difficult'],
    correctAnswer: 'clear',
    explanation: '"Clear" means easy to understand, which fits the context of a good explanation.',
    metadata: { topic: 'Academic Vocabulary', skill: 'Context Clues' },
  },
  {
    sectionType: SectionType.VOCABULARY,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: 'What does "analyze" mean in an academic context?',
    options: [
      'To memorize information',
      'To examine something in detail',
      'To summarize briefly',
      'To ignore completely',
    ],
    correctAnswer: 'To examine something in detail',
    explanation: '"Analyze" means to study or examine something carefully and in detail.',
    metadata: { topic: 'Academic Verbs', skill: 'Definition' },
  },
  {
    sectionType: SectionType.VOCABULARY,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: 'Choose the synonym for "significant": "The research findings were _____ for the field."',
    options: ['important', 'small', 'irrelevant', 'minor'],
    correctAnswer: 'important',
    explanation: '"Significant" means important or notable.',
    metadata: { topic: 'Synonyms', skill: 'Word Relationships' },
  },
  {
    sectionType: SectionType.VOCABULARY,
    difficulty: QuestionDifficulty.HARD,
    questionText: 'What does "synthesize" mean in academic writing?',
    options: [
      'To copy information directly',
      'To combine ideas from multiple sources',
      'To delete unnecessary information',
      'To translate to another language',
    ],
    correctAnswer: 'To combine ideas from multiple sources',
    explanation: '"Synthesize" means to combine different ideas or information to form a coherent whole.',
    metadata: { topic: 'Academic Processes', skill: 'Advanced Vocabulary' },
  },
  {
    sectionType: SectionType.VOCABULARY,
    difficulty: QuestionDifficulty.EASY,
    questionText: 'The word "hypothesis" refers to:',
    options: [
      'A proven fact',
      'A proposed explanation to be tested',
      'A final conclusion',
      'A random guess',
    ],
    correctAnswer: 'A proposed explanation to be tested',
    explanation: 'A hypothesis is a tentative explanation that can be tested through research.',
    metadata: { topic: 'Research Vocabulary', skill: 'Definition' },
  },
];

/**
 * Sample Grammar Questions
 */
export const grammarQuestions: QuestionData[] = [
  {
    sectionType: SectionType.GRAMMAR,
    difficulty: QuestionDifficulty.EASY,
    questionText: 'Choose the correct sentence:',
    options: [
      'She go to university every day.',
      'She goes to university every day.',
      'She going to university every day.',
      'She gone to university every day.',
    ],
    correctAnswer: 'She goes to university every day.',
    explanation: 'Third person singular present tense requires "goes" not "go".',
    metadata: { topic: 'Subject-Verb Agreement', skill: 'Present Tense' },
  },
  {
    sectionType: SectionType.GRAMMAR,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: 'Which sentence uses the correct article?',
    options: [
      'I need a advice from my professor.',
      'I need an advice from my professor.',
      'I need advice from my professor.',
      'I need the advices from my professor.',
    ],
    correctAnswer: 'I need advice from my professor.',
    explanation: '"Advice" is an uncountable noun and does not use articles in this context.',
    metadata: { topic: 'Articles', skill: 'Countable/Uncountable Nouns' },
  },
  {
    sectionType: SectionType.GRAMMAR,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: 'Choose the sentence with correct passive voice:',
    options: [
      'The experiment was conducted by the students.',
      'The experiment conducted by the students.',
      'The experiment is conduct by the students.',
      'The experiment conducting by the students.',
    ],
    correctAnswer: 'The experiment was conducted by the students.',
    explanation: 'Passive voice requires "was/were + past participle".',
    metadata: { topic: 'Passive Voice', skill: 'Verb Forms' },
  },
  {
    sectionType: SectionType.GRAMMAR,
    difficulty: QuestionDifficulty.HARD,
    questionText: 'Identify the sentence with correct conditional structure:',
    options: [
      'If I would have studied harder, I would pass the exam.',
      'If I had studied harder, I would have passed the exam.',
      'If I have studied harder, I will pass the exam.',
      'If I study harder, I would have passed the exam.',
    ],
    correctAnswer: 'If I had studied harder, I would have passed the exam.',
    explanation: 'Third conditional uses "had + past participle" in the if-clause and "would have + past participle" in the main clause.',
    metadata: { topic: 'Conditionals', skill: 'Complex Sentences' },
  },
  {
    sectionType: SectionType.GRAMMAR,
    difficulty: QuestionDifficulty.EASY,
    questionText: 'Which sentence is grammatically correct?',
    options: [
      'There is many students in the classroom.',
      'There are many students in the classroom.',
      'There be many students in the classroom.',
      'There was many students in the classroom.',
    ],
    correctAnswer: 'There are many students in the classroom.',
    explanation: '"Many students" is plural, so we use "are" not "is".',
    metadata: { topic: 'Subject-Verb Agreement', skill: 'Plural Forms' },
  },
];

/**
 * Sample Reading Questions (with passages)
 */
export const readingQuestions: QuestionData[] = [
  {
    sectionType: SectionType.READING,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: `Read the passage and answer the question:

"Climate change is one of the most pressing issues facing humanity today. Rising global temperatures are causing ice caps to melt, sea levels to rise, and weather patterns to become more extreme. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause of these changes. Immediate action is needed to reduce carbon emissions and transition to renewable energy sources."

What is the main idea of this passage?`,
    options: [
      'Ice caps are melting rapidly',
      'Climate change is a serious problem requiring urgent action',
      'Scientists study weather patterns',
      'Fossil fuels are expensive',
    ],
    correctAnswer: 'Climate change is a serious problem requiring urgent action',
    explanation: 'The passage discusses climate change as a pressing issue and emphasizes the need for immediate action.',
    metadata: { topic: 'Main Idea', skill: 'Reading Comprehension' },
  },
  {
    sectionType: SectionType.READING,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: `Based on the same passage, what do scientists believe is the primary cause of climate change?`,
    options: [
      'Natural weather cycles',
      'Solar radiation',
      'Human activities, especially burning fossil fuels',
      'Volcanic eruptions',
    ],
    correctAnswer: 'Human activities, especially burning fossil fuels',
    explanation: 'The passage explicitly states that scientists agree human activities, particularly burning fossil fuels, are the primary cause.',
    metadata: { topic: 'Supporting Details', skill: 'Reading Comprehension' },
  },
  {
    sectionType: SectionType.READING,
    difficulty: QuestionDifficulty.HARD,
    questionText: `Read the passage:

"The concept of artificial intelligence (AI) has evolved significantly over the past decades. Initially, AI systems were rule-based and could only perform specific tasks. However, modern AI utilizes machine learning algorithms that allow systems to learn from data and improve their performance over time. This advancement has led to applications in various fields, from healthcare diagnostics to autonomous vehicles. Despite these achievements, ethical concerns regarding AI decision-making and job displacement remain topics of ongoing debate."

What can be inferred about the author's view on AI development?`,
    options: [
      'AI development should be stopped immediately',
      'AI has both benefits and challenges that need consideration',
      'AI is only useful in healthcare',
      'AI will solve all human problems',
    ],
    correctAnswer: 'AI has both benefits and challenges that need consideration',
    explanation: 'The passage presents both the advancements and ethical concerns of AI, suggesting a balanced view.',
    metadata: { topic: 'Inference', skill: 'Critical Reading' },
  },
];

/**
 * Sample Listening Questions
 */
export const listeningQuestions: QuestionData[] = [
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.EASY,
    questionText: 'According to the conversation, what is the deadline to register for the student orientation program?',
    options: ['July 5th', 'July 10th', 'July 15th', 'July 20th'],
    correctAnswer: 'July 15th',
    explanation: 'The speaker explicitly states that the student orientation registration deadline is Monday, July 15th.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      topic: 'Orientation Registration',
      skill: 'Detail Identification',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.EASY,
    questionText: 'Where will the main orientation event be held?',
    options: ['The Central Library', 'The Auditorium', 'The Science Lab', 'The Gymnasium'],
    correctAnswer: 'The Auditorium',
    explanation: 'The host mentions that all new students should gather in the Auditorium for the opening ceremony.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      topic: 'Event Location',
      skill: 'Detail Identification',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: 'What document must students bring to receive their student ID cards?',
    options: ['A high school diploma', 'A payment receipt', 'An enrollment confirmation letter', 'A birth certificate'],
    correctAnswer: 'An enrollment confirmation letter',
    explanation: 'The registrar explains that students must present their enrollment confirmation letter to collect their ID card.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      topic: 'Required Documents',
      skill: 'Detail Identification',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: 'Which class is currently full and unavailable for immediate enrollment?',
    options: ['Introduction to Physics', 'Calculus I', 'Academic Writing', 'Basic Chemistry'],
    correctAnswer: 'Academic Writing',
    explanation: 'The adviser notes that the Academic Writing course is fully booked but students can join the waitlist.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      topic: 'Course Availability',
      skill: 'Inference',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.HARD,
    questionText: 'What is the adviser\'s main recommendation for students who cannot register for their preferred courses?',
    options: [
      'Take a gap semester',
      'Register for elective courses first',
      'Speak directly to the dean of the faculty',
      'Wait for the second round of registration next month'
    ],
    correctAnswer: 'Register for elective courses first',
    explanation: 'The adviser recommends completing general elective requirements if core classes are unavailable in the first semester.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      topic: 'Academic Advising',
      skill: 'Determining Speaker Recommendation',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.EASY,
    questionText: 'According to the lecture, what is the primary source of solar energy production?',
    options: ['Wind turbines', 'Photovoltaic cells', 'Geothermal vents', 'Hydroelectric dams'],
    correctAnswer: 'Photovoltaic cells',
    explanation: 'The lecturer notes that photovoltaic cells are the primary technology used to convert sunlight into electricity.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      topic: 'Renewable Energy',
      skill: 'Technical Terminology',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: 'What is the main limitation of wind power discussed by the speaker?',
    options: [
      'It is too expensive to construct turbines',
      'It produces harmful carbon emissions',
      'Wind speed is highly intermittent and unpredictable',
      'Turbines require too much land space'
    ],
    correctAnswer: 'Wind speed is highly intermittent and unpredictable',
    explanation: 'The speaker highlights intermittency as wind power\'s primary challenge because wind does not blow consistently.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      topic: 'Wind Energy',
      skill: 'Identifying Key Arguments',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.MEDIUM,
    questionText: 'Which country is cited as a leader in geothermal energy usage?',
    options: ['Iceland', 'Australia', 'Brazil', 'Japan'],
    correctAnswer: 'Iceland',
    explanation: 'Iceland is highlighted as a country that derives a vast majority of its heating and electricity from geothermal resources.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      topic: 'Geothermal Leaders',
      skill: 'Detail Identification',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.HARD,
    questionText: 'What can be inferred about the future of global renewable energy storage?',
    options: [
      'Battery technology is already sufficient for all grid demands',
      'Storage will become less important as solar panels improve',
      'Advancements in battery capacity are crucial for transitioning away from fossil fuels',
      'Governments will ban energy storage due to safety concerns'
    ],
    correctAnswer: 'Advancements in battery capacity are crucial for transitioning away from fossil fuels',
    explanation: 'The lecturer concludes that solving the storage problem through larger, cheaper batteries is essential for a fully renewable grid.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      topic: 'Grid Storage Futures',
      skill: 'Drawing Inferences',
    },
  },
  {
    sectionType: SectionType.LISTENING,
    difficulty: QuestionDifficulty.HARD,
    questionText: 'What is the speaker\'s attitude toward the pace of the global transition to green energy?',
    options: [
      'Highly optimistic that it will be completed within five years',
      'Concerned that the transition is currently too slow to meet climate targets',
      'Indifferent to the timing of the transition',
      'Skeptical that renewable energy will ever be viable'
    ],
    correctAnswer: 'Concerned that the transition is currently too slow to meet climate targets',
    explanation: 'The speaker expresses worry that current investment rates are insufficient to meet international carbon reduction deadlines.',
    metadata: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      topic: 'Transition Pace Assessment',
      skill: 'Determining Speaker Attitude',
    },
  },
];

/**
 * Sample Writing Prompts
 */
export const writingPrompts: PromptData[] = [
  {
    sectionType: SectionType.WRITING,
    promptText: `Write a paragraph (100-150 words) about the following topic:

"What are the advantages and disadvantages of online learning compared to traditional classroom learning?"

Your paragraph should:
- Have a clear topic sentence
- Include at least two advantages and two disadvantages
- Use appropriate transition words
- End with a concluding sentence`,
    rubric: {
      criteria: [
        'Clear topic sentence and conclusion',
        'Logical organization and coherence',
        'Grammar and vocabulary accuracy',
        'Appropriate use of transition words',
        'Addresses the prompt completely',
      ],
      maxScore: 100,
      scoringGuide: 'Evaluate based on content, organization, grammar, and vocabulary usage.',
    },
  },
  {
    sectionType: SectionType.WRITING,
    promptText: `Write a paragraph (100-150 words) describing your academic goals:

"Describe your main academic goal for this semester and explain how you plan to achieve it."

Your paragraph should:
- State your goal clearly
- Explain why this goal is important to you
- Describe specific steps you will take
- Use appropriate academic vocabulary`,
    rubric: {
      criteria: [
        'Clear statement of academic goal',
        'Logical explanation and planning',
        'Grammar and sentence structure',
        'Academic vocabulary usage',
        'Coherence and unity',
      ],
      maxScore: 100,
      scoringGuide: 'Assess clarity, organization, language accuracy, and relevance to academic context.',
    },
  },
];

/**
 * Sample Speaking Prompts
 */
export const speakingPrompts: PromptData[] = [
  {
    sectionType: SectionType.SPEAKING,
    promptText: `Introduce yourself and describe your academic background.

Please speak for 30-60 seconds about:
- Your name and major
- Why you chose this field of study
- Your academic interests or goals

Speak clearly and naturally.`,
    rubric: {
      criteria: [
        'Pronunciation and clarity',
        'Fluency and coherence',
        'Grammar and vocabulary',
        'Content relevance',
        'Confidence and delivery',
      ],
      maxScore: 100,
      scoringGuide: 'Evaluate pronunciation, fluency, grammar, vocabulary, and content quality.',
    },
  },
  {
    sectionType: SectionType.SPEAKING,
    promptText: `Describe a challenge you faced in your studies and how you overcame it.

Please speak for 30-60 seconds about:
- What the challenge was
- How it affected your studies
- What steps you took to overcome it
- What you learned from the experience`,
    rubric: {
      criteria: [
        'Clear description of challenge',
        'Logical narrative structure',
        'Pronunciation and fluency',
        'Grammar and vocabulary accuracy',
        'Reflection and learning',
      ],
      maxScore: 100,
      scoringGuide: 'Assess storytelling ability, language accuracy, and reflective thinking.',
    },
  },
  {
    sectionType: SectionType.SPEAKING,
    promptText: `Express your opinion on the following statement:

"Technology has made education more accessible to everyone."

Please speak for 30-60 seconds:
- State whether you agree or disagree
- Provide at least two reasons for your opinion
- Give specific examples if possible`,
    rubric: {
      criteria: [
        'Clear opinion statement',
        'Supporting reasons and examples',
        'Pronunciation and fluency',
        'Grammar and vocabulary',
        'Logical argumentation',
      ],
      maxScore: 100,
      scoringGuide: 'Evaluate opinion clarity, reasoning quality, language proficiency, and argumentation.',
    },
  },
];

/**
 * Get random questions for a section
 */
export function getRandomQuestions(
  sectionType: SectionType,
  count: number,
  difficulty?: QuestionDifficulty
): QuestionData[] {
  let pool: QuestionData[] = [];

  switch (sectionType) {
    case SectionType.VOCABULARY:
      pool = vocabularyQuestions;
      break;
    case SectionType.GRAMMAR:
      pool = grammarQuestions;
      break;
    case SectionType.READING:
      pool = readingQuestions;
      break;
    case SectionType.LISTENING:
      pool = listeningQuestions;
      break;
    default:
      return [];
  }

  // Filter by difficulty if specified
  if (difficulty) {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  // Shuffle and return requested count
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random prompt for writing or speaking
 */
export function getRandomPrompt(sectionType: SectionType): PromptData | null {
  const pool = sectionType === SectionType.WRITING ? writingPrompts : speakingPrompts;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const SECTION_ORDER = [
  SectionType.VOCABULARY,
  SectionType.GRAMMAR,
  SectionType.LISTENING,
  SectionType.READING,
  SectionType.WRITING,
  SectionType.SPEAKING,
];

