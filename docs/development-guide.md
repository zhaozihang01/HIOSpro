# HIOS Development Guide

Version: 1.0
Status: Active

---

# 1. Purpose

This document defines the engineering standards for HIOS.

Every module, feature, and contributor must follow these rules.

---

# 2. Development Principles

## Architecture First

Always design before coding.

Development order:

Requirement

↓

Architecture

↓

Data Model

↓

Business Logic

↓

API

↓

UI

---

## Single Responsibility

Each module should have one clear responsibility.

---

## Reusability

Write reusable modules.

Avoid duplicate logic.

---

## Explainability

Every calculation must be explainable.

---

## Testability

Every important module should be testable independently.

---

# 3. Naming Convention

## Folder

lowercase

Example

market

engine

research

---

## File

camelCase

Example

stockResearch.ts

marketGateway.ts

---

## Type

PascalCase

Example

StockQuote

ResearchReport

---

## Function

camelCase

Example

calculateTrendScore()

normalizeQuote()

---

## Constant

UPPER_SNAKE_CASE

Example

DEFAULT_CACHE_TIME

---

# 4. Code Rules

Never hardcode provider field names outside Provider Layer.

Never duplicate business logic.

Never place calculations inside UI components.

Never expose secrets.

Prefer readable code over clever code.

---

# 5. AI Rules

AI explains.

AI does not calculate official HIOS scores.

AI never fabricates data.

AI must always describe uncertainty.

---

# 6. Git Convention

Commit types

feat:

fix:

refactor:

docs:

test:

style:

---

# 7. Error Handling

Every error should have a defined type.

Examples

InvalidSymbol

ProviderTimeout

RateLimit

AuthenticationError

MissingData

CalculationError

---

# 8. Review Checklist

Before merging any feature:

- Is the architecture respected?
- Is the code reusable?
- Is the calculation explainable?
- Is the provider replaceable?
- Can this module still work in three years?

If any answer is No,

refactor first.

---

# 9. Product Philosophy

HIOS does not predict the future.

HIOS provides reliable data, transparent analysis, and explainable investment research.

Every feature should improve investment decision quality.
