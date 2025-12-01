# Fix: GitHub "Repository Not Found" Error

## Problem Analysis

The "Repository not found" error occurs when trying to push code to GitHub. Based on your console logs:

```
Repository details: 
{repoName: 'manas@gamil.com', owner: 'mdkulkarni2005', fullRepoPath: 'mdkulkarni2005/manas@gamil.com'}
```

**Root Cause**: Repository names containing invalid characters (like `@`, spaces, etc.) are being accepted and stored in the database, but GitHub API rejects them because they don't follow GitHub's naming conventions.

## GitHub Repository Naming Rules

GitHub requires repository names to:
- ✅ Only contain alphanumeric characters (a-z, A-Z, 0-9)
- ✅ Can use hyphens (`-`), underscores (`_`), and periods (`.`)
- ✅ Cannot start with a period or hyphen
- ✅ Cannot end with a period
- ✅ Maximum 100 characters
- ❌ **Cannot contain: `@ ! # $ % ^ & * ( ) + = { } [ ] | \ : ; " ' < > , ? / spaces`**

## Solutions Implemented

### 1. Server-Side Validation (`/src/app/api/github/init/route.ts`)

Added comprehensive validation before making GitHub API calls:

```typescript
// Validate repository name - GitHub doesn't allow certain characters
const invalidChars = /[@\s!#$%^&*()+={}\[\]|\\:;"'<>,.?/]/;
if (invalidChars.test(repoName)) {
  return NextResponse.json({ 
    error: "Invalid repository name",
    detail: "Repository name can only contain letters, numbers, hyphens (-), underscores (_), and periods (.). Cannot contain spaces, @, or other special characters."
  }, { status: 400 });
}

// Check for invalid starting characters
if (repoName.startsWith('.') || repoName.startsWith('-')) {
  return NextResponse.json({ 
    error: "Invalid repository name",
    detail: "Repository name cannot start with a period (.) or hyphen (-)."
  }, { status: 400 });
}

// Check for invalid ending characters  
if (repoName.endsWith('.')) {
  return NextResponse.json({ 
    error: "Invalid repository name",
    detail: "Repository name cannot end with a period (.)."
  }, { status: 400 });
}
```

**Benefits**:
- Prevents invalid API calls to GitHub
- Saves API rate limits
- Provides specific error messages
- Catches issues before they reach GitHub

### 2. Enhanced Error Logging

Added detailed console logging throughout the flow:

**In `/src/app/api/github/init/route.ts`**:
```typescript
console.log(`[GitHub Init] Creating repository: ${repoName} for project: ${projectId}`);
console.log(`[GitHub Init] Repository created successfully:`, {
  repoName,
  htmlUrl: repoData.html_url,
  owner: repoData.owner?.login
});
```

**In `/src/app/api/github/push/route.ts`**:
```typescript
console.log(`[GitHub Push] Attempting to access repository: ${owner}/${project.githubRepoName}`);
console.error(`[GitHub Push] Repository not found:`, {
  owner,
  repoName: project.githubRepoName,
  status: repoResponse.status,
  error: errorData
});
```

**Benefits**:
- Easy debugging in development
- Track the exact repository name being used
- Identify where the flow fails
- Monitor GitHub API responses

### 3. Improved Error Messages

**Push API Error** (`/src/app/api/github/push/route.ts`):
```typescript
return NextResponse.json({ 
  error: "Repository not found",
  detail: `Could not find repository '${owner}/${project.githubRepoName}'. Please verify:\n1. The repository name doesn't contain invalid characters like @ or spaces\n2. The repository exists in your GitHub account\n3. Your token has access to this repository\n\nIf you just created the repo, wait 5-10 seconds and try again.`,
  repoName: project.githubRepoName,
  owner: owner
}, { status: 404 });
```

**"Already Exists" Error** (`/src/app/api/github/init/route.ts`):
```typescript
if (response.status === 422 && error.errors?.some((e: { message?: string }) => 
  e.message?.toLowerCase().includes("already exists")
)) {
  return NextResponse.json({ 
    error: "Repository already exists",
    detail: `A repository named '${repoName}' already exists in your GitHub account. Please use a different name or delete the existing repository first.`
  }, { status: 422 });
}
```

### 4. Better UI Feedback

**In Project View** (`/src/modules/projects/ui/views/project-view.tsx`):
```typescript
// Show multiline errors properly
if (errorMsg.includes('\n')) {
  const lines = errorMsg.split('\n');
  toast.error(lines[0], {
    description: lines.slice(1).join('\n'),
    duration: 10000
  });
} else {
  toast.error(errorMsg);
}
```

**In Project Form** (`/src/modules/home/ui/components/project-form.tsx`):
- Added helpful hint text below repository name input
- Shows better error formatting
- Logs errors to console for debugging

```typescript
<p className="text-xs text-muted-foreground">
  Use letters, numbers, hyphens (-), and underscores (_) only. No spaces or special characters like @.
