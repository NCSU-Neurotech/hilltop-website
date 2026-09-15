-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "approvedAt" TIMESTAMP(3),
    "ttsCharQuotaDaily" INTEGER NOT NULL DEFAULT 50000,
    "ttsCharUsedToday" INTEGER NOT NULL DEFAULT 0,
    "ttsLastResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "childId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "changes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "avatarId" TEXT NOT NULL DEFAULT 'bear',
    "scanSpeedMs" INTEGER NOT NULL DEFAULT 1200,
    "scanHighlightColor" TEXT NOT NULL DEFAULT '#FFD700',
    "voiceRate" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "voicePitch" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "preferredCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fontSizeRem" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "highContrastMode" BOOLEAN NOT NULL DEFAULT false,
    "darkModeOverride" TEXT,
    "enabledCategories" TEXT[] DEFAULT ARRAY['games', 'learn', 'stories', 'sound-boards', 'communicate']::TEXT[],
    "enabledLearnTiers" TEXT[] DEFAULT ARRAY['beginner', 'intermediate', 'advanced']::TEXT[],
    "ttsPreferenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaregiverNote" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaregiverNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledActivity" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activityType" TEXT NOT NULL DEFAULT 'OTHER',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoundBoard" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#a855f7',
    "sounds" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPreset" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoundBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoundBoardProgress" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "soundBoardId" TEXT NOT NULL,
    "favorites" TEXT,
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoundBoardProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TTSPreference" (
    "id" TEXT NOT NULL,
    "childId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'BROWSER',
    "voiceId" TEXT NOT NULL DEFAULT 'default',
    "voiceName" TEXT NOT NULL DEFAULT 'Default',
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "gender" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TTSPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookProgress" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "pageIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BookProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommTile" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL DEFAULT '',
    "childId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommTile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Facility_email_key" ON "Facility"("email");

-- CreateIndex
CREATE INDEX "AuditLog_facilityId_timestamp_idx" ON "AuditLog"("facilityId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_childId_timestamp_idx" ON "AuditLog"("childId", "timestamp");

-- CreateIndex
CREATE INDEX "CaregiverNote_childId_createdAt_idx" ON "CaregiverNote"("childId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ScheduledActivity_childId_scheduledAt_idx" ON "ScheduledActivity"("childId", "scheduledAt");

-- CreateIndex
CREATE INDEX "SoundBoard_facilityId_idx" ON "SoundBoard"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "SoundBoard_facilityId_name_key" ON "SoundBoard"("facilityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SoundBoardProgress_childId_soundBoardId_key" ON "SoundBoardProgress"("childId", "soundBoardId");

-- CreateIndex
CREATE UNIQUE INDEX "BookProgress_childId_bookId_key" ON "BookProgress"("childId", "bookId");

-- CreateIndex
CREATE INDEX "CommTile_childId_boardId_idx" ON "CommTile"("childId", "boardId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_ttsPreferenceId_fkey" FOREIGN KEY ("ttsPreferenceId") REFERENCES "TTSPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverNote" ADD CONSTRAINT "CaregiverNote_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledActivity" ADD CONSTRAINT "ScheduledActivity_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundBoard" ADD CONSTRAINT "SoundBoard_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundBoardProgress" ADD CONSTRAINT "SoundBoardProgress_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundBoardProgress" ADD CONSTRAINT "SoundBoardProgress_soundBoardId_fkey" FOREIGN KEY ("soundBoardId") REFERENCES "SoundBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookProgress" ADD CONSTRAINT "BookProgress_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommTile" ADD CONSTRAINT "CommTile_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
