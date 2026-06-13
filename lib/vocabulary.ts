import { VocabularyCategory, CardState, QuestionDifficulty } from '@prisma/client';
import prisma from '@/lib/prisma';



/**
 * Vocabulary card data structure
 */
export interface VocabularyCardData {
  term: string;
  meaning: string;
  exampleSentence: string;
  pronunciation?: string;
  audioUrl?: string;
  category: VocabularyCategory;
  difficulty: QuestionDifficulty;
  metadata?: {
    synonyms?: string[];
    antonyms?: string[];
    partOfSpeech?: string;
    topic?: string;
  };
}

/**
 * Sample vocabulary cards for academic English
 */
export const academicVocabularyCards: VocabularyCardData[] = [
  {
    term: 'analyze',
    meaning: 'Memeriksa sesuatu secara detail untuk memahami atau menjelaskannya',
    exampleSentence: 'Students need to analyze the data before drawing conclusions.',
    pronunciation: '/ˈæn.ə.laɪz/',
    category: VocabularyCategory.ACADEMIC_GENERAL,
    difficulty: QuestionDifficulty.MEDIUM,
    metadata: {
      synonyms: ['examine', 'study', 'investigate'],
      partOfSpeech: 'verb',
      topic: 'Research Methods',
    },
  },
  {
    term: 'hypothesis',
    meaning: 'Penjelasan atau teori yang diusulkan untuk diuji melalui penelitian',
    exampleSentence: 'The researcher proposed a hypothesis about climate change effects.',
    pronunciation: '/haɪˈpɒθ.ə.sɪs/',
    category: VocabularyCategory.SCIENCE,
    difficulty: QuestionDifficulty.MEDIUM,
    metadata: {
      synonyms: ['theory', 'proposition', 'assumption'],
      partOfSpeech: 'noun',
      topic: 'Scientific Method',
    },
  },
  {
    term: 'synthesize',
    meaning: 'Menggabungkan berbagai ide atau informasi untuk membentuk satu kesatuan yang koheren',
    exampleSentence: 'The essay should synthesize information from multiple sources.',
    pronunciation: '/ˈsɪn.θə.saɪz/',
    category: VocabularyCategory.ACADEMIC_GENERAL,
    difficulty: QuestionDifficulty.HARD,
    metadata: {
      synonyms: ['combine', 'integrate', 'merge'],
      partOfSpeech: 'verb',
      topic: 'Academic Writing',
    },
  },
  {
    term: 'methodology',
    meaning: 'Sistem metode yang digunakan dalam bidang studi atau aktivitas tertentu',
    exampleSentence: 'The research methodology was clearly explained in chapter three.',
    pronunciation: '/ˌmeθ.əˈdɒl.ə.dʒi/',
    category: VocabularyCategory.ACADEMIC_GENERAL,
    difficulty: QuestionDifficulty.HARD,
    metadata: {
      synonyms: ['approach', 'procedure', 'technique'],
      partOfSpeech: 'noun',
      topic: 'Research',
    },
  },
  {
    term: 'significant',
    meaning: 'Cukup besar atau penting untuk diperhatikan atau memiliki efek',
    exampleSentence: 'The study found a significant correlation between the variables.',
    pronunciation: '/sɪɡˈnɪf.ɪ.kənt/',
    category: VocabularyCategory.ACADEMIC_GENERAL,
    difficulty: QuestionDifficulty.EASY,
    metadata: {
      synonyms: ['important', 'notable', 'considerable'],
      antonyms: ['insignificant', 'minor', 'trivial'],
      partOfSpeech: 'adjective',
      topic: 'Statistics',
    },
  },
  {
    term: 'implement',
    meaning: 'Melaksanakan atau menerapkan rencana, keputusan, atau sistem',
    exampleSentence: 'The university will implement the new policy next semester.',
    pronunciation: '/ˈɪm.plɪ.ment/',
    category: VocabularyCategory.ACADEMIC_GENERAL,
    difficulty: QuestionDifficulty.MEDIUM,
    metadata: {
      synonyms: ['execute', 'apply', 'carry out'],
      partOfSpeech: 'verb',
      topic: 'Management',
    },
  },
  {
    term: 'paradigm',
    meaning: 'Model atau pola yang khas dalam suatu bidang ilmu atau pemikiran',
    exampleSentence: 'The research represents a shift in the scientific paradigm.',
    pronunciation: '/ˈpær.ə.daɪm/',
    category: VocabularyCategory.ACADEMIC_GENERAL,
    difficulty: QuestionDifficulty.HARD,
    metadata: {
      synonyms: ['model', 'framework', 'pattern'],
      partOfSpeech: 'noun',
      topic: 'Theory',
    },
  },
  {
    term: 'empirical',
    meaning: 'Berdasarkan pada observasi atau pengalaman daripada teori atau logika murni',
    exampleSentence: 'The conclusion is supported by empirical evidence.',
    pronunciation: '/ɪmˈpɪr.ɪ.kəl/',
    category: VocabularyCategory.SCIENCE,
    difficulty: QuestionDifficulty.HARD,
    metadata: {
      synonyms: ['experimental', 'observed', 'practical'],
      antonyms: ['theoretical', 'speculative'],
      partOfSpeech: 'adjective',
      topic: 'Research Methods',
    },
  },
  {
    term: 'criteria',
    meaning: 'Standar atau prinsip yang digunakan untuk menilai atau memutuskan sesuatu',
    exampleSentence: 'The selection criteria for the program are clearly stated.',
    pronunciation: '/kraɪˈtɪə.ri.ə/',
    category: VocabularyCategory.ACADEMIC_GENERAL,
    difficulty: QuestionDifficulty.MEDIUM,
    metadata: {
      synonyms: ['standards', 'requirements', 'guidelines'],
      partOfSpeech: 'noun (plural)',
      topic: 'Evaluation',
    },
  },
  {
    term: 'comprehensive',
    meaning: 'Lengkap dan mencakup semua atau hampir semua elemen atau aspek',
    exampleSentence: 'The textbook provides a comprehensive overview of the subject.',
    pronunciation: '/ˌkɒm.prɪˈhen.sɪv/',
    category: VocabularyCategory.ACADEMIC_GENERAL,
    difficulty: QuestionDifficulty.MEDIUM,
    metadata: {
      synonyms: ['complete', 'thorough', 'extensive'],
      antonyms: ['partial', 'incomplete', 'limited'],
      partOfSpeech: 'adjective',
      topic: 'General Academic',
    },
  },
];

