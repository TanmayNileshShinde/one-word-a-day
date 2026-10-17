# Security Policy

**One Word A Day** is a daily vocabulary learning web application.

---

## 🔒 Security Practices

1. **Serverless Secret Isolation:** Sensitive API tokens (such as `AI_API_KEY`) are managed exclusively through serverless runtime environment variables (`api/today-word.js`) and never exposed to the client.
2. **Client Authentication:** Firebase Auth handles user authentication securely without storing plain-text credentials.
3. **Firestore Security Rules:** User streaks and progress documents are protected by authenticated user UID rules.

---

## 🚨 Vulnerability Reporting

Please report any security concerns directly to:
- **Email:** `tanmaynileshshinde@gmail.com`
- **Subject:** `[SECURITY] One Word A Day Security Report`
