# Code Review Prompt Template

Copy the text below, fill in the bracketed placeholders, and paste it into Eon AI along with your project folder.

---

## Prompt

You are reviewing the codebase in the attached/linked project folder. Please conduct a thorough, structured review covering the following areas. Be specific — cite file names and line numbers where possible, and prioritize findings by severity (Critical / High / Medium / Low).

**Project context:**
- Project name: [YOUR PROJECT NAME]
- Tech stack: [e.g. Node.js/Express, Python/Django, React, etc.]
- Purpose: [1-2 sentence description of what the app does]
- Stage: [prototype / MVP / production]

**1. Architecture & Structure**
- Is the folder/module structure logical and consistent?
- Are there circular dependencies or tight coupling between unrelated modules?
- Is separation of concerns respected (e.g. business logic vs. UI vs. data access)?
- Are there god files/classes that should be split up?

**2. Code Quality & Maintainability**
- Identify dead code, duplicated logic, and overly complex functions (high cyclomatic complexity).
- Flag inconsistent naming conventions or formatting.
- Note missing or unclear comments/docstrings on non-obvious logic.
- Check for magic numbers/strings that should be constants or config.

**3. Bugs & Correctness**
- Look for logic errors, off-by-one errors, unhandled edge cases.
- Check error handling: are exceptions caught appropriately, or silently swallowed?
- Identify any race conditions or async/await misuse.
- Flag null/undefined reference risks.

**4. Security**
- Check for hardcoded secrets, API keys, or credentials.
- Identify injection risks (SQL, command, XSS).
- Review input validation and sanitization on all external inputs.
- Check authentication/authorization logic for gaps.
- Flag outdated or vulnerable dependencies.

**5. Performance**
- Identify obvious bottlenecks (N+1 queries, unnecessary loops, blocking calls on the main thread).
- Check for missing caching where it would help.
- Note large bundle sizes or unoptimized assets (if frontend).

**6. Testing**
- What is the current test coverage, and which critical paths are untested?
- Are tests meaningful (testing behavior) or superficial (testing implementation details)?
- Flag any flaky or skipped tests.

**7. Dependencies**
- List outdated packages and any with known vulnerabilities.
- Flag unused dependencies that can be removed.

**8. Documentation**
- Is there a README with setup/run instructions?
- Are public functions/APIs documented?
- Is there any onboarding doc for new contributors?

**9. Summary**
- Top 5 issues to fix first, ranked by impact vs. effort.
- One paragraph on overall code health.

---

### Tips for using this with Eon AI
- If Eon AI has a file/folder upload limit, start with your most critical directories (`src/`, `api/`, `core/`) rather than the whole repo.
- If it supports multi-turn context, ask it to go section-by-section rather than dumping everything in one response — you'll get more depth per area.
- Paste your `package.json` / `requirements.txt` / equivalent separately if you want a focused dependency-vulnerability pass.
