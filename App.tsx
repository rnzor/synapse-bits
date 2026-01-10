
import React, { useState, useEffect, useCallback, useMemo, Suspense, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Bit, UserStats, Badge, AuthUser, Tutorial } from './types';
import BitCard from './components/BitCard';
import CreateBitModal from './components/CreateBitModal';
import BitDetailModal from './components/BitDetailModal';
import ShareModal from './components/ShareModal';
import { ToastMessage, ToastType } from './components/Toast';
import VibeBackground from './components/VibeBackground';
import BitSwipeDeck from './components/BitSwipeDeck';
import NetworkStatus from './components/NetworkStatus';
import AuthModal from './components/AuthModal';
import ProgressDashboard from './components/ProgressDashboard';
import ChatDrawer from './components/ChatDrawer';
import TutorialCard from './components/TutorialCard';
import TutorialReader from './components/TutorialReader';
import HomePage from './src/pages/HomePage';
import TopicsPage from './src/pages/TopicsPage';
import TopicPage from './src/pages/TopicPage';
import { IconSearch, IconPlus, IconCpu, IconFire, IconCompass, IconStar, IconMenu, IconBookmark, IconBook, IconHome } from './components/Icons';
import { slugify } from './utils';

// Progress utility functions
function isCompleted(stats: UserStats, bitId: string): boolean {
  return stats.completedBits.includes(bitId);
}

function markCompleted(stats: UserStats, bitId: string): UserStats {
  if (isCompleted(stats, bitId)) return stats;
  return {
    ...stats,
    completedBits: [...stats.completedBits, bitId],
    lastSeenBitId: bitId
  };
}

function getTopicProgress(bits: Bit[], stats: UserStats, topicSlug: string): { completed: number, total: number } {
  const topicBits = bits.filter(bit => bit.topicSlug === topicSlug);
  const completed = topicBits.filter(bit => isCompleted(stats, bit.id)).length;
  const total = topicBits.length;
  return { completed, total };
}

function getNextBitToContinue(bits: Bit[], stats: UserStats, topicSlug?: string): Bit | null {
  let candidates = bits;
  if (topicSlug) {
    candidates = bits.filter(bit => bit.topicSlug === topicSlug);
  }
  // Find first incomplete bit
  const nextBit = candidates.find(bit => !isCompleted(stats, bit.id));
  return nextBit || null;
}

