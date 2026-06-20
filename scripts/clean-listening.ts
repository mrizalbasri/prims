import 'dotenv/config';
import prisma from '../lib/prisma';
import { SectionType } from '@prisma/client';

async function main() {
  console.log("Menghubungkan ke database...");
  
  const listeningQuestions = await prisma.question.findMany({
    where: {
      sectionType: SectionType.LISTENING,
    },
  });

  console.log(`Total soal LISTENING awal: ${listeningQuestions.length}`);

  let deleteCount = 0;
  for (const q of listeningQuestions) {
    const metadata = q.metadata as Record<string, unknown> | null;
    const audioUrl = typeof metadata?.audioUrl === 'string' ? metadata.audioUrl : "";
    
    const isPlaceholder = audioUrl.includes("soundhelix.com");
    const isEmpty = !audioUrl.trim();

    if (isEmpty || isPlaceholder) {
      console.log(`Menghapus soal ID: ${q.id} ("${q.questionText.slice(0, 50)}...") dengan audio: "${audioUrl}"`);
      await prisma.question.delete({
        where: { id: q.id },
      });
      deleteCount++;
    }
  }

  console.log(`\nSelesai! Berhasil menghapus ${deleteCount} soal listening dummy/tanpa audio asli.`);
}

main()
  .catch((e) => {
    console.error("Terjadi error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
