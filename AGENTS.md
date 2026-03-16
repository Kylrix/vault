1. don't bother about git; i'll handle myself
2. don't create any indiscriminate markdown files, or summaries files, or implementation summaries, or any docs. except explicitly told to. simply write code or modify code functionalities.
### ⚠️ CRITICAL PROHIBITION: Unauthrorized Backend/Database Modifications
- **DO NOT** write, execute, or attempt to run independent scripts (Node.js, Python, Bash, etc.) to modify remote backend database schemas, metadata, or server configurations unless explicitly commanded to do so by the user.
- When debugging client-side API errors (such as Appwrite "Unknown attribute" or schema mismatch errors), assume the backend is the source of truth. Your job is to align the client payload, SDK usage, or local generated types to match the backend, **not** to forcefully migrate the backend to match the client.
- **NEVER** search for or attempt to use server-side API keys, admin credentials, or `node-appwrite` administrative methods to bypass client-side limitations while tasked with a frontend or client SDK issue.