// --- DATASET: 100+ Curated Bits ---
const INITIAL_BITS: Bit[] = [
  // --- CORE CONCEPTS ---
  {
    id: '1',
    title: 'Understanding CIDR Notation',
    summary: 'Subnet masks explained simply.',
    content: 'CIDR (Classless Inter-Domain Routing) replaces old classful networks. IP/Suffix (e.g., /24) indicates how many bits are fixed for the network. /24 = 255.255.255.0 = 256 IPs.',
    codeSnippet: '192.168.1.0/24  => 256 IPs\n10.0.0.0/8      => 16M IPs\n172.16.0.0/12   => 1M IPs',
    language: 'network',
    tags: ['networking', 'subnetting'],
    difficulty: 'Beginner',
    author: 'NetNinja',
    timestamp: Date.now(),
    votes: 42
  },
  {
    id: '2',
    title: 'React useEffect Cleanup',
    summary: 'Prevent memory leaks with return functions.',
    content: 'Always return a cleanup function in useEffect if you create listeners or timers. This runs when the component unmounts or before the effect re-runs.',
    codeSnippet: `useEffect(() => {\n  const sub = api.subscribe();\n  return () => sub.unsubscribe();\n}, []);`,
    language: 'javascript',
    tags: ['react', 'hooks'],
    difficulty: 'Intermediate',
    author: 'CodeWizard',
    timestamp: Date.now() - 10000,
    votes: 128
  },
  {
    id: '3',
    title: 'The CAP Theorem',
    summary: 'Consistency, Availability, Partition Tolerance.',
    content: 'In a distributed system, you can only pick two. CP (Consistency + Partition Tolerance) = MongoDB/Redis. AP (Availability + Partition Tolerance) = Cassandra/Dynamo. CA is impossible in distributed networks.',
    codeSnippet: 'CP: Banking (Data must be accurate)\nAP: Social Feed (Data can be eventually consistent)',
    language: 'text',
    tags: ['system-design', 'database'],
    difficulty: 'Advanced',
    author: 'Arch_Angel',
    timestamp: Date.now() - 20000,
    votes: 620
  },
  // Additional bits to reach 101 total
  {
    id: '4',
    title: 'Docker Multi-Stage Builds',
    summary: 'Reduce image size dramatically.',
    content: 'Multi-stage builds let you use multiple FROM statements. Copy only artifacts you need from previous stages, leaving build tools behind.',
    codeSnippet: `FROM node:18 AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=builder /app/dist /usr/share/nginx/html`,
    language: 'dockerfile',
    tags: ['docker', 'devops'],
    difficulty: 'Intermediate',
    author: 'DevOpsGuru',
    timestamp: Date.now() - 30000,
    votes: 215
  },
  {
    id: '5',
    title: 'SQL EXPLAIN Plan',
    summary: 'Understand query performance.',
    content: 'EXPLAIN shows how your database executes a query. Look for full table scans, check if indexes are used.',
    codeSnippet: `EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';\n-- Look for: type, possible_keys, key, rows`,
    language: 'sql',
    tags: ['database', 'optimization', 'sql'],
    difficulty: 'Intermediate',
    author: 'DataWizard',
    timestamp: Date.now() - 40000,
    votes: 189
  },
  {
    id: '6',
    title: 'Python List Comprehensions',
    summary: 'Elegant one-liners for lists.',
    content: 'List comprehensions provide a concise way to create lists. They can replace map() and filter() calls.',
    codeSnippet: `# Traditional\nsquares = []\nfor x in range(10):\n    squares.append(x**2)\n\n# Comprehension\nsquares = [x**2 for x in range(10)]\n\n# With condition\nevens = [x for x in range(20) if x % 2 == 0]`,
    language: 'python',
    tags: ['python', 'syntax'],
    difficulty: 'Beginner',
    author: 'PythonMaster',
    timestamp: Date.now() - 50000,
    votes: 342
  },
  {
    id: '7',
    title: 'Git Rebase vs Merge',
    summary: 'Clean history or preserve context?',
    content: 'Merge keeps history intact with merge commits. Rebase rewrites history for a linear timeline. Never rebase public branches!',
    codeSnippet: `# Merge (preserves history)\ngit checkout main\ngit merge feature\n\n# Rebase (linear history)\ngit checkout feature\ngit rebase main`,
    language: 'bash',
    tags: ['git', 'version-control'],
    difficulty: 'Intermediate',
    author: 'GitNinja',
    timestamp: Date.now() - 60000,
    votes: 451
  },
  {
    id: '8',
    title: 'CSS Grid vs Flexbox',
    summary: 'Two-dimensional vs one-dimensional layout.',
    content: 'Grid excels at 2D layouts (rows AND columns). Flexbox is better for 1D layouts (single row OR column).',
    codeSnippet: `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n\n.flex-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}`,
    language: 'css',
    tags: ['css', 'layout', 'frontend'],
    difficulty: 'Intermediate',
    author: 'CSSMaestro',
    timestamp: Date.now() - 70000,
    votes: 278
  },
  {
    id: '9',
    title: 'REST vs GraphQL',
    summary: 'Multiple endpoints vs single endpoint.',
    content: 'REST uses multiple URLs for different resources. GraphQL uses one endpoint and lets clients specify exactly what data they need.',
    codeSnippet: `# REST\nGET /users/1\nGET /users/1/posts\nGET /users/1/comments\n\n# GraphQL\nPOST /graphql\n{\n  user(id: 1) {\n    name\n    posts { title }\n    comments { text }\n  }\n}`,
    language: 'text',
    tags: ['api', 'backend', 'graphql'],
    difficulty: 'Intermediate',
    author: 'APIArchitect',
    timestamp: Date.now() - 80000,
    votes: 523
  },
  {
    id: '10',
    title: 'Kubernetes Pod Lifecycle',
    summary: 'Understanding pod states.',
    content: 'Pods move through Pending → Running → Succeeded/Failed. Containers within can be Waiting, Running, or Terminated.',
    codeSnippet: `kubectl get pods\n# Pending: Scheduling\n# Running: At least one container running\n# Succeeded: All containers terminated successfully\n# Failed: Container(s) terminated with error`,
    language: 'bash',
    tags: ['kubernetes', 'devops', 'containers'],
    difficulty: 'Advanced',
    author: 'K8sExpert',
    timestamp: Date.now() - 90000,
    votes: 612
  },
  {
    id: '11',
    title: 'JavaScript Promises vs Async/Await',
    summary: 'Syntactic sugar for async operations.',
    content: 'Async/await makes promise-based code look synchronous. It\'s easier to read but functionally identical to .then() chains.',
    codeSnippet: `// Promises\nfetch('/api/data')\n  .then(res => res.json())\n  .then(data => console.log(data));\n\n// Async/Await\nconst data = await fetch('/api/data').then(r => r.json());\nconsole.log(data);`,
    language: 'javascript',
    tags: ['javascript', 'async', 'promises'],
    difficulty: 'Intermediate',
    author: 'JSGuru',
    timestamp: Date.now() - 100000,
    votes: 489
  },
  {
    id: '12',
    title: 'Linux Process Signals',
    summary: 'SIGTERM vs SIGKILL.',
    content: 'SIGTERM (15) asks a process to terminate gracefully. SIGKILL (9) forces immediate termination, no cleanup.',
    codeSnippet: `kill -15 1234  # SIGTERM - graceful\nkill -9 1234   # SIGKILL - force\nkillall -TERM myapp`,
    language: 'bash',
    tags: ['linux', 'processes', 'signals'],
    difficulty: 'Intermediate',
    author: 'LinuxAdmin',
    timestamp: Date.now() - 110000,
    votes: 267
  },
  {
    id: '13',
    title: 'OAuth 2.0 Flow',
    summary: 'Authorization code flow explained.',
    content: 'Client redirects to auth server → User logs in → Redirect back with code → Exchange code for token → Access protected resources.',
    codeSnippet: `1. GET /authorize?client_id=xxx&redirect_uri=xxx\n2. User authenticates\n3. Redirect: callback?code=ABC\n4. POST /token {code, client_secret}\n5. Response: {access_token, refresh_token}`,
    language: 'text',
    tags: ['security', 'authentication', 'oauth'],
    difficulty: 'Advanced',
    author: 'SecurityPro',
    timestamp: Date.now() - 120000,
    votes: 734
  },
  {
    id: '14',
    title: 'MongoDB Indexing',
    summary: 'Speed up queries with indexes.',
    content: 'Indexes allow fast lookups but slow down writes. Create indexes on frequently queried fields.',
    codeSnippet: `// Create index\ndb.users.createIndex({ email: 1 })\n\n// Compound index\ndb.orders.createIndex({ userId: 1, createdAt: -1 })\n\n// Check if index used\ndb.users.find({email: "test@example.com"}).explain("executionStats")`,
    language: 'javascript',
    tags: ['mongodb', 'database', 'performance'],
    difficulty: 'Intermediate',
    author: 'MongoMaster',
    timestamp: Date.now() - 130000,
    votes: 391
  },
  {
    id: '15',
    title: 'HTTP Status Codes',
    summary: 'Common response codes decoded.',
    content: '2xx = Success, 3xx = Redirect, 4xx = Client Error, 5xx = Server Error. Know the key ones!',
    codeSnippet: `200 OK\n201 Created\n204 No Content\n301 Moved Permanently\n400 Bad Request\n401 Unauthorized\n403 Forbidden\n404 Not Found\n500 Internal Server Error\n502 Bad Gateway\n503 Service Unavailable`,
    language: 'text',
    tags: ['http', 'api', 'networking'],
    difficulty: 'Beginner',
    author: 'WebDev101',
    timestamp: Date.now() - 140000,
    votes: 823
  },
  {
    id: '16',
    title: 'Redis Data Types',
    summary: 'More than just key-value.',
    content: 'Redis supports Strings, Lists, Sets, Sorted Sets, Hashes, Streams, and more. Each has specific use cases.',
    codeSnippet: `SET user:1:name "Alice"  # String\nLPUSH queue task1        # List\nSADD tags python js      # Set\nZADD leaderboard 100 "Alice"  # Sorted Set\nHMSET user:1 name "Alice" age 30  # Hash`,
    language: 'redis',
    tags: ['redis', 'database', 'cache'],
    difficulty: 'Intermediate',
    author: 'CacheMaster',
    timestamp: Date.now() - 150000,
    votes: 412
  },
  {
    id: '17',
    title: 'TypeScript Generics',
    summary: 'Type-safe reusable components.',
    content: 'Generics let you write flexible, reusable functions while maintaining type safety.',
    codeSnippet: `function identity<T>(arg: T): T {\n  return arg;\n}\n\n// Usage\nlet output = identity<string>("hello");\nlet num = identity<number>(42);`,
    language: 'typescript',
    tags: ['typescript', 'generics', 'types'],
    difficulty: 'Intermediate',
    author: 'TypeScriptNinja',
    timestamp: Date.now() - 160000,
    votes: 556
  },
  {
    id: '18',
    title: 'AWS S3 Lifecycle Policies',
    summary: 'Automate cost optimization.',
    content: 'Move objects to cheaper storage classes over time. Transition Standard → IA → Glacier → Deep Archive.',
    codeSnippet: `{\n  "Rules": [{\n    "Transitions": [\n      {"Days": 30, "StorageClass": "STANDARD_IA"},\n      {"Days": 90, "StorageClass": "GLACIER"},\n      {"Days": 365, "StorageClass": "DEEP_ARCHIVE"}\n    ],\n    "Expiration": {"Days": 2555}\n  }]\n}`,
    language: 'json',
    tags: ['aws', 's3', 'cloud', 'cost-optimization'],
    difficulty: 'Intermediate',
    author: 'CloudArchitect',
    timestamp: Date.now() - 170000,
    votes: 298
  },
  {
    id: '19',
    title: 'Nginx as Reverse Proxy',
    summary: 'Load balancing and SSL termination.',
    content: 'Nginx can distribute traffic, handle SSL, cache responses, and protect backend servers.',
    codeSnippet: `upstream backend {\n  server 10.0.1.10:3000;\n  server 10.0.1.11:3000;\n}\n\nserver {\n  listen 443 ssl;\n  ssl_certificate /path/to/cert;\n  ssl_certificate_key /path/to/key;\n\n  location / {\n    proxy_pass http://backend;\n  }\n}`,
    language: 'nginx',
    tags: ['nginx', 'devops', 'load-balancing'],
    difficulty: 'Advanced',
    author: 'InfraGuru',
    timestamp: Date.now() - 180000,
    votes: 687
  },
  {
    id: '20',
    title: 'Python Decorators',
    summary: 'Modify functions without changing their code.',
    content: 'Decorators wrap functions to add functionality: logging, timing, authentication, caching.',
    codeSnippet: `def timer(func):\n  def wrapper(*args, **kwargs):\n    start = time.time()\n    result = func(*args, **kwargs)\n    print(f"{func.__name__} took {time.time()-start}s")\n    return result\n  return wrapper\n\n@timer\ndef slow_function():\n  time.sleep(2)`,
    language: 'python',
    tags: ['python', 'decorators', 'metaprogramming'],
    difficulty: 'Advanced',
    author: 'PythonWizard',
    timestamp: Date.now() - 190000,
    votes: 721
  },
  { id: '21', title: 'TCP vs UDP', summary: 'Connection-oriented vs connectionless.', content: 'TCP guarantees delivery and order (HTTP, SSH). UDP is faster but unreliable (DNS, streaming, gaming).', codeSnippet: `TCP: Reliable, Ordered, Slow\nUDP: Fast, Unreliable, No guarantee\n\nUse TCP for: Web, Email, File Transfer\nUse UDP for: Gaming, VoIP, Live Streaming`, language: 'text', tags: ['networking', 'protocols'], difficulty: 'Beginner', author: 'NetEngineer', timestamp: Date.now() - 200000, votes: 445 },
  { id: '22', title: 'JWT Authentication', summary: 'Stateless token-based auth.', content: 'JSON Web Tokens contain user data in an encoded format. Server verifies signature without storing session.', codeSnippet: `Header.Payload.Signature\n\n// Decode\nconst decoded = jwt.verify(token, SECRET);\nconsole.log(decoded.userId);`, language: 'javascript', tags: ['security', 'authentication', 'jwt'], difficulty: 'Intermediate', author: 'AuthExpert', timestamp: Date.now() - 210000, votes: 612 },
  { id: '23', title: 'CSS Pseudo-classes', summary: ':hover, :focus, :nth-child and more.', content: 'Pseudo-classes select elements based on state or position in the DOM tree.', codeSnippet: `a:hover { color: blue; }\ninput:focus { border: 2px solid blue; }\nli:nth-child(odd) { background: #f0f0f0; }\nli:first-child { font-weight: bold; }`, language: 'css', tags: ['css', 'selectors', 'frontend'], difficulty: 'Beginner', author: 'CSSNinja', timestamp: Date.now() - 220000, votes: 234 },
  { id: '24', title: 'React useCallback', summary: 'Memoize functions to prevent re-renders.', content: 'useCallback returns a memoized version of the callback that only changes if dependencies change.', codeSnippet: `const handleClick = useCallback(() => {\n  doSomething(a, b);\n}, [a, b]);\n\n// Without useCallback, function recreated every render`, language: 'javascript', tags: ['react', 'hooks', 'performance'], difficulty: 'Intermediate', author: 'ReactPro', timestamp: Date.now() - 230000, votes: 378 },
  { id: '25', title: 'Linux Find Command', summary: 'Search for files and directories.', content: 'The find command locates files by name, type, size, modification time, and more.', codeSnippet: `find . -name "*.js"  # Find all JS files\nfind /var/log -type f -mtime +7  # Files older than 7 days\nfind . -size +100M  # Files larger than 100MB`, language: 'bash', tags: ['linux', 'cli', 'filesystem'], difficulty: 'Intermediate', author: 'BashMaster', timestamp: Date.now() - 240000, votes: 312 },
  { id: '26', title: 'SQL Joins Explained', summary: 'INNER, LEFT, RIGHT, FULL.', content: 'Joins combine rows from multiple tables. INNER returns matches only, LEFT includes all left rows, RIGHT all right rows, FULL all rows.', codeSnippet: `INNER JOIN: Only matching rows\nLEFT JOIN: All from left + matches\nRIGHT JOIN: All from right + matches\nFULL OUTER: All rows from both`, language: 'sql', tags: ['sql', 'database', 'joins'], difficulty: 'Intermediate', author: 'SQLMaster', timestamp: Date.now() - 250000, votes: 589 },
  { id: '27', title: 'GraphQL Resolvers', summary: 'Functions that return field data.', content: 'Each field in GraphQL schema has a resolver function that fetches the data for that field.', codeSnippet: `const resolvers = {\n  Query: {\n    user: (parent, args, context) => {\n      return db.users.findById(args.id);\n    }\n  }\n};`, language: 'javascript', tags: ['graphql', 'api', 'backend'], difficulty: 'Intermediate', author: 'GraphQLDev', timestamp: Date.now() - 260000, votes: 423 },
  { id: '28', title: 'Python Context Managers', summary: 'with statement for resource management.', content: 'Context managers ensure resources are properly acquired and released. Common with files, locks, database connections.', codeSnippet: `with open('file.txt', 'r') as f:\n  data = f.read()\n# File automatically closed\n\nwith db.connection() as conn:\n  conn.execute(query)`, language: 'python', tags: ['python', 'resources', 'best-practices'], difficulty: 'Intermediate', author: 'PythonicCode', timestamp: Date.now() - 270000, votes: 367 },
  { id: '29', title: 'Docker Compose', summary: 'Multi-container applications made easy.', content: 'docker-compose.yml defines services, networks, and volumes. Start entire stack with one command.', codeSnippet: `version: '3.8'\nservices:\n  web:\n    build: .\n    ports: ["3000:3000"]\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_PASSWORD: secret`, language: 'yaml', tags: ['docker', 'devops', 'containers'], difficulty: 'Intermediate', author: 'DockerPro', timestamp: Date.now() - 280000, votes: 534 },
  { id: '30', title: 'Git Cherry-Pick', summary: 'Apply specific commits to another branch.', content: 'Cherry-pick lets you copy commits from one branch to another without merging everything.', codeSnippet: `git cherry-pick abc123  # Apply commit abc123\ngit cherry-pick A..B    # Range of commits`, language: 'bash', tags: ['git', 'version-control'], difficulty: 'Advanced', author: 'GitPro', timestamp: Date.now() - 290000, votes: 412 },
  { id: '31', title: 'CSS Flexbox Gap', summary: 'Spacing without margins.', content: 'The gap property adds space between flex items without needing margins on every child.', codeSnippet: `.container {\n  display: flex;\n  gap: 1rem; /* Space between items */\n}`, language: 'css', tags: ['css', 'flexbox', 'layout'], difficulty: 'Beginner', author: 'LayoutMaster', timestamp: Date.now() - 300000, votes: 267 },
  { id: '32', title: 'Node.js Event Loop', summary: 'How async operations work.', content: 'Event loop phases: timers → I/O callbacks → idle → poll → check → close. Understanding this explains async behavior.', codeSnippet: `setTimeout(() => console.log('timeout'), 0);\nsetImmediate(() => console.log('immediate'));\nPromise.resolve().then(() => console.log('promise'));\n// Output: promise, timeout, immediate`, language: 'javascript', tags: ['nodejs', 'async', 'event-loop'], difficulty: 'Advanced', author: 'NodeExpert', timestamp: Date.now() - 310000, votes: 678 },
  { id: '33', title: 'PostgreSQL JSONB', summary: 'Binary JSON with indexing support.', content: 'JSONB stores JSON as binary, allowing indexing and faster queries than JSON type.', codeSnippet: `CREATE TABLE users (data JSONB);\nCREATE INDEX idx_data ON users USING GIN (data);\n\nSELECT * FROM users WHERE data @> '{"age": 25}';`, language: 'sql', tags: ['postgresql', 'database', 'json'], difficulty: 'Intermediate', author: 'PostgresGuru', timestamp: Date.now() - 320000, votes: 445 },
  { id: '34', title: 'React useRef', summary: 'Persisting values without re-renders.', content: 'useRef stores mutable values that persist across renders without causing re-renders when updated.', codeSnippet: `const inputRef = useRef(null);\n\nconst focusInput = () => {\n  inputRef.current.focus();\n};\n\n<input ref={inputRef} />`, language: 'javascript', tags: ['react', 'hooks', 'dom'], difficulty: 'Intermediate', author: 'ReactDev', timestamp: Date.now() - 330000, votes: 389 },
  { id: '35', title: 'Linux Cron Jobs', summary: 'Schedule recurring tasks.', content: 'Cron runs commands at specified times. Format: minute hour day month weekday command.', codeSnippet: `# Edit crontab\ncrontab -e\n\n# Every day at 3am\n0 3 * * * /path/to/backup.sh\n\n# Every Monday at 9am\n0 9 * * 1 /path/to/report.py`, language: 'bash', tags: ['linux', 'automation', 'cron'], difficulty: 'Intermediate', author: 'SysAdmin', timestamp: Date.now() - 340000, votes: 456 },
  { id: '36', title: 'WebSocket vs HTTP', summary: 'Full-duplex vs request-response.', content: 'HTTP is request-response. WebSocket maintains a persistent connection for real-time bidirectional communication.', codeSnippet: `// WebSocket\nconst ws = new WebSocket('ws://localhost:8080');\nws.onmessage = (event) => console.log(event.data);\nws.send('Hello Server');`, language: 'javascript', tags: ['websocket', 'networking', 'realtime'], difficulty: 'Intermediate', author: 'WebDev', timestamp: Date.now() - 350000, votes: 523 },
  { id: '37', title: 'Python Generators', summary: 'Lazy evaluation with yield.', content: 'Generators produce items one at a time, saving memory. Use yield instead of return.', codeSnippet: `def fibonacci():\n  a, b = 0, 1\n  while True:\n    yield a\n    a, b = b, a + b\n\nfor num in fibonacci():\n  if num > 100: break\n  print(num)`, language: 'python', tags: ['python', 'generators', 'memory'], difficulty: 'Intermediate', author: 'PyExpert', timestamp: Date.now() - 360000, votes: 478 },
  { id: '38', title: 'SSH Tunneling', summary: 'Secure access to remote services.', content: 'SSH tunnels forward ports securely over SSH connection. Useful for accessing internal services.', codeSnippet: `# Local port forward\nssh -L 8080:localhost:80 user@server\n# Access via localhost:8080\n\n# Dynamic SOCKS proxy\nssh -D 9090 user@server`, language: 'bash', tags: ['ssh', 'security', 'networking'], difficulty: 'Advanced', author: 'SecOps', timestamp: Date.now() - 370000, votes: 589 },
  { id: '39', title: 'TypeScript Union Types', summary: 'Multiple possible types for a value.', content: 'Union types allow a value to be one of several types. Use type guards to narrow the type.', codeSnippet: `type Status = 'success' | 'error' | 'loading';\n\nfunction handle(status: Status) {\n  if (status === 'success') {\n    // TypeScript knows it\'s success here\n  }\n}`, language: 'typescript', tags: ['typescript', 'types', 'unions'], difficulty: 'Intermediate', author: 'TSMaster', timestamp: Date.now() - 380000, votes: 412 },
  { id: '40', title: 'AWS Lambda Cold Starts', summary: 'Understanding initialization delays.', content: 'Cold starts occur when Lambda creates a new execution environment. Keep functions warm or use provisioned concurrency.', codeSnippet: `// Minimize cold start\n// - Keep dependencies small\n// - Initialize outside handler\n// - Use provisioned concurrency\n\nconst db = connectDB(); // Outside handler\n\nexport const handler = async (event) => {\n  // Handler code\n};`, language: 'javascript', tags: ['aws', 'lambda', 'serverless', 'performance'], difficulty: 'Advanced', author: 'ServerlessGuru', timestamp: Date.now() - 390000, votes: 534 },
  { id: '41', title: 'CSS Variables (Custom Properties)', summary: 'Dynamic theming made easy.', content: 'CSS variables can be changed at runtime with JavaScript, perfect for themes and responsive designs.', codeSnippet: `:root {\n  --primary-color: #3b82f6;\n  --spacing: 1rem;\n}\n\n.button {\n  background: var(--primary-color);\n  padding: var(--spacing);\n}`, language: 'css', tags: ['css', 'theming', 'variables'], difficulty: 'Beginner', author: 'CSSWizard', timestamp: Date.now() - 400000, votes: 345 },
  { id: '42', title: 'React memo', summary: 'Prevent unnecessary re-renders.', content: 'React.memo() creates a memoized component that only re-renders when props change.', codeSnippet: `const ExpensiveComponent = React.memo(({ data }) => {\n  return <div>{/* Expensive render */}</div>;\n});`, language: 'javascript', tags: ['react', 'performance', 'optimization'], difficulty: 'Intermediate', author: 'ReactOptimizer', timestamp: Date.now() - 410000, votes: 456 },
  { id: '43', title: 'Vim Basic Commands', summary: 'Survive the text editor.', content: 'Essential Vim commands: i (insert), Esc (normal mode), :w (save), :q (quit), :wq (save & quit), dd (delete line).', codeSnippet: `i    - Insert mode\nEsc  - Normal mode\n:w   - Save\n:q   - Quit\n:wq  - Save and quit\n:q!  - Quit without saving\ndd   - Delete line\nyy   - Copy line\np    - Paste`, language: 'text', tags: ['vim', 'editor', 'cli'], difficulty: 'Beginner', author: 'VimGuru', timestamp: Date.now() - 420000, votes: 678 },
  { id: '44', title: 'MongoDB Aggregation Pipeline', summary: 'Powerful data processing.', content: 'Aggregation pipeline processes documents through multiple stages: $match, $group, $sort, $project.', codeSnippet: `db.orders.aggregate([\n  { $match: { status: "completed" } },\n  { $group: { _id: "$userId", total: { $sum: "$amount" } } },\n  { $sort: { total: -1 } },\n  { $limit: 10 }\n])`, language: 'javascript', tags: ['mongodb', 'database', 'aggregation'], difficulty: 'Advanced', author: 'MongoExpert', timestamp: Date.now() - 430000, votes: 512 },
  { id: '45', title: 'DNS Record Types', summary: 'A, AAAA, CNAME, MX, TXT.', content: 'A = IPv4, AAAA = IPv6, CNAME = Alias, MX = Mail, TXT = Text (SPF, DKIM).', codeSnippet: `A      example.com → 192.168.1.1\nAAAA   example.com → 2001:db8::1\nCNAME  www.example.com → example.com\nMX     example.com → mail.example.com\nTXT    SPF, DKIM, domain verification`, language: 'text', tags: ['dns', 'networking', 'domains'], difficulty: 'Beginner', author: 'DNSMaster', timestamp: Date.now() - 440000, votes: 389 },
  { id: '46', title: 'JavaScript Closures', summary: 'Functions remember their lexical scope.', content: 'Closures allow inner functions to access outer function variables even after outer function has returned.', codeSnippet: `function counter() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}\n\nconst increment = counter();\nincrement(); // 1\nincrement(); // 2`, language: 'javascript', tags: ['javascript', 'closures', 'scope'], difficulty: 'Intermediate', author: 'JSExpert', timestamp: Date.now() - 450000, votes: 567 },
  { id: '47', title: 'Linux iptables Basics', summary: 'Firewall rules at the kernel level.', content: 'iptables controls network traffic. Rules specify actions for packets: ACCEPT, DROP, REJECT.', codeSnippet: `# Allow SSH\niptables -A INPUT -p tcp --dport 22 -j ACCEPT\n\n# Block IP\niptables -A INPUT -s 192.168.1.100 -j DROP\n\n# Save rules\niptables-save > /etc/iptables/rules.v4`, language: 'bash', tags: ['linux', 'security', 'firewall'], difficulty: 'Advanced', author: 'SecurityAdmin', timestamp: Date.now() - 460000, votes: 623 },
  { id: '48', title: 'Python Virtual Environments', summary: 'Isolated dependency management.', content: 'Virtual environments keep project dependencies separate. Essential for avoiding conflicts.', codeSnippet: `# Create venv\npython -m venv venv\n\n# Activate\nsource venv/bin/activate  # Linux/Mac\nvenv\\Scripts\\activate     # Windows\n\n# Install packages\npip install -r requirements.txt`, language: 'bash', tags: ['python', 'venv', 'dependencies'], difficulty: 'Beginner', author: 'PythonDev', timestamp: Date.now() - 470000, votes: 412 },
  { id: '49', title: 'SQL Transactions', summary: 'ACID properties explained.', content: 'Transactions ensure data integrity: Atomic (all or nothing), Consistent, Isolated, Durable.', codeSnippet: `BEGIN TRANSACTION;\n\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\n\nCOMMIT; -- or ROLLBACK on error`, language: 'sql', tags: ['sql', 'database', 'transactions'], difficulty: 'Intermediate', author: 'DBArchitect', timestamp: Date.now() - 480000, votes: 534 },
  { id: '50', title: 'React Context API', summary: 'Global state without prop drilling.', content: 'Context provides a way to pass data through component tree without passing props manually at every level.', codeSnippet: `const ThemeContext = React.createContext('light');\n\n<ThemeContext.Provider value="dark">\n  <App />\n</ThemeContext.Provider>\n\n// In child component\nconst theme = useContext(ThemeContext);`, language: 'javascript', tags: ['react', 'context', 'state-management'], difficulty: 'Intermediate', author: 'ReactArch', timestamp: Date.now() - 490000, votes: 478 },
  { id: '51', title: 'Git Stash', summary: 'Temporarily save uncommitted changes.', content: 'Stash saves your working directory changes so you can switch branches without committing.', codeSnippet: `git stash          # Save changes\ngit stash list     # View stashes\ngit stash pop      # Apply and remove\ngit stash apply    # Apply but keep\ngit stash drop     # Delete stash`, language: 'bash', tags: ['git', 'version-control'], difficulty: 'Beginner', author: 'GitUser', timestamp: Date.now() - 500000, votes: 389 },
  { id: '52', title: 'CORS Explained', summary: 'Cross-Origin Resource Sharing.', content: 'CORS is a browser security feature that restricts cross-origin HTTP requests. Configure server to allow specific origins.', codeSnippet: `// Express.js\napp.use((req, res, next) => {\n  res.header('Access-Control-Allow-Origin', 'https://example.com');\n  res.header('Access-Control-Allow-Methods', 'GET, POST');\n  next();\n});`, language: 'javascript', tags: ['security', 'cors', 'api'], difficulty: 'Intermediate', author: 'WebSecPro', timestamp: Date.now() - 510000, votes: 612 },
  { id: '53', title: 'TypeScript Utility Types', summary: 'Built-in type transformations.', content: 'TypeScript provides utilities like Partial, Required, Pick, Omit for type manipulation.', codeSnippet: `interface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\ntype PartialUser = Partial<User>;  // All optional\ntype UserName = Pick<User, 'name'>; // Only name\ntype NoEmail = Omit<User, 'email'>; // Without email`, language: 'typescript', tags: ['typescript', 'types', 'utilities'], difficulty: 'Intermediate', author: 'TypeDev', timestamp: Date.now() - 520000, votes: 445 },
  { id: '54', title: 'Load Balancing Algorithms', summary: 'Round Robin, Least Connections, IP Hash.', content: 'Different strategies distribute traffic: Round Robin (rotate), Least Connections (least busy), IP Hash (same user → same server).', codeSnippet: `Round Robin: Server 1 → Server 2 → Server 3 → Server 1\nLeast Conn: Send to server with fewest active connections\nIP Hash: hash(client_ip) % server_count`, language: 'text', tags: ['load-balancing', 'system-design', 'networking'], difficulty: 'Advanced', author: 'InfraExpert', timestamp: Date.now() - 530000, votes: 578 },
  { id: '55', title: 'Python List vs Tuple', summary: 'Mutable vs immutable sequences.', content: 'Lists are mutable (can change), tuples are immutable (cannot change). Tuples are faster and safer.', codeSnippet: `# List (mutable)\nmy_list = [1, 2, 3]\nmy_list[0] = 99  # OK\n\n# Tuple (immutable)\nmy_tuple = (1, 2, 3)\nmy_tuple[0] = 99  # Error!`, language: 'python', tags: ['python', 'data-structures'], difficulty: 'Beginner', author: 'PythonBasics', timestamp: Date.now() - 540000, votes: 312 },
  { id: '56', title: 'Docker Volumes', summary: 'Persistent data storage.', content: 'Volumes persist data outside containers. Survive container restarts and removals.', codeSnippet: `# Create volume\ndocker volume create mydata\n\n# Use volume\ndocker run -v mydata:/app/data myimage\n\n# List volumes\ndocker volume ls`, language: 'bash', tags: ['docker', 'storage', 'persistence'], difficulty: 'Intermediate', author: 'ContainerPro', timestamp: Date.now() - 550000, votes: 423 },
  { id: '57', title: 'CSS Grid Template Areas', summary: 'Named grid layouts.', content: 'Template areas provide intuitive way to create complex layouts using ASCII-art-like syntax.', codeSnippet: `.container {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "sidebar main"\n    "footer footer";\n}\n\n.header { grid-area: header; }`, language: 'css', tags: ['css', 'grid', 'layout'], difficulty: 'Intermediate', author: 'GridMaster', timestamp: Date.now() - 560000, votes: 367 },
  { id: '58', title: 'Kubernetes ConfigMaps', summary: 'Externalize configuration.', content: 'ConfigMaps store configuration data as key-value pairs. Inject into pods as environment variables or files.', codeSnippet: `# Create ConfigMap\nkubectl create configmap app-config --from-literal=API_URL=https://api.example.com\n\n# Use in pod\nenv:\n  - name: API_URL\n    valueFrom:\n      configMapKeyRef:\n        name: app-config\n        key: API_URL`, language: 'yaml', tags: ['kubernetes', 'config', 'devops'], difficulty: 'Intermediate', author: 'K8sAdmin', timestamp: Date.now() - 570000, votes: 489 },
  { id: '59', title: 'Regular Expressions Basics', summary: 'Pattern matching essentials.', content: 'Regex symbols: . (any char), * (0+ times), + (1+ times), ? (optional), ^ (start), $ (end), [] (character set).', codeSnippet: `^\\d{3}-\\d{2}-\\d{4}$  # SSN: 123-45-6789\n[a-z]+@[a-z]+\\.[a-z]{2,}  # Email pattern\n^https?://  # URL start`, language: 'text', tags: ['regex', 'patterns', 'parsing'], difficulty: 'Intermediate', author: 'RegexNinja', timestamp: Date.now() - 580000, votes: 534 },
  { id: '60', title: 'Node.js Streams', summary: 'Process data chunk by chunk.', content: 'Streams handle large data efficiently by processing it in chunks rather than loading everything into memory.', codeSnippet: `const fs = require('fs');\nconst readable = fs.createReadStream('large-file.txt');\nconst writable = fs.createWriteStream('output.txt');\n\nreadable.pipe(writable);`, language: 'javascript', tags: ['nodejs', 'streams', 'performance'], difficulty: 'Advanced', author: 'NodePro', timestamp: Date.now() - 590000, votes: 612 },
  { id: '61', title: 'Python __init__.py', summary: 'Making packages importable.', content: '__init__.py tells Python a directory is a package. Can be empty or contain initialization code.', codeSnippet: `mypackage/\n  __init__.py\n  module1.py\n  module2.py\n\n# Now you can:\nimport mypackage.module1`, language: 'python', tags: ['python', 'modules', 'packages'], difficulty: 'Beginner', author: 'PyPackager', timestamp: Date.now() - 600000, votes: 289 },
  { id: '62', title: 'SQL Indexes Types', summary: 'B-Tree, Hash, GiST, GIN.', content: 'Different index types optimize different queries. B-Tree for general, Hash for equality, GIN for arrays/JSONB.', codeSnippet: `-- B-Tree (default)\nCREATE INDEX idx_name ON users(name);\n\n-- Hash (equality only)\nCREATE INDEX idx_hash ON users USING HASH(email);\n\n-- GIN (arrays, JSONB)\nCREATE INDEX idx_gin ON products USING GIN(tags);`, language: 'sql', tags: ['database', 'indexes', 'performance'], difficulty: 'Advanced', author: 'DBTuner', timestamp: Date.now() - 610000, votes: 456 },
  { id: '63', title: 'Bash Piping & Redirection', summary: 'Chain commands and redirect output.', content: '| pipes output to next command. > redirects to file (overwrite). >> appends to file. 2> redirects errors.', codeSnippet: `cat file.txt | grep "error" | wc -l\nls -la > files.txt\ncommand 2> errors.log\ncommand &> all-output.log`, language: 'bash', tags: ['bash', 'cli', 'shell'], difficulty: 'Beginner', author: 'ShellScripter', timestamp: Date.now() - 620000, votes: 378 },
  { id: '64', title: 'React useReducer', summary: 'Complex state logic alternative.', content: 'useReducer is better than useState for complex state transitions. Similar to Redux pattern.', codeSnippet: `const [state, dispatch] = useReducer(reducer, initialState);\n\nfunction reducer(state, action) {\n  switch(action.type) {\n    case 'increment': return {count: state.count + 1};\n    case 'decrement': return {count: state.count - 1};\n  }\n}`, language: 'javascript', tags: ['react', 'hooks', 'state-management'], difficulty: 'Intermediate', author: 'ReactAdvanced', timestamp: Date.now() - 630000, votes: 512 },
  { id: '65', title: 'AWS VPC Basics', summary: 'Virtual Private Cloud fundamentals.', content: 'VPC isolates your AWS resources. Contains subnets (public/private), route tables, internet gateway, NAT gateway.', codeSnippet: `VPC (10.0.0.0/16)\n├─ Public Subnet (10.0.1.0/24) → Internet Gateway\n└─ Private Subnet (10.0.2.0/24) → NAT Gateway → IGW`, language: 'text', tags: ['aws', 'networking', 'vpc'], difficulty: 'Intermediate', author: 'CloudNetEngineer', timestamp: Date.now() - 640000, votes: 589 },
  { id: '66', title: 'JavaScript Debounce vs Throttle', summary: 'Rate limiting function calls.', content: 'Debounce delays execution until inactivity. Throttle ensures maximum once per time period.', codeSnippet: `// Debounce: Wait for pause\nconst debounced = debounce(search, 300);\n\n// Throttle: At most once per interval\nconst throttled = throttle(scroll, 100);`, language: 'javascript', tags: ['javascript', 'performance', 'optimization'], difficulty: 'Intermediate', author: 'JSOptimizer', timestamp: Date.now() - 650000, votes: 623 },
  { id: '67', title: 'MongoDB Sharding', summary: 'Horizontal scaling for large datasets.', content: 'Sharding distributes data across multiple servers. Shard key determines data distribution.', codeSnippet: `sh.enableSharding("mydb")\nsh.shardCollection("mydb.users", { "userId": 1 })\n\n// Data distributed across shards based on userId`, language: 'javascript', tags: ['mongodb', 'scaling', 'sharding'], difficulty: 'Advanced', author: 'MongoScaler', timestamp: Date.now() - 660000, votes: 478 },
  { id: '68', title: 'Linux systemd Services', summary: 'Managing background services.', content: 'systemd manages services, handles dependencies, automatic restarts, logging.', codeSnippet: `# Start/stop service\nsudo systemctl start myapp\nsudo systemctl stop myapp\n\n# Enable on boot\nsudo systemctl enable myapp\n\n# Check status\nsudo systemctl status myapp`, language: 'bash', tags: ['linux', 'systemd', 'services'], difficulty: 'Intermediate', author: 'LinuxOps', timestamp: Date.now() - 670000, votes: 423 },
  { id: '69', title: 'CSS Animations', summary: '@keyframes for smooth transitions.', content: 'Animations define intermediate steps. More powerful than transitions for complex sequences.', codeSnippet: `@keyframes slideIn {\n  from { transform: translateX(-100%); }\n  to { transform: translateX(0); }\n}\n\n.element {\n  animation: slideIn 0.5s ease-out;\n}`, language: 'css', tags: ['css', 'animations', 'frontend'], difficulty: 'Intermediate', author: 'AnimationPro', timestamp: Date.now() - 680000, votes: 445 },
  { id: '70', title: 'Python async/await', summary: 'Asynchronous programming in Python.', content: 'async/await enables non-blocking I/O operations. Great for web scraping, API calls, concurrent tasks.', codeSnippet: `import asyncio\n\nasync def fetch_data(url):\n  response = await http_client.get(url)\n  return response.json()\n\nawait asyncio.gather(\n  fetch_data(url1),\n  fetch_data(url2)\n)`, language: 'python', tags: ['python', 'async', 'concurrency'], difficulty: 'Advanced', author: 'AsyncExpert', timestamp: Date.now() - 690000, votes: 567 },
  { id: '71', title: 'Git Interactive Rebase', summary: 'Rewrite commit history interactively.', content: 'Interactive rebase lets you edit, squash, reorder, or drop commits before pushing.', codeSnippet: `git rebase -i HEAD~5\n\n# Editor opens:\npick abc123 Commit message\nsquash def456 Fix typo\nreword ghi789 Better message\ndrop jkl012 Bad commit`, language: 'bash', tags: ['git', 'version-control', 'rebase'], difficulty: 'Advanced', author: 'GitMaster', timestamp: Date.now() - 700000, votes: 534 },
  { id: '72', title: 'API Rate Limiting', summary: 'Protect your API from abuse.', content: 'Rate limiting restricts requests per time window. Common strategies: fixed window, sliding window, token bucket.', codeSnippet: `// Express rate limiter\nconst rateLimit = require('express-rate-limit');\n\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 min\n  max: 100 // 100 requests per window\n});\n\napp.use('/api/', limiter);`, language: 'javascript', tags: ['api', 'security', 'rate-limiting'], difficulty: 'Intermediate', author: 'APISecure', timestamp: Date.now() - 710000, votes: 612 },
  { id: '73', title: 'TypeScript Interfaces vs Types', summary: 'When to use which?', content: 'Interfaces are extendable and better for objects. Types are more flexible for unions, tuples, primitives.', codeSnippet: `// Interface (extendable)\ninterface User {\n  name: string;\n}\ninterface Admin extends User {\n  role: string;\n}\n\n// Type (flexible)\ntype Status = 'active' | 'inactive';\ntype Point = [number, number];`, language: 'typescript', tags: ['typescript', 'types', 'interfaces'], difficulty: 'Intermediate', author: 'TSArchitect', timestamp: Date.now() - 720000, votes: 489 },
  { id: '74', title: 'Redis Pub/Sub', summary: 'Message broadcasting pattern.', content: 'Publishers send messages to channels. Subscribers receive all messages from subscribed channels. Real-time notifications.', codeSnippet: `// Publisher\nredis.publish('news', 'Breaking news!');\n\n// Subscriber\nredis.subscribe('news');\nredis.on('message', (channel, message) => {\n  console.log(message);\n});`, language: 'javascript', tags: ['redis', 'pubsub', 'messaging'], difficulty: 'Intermediate', author: 'RedisPro', timestamp: Date.now() - 730000, votes: 456 },
  { id: '75', title: 'SQL Window Functions', summary: 'Calculations across related rows.', content: 'Window functions perform calculations across rows related to current row without grouping.', codeSnippet: `SELECT name, salary,\n  AVG(salary) OVER (PARTITION BY department) as dept_avg,\n  RANK() OVER (ORDER BY salary DESC) as rank\nFROM employees;`, language: 'sql', tags: ['sql', 'database', 'window-functions'], difficulty: 'Advanced', author: 'SQLAnalyst', timestamp: Date.now() - 740000, votes: 678 },
  { id: '76', title: 'Docker Health Checks', summary: 'Monitor container health.', content: 'Health checks verify container is working correctly. Docker restarts unhealthy containers.', codeSnippet: `# Dockerfile\nHEALTHCHECK --interval=30s --timeout=3s \\\n  CMD curl -f http://localhost/ || exit 1\n\n# docker-compose.yml\nhealthcheck:\n  test: ["CMD", "curl", "-f", "http://localhost"]\n  interval: 30s\n  timeout: 3s`, language: 'dockerfile', tags: ['docker', 'monitoring', 'health'], difficulty: 'Intermediate', author: 'DockerOps', timestamp: Date.now() - 750000, votes: 412 },
  { id: '77', title: 'JavaScript Event Delegation', summary: 'Handle events efficiently.', content: 'Attach single event listener to parent instead of many listeners on children. Uses event bubbling.', codeSnippet: `// Instead of this:\nitems.forEach(item => item.addEventListener('click', handler));\n\n// Do this:\nparent.addEventListener('click', (e) => {\n  if (e.target.matches('.item')) {\n    handler(e);\n  }\n});`, language: 'javascript', tags: ['javascript', 'events', 'performance'], difficulty: 'Intermediate', author: 'DOMExpert', timestamp: Date.now() - 760000, votes: 534 },
  { id: '78', title: 'Kubernetes Secrets', summary: 'Store sensitive configuration.', content: 'Secrets store sensitive data like passwords, tokens. Base64 encoded but should encrypt at rest.', codeSnippet: `# Create secret\nkubectl create secret generic db-secret \\\n  --from-literal=password=mypassword\n\n# Use in pod\nenv:\n  - name: DB_PASSWORD\n    valueFrom:\n      secretKeyRef:\n        name: db-secret\n        key: password`, language: 'bash', tags: ['kubernetes', 'security', 'secrets'], difficulty: 'Intermediate', author: 'K8sSecurity', timestamp: Date.now() - 770000, votes: 489 },
  { id: '79', title: 'Python Comprehensions', summary: 'List, dict, set comprehensions.', content: 'Concise syntax for creating lists, dictionaries, and sets from iterables.', codeSnippet: `# List\nsquares = [x**2 for x in range(10)]\n\n# Dict\nsquare_dict = {x: x**2 for x in range(5)}\n\n# Set\nunique_lens = {len(word) for word in words}`, language: 'python', tags: ['python', 'comprehensions', 'syntax'], difficulty: 'Intermediate', author: 'PythonicPro', timestamp: Date.now() - 780000, votes: 445 },
  { id: '80', title: 'CSS Position Property', summary: 'static, relative, absolute, fixed, sticky.', content: 'Position controls element placement. Understanding the differences is crucial for layouts.', codeSnippet: `static: Default, normal flow\nrelative: Offset from normal position\nabsolute: Positioned relative to parent\nfixed: Fixed viewport position\nsticky: Toggles relative/fixed on scroll`, language: 'css', tags: ['css', 'positioning', 'layout'], difficulty: 'Beginner', author: 'CSSBasics', timestamp: Date.now() - 790000, votes: 367 },
  { id: '81', title: 'React Custom Hooks', summary: 'Reusable stateful logic.', content: 'Custom hooks extract component logic into reusable functions. Start with "use" prefix.', codeSnippet: `function useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(\n    () => localStorage.getItem(key) || initialValue\n  );\n  \n  useEffect(() => {\n    localStorage.setItem(key, value);\n  }, [key, value]);\n  \n  return [value, setValue];\n}`, language: 'javascript', tags: ['react', 'hooks', 'custom-hooks'], difficulty: 'Intermediate', author: 'ReactHooks', timestamp: Date.now() - 800000, votes: 589 },
  { id: '82', title: 'Linux grep Command', summary: 'Search text patterns.', content: 'grep searches files for patterns. Essential for log analysis and text processing.', codeSnippet: `grep "error" log.txt\ngrep -r "TODO" src/  # Recursive\ngrep -i "warning" *  # Case insensitive\ngrep -v "debug" log.txt  # Invert match`, language: 'bash', tags: ['linux', 'grep', 'search'], difficulty: 'Beginner', author: 'CLIPro', timestamp: Date.now() - 810000, votes: 312 },
  { id: '83', title: 'OAuth vs JWT', summary: 'Protocol vs token format.', content: 'OAuth 2.0 is an authorization protocol. JWT is a token format often used WITH OAuth.', codeSnippet: `OAuth 2.0: Authorization framework\n- Defines flows and roles\n- Can use any token format\n\nJWT: Token format\n- Self-contained\n- Base64 encoded JSON\n- Often used as OAuth access token`, language: 'text', tags: ['security', 'oauth', 'jwt'], difficulty: 'Intermediate', author: 'AuthGuru', timestamp: Date.now() - 820000, votes: 623 },
  { id: '84', title: 'PostgreSQL CTE', summary: 'Common Table Expressions.', content: 'CTEs create temporary named result sets. Make complex queries readable and enable recursive queries.', codeSnippet: `WITH high_earners AS (\n  SELECT * FROM employees WHERE salary > 100000\n)\nSELECT department, COUNT(*)\nFROM high_earners\nGROUP BY department;`, language: 'sql', tags: ['postgresql', 'sql', 'cte'], difficulty: 'Advanced', author: 'PostgresMaster', timestamp: Date.now() - 830000, votes: 512 },
  { id: '85', title: 'JavaScript Array Methods', summary: 'map, filter, reduce essentials.', content: 'Functional array methods for transforming and processing data without mutations.', codeSnippet: `const nums = [1, 2, 3, 4, 5];\n\n// map: transform\nconst doubled = nums.map(n => n * 2);\n\n// filter: select\nconst evens = nums.filter(n => n % 2 === 0);\n\n// reduce: aggregate\nconst sum = nums.reduce((acc, n) => acc + n, 0);`, language: 'javascript', tags: ['javascript', 'arrays', 'functional'], difficulty: 'Beginner', author: 'JSFunctional', timestamp: Date.now() - 840000, votes: 478 },
  { id: '86', title: 'Nginx Caching', summary: 'Speed up responses with caching.', content: 'Nginx can cache proxy responses, reducing backend load and improving response times.', codeSnippet: `proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;\n\nserver {\n  location / {\n    proxy_cache my_cache;\n    proxy_cache_valid 200 1h;\n    proxy_pass http://backend;\n  }\n}`, language: 'nginx', tags: ['nginx', 'caching', 'performance'], difficulty: 'Intermediate', author: 'NginxExpert', timestamp: Date.now() - 850000, votes: 445 },
  { id: '87', title: 'Python Type Hints', summary: 'Static type checking in Python.', content: 'Type hints improve code readability and enable static analysis tools like mypy.', codeSnippet: `def greet(name: str) -> str:\n    return f"Hello, {name}"\n\nfrom typing import List, Dict, Optional\n\ndef process(items: List[int]) -> Dict[str, int]:\n    pass`, language: 'python', tags: ['python', 'types', 'typing'], difficulty: 'Intermediate', author: 'TypedPython', timestamp: Date.now() - 860000, votes: 534 },
  { id: '88', title: 'AWS CloudWatch', summary: 'Monitoring and logging service.', content: 'CloudWatch collects metrics, logs, and events. Set alarms, create dashboards, trigger automated actions.', codeSnippet: `# AWS CLI\naws cloudwatch put-metric-alarm \\\n  --alarm-name cpu-high \\\n  --metric-name CPUUtilization \\\n  --threshold 80 \\\n  --comparison-operator GreaterThanThreshold`, language: 'bash', tags: ['aws', 'monitoring', 'cloudwatch'], difficulty: 'Intermediate', author: 'CloudMonitor', timestamp: Date.now() - 870000, votes: 467 },
  { id: '89', title: 'Git Reflog', summary: 'Recover lost commits.', content: 'Reflog tracks all HEAD movements. Useful for recovering deleted branches or reset commits.', codeSnippet: `git reflog\n# Find lost commit\n\ngit checkout abc123\n# Or restore branch\ngit branch recovered-branch abc123`, language: 'bash', tags: ['git', 'recovery', 'reflog'], difficulty: 'Advanced', author: 'GitRescue', timestamp: Date.now() - 880000, votes: 578 },
  { id: '90', title: 'TypeScript Enums', summary: 'Named constant values.', content: 'Enums define a set of named constants. Numeric or string enums available.', codeSnippet: `enum Direction {\n  Up,\n  Down,\n  Left,\n  Right\n}\n\nenum Status {\n  Active = "ACTIVE",\n  Inactive = "INACTIVE"\n}\n\nlet dir: Direction = Direction.Up;`, language: 'typescript', tags: ['typescript', 'enums', 'types'], difficulty: 'Beginner', author: 'TSBasics', timestamp: Date.now() - 890000, votes: 389 },
  { id: '91', title: 'MongoDB Change Streams', summary: 'Real-time data change notifications.', content: 'Change streams watch for changes in collections. Perfect for real-time features and data sync.', codeSnippet: `const changeStream = db.collection('orders').watch();\n\nchangeStream.on('change', (change) => {\n  console.log('Operation:', change.operationType);\n  console.log('Document:', change.fullDocument);\n});`, language: 'javascript', tags: ['mongodb', 'realtime', 'streams'], difficulty: 'Advanced', author: 'MongoRealtime', timestamp: Date.now() - 900000, votes: 498 },
  { id: '92', title: 'CSS Media Queries', summary: 'Responsive design breakpoints.', content: 'Media queries apply styles based on device characteristics like width, height, orientation.', codeSnippet: `/* Mobile first */\n.container { width: 100%; }\n\n@media (min-width: 768px) {\n  .container { width: 750px; }\n}\n\n@media (min-width: 1024px) {\n  .container { width: 970px; }\n}`, language: 'css', tags: ['css', 'responsive', 'media-queries'], difficulty: 'Beginner', author: 'ResponsiveWeb', timestamp: Date.now() - 910000, votes: 423 },
  { id: '93', title: 'Linux Sed Command', summary: 'Stream editor for text manipulation.', content: 'sed performs text transformations on streams. Search and replace, line deletion, insertion.', codeSnippet: `sed 's/old/new/g' file.txt  # Replace all\nsed -i 's/foo/bar/' file.txt  # In-place edit\nsed '5d' file.txt  # Delete line 5\nsed -n '1,10p' file.txt  # Print lines 1-10`, language: 'bash', tags: ['linux', 'sed', 'text-processing'], difficulty: 'Intermediate', author: 'SedMaster', timestamp: Date.now() - 920000, votes: 456 },
  { id: '94', title: 'React Error Boundaries', summary: 'Catch JavaScript errors in components.', content: 'Error boundaries catch errors in child component tree, log errors, and display fallback UI.', codeSnippet: `class ErrorBoundary extends React.Component {\n  state = { hasError: false };\n  \n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n  \n  render() {\n    if (this.state.hasError) {\n      return <h1>Something went wrong.</h1>;\n    }\n    return this.props.children;\n  }\n}`, language: 'javascript', tags: ['react', 'error-handling', 'boundaries'], difficulty: 'Intermediate', author: 'ReactSafety', timestamp: Date.now() - 930000, votes: 512 },
  { id: '95', title: 'Python f-strings', summary: 'Modern string formatting.', content: 'f-strings (Python 3.6+) provide concise and readable string interpolation.', codeSnippet: `name = "Alice"\nage = 30\n\n# f-string\nmessage = f"{name} is {age} years old"\n\n# With expressions\nresult = f"2 + 2 = {2 + 2}"\n\n# Formatting\npi = 3.14159\nformatted = f"Pi: {pi:.2f}"`, language: 'python', tags: ['python', 'strings', 'formatting'], difficulty: 'Beginner', author: 'PythonModern', timestamp: Date.now() - 940000, votes: 345 },
  { id: '96', title: 'Kubernetes Ingress', summary: 'HTTP/HTTPS routing to services.', content: 'Ingress manages external access to services. Provides load balancing, SSL termination, name-based routing.', codeSnippet: `apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: app-ingress\nspec:\n  rules:\n  - host: myapp.com\n    http:\n      paths:\n      - path: /\n        backend:\n          service:\n            name: myapp-service\n            port: 80`, language: 'yaml', tags: ['kubernetes', 'ingress', 'networking'], difficulty: 'Advanced', author: 'K8sNetwork', timestamp: Date.now() - 950000, votes: 589 },
  { id: '97', title: 'SQL NULL Handling', summary: 'IS NULL, IS NOT NULL, COALESCE.', content: 'NULL is not equal to anything, including NULL. Use special operators and functions.', codeSnippet: `-- Check for NULL\nWHERE column IS NULL\nWHERE column IS NOT NULL\n\n-- Default value\nSELECT COALESCE(column, 'default') FROM table;\n\n-- NULL in comparisons\nNULL = NULL  -- Result: NULL (not true!)`, language: 'sql', tags: ['sql', 'null', 'database'], difficulty: 'Beginner', author: 'SQLBasics', timestamp: Date.now() - 960000, votes: 378 },
  { id: '98', title: 'JavaScript Promises.all', summary: 'Run promises in parallel.', content: 'Promise.all waits for all promises to resolve. Fails fast if any promise rejects.', codeSnippet: `const promises = [\n  fetch('/api/users'),\n  fetch('/api/posts'),\n  fetch('/api/comments')\n];\n\nPromise.all(promises)\n  .then(([users, posts, comments]) => {\n    // All resolved\n  })\n  .catch(err => {\n    // Any failed\n  });`, language: 'javascript', tags: ['javascript', 'promises', 'async'], difficulty: 'Intermediate', author: 'AsyncJS', timestamp: Date.now() - 970000, votes: 534 },
  { id: '99', title: 'Docker Multi-Platform Builds', summary: 'Build for different architectures.', content: 'Create images for multiple CPU architectures (amd64, arm64) with buildx.', codeSnippet: `# Create builder\ndocker buildx create --use\n\n# Build multi-platform\ndocker buildx build \\\n  --platform linux/amd64,linux/arm64 \\\n  -t myimage:latest \\\n  --push .`, language: 'bash', tags: ['docker', 'multi-platform', 'buildx'], difficulty: 'Advanced', author: 'DockerArch', timestamp: Date.now() - 980000, votes: 467 },
  { id: '100', title: 'Python Decorators with Arguments', summary: 'Parametrized decorators.', content: 'Create decorators that accept arguments for more flexibility.', codeSnippet: `def repeat(times):\n  def decorator(func):\n    def wrapper(*args, **kwargs):\n      for _ in range(times):\n        result = func(*args, **kwargs)\n      return result\n    return wrapper\n  return decorator\n\n@repeat(3)\ndef greet(name):\n  print(f"Hello {name}")`, language: 'python', tags: ['python', 'decorators', 'advanced'], difficulty: 'Advanced', author: 'PythonMeta', timestamp: Date.now() - 990000, votes: 612 },
  { id: '101', title: 'Microservices vs Monolith', summary: 'Architecture trade-offs.', content: 'Monolith: simpler deployment, shared database. Microservices: independent scaling, tech diversity, complexity.', codeSnippet: `Monolith:\n+ Simple deployment\n+ Easier development\n- Scales as a whole\n- Technology lock-in\n\nMicroservices:\n+ Independent scaling\n+ Technology freedom\n- Complex deployment\n- Distributed system challenges`, language: 'text', tags: ['architecture', 'microservices', 'system-design'], difficulty: 'Advanced', author: 'ArchitectGuru', timestamp: Date.now() - 1000000, votes: 789 }
];

