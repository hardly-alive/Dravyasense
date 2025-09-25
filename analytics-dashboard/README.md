# Analytics Dashboard – Dravyasense

Next.js web application for visualizing herbal purity analysis results from IoT sensors and AI models.

---

## Key Features

* **Real-Time Dashboard**: Live stats on total scans, adulteration rates, and recent activity.
* **Latest Scan Spotlight**: Dynamic hero section showing the most recent test with sensor breakdowns.
* **Scan History**: Searchable, filterable table with expandable rows for past results.
* **Data Visualization**: Interactive charts tracking trends, adulteration patterns, and scan volumes.
* **Scalable Backend**: Connects to AWS Lambda APIs and DynamoDB.

---

## Tech Stack

**Frontend**

* Framework: Next.js (App Router, TypeScript)
* Styling: Tailwind CSS + Shadcn/UI
* Charts: Recharts
* Animations: Framer Motion

**Backend Integration**

* AWS Lambda (Node.js runtime)
* AWS API Gateway
* AWS DynamoDB (NoSQL)

---

## Getting Started

### Prerequisites

* Node.js v18+
* npm or yarn
* AWS credentials (for backend access)

### Installation

```bash
cd analytics-dashboard
npm install
```

Set up environment variables in `.env.local`:

```bash
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=your-region
NEXT_PUBLIC_AWS_REGION=your-region
```

Start the dev server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Deployment

* Hosted on **Vercel** for continuous deployment.
* Any push to `main` triggers automatic redeployment.
* Ensure typesafe editing.
