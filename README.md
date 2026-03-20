# ☁️ AWS Cloud Infrastructure Monitor

Full-stack AWS monitoring dashboard — React (Vite + TypeScript) frontend + Node.js/Express backend.

## Project Structure

```
aws-monitor/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   └── .env.example       # Copy to .env and fill in your AWS keys
└── frontend/
    ├── src/
    │   ├── App.tsx                    # Main dashboard
    │   ├── hooks/useAWS.ts            # API hooks
    │   └── components/
    │       ├── UI.tsx                 # Shared UI primitives
    │       ├── EC2Panel.tsx           # EC2 instances table
    │       ├── S3Panel.tsx            # S3 buckets table
    │       ├── LambdaPanel.tsx        # Lambda functions table
    │       └── AlertSender.tsx        # SNS alert form
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

## Quick Start

### 1. AWS IAM Setup

Create an IAM user in the AWS Console with these policies:
- `AmazonEC2ReadOnlyAccess`
- `AmazonS3ReadOnlyAccess`
- `AWSLambda_ReadOnlyAccess`
- `CloudWatchReadOnlyAccess`
- `AmazonSNSFullAccess` (for sending alerts)

Generate an Access Key and save the credentials.

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your AWS credentials
npm install
npm run dev
```

Backend runs at: http://localhost:4000

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

### 4. SNS Alert Setup (optional)

1. Go to AWS Console → SNS → Topics → Create Topic
2. Add your email or phone number as a subscriber
3. Confirm the subscription via email/SMS
4. Paste the Topic ARN into `.env` as `SNS_TOPIC_ARN`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/summary | EC2/S3/Lambda counts |
| GET | /api/ec2 | All EC2 instances |
| GET | /api/ec2/:id/cpu | CPU metrics from CloudWatch |
| GET | /api/s3 | All S3 buckets |
| GET | /api/lambda | All Lambda functions |
| GET | /api/lambda/:name/metrics | Invocations, errors, duration |
| POST | /api/alerts/send | Send SNS alert |
| GET | /health | Health check |

## Environment Variables

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:ACCOUNT:TOPIC
PORT=4000
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Recharts
- **Backend**: Node.js, Express, AWS SDK v3
- **AWS Services**: EC2, S3, Lambda, CloudWatch, SNS