/**
 * Get cards for a specific category and difficulty
 */
export function getVocabularyCards(
  category?: VocabularyCategory,
  difficulty?: QuestionDifficulty,
  limit?: number
): VocabularyCardData[] {
  let filtered = [...academicVocabularyCards];

  if (category) {
    filtered = filtered.filter((card) => card.category === category);
  }

  if (difficulty) {
    filtered = filtered.filter((card) => card.difficulty === difficulty);
  }

  if (limit) {
    filtered = filtered.slice(0, limit);
  }

  return filtered;
}

/**
 * Get next cards for review based on spaced repetition
 */
export async function getNextReviewCards(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  // Get cards that need review (not mastered, or due for review)
  const progress = await prisma.vocabularyProgress.findMany({
    where: {
      userId,
      state: {
        in: [CardState.NEW, CardState.LEARNING],
      },
    },
    include: {
      card: true,
    },
    orderBy: [
      { lastReviewedAt: 'asc' },
      { createdAt: 'asc' },
    ],
    take: limit,
  });

  return progress.map((p: any) => ({
    progressId: p.id,
    cardId: p.card.id,
    term: p.card.term,
    meaning: p.card.meaning,
    exampleSentence: p.card.exampleSentence,
    pronunciation: p.card.pronunciation,
    audioUrl: p.card.audioUrl,
    category: p.card.category,
    difficulty: p.card.difficulty,
    state: p.state,
    repetitionCount: p.repetitionCount,
  }));
}

/**
 * Update card progress after review
 */
export async function updateCardProgress(
  userId: string,
  cardId: string,
  correct: boolean
): Promise<void> {
  const progress = await prisma.vocabularyProgress.findUnique({
    where: {
      userId_cardId: {
        userId,
        cardId,
      },
    },
  });

  if (!progress) {
    // Create new progress
    await prisma.vocabularyProgress.create({
      data: {
        userId,
        cardId,
        state: correct ? CardState.LEARNING : CardState.NEW,
        repetitionCount: 1,
        lastReviewedAt: new Date(),
      },
    });
    return;
  }

  // Update existing progress
  const newRepetitionCount = progress.repetitionCount + 1;
  let newState = progress.state;
  let masteredAt = progress.masteredAt;

  if (correct) {
    if (progress.state === CardState.NEW) {
      newState = CardState.LEARNING;
    } else if (progress.state === CardState.LEARNING && newRepetitionCount >= 5) {
      newState = CardState.MASTERED;
      masteredAt = new Date();
    }
  } else {
    // If incorrect, move back to NEW or stay in LEARNING
    if (progress.state === CardState.MASTERED) {
      newState = CardState.LEARNING;
      masteredAt = null;
    } else if (progress.state === CardState.LEARNING) {
      newState = CardState.NEW;
    }
  }

  await prisma.vocabularyProgress.update({
    where: {
      userId_cardId: {
        userId,
        cardId,
      },
    },
    data: {
      state: newState,
      repetitionCount: newRepetitionCount,
      lastReviewedAt: new Date(),
      masteredAt,
    },
  });
}

/**
 * Get vocabulary statistics for a user
 */
export async function getVocabularyStats(userId: string) {
  const progress = await prisma.vocabularyProgress.findMany({
    where: { userId },
  });

  const stats = {
    total: progress.length,
    new: progress.filter((p: any) => p.state === CardState.NEW).length,
    learning: progress.filter((p: any) => p.state === CardState.LEARNING).length,
    mastered: progress.filter((p: any) => p.state === CardState.MASTERED).length,
  };

  return stats;
}
