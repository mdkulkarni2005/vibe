-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('SECURITY', 'BUG', 'CODE_QUALITY', 'PERFORMANCE', 'BEST_PRACTICE');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "summary" TEXT,
    "score" INTEGER,
    "totalFiles" INTEGER NOT NULL DEFAULT 0,
    "totalIssues" INTEGER NOT NULL DEFAULT 0,
    "criticalIssues" INTEGER NOT NULL DEFAULT 0,
    "highIssues" INTEGER NOT NULL DEFAULT 0,
    "mediumIssues" INTEGER NOT NULL DEFAULT 0,
    "lowIssues" INTEGER NOT NULL DEFAULT 0,
    "architectureDiagram" TEXT,
    "complexityGraph" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewFile" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "language" TEXT,
    "linesOfCode" INTEGER NOT NULL DEFAULT 0,
    "complexity" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER,

    CONSTRAINT "ReviewFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeIssue" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "fileId" TEXT,
    "type" "IssueType" NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filePath" TEXT,
    "lineStart" INTEGER,
    "lineEnd" INTEGER,
    "code" TEXT,
    "recommendation" TEXT,
    "fixCode" TEXT,
    "cweId" TEXT,
    "cvssScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_projectId_idx" ON "Review"("projectId");

-- CreateIndex
CREATE INDEX "ReviewFile_reviewId_idx" ON "ReviewFile"("reviewId");

-- CreateIndex
CREATE INDEX "CodeIssue_reviewId_idx" ON "CodeIssue"("reviewId");

-- CreateIndex
CREATE INDEX "CodeIssue_fileId_idx" ON "CodeIssue"("fileId");

-- CreateIndex
CREATE INDEX "CodeIssue_severity_idx" ON "CodeIssue"("severity");

-- CreateIndex
CREATE INDEX "CodeIssue_type_idx" ON "CodeIssue"("type");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewFile" ADD CONSTRAINT "ReviewFile_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeIssue" ADD CONSTRAINT "CodeIssue_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeIssue" ADD CONSTRAINT "CodeIssue_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "ReviewFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
