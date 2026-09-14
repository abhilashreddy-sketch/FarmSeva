-- CreateTable
CREATE TABLE IF NOT EXISTS "CropDiagnosis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "cropConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "primaryProblem" TEXT NOT NULL,
    "problemType" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observationsJson" TEXT NOT NULL,
    "possibleCausesJson" TEXT NOT NULL,
    "recommendedActionsJson" TEXT NOT NULL,
    "preventionJson" TEXT NOT NULL,
    "medicineGuidanceJson" TEXT NOT NULL,
    "selectedLanguage" TEXT NOT NULL DEFAULT 'en',
    "imageQualityJson" TEXT NOT NULL,
    "needsExpert" BOOLEAN NOT NULL DEFAULT false,
    "expertReason" TEXT,
    "aiProvider" TEXT NOT NULL DEFAULT 'GEMINI_VISION',
    "aiModel" TEXT NOT NULL DEFAULT 'gemini-3.8-flash',
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CropDiagnosisImage" (
    "id" TEXT NOT NULL,
    "cropDiagnosisId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CropDiagnosisImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CropDiagnosis_userId_idx" ON "CropDiagnosis"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CropDiagnosis_cropName_idx" ON "CropDiagnosis"("cropName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CropDiagnosis_problemType_idx" ON "CropDiagnosis"("problemType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CropDiagnosis_needsExpert_idx" ON "CropDiagnosis"("needsExpert");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CropDiagnosis_createdAt_idx" ON "CropDiagnosis"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CropDiagnosisImage_cropDiagnosisId_idx" ON "CropDiagnosisImage"("cropDiagnosisId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CropDiagnosis_userId_fkey'
    ) THEN
        ALTER TABLE "CropDiagnosis" ADD CONSTRAINT "CropDiagnosis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CropDiagnosisImage_cropDiagnosisId_fkey'
    ) THEN
        ALTER TABLE "CropDiagnosisImage" ADD CONSTRAINT "CropDiagnosisImage_cropDiagnosisId_fkey" FOREIGN KEY ("cropDiagnosisId") REFERENCES "CropDiagnosis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
