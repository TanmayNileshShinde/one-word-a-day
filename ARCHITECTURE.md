# System Architecture — One Word A Day

This document details the serverless caching lifecycle, OpenRouter LLM word generation pipeline, and atomic date verification.

## Architecture Overview

```text
[ Browser PWA Client ]  <---> [ Vercel Serverless Function (/api/today-word) ]
         |                                           |
         |                            +--------------+---------------+
         |                            |                              |
         |                   [ Global Memory Cache ]        [ OpenRouter AI API ]
         |                   (TTL: Current UTC Date)         (Prompt Format JSON)
         |
  [ Firebase Auth + Cloud Firestore ]
  (Atomic streak records & user dictionary)
```

### Components
1. **Serverless Date Caching:** Prevents redundant LLM API calls by caching the daily word globally until midnight UTC transition.
2. **Atomic Date Locks:** User streaks increment strictly once per 24-hour calendar window.