const INITIAL_TUTORIALS: Tutorial[] = [
    {
        id: 't-1',
        slug: 'securing-your-vps',
        title: 'Ironclad: Securing Your Linux VPS',
        description: 'The mandatory first steps for any new server. SSH keys, firewalls, and automated defense against brute force attacks.',
        coverGradient: 'bg-gradient-to-br from-slate-900 via-[#0f172a] to-emerald-900',
        duration: '15 min',
        level: 'Intermediate',
        tags: ['security', 'linux', 'devops'],
        author: 'Cipher_One',
        isPremium: true,
        timestamp: Date.now(),
        content: `
# 1. Update Your System

Before anything else, update the package repositories and upgrade existing packages. This ensures you have the latest security patches.

\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

# 2. Create a Non-Root User

Never operate as \`root\`. Create a new user with sudo privileges.

\`\`\`bash
adduser samurai
usermod -aG sudo samurai
\`\`\`

Now, switch to this user: \`su - samurai\`.

# 3. SSH Key Authentication

Password authentication is vulnerable to brute-force attacks. We will use SSH keys.

**On your local machine:**
\`\`\`bash
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id samurai@your_server_ip
\`\`\`

# 4. Hardening SSH

Now we disable root login and password authentication entirely.

Edit the config file:
\`\`\`bash
sudo nano /etc/ssh/sshd_config
\`\`\`

Change these settings:
\`\`\`text
PermitRootLogin no
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no
\`\`\`

Restart SSH: \`sudo systemctl restart ssh\`.

# 5. Firewall Setup (UFW)

Uncomplicated Firewall (UFW) is the easiest way to manage iptables.

\`\`\`bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
\`\`\`

# 6. Install Fail2Ban

Fail2Ban scans log files and bans IPs that show malicious signs (like too many password failures).

\`\`\`bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
\`\`\`

Your server is now significantly harder to breach. Stay safe.
        `
    }
];

