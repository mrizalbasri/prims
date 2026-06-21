import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { DEFAULT_QUESTIONS_COUNT, DEFAULT_DURATIONS, getTestSettings } from "@/lib/settings";
import { SectionType } from "@prisma/client";

/**
 * GET /api/admin/settings - Fetch current test settings
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await getTestSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/settings - Save/Update test settings
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { counts, durations } = await request.json();

    if (!counts || !durations) {
      return NextResponse.json({ error: "Counts and durations are required" }, { status: 400 });
    }

    // List of editable sections for placement test
    const targetSections = [SectionType.VOCABULARY, SectionType.GRAMMAR, SectionType.LISTENING, SectionType.READING];

    // Transaction to upsert settings
    await prisma.$transaction(async (tx) => {
      for (const section of targetSections) {
        const countKey = `${section.toLowerCase()}_count`;
        const durationKey = `${section.toLowerCase()}_duration`;

        const countVal = counts[section] !== undefined ? String(counts[section]) : String(DEFAULT_QUESTIONS_COUNT[section]);
        const durationVal = durations[section] !== undefined ? String(durations[section]) : String(DEFAULT_DURATIONS[section]);

        // Upsert count
        await tx.systemSetting.upsert({
          where: { key: countKey },
          update: { value: countVal },
          create: { key: countKey, value: countVal },
        });

        // Upsert duration
        await tx.systemSetting.upsert({
          where: { key: durationKey },
          update: { value: durationVal },
          create: { key: durationKey, value: durationVal },
        });
      }
    });

    const updatedSettings = await getTestSettings();

    return NextResponse.json(
      {
        message: "Settings updated successfully",
        settings: updatedSettings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
