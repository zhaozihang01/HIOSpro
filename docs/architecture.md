# HIOS Architecture

Version: 1.0
Status: Active

---

# 1. Purpose

This document defines the software architecture of HIOS.

The architecture is designed for long-term evolution.

Every feature must follow this architecture.

---

# 2. Design Principles

HIOS follows five core principles.

## Single Source of Truth

Every piece of information has one canonical definition.

## Separation of Responsibilities

Each layer has only one responsibility.

## Provider Independence

The system must never depend on one financial data provider.

## Explainability

Every calculation must be explainable.

## Replaceability

Every module should be replaceable without affecting upper layers.

---

# 3. System Architecture

```

UI Layer

↓

Application Layer

↓

Research Layer

↓

Knowledge Layer

↓

Data Gateway

↓

External Providers

```

---

# 4. Layer Responsibilities

## UI Layer

Responsible for:

- Display
- User interaction

Must not:

- Calculate scores
- Interpret financial data
- Call providers directly

---

## Application Layer

Responsible for:

- APIs
- Validation
- Service orchestration

---

## Research Layer

Responsible for:

- Generate research reports
- Organize research results

---

## Knowledge Layer

Responsible for:

- Convert raw data into investment knowledge
- Industry comparison
- Historical comparison
- Rule evaluation

---

## Data Gateway

Responsible for:

- Provider management
- Normalization
- Cache
- Retry
- Fallback
- Symbol mapping

---

## Provider Layer

Responsible for:

- External requests
- Authentication
- Response parsing

Nothing else.

---

# 5. Project Structure

```

app/
components/

lib/
├── market/
├── knowledge/
├── engine/
├── research/
├── ai/
└── utils/

docs/

```

---

# 6. Data Flow

```

External Provider

↓

Data Gateway

↓

Knowledge Layer

↓

Research Engine

↓

Application API

↓

UI

↓

AI Explanation

```

---

# 7. Development Rules

Development order:

1. Define Type
2. Provider
3. Gateway
4. Knowledge
5. Engine
6. API
7. UI
8. AI

Skipping steps is not allowed.

---

# 8. Long-term Goal

HIOS is designed as an AI-powered investment research platform.

The architecture must support:

- Multiple markets
- Multiple providers
- Multiple AI models
- Portfolio analysis
- Backtesting
- Future expansion

without major redesign.