const DID_YOU_KNOW_FACTS = [
    "The first computer bug was a literal moth found in the Harvard Mark II in 1947.",
    "Python is named after 'Monty Python's Flying Circus', not the snake.",
    "The average person blinks 15-20 times per minute, but only 7 times while looking at a screen.",
    "NASA's entire Apollo 11 guidance computer had less power than a modern smartphone.",
    "The first 1GB hard drive, announced in 1980, weighed over 500 pounds and cost $40,000.",
    "Linux is named after its creator Linus Torvalds, not the other way around.",
    "The '@' symbol in email addresses was chosen by Ray Tomlinson in 1971 because it was unlikely to appear in anyone's name.",
    "The HTTP error code 418 'I'm a teapot' was created as an April Fools' joke in 1998.",
    "The term 'bug' predates computers - Thomas Edison used it to describe technical defects in 1878.",
    "Git was created by Linus Torvalds in just 2 weeks when BitKeeper revoked Linux kernel's free license.",
    "The first computer virus was created in 1983 as an experiment to show vulnerabilities.",
    "JavaScript was created in just 10 days by Brendan Eich at Netscape in 1995.",
    "The word 'spam' for junk email comes from a Monty Python sketch about canned meat.",
    "CAPTCHA stands for 'Completely Automated Public Turing test to tell Computers and Humans Apart'.",
    "The first domain name ever registered was symbolics.com on March 15, 1985.",
    "Over 90% of the world's currency exists only as digital data on computer servers.",
    "The average lifespan of a URL is only about 2 years before it goes dead.",
    "Cookie data is named after 'fortune cookies' - small pieces of data that reveal information.",
    "The term 'cloud computing' was inspired by the cloud symbol used to represent the internet in diagrams.",
    "PostgreSQL was originally called POSTGRES, which stood for 'POST inGRES' (after the INGRES database)."
];

