# Rule #1 Investing Analyzer

A comprehensive web application for analyzing publicly traded companies using **Phil Town's Rule #1 Investing Framework**. The app evaluates stocks through the Four M's (Meaning, Moat, Management, Margin of Safety), Big Five Numbers analysis, Technical Confirmation Engine, and Sticker Price calculation.

## Features

- **Four M's Scorecard**: Detailed scoring for Meaning, Moat, Management, and Margin of Safety
- **Big Five Numbers Analysis**: 10-year CAGR analysis for Revenue, EPS, Equity, Free Cash Flow, and ROIC
- **Sticker Price Calculator**: Phil Town's methodology for intrinsic value estimation
- **Technical Confirmation Engine**: Weighted scoring using 9 EMA (25%), MACD 8/17/9 (40%), and Stochastic 14/3/3 (35%)
- **Wonderful Business Classification**: Automatic categorization from "Exceptional" to "Avoid"
- **Red Flag Detection**: Identifies financial risks and concerns
- **Real-time Data**: Fetches live stock data from Yahoo Finance

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts + Framer Motion
- **Backend**: Hono + tRPC 11.x + Drizzle ORM + MySQL
- **Data Source**: Yahoo Finance API

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL database (for backend features)

### Installation

```bash
# Clone the repository
git clone https://github.com/AbdullayevJavohir/rule1-investing-analyzer.git
cd rule1-investing-analyzer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## Rule #1 Framework

### The Four M's

1. **Meaning** (0-10): Business understandability and clarity
2. **Moat** (0-10): Durable competitive advantage strength
3. **Management** (0-10): Quality of leadership and capital allocation
4. **Margin of Safety** (0-10): Discount to intrinsic value

### Big Five Numbers

- Revenue Growth (CAGR)
- Earnings Per Share Growth (CAGR)
- Equity Growth (CAGR)
- Free Cash Flow Growth (CAGR)
- Return on Invested Capital (ROIC)

### Technical Confirmation (Eligible when Score >= 40)

- **MACD (8,17,9)**: 40% weight - Momentum and trend direction
- **Stochastic (14,3,3)**: 35% weight - Overbought/oversold conditions
- **9 EMA**: 25% weight - Short-term trend confirmation

### Scoring Classifications

| Score | Classification |
|-------|---------------|
| 55-60 | Exceptional Business |
| 50-54 | Wonderful Business |
| 40-49 | Good Business |
| 30-39 | Average Business |
| 20-29 | Weak Business |
| <20 | Avoid |

## Disclaimer

This application is for educational purposes only. It implements Phil Town's Rule #1 investing framework as described in his books. This is not financial advice. Always do your own research and consult with a financial advisor before making investment decisions.

## License

MIT License
