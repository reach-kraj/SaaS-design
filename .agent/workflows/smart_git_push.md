---
description: Automatically configure git credentials from git_readme.md and safely push code.
---

1. Check if `git_readme.md` exists. If not, ask the user to create it.
2. Read `git_readme.md` and extract the values for `Username` and `Email` from the "Configuration" section.
3. Run the following commands using the extracted values:
   ```bash
   git config user.name "<Username>"
   git config user.email "<Email>"
   ```
4. Verify the config was set:
   ```bash
   git config user.name
   git config user.email
   ```
5. Check `git status`.
6. Ask the user for a commit message.
7. Run:
   ```bash
   git add .
   git commit -m "<Commit Message>"
   ```
8. Append a log entry to `git_readme.md` with the current date, time, action ("Push"), description (Commit Message), and status ("Pending").
9. Run `git push origin main`.
10. If the push is successful, update the log entry in `git_readme.md` to "Success".