// Badge Definitions
const AVAILABLE_BADGES: Badge[] = [
    { id: 'b_novice', name: 'Hello World', description: 'Read your first Bit.', icon: 'code', color: 'emerald', condition: (s) => s.bitsRead >= 1 },
    { id: 'b_scholar', name: 'Scholar', description: 'Read 10 Bits.', icon: 'brain', color: 'blue', condition: (s) => s.bitsRead >= 10 },
    { id: 'b_streak_3', name: 'On Fire', description: 'Maintain a 3-day streak.', icon: 'fire', color: 'orange', condition: (s) => s.streak >= 3 },
    { id: 'b_quiz_1', name: 'Sharp Mind', description: 'Win 1 Quiz Challenge.', icon: 'medal', color: 'purple', condition: (s) => s.quizzesWon >= 1 },
    { id: 'b_level_5', name: 'Neural Master', description: 'Reach Level 5.', icon: 'zap', color: 'amber', condition: (_, l) => l >= 5 },
];

const INITIAL_STATS: UserStats = {
    bitsRead: 0,
    quizzesWon: 0,
    streak: 1,
    lastLogin: Date.now(),
    badges: [],
    bookmarkedBits: [],
    completedBits: [],
    lastSeenBitId: undefined
};

// --- COMPONENTS ---