</p>
```

## How It Works Now

### Creating a Repository

**Before** ❌:
1. User enters `manas@gamil.com`
2. No validation
3. Saved to database
4. GitHub API call fails later
5. Confusing error message

**After** ✅:
1. User enters `manas@gamil.com`
2. Server validates immediately
3. Returns clear error: "Repository name can only contain letters, numbers, hyphens (-), underscores (_), and periods (.). Cannot contain spaces, @, or other special characters."
4. User corrects to `manas-gmail` or `manas-app`
5. Repository created successfully!

### Pushing to GitHub

**Before** ❌:
- Generic "Repository not found" error
- No context about why
- User doesn't know how to fix

**After** ✅:
- Detailed error with multiple possible causes
- Logs show exact repository path attempted
- User gets actionable steps to resolve
- Mentions timing issue for new repos

## Valid Repository Name Examples

✅ **Valid Names**:
- `my-awesome-project`
- `nextjs_app_2024`
- `vibe-clone`
- `user123-repo`
- `project.test`

❌ **Invalid Names** (now blocked):
- `manas@gmail.com` ← contains @
- `my project` ← contains space
- `app!` ← contains !
- `.hidden` ← starts with period
- `repo-` ← ends with hyphen (allowed actually)
- `my/repo` ← contains slash

## Testing Your Fix

### 1. Test Invalid Characters
```bash
# Try to create repo with @
Repository name: test@example.com
Expected: Error immediately - "Repository name can only contain..."
```

### 2. Test Valid Name
```bash
# Use valid characters
Repository name: test-example-app
Expected: Repository created successfully
```

### 3. Test Push After Creation
```bash
# Wait 5 seconds after creating repo
# Then try to push
Expected: Files pushed successfully
```

### 4. Check Console Logs
```bash
# Look for these logs:
[GitHub Init] Creating repository: test-example-app for project: xxx
[GitHub Init] Repository created successfully: {...}
[GitHub Push] Attempting to access repository: mdkulkarni2005/test-example-app
```

## Common Scenarios & Solutions

### Scenario 1: Invalid Repository Name
**Error**: "Repository name can only contain letters, numbers, hyphens (-), underscores (_), and periods (.)"

**Solution**: 
- Remove special characters like `@`, `!`, spaces
- Use hyphens instead: `my-app` instead of `my@app`
- Use underscores: `my_app` instead of `my app`

### Scenario 2: Repository Already Exists
**Error**: "A repository named 'X' already exists in your GitHub account"

**Solution**:
- Use a different name
- Or delete the existing repository from GitHub first
- Or connect to the existing repository instead

### Scenario 3: Repository Not Found (after creation)
**Error**: "Could not find repository 'owner/repo-name'"

**Possible Causes**:
1. **Just created** - Wait 5-10 seconds for GitHub to index
2. **Wrong token** - Token doesn't have access to the repo
3. **Name mismatch** - Check console logs for actual vs expected name

**Solution**:
- Check console logs for the exact repository path
- Verify repository exists on GitHub.com
- Wait a few seconds if just created
- Ensure token has `repo` scope

## Files Modified

1. ✅ `/src/app/api/github/init/route.ts`
   - Added validation for repository names
   - Added detailed logging
   - Improved error messages
   - Handle "already exists" case

2. ✅ `/src/app/api/github/push/route.ts`
   - Added detailed logging
   - Enhanced 404 error message
   - Return repository details for debugging

3. ✅ `/src/modules/projects/ui/views/project-view.tsx`
   - Better error message display
   - Support for multiline errors
   - Console logging for debugging

4. ✅ `/src/modules/home/ui/components/project-form.tsx`
   - Added helpful hint text
   - Better error display
   - Console logging

## Prevention Checklist

Before creating a repository, ensure the name:
- [ ] Only uses letters (a-z, A-Z)
- [ ] Only uses numbers (0-9)
- [ ] Only uses hyphens (-), underscores (_), or periods (.)
- [ ] Does NOT contain @ symbol
- [ ] Does NOT contain spaces
- [ ] Does NOT start with a period or hyphen
- [ ] Does NOT end with a period
- [ ] Is between 1-100 characters

## Summary

✅ **Root Cause Fixed**: Invalid repository names are now blocked at the API level

✅ **Better Errors**: Users get clear, actionable error messages explaining exactly what's wrong

✅ **Debugging Tools**: Console logs help track the exact repository name and API responses

✅ **User Guidance**: Helpful hints in the UI prevent mistakes before they happen

The "Repository not found" error should now be:
1. **Prevented** - Invalid names blocked before creation
2. **Explained** - Clear messages when it does occur
3. **Debuggable** - Detailed logs for troubleshooting
4. **Fixable** - Actionable steps provided to users
