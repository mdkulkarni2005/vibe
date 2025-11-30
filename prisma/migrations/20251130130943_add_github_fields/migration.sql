-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "githubRepoName" TEXT,
ADD COLUMN     "githubRepoUrl" TEXT;