// Route wrapper for detail modal
const BitDetailRoute = ({ bits, onVote, showToast, onAddXp, onQuizWin, stats, onBookmark, user, onBitComplete, onMarkCompleted }: any) => {
    const { slug } = useParams();
    const navigate = useNavigate();
    
    // Lookup by Slug OR ID (legacy)
    const bit = bits.find((b: Bit) => slugify(b.title) === slug || b.id === slug);

    if (!bit) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                 <div className="text-center">
                     <h2 className="text-2xl font-bold text-white mb-4">Bit Not Found</h2>
                     <button onClick={() => navigate('/')} className="px-4 py-2 bg-indigo-600 rounded-lg text-white">Return Home</button>
                 </div>
            </div>
        );
    }

    const isBookmarked = stats?.bookmarkedBits?.includes(bit.id) || false;

    return (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div></div>}>
            <BitDetailModal
                bit={bit}
                allBits={bits}
                isBookmarked={isBookmarked}
                onClose={() => navigate('/')}
                onVote={onVote}
                onBookmark={onBookmark}
                showToast={showToast}
                onAddXp={onAddXp}
                onQuizWin={onQuizWin}
                onComplete={onBitComplete}
                onMarkCompleted={onMarkCompleted}
                user={user}
            />
        </Suspense>
    );
};

