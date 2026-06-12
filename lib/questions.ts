import { SectionType, QuestionDifficulty } from '@/app/generated/prisma';

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
export function getRandomPrompt(sectionType: SectionType.WRITING | SectionType.SPEAKING): PromptData | null {
  const pool = sectionType === SectionType.WRITING ? writingPrompts : speakingPrompts;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}