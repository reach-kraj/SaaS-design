#!/bin/bash

# Create git_readme.md if it doesn't exist
if [ ! -f git_readme.md ]; then
  cat <<EOL > git_readme.md
# Git Operations Log & Configuration

This file tracks git configuration and operational logs for the AI assistant.

## Configuration
**Username**: Karthickraj
**Email**: reach.kraj28@gmail.com

## Git Commands Reference (AI Guardrails)

### Standard Workflow
1. **Check Status**: \`git status\`
2. **Stage Changes**: \`git add <file>\` (Avoid \`git add .\` unless absolutely sure)
3. **Commit**: \`git commit -m "feat: description"\` (Use conventional commits)
4. **Push**: \`git push origin main\` (Only after user approval)

### Configuration Commands
- Set Identity:
  \`\`\`bash
  git config user.name "Karthickraj"
  git config user.email "reach.kraj28@gmail.com"
  \`\`\`

## Operations Log

| Date | Time | Action | Description | Status |
|------|------|--------|-------------|--------|
| | | | | |
EOL
  echo "git_readme.md created."
else
  echo "git_readme.md already exists."
fi

# Add to .gitignore
if ! grep -q "git_readme.md" .gitignore; then
  echo "git_readme.md" >> .gitignore
  echo "Added git_readme.md to .gitignore"
else
  echo "git_readme.md already in .gitignore"
fi