// Featured "Daily Bit" Component
const DailyBitHero = ({ bit, onClick }: { bit: Bit, onClick: (bit: Bit) => void }) => {
    // ... (Existing code)
    if (!bit) return null;
    return (
        <div className="mb-12 relative group cursor-pointer w-full" onClick={() => onClick(bit)}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-1000 pointer-events-none"></div>
            <div className="relative glass-panel rounded-3xl p-8 md:p-12 overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-indigo-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent opacity-50"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="relative z-10 grid md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center space-x-3 mb-2">
                             <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center space-x-2 text-amber-400">
                                <IconStar className="w-3.5 h-3.5" fill />
                                <span className="text-xs font-bold uppercase tracking-widest">Daily Highlight</span>
                             </div>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">{bit.title}</h2>
                        <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">{bit.summary}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sidebar Navigation Component
const Sidebar = ({
    activeTab,
    setActiveTab,
    categories,
    navigate,
    setSearchTerm,
    setCurrentPage
}: {
    activeTab: string,
    setActiveTab: (t: string) => void,
    categories: string[],
    navigate: any,
    setSearchTerm: (s: string) => void,
    setCurrentPage: (p: number) => void
}) => {
    const [randomFact, setRandomFact] = useState(() => DID_YOU_KNOW_FACTS[Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length)]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setRandomFact(DID_YOU_KNOW_FACTS[Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length)]);
        }, 30000); // Change every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <aside className="hidden lg:block w-72 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-4 scrollbar-hide">
            <nav className="space-y-10">
                
                {/* Main Nav */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">System Feed</h3>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => { setActiveTab('home'); navigate('/'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === 'home'
                                    ? 'bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconHome className={`w-5 h-5 ${activeTab === 'home' ? 'animate-pulse' : ''}`} />
                                    <span className="font-medium">Home</span>
                                </div>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { setActiveTab('all'); navigate('/explore'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === 'all'
                                    ? 'bg-indigo-600 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconCompass className={`w-5 h-5 ${activeTab === 'all' ? 'animate-pulse' : ''}`} />
                                    <span className="font-medium">Explore</span>
                                </div>
                            </button>
                        </li>
                         <li>
                            <button 
                                onClick={() => { setActiveTab('tutorials'); navigate('/tutorials'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === 'tutorials' 
                                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconBook className="w-5 h-5" />
                                    <span className="font-medium">Tutorials</span>
                                </div>
                                {activeTab === 'tutorials' && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]"></div>}
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => { setActiveTab('saved'); navigate('/'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === 'saved' 
                                    ? 'bg-amber-600 text-white shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconBookmark className="w-5 h-5" />
                                    <span className="font-medium">Saved</span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Topics */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">Learning Paths</h3>
                    <ul className="space-y-2 mb-6">
                        <li>
                            <button
                                onClick={() => { setActiveTab('topics'); navigate('/topics'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === 'topics'
                                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconBook className="w-5 h-5" />
                                    <span className="font-medium">Topics</span>
                                </div>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { setActiveTab('tracks'); navigate('/tracks'); }}
                                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeTab === 'tracks'
                                    ? 'bg-purple-600 text-white shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <IconStar className="w-5 h-5" />
                                    <span className="font-medium">Tracks</span>
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Data Streams */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">Data Streams</h3>
                    <ul className="space-y-1">
                        {categories.map(cat => (
                            <li key={cat}>
                                <button
                                    onClick={() => { setSearchTerm(''); setActiveTab(cat); setCurrentPage(1); navigate('/'); }}
                                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === cat
                                        ? 'text-emerald-400 bg-emerald-400/10 border-l-2 border-emerald-400 translate-x-2'
                                        : 'text-slate-500 hover:text-slate-300 hover:translate-x-1 border-l-2 border-transparent'
                                    }`}
                                >
                                    <span className="text-xs opacity-50 font-mono">#</span>
                                    <span className="capitalize">{cat}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Did You Know Section */}
                <div className="px-4">
                    <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                        <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider">Did You Know?</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{randomFact}</p>
                    </div>
                </div>

                {/* Quick Stats Module */}
                <div className="px-4">
                    <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-gradient-to-br from-emerald-900/20 to-teal-900/20">
                        <div className="flex items-center space-x-2 mb-3">
                            <IconCpu className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Knowledge Base</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Total Bits</span>
                                <span className="text-sm font-bold text-white">101</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Categories</span>
                                <span className="text-sm font-bold text-white">{categories.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-400">Active Learners</span>
                                <span className="text-sm font-bold text-emerald-400">2.5k+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
};

const ITEMS_PER_PAGE = 6;

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(() => {
      const savedUser = localStorage.getItem('ai-bits-user');
      return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Persistence Initialization
  const [bits, setBits] = useState<Bit[]>(() => {
      // (Same logic as before, omitting for brevity in diff but strictly preserving logic)
      try {
        const saved = localStorage.getItem('ai-bits-data');
        const parsedSaved = saved ? JSON.parse(saved) : [];
        const merged = [...INITIAL_BITS];
        if (parsedSaved.length > 0) {
            parsedSaved.forEach((sb: Bit) => {
                if (!merged.find(mb => mb.id === sb.id)) {
                    merged.push(sb);
                }
            });
        }
        return merged;
      } catch (e) {
        return INITIAL_BITS;
      }
  });

  const [tutorials] = useState<Tutorial[]>(INITIAL_TUTORIALS);

  const [xp, setXp] = useState<number>(() => {
    try { const saved = localStorage.getItem('ai-bits-xp'); return saved ? parseInt(saved) : 0; } catch { return 0; }
  });

  const [stats, setStats] = useState<UserStats>(() => {
      try {
        const saved = localStorage.getItem('ai-bits-stats');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Ensure backward compatibility for new fields
          if (!parsed.bookmarkedBits) parsed.bookmarkedBits = [];
          if (!parsed.completedBits) parsed.completedBits = [];
          if (!parsed.lastSeenBitId) parsed.lastSeenBitId = undefined;
          return parsed;
        }
        return INITIAL_STATS;
      } catch {
        return INITIAL_STATS;
      }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sharingBit, setSharingBit] = useState<Bit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'tutorials', 'saved', or tag
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(Math.floor(xp / 100) + 1);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate context
  const currentSlug = location.pathname.split('/bit/')[1];
  const currentBit = useMemo(() => {
      if (!currentSlug) return null;
      return bits.find(bit => slugify(bit.title) === currentSlug || bit.id === currentSlug) || null;
  }, [currentSlug, bits]);

  const currentBitContext = currentBit?.title;

  // Handle Tab Logic based on URL
  useEffect(() => {
      if (location.pathname === '/tutorials') {
          setActiveTab('tutorials');
      } else if (location.pathname === '/' && activeTab === 'tutorials') {
          setActiveTab('all');
      }
  }, [location.pathname]);

  // Persist stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai-bits-stats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  }, [stats]);

  // Persist XP to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai-bits-xp', xp.toString());
    } catch (e) {
      console.error('Failed to save XP:', e);
    }
  }, [xp]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter(t => t.id !== id));
  const handleAddXp = (amount: number) => { setXp(prev => prev + amount); addToast(`+${amount} XP Gained!`, 'success'); };

  const handleBookmark = (bitId: string) => {
    if (!user) { setIsLoginModalOpen(true); return; }
    setStats(prev => {
      const newStats = { ...prev };
      if (!newStats.bookmarkedBits) newStats.bookmarkedBits = [];
      if (newStats.bookmarkedBits.includes(bitId)) {
        newStats.bookmarkedBits = newStats.bookmarkedBits.filter(id => id !== bitId);
        addToast('Removed from saved bits', 'info');
      } else {
        newStats.bookmarkedBits = [...newStats.bookmarkedBits, bitId];
        addToast('Saved to bookmarks', 'success');
      }
      return newStats;
    });
  };

  const handleBitComplete = (bitId: string) => {
    if (!user) return;
    setStats(prev => {
      const newStats = { ...prev, bitsRead: (prev.bitsRead || 0) + 1 };
      handleAddXp(10);
      return newStats;
    });
  };

  const handleMarkCompleted = (bitId: string) => {
    if (!user) return;
    setStats(prev => markCompleted(prev, bitId));
    handleAddXp(10);
    addToast('Bit marked as learned! +10 XP', 'success');
  };

  const handleQuizWin = () => {
    if (!user) return;
    setStats(prev => ({ ...prev, quizzesWon: (prev.quizzesWon || 0) + 1 }));
    handleAddXp(25);
    addToast('Quiz completed! +25 XP', 'success');
  };

  const handleVote = (id: string) => {
    if (!user) { setIsLoginModalOpen(true); return; }
    setBits(bits.map(b => b.id === id ? { ...b, votes: b.votes + 1 } : b));
    handleAddXp(2);
  };

  const categories = useMemo(() => {
      const allTags = bits.flatMap(b => b.tags);
      const counts: Record<string, number> = {};
      allTags.forEach(t => counts[t] = (counts[t] || 0) + 1);
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);
  }, [bits]);

  const filteredBits = bits.filter(bit => {
    const matchesSearch = bit.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bit.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    let matchesTab = true;
    if (activeTab === 'trending') matchesTab = bit.votes > 100;
    else if (activeTab === 'saved') matchesTab = stats.bookmarkedBits?.includes(bit.id) || false;
    else if (activeTab === 'tutorials') return false; // Handled separately
    else if (activeTab !== 'all') matchesTab = bit.tags.includes(activeTab) || bit.language === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredBits.length / ITEMS_PER_PAGE);
  const paginatedBits = filteredBits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Render Skeletons for Loading State
  const renderSkeletons = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-800/20 border border-white/5 animate-pulse p-6 flex flex-col">
                  <div className="flex justify-between mb-4">
                      <div className="w-20 h-6 bg-slate-700/50 rounded-md"></div>
                      <div className="w-8 h-8 bg-slate-700/50 rounded-full"></div>
                  </div>
                  <div className="w-3/4 h-8 bg-slate-700/50 rounded-md mb-3"></div>
                  <div className="w-1/2 h-8 bg-slate-700/50 rounded-md mb-6"></div>
              </div>
          ))}
      </div>
  );

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden flex flex-col">
      <Helmet>
        <title>{currentBit ? `${currentBit.title} | SYNAPSE BITS` : 'SYNAPSE BITS | Neural Knowledge Stream'}</title>
        <meta name="description" content={currentBit ? currentBit.summary : 'Next-gen AI micro-learning for engineers. Master networking, distributed systems, and coding patterns with high-velocity data bits.'} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SYNAPSE BITS" />
        <meta property="og:title" content={currentBit ? `${currentBit.title} | SYNAPSE BITS` : 'SYNAPSE BITS | Neural Knowledge Stream'} />
        <meta property="og:description" content={currentBit ? currentBit.summary : 'Next-gen AI micro-learning for engineers. Master networking, distributed systems, and coding patterns with high-velocity data bits.'} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:image" content={typeof window !== 'undefined' ? `${window.location.origin}/og-image.svg` : '/og-image.svg'} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentBit ? `${currentBit.title} | SYNAPSE BITS` : 'SYNAPSE BITS | Neural Knowledge Stream'} />
        <meta name="twitter:description" content={currentBit ? currentBit.summary : 'Next-gen AI micro-learning for engineers. Master networking, distributed systems, and coding patterns with high-velocity data bits.'} />
        <meta name="twitter:image" content={typeof window !== 'undefined' ? `${window.location.origin}/og-image.svg` : '/og-image.svg'} />
      </Helmet>
      <VibeBackground />
      <NetworkStatus />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col mb-24 md:mb-0">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 md:mb-12 sticky top-4 z-40 bg-black/60 backdrop-blur-xl py-3 px-6 rounded-2xl border border-white/10 shadow-2xl">
           <div className="flex items-center justify-between w-full md:w-auto">
               <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => {setSearchTerm(''); setActiveTab('all'); navigate('/'); }}>
                 <div className="relative group/logo">
                    <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-20 group-hover/logo:opacity-40 transition-opacity"></div>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transform transition-transform group-hover/logo:scale-105">
                        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#premium_gradient)" />
                        <path d="M22 11L16 20H21L19 29L26 18H20.5L22 11Z" fill="white"/>
                        <defs><linearGradient id="premium_gradient" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse"><stop stopColor="#4F46E5" /><stop offset="1" stopColor="#7C3AED" /></linearGradient></defs>
                    </svg>
                 </div>
                 <div><h1 className="text-xl font-black tracking-tight text-white">SYNAPSE BITS</h1></div>
              </div>
              <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <IconMenu className="w-6 h-6" />
              </button>
           </div>
           
           {/* Search Bar */}
           <div className="hidden md:block flex-1 max-w-xl mx-auto md:ml-12 relative">
                <div className="relative group">
                    <IconSearch className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input ref={searchInputRef} type="text" className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:bg-black focus:border-indigo-500 transition-all" placeholder="Search knowledge... (/)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
           </div>

           {/* User Controls */}
           <div className="hidden md:flex items-center gap-4">
               {user ? (
                   <div className="flex items-center space-x-4 bg-slate-900/50 border border-white/5 rounded-full px-5 py-2 cursor-pointer hover:bg-slate-800/50 transition-colors group" onClick={() => setIsProfileOpen(true)}>
                       <div className="flex items-center space-x-1.5 text-orange-400"><IconFire className="w-4 h-4" /><span className="font-bold text-sm font-mono">{stats.streak}</span></div>
                       <div className="w-px h-4 bg-white/10"></div>
                       <div className="flex items-center space-x-2 text-indigo-400"><span className="text-xs font-bold font-mono">Lvl {Math.floor(xp/100)+1}</span></div>
                   </div>
               ) : (
                   <button onClick={() => setIsLoginModalOpen(true)} className="px-5 py-2 text-sm font-bold text-white hover:text-indigo-400 transition-colors">Log In</button>
               )}
               <button onClick={() => user ? setIsModalOpen(true) : setIsLoginModalOpen(true)} className="flex items-center justify-center px-5 py-2 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform"><IconPlus className="mr-2 h-4 w-4" /><span>Create</span></button>
           </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} categories={categories} navigate={navigate} setSearchTerm={setSearchTerm} setCurrentPage={setCurrentPage} />

            <main className="flex-1 min-w-0 pb-20">
                
                {/* TUTORIALS TAB */}
                {activeTab === 'tutorials' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                             <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                                <IconBook className="w-8 h-8 text-emerald-500" />
                                Deep Dive Tutorials
                             </h2>
                             <p className="text-slate-400 mt-2">Comprehensive guides and lessons for advanced engineering.</p>
                        </div>
                        
                        <div className="grid gap-6">
                            {tutorials.map(tutorial => (
                                <TutorialCard 
                                    key={tutorial.id} 
                                    tutorial={tutorial} 
                                    isLocked={tutorial.isPremium && !user} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* NORMAL FEED */}
                {activeTab !== 'tutorials' && (
                    <>
                        {user && activeTab === 'all' && !searchTerm && <ProgressDashboard user={user} localStats={stats} bits={bits} xp={xp} />}
                        {activeTab === 'all' && !searchTerm && currentPage === 1 && (
                            <div className="hidden md:block"><DailyBitHero bit={bits[0]} onClick={(b) => navigate(`/bit/${slugify(b.title)}`)} /></div>
                        )}
                        
                        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
                            <div>
                                <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                                    {activeTab === 'all' ? (searchTerm ? 'Search Results' : 'Explore Feed') : activeTab === 'saved' ? 'Saved Bits' : <span className="capitalize">{activeTab}</span>}
                                </h2>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            {paginatedBits.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                                    {paginatedBits.map((bit) => (
                                        <div key={bit.id} className="h-full">
                                        <BitCard bit={bit} isBookmarked={stats?.bookmarkedBits?.includes(bit.id) || false} onClick={() => {}} onShare={(b) => { console.log('Share clicked for bit:', b.title); setSharingBit(b); }} onTagClick={(tag) => { setSearchTerm(tag); setActiveTab('all'); }} onBookmark={() => handleBookmark(bit.id)} />
                                        </div>
                                    ))}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="mt-12 flex items-center justify-center space-x-2">
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400">Prev</button>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400">Next</button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center border border-dashed border-white/5 rounded-3xl bg-white/5">
                                     <h3 className="text-xl font-bold text-white">No bits found</h3>
                                </div>
                            )}
                        </div>
                        
                        {/* Mobile Swipe Deck */}
                        <div className="md:hidden">
                            <BitSwipeDeck bits={filteredBits} onVote={handleVote} onShare={(b) => setSharingBit(b)} />
                        </div>
                    </>
                )}
            </main>
        </div>
      </div>

      <ChatDrawer context={currentBitContext} />

      <Routes>
          <Route path="/" element={<HomePageWrapper bits={bits} stats={stats} user={user} />} />
          <Route path="/explore" element={<ExplorePageWrapper bits={bits} stats={stats} user={user} />} />
          <Route path="/topics" element={<TopicsPageWrapper bits={bits} stats={stats} />} />
          <Route path="/topic/:slug" element={<TopicPageWrapper bits={bits} stats={stats} user={user} />} />
          <Route path="/tracks" element={<TracksPageWrapper />} />
          <Route path="/track/:slug" element={<TrackPageWrapper />} />

          <Route path="/bit/:slug" element={
               <BitDetailRoute 
                    bits={bits} 
                    onVote={handleVote} 
                    showToast={addToast}
                    onAddXp={handleAddXp}
                    onQuizWin={handleQuizWin}
                    stats={stats}
                    onBookmark={handleBookmark}
                    user={user}
                    onBitComplete={handleBitComplete}
                />
          } />
          
          <Route path="/tutorial/:slug" element={
               <TutorialReaderWrapper tutorials={tutorials} user={user} openLogin={() => setIsLoginModalOpen(true)} />
          } />
      </Routes>

      {/* Modals ... */}
      {isModalOpen && <CreateBitModal onClose={() => setIsModalOpen(false)} onSave={() => {}} showToast={addToast} />}
      {sharingBit && <ShareModal bit={sharingBit} onClose={() => setSharingBit(null)} />}
      {isLoginModalOpen && <AuthModal onClose={() => setIsLoginModalOpen(false)} onLogin={(u) => { setUser(u); setIsLoginModalOpen(false); addToast(`Welcome ${u.name}`); }} />}
      {/* ... */}
    </div>
  );
};

// Wrapper components for new pages
const HomePageWrapper = ({ bits, stats, user }: any) => {
    return <HomePage bits={bits} stats={stats} user={user} />;
};

const ExplorePageWrapper = ({ bits, stats, user }: any) => {
    return <TopicsPage bits={bits} stats={stats} />; // Using existing TopicsPage as explore for now
};

const TopicsPageWrapper = ({ bits, stats }: any) => {
    return <TopicsPage bits={bits} stats={stats} />;
};

const TopicPageWrapper = ({ bits, stats, user }: any) => {
    const { slug } = useParams<{ slug: string }>();
    return <TopicPage bits={bits} stats={stats} user={user} />;
};

const TracksPageWrapper = () => {
    return <div>Tracks Page - Coming Soon</div>;
};

const TrackPageWrapper = () => {
    return <div>Track Detail Page - Coming Soon</div>;
};

// Wrapper to handle finding tutorial
const TutorialReaderWrapper = ({ tutorials, user, openLogin }: any) => {
    const { slug } = useParams();
    const tutorial = tutorials.find((t: Tutorial) => t.slug === slug);
    if (!tutorial) return <div>Not Found</div>;
    return <TutorialReader tutorial={tutorial} user={user} onLoginRequest={openLogin} />;
};

export default App;
