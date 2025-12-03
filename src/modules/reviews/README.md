# Code Review System

A comprehensive AI-powered code review system that analyzes your project for security vulnerabilities, bugs, code quality issues, performance problems, and best practice violations.

## Features

### 1. **AI-Powered Analysis**
- Uses Claude 3.5 Sonnet for intelligent code analysis
- Comprehensive review of all code files in your project
- Context-aware recommendations

### 2. **Security Analysis**
- Identifies security vulnerabilities
- Provides CWE (Common Weakness Enumeration) IDs
- Calculates CVSS (Common Vulnerability Scoring System) scores
- Suggests security fixes

### 3. **Bug Detection**
- Identifies potential bugs and runtime errors
- Points to exact file locations and line numbers
- Provides fix recommendations with code examples

### 4. **Code Quality Assessment**
- Overall code quality score (0-100)
- File-by-file quality metrics
- Code complexity analysis
- Best practice violations

### 5. **Visual Diagrams**
- **Architecture Diagram**: Visual representation of your project structure
- **Complexity Graph**: Complexity analysis visualization
- Both rendered using Mermaid diagrams

### 6. **Issue Categorization**
Issues are categorized by:
- **Type**: Security, Bug, Code Quality, Performance, Best Practice
- **Severity**: Critical, High, Medium, Low, Info

## How to Use

### 1. Navigate to Review Page
Go to `/projects/[projectId]/reviews` to access the review system.

### 2. Generate Review
Click "Start Review" or "Generate New Review" button to analyze your project.

### 3. View Results
The review page displays:
- Overall code quality score
- Total issues found (categorized by severity)
- Summary of findings
- Architecture and complexity diagrams
- Detailed issue list with:
  - Issue description
  - Affected file and line numbers
  - Code snippet
  - Fix recommendations
  - Suggested code fixes

### 4. Filter Issues
Use the tabs to filter issues by:
- Type (Security, Bugs, Quality, Performance, Best Practices)
- Severity (Critical, High, Medium, Low, Info)

## API Endpoints

### POST `/api/review/generate`
Generates a new code review for a project.

**Request Body:**
```json
{
  "projectId": "string",
  "files": [ // Optional - will auto-fetch from project if not provided
    {
      "path": "string",
      "content": "string",
      "language": "string"
    }
  ]
}
```

**Response:**
```json
{
  "review": {
    "id": "string",
    "score": 85,
    "summary": "string",
    "totalIssues": 10,
    "criticalIssues": 0,
    "highIssues": 2,
    "mediumIssues": 5,
    "lowIssues": 3,
    "architectureDiagram": "mermaid diagram",
    "complexityGraph": "mermaid diagram",
    "files": [...],
    "issues": [...]
  }
}
```

## tRPC Procedures

### `reviews.getByProject`
Get all reviews for a project.

### `reviews.getById`
Get a specific review by ID.

### `reviews.getLatest`
Get the latest review for a project.

### `reviews.create`
Create a new empty review.

### `reviews.update`
Update review data.

### `reviews.addFile`
Add a file to a review.

### `reviews.addIssue`
Add an issue to a review.

### `reviews.getIssuesBySeverity`
Get issues filtered by severity.

### `reviews.getIssuesByType`
Get issues filtered by type.

### `reviews.delete`
Delete a review.

## Database Schema

### Review
Main review record with overall metrics and status.

### ReviewFile
Individual file analysis with metrics.

### CodeIssue
Detailed issue information including:
- Type and severity
- Description and recommendations
- File location and code snippets
- Security-specific data (CWE, CVSS)

## Components

### ReviewOverview
Displays overall score, status, and issue summary.

### IssueCard
Shows individual issue details with code snippets and fixes.

### IssuesList
Tabbed interface for filtering and viewing issues.

### DiagramViewer
Renders Mermaid diagrams for architecture and complexity.

## Environment Variables

```env
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

## Future Enhancements

- [ ] Export review as PDF/HTML
- [ ] Compare reviews over time
- [ ] Integration with CI/CD pipelines
- [ ] Custom rule configuration
- [ ] Team collaboration features
- [ ] Auto-fix application
- [ ] IDE integration

## Tech Stack

- **AI**: Claude 3.5 Sonnet (Anthropic)
- **Database**: PostgreSQL with Prisma
- **API**: tRPC for type-safe APIs
- **UI**: React, Next.js, Tailwind CSS
- **Diagrams**: Mermaid
