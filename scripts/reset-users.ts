import 'dotenv/config';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // 1. Reset Admin Password to "admin123"
  const adminEmail = 'admin@president.ac.id';
  const newPassword = 'admin123';
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: adminEmail },
    data: { passwordHash },
  });

  console.log(`✅ Admin password reset successfully!`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${newPassword}`);

  // 2. Reset student password to "student123" and delete test attempts for student to start fresh
  const studentEmail = 'm.basri@student.president.ac.id';
  const studentPassword = 'student123';
  const studentPasswordHash = await bcrypt.hash(studentPassword, 10);

  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (student) {
    await prisma.user.update({
      where: { email: studentEmail },
      data: { passwordHash: studentPasswordHash },
    });
    await prisma.testAttempt.deleteMany({
      where: { userId: student.id },
    });
    console.log(`✅ Student password reset successfully!`);
    console.log(`Email: ${studentEmail}`);
    console.log(`Password: ${studentPassword}`);
    console.log(`✅ Deleted all old test attempts for ${studentEmail}. They can now start the test fresh!`);
  } else {
    console.log(`❌ Student ${studentEmail} not found`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
