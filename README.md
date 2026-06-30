# Production Quality Engineering Lab

<p align="center">

<img src="https://img.shields.io/badge/Playwright-E2E-2EAD33?style=for-the-badge&logo=playwright&logoColor=white"/>
<img src="https://img.shields.io/badge/Cypress-Network_Testing-17202C?style=for-the-badge&logo=cypress&logoColor=white"/>
<img src="https://img.shields.io/badge/k6-Performance-7D64FF?style=for-the-badge&logo=k6&logoColor=white"/>
<img src="https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white"/>

</p>

<p align="center">

<strong>Evaluating an unfamiliar production system through risk-based quality engineering and evidence-driven release decisions.</strong>

</p>

---

# 🎥 Project Walkthrough

> Follow the complete engineering workflow in the video.

<p align="center">

[Watch the Full Walkthrough](https://youtu.be/BprAgZM3lek)

</p>

---

# Overview

This project simulates a real onboarding scenario where a Quality Engineer joins an unfamiliar product and becomes responsible for:

- Understanding the system
- Identifying business and technical risks
- Establishing confidence in product behaviour
- Implementing quality validations
- Collecting evidence
- Supporting production release decisions

The objective of this repository is not to demonstrate only test automation skills.

Its purpose is to demonstrate how Quality Engineering is applied when evaluating an unknown production system for the first time.

---

# Why This Project Exists

Imagine receiving responsibility for a product you have never seen before.

- No documentation
- No architectural knowledge
- No historical incidents
- No existing tests
- No previous context

Yet you still need to answer one question:

> **Is this system ready for production?**

This laboratory was created to simulate exactly that scenario.

Using OpenCart Demo as the reference application, the project reproduces the complete Quality Engineering process, from product discovery to an evidence-based release recommendation.

---

# Key Outcomes

- Assessed an unfamiliar production system
- Identified business-critical risks
- Established confidence through automated evidence
- Implemented quality gates and reporting
- Delivered an evidence-based release recommendation

---

# System Under Evaluation

| Item | Value |
|------|--------|
| Product | OpenCart Demo |
| Domain | E-commerce |
| Scenario | New Product Onboarding |
| Approach | Risk-Based Quality Engineering |
| Objective | Production Readiness Assessment |

---

# Assessment Approach

The evaluation followed the same process commonly used by Quality Engineers when joining a new product:

```text
Product Discovery
        ↓
Business Flow Mapping
        ↓
Risk Assessment
        ↓
Risk-Based Testing Strategy
        ↓
Automation of Critical Validations
        ↓
Evidence Collection
        ↓
Release Recommendation
```

---

# Architecture

```text
Product Under Evaluation
          │
          ▼
Risk Assessment
          │
          ▼
Automation Layers
 ├── Playwright
 ├── Cypress
 └── k6
          │
          ▼
Evidence Collection
 ├── Reports
 ├── Allure
 └── Artifacts
          │
          ▼
Release Recommendation
```

---

# Project Snapshot

| Metric | Result |
|--------|---------|
| Automated Tests | 22 |
| Passing Tests | 20 |
| Failed Tests | 0 |
| Skipped Tests | 2 (by design) |
| Browser Engines | 3 |
| Automation Frameworks | 2 |
| Accessibility Validation | Implemented |
| Performance Validation | Implemented |
| Reporting | Implemented |
| CI/CD Quality Gates | Implemented |

---

# Quality Capabilities

| Capability | Technology |
|------------|-------------|
| End-to-End Validation | Playwright |
| Network Behaviour Validation | Cypress |
| API Validation | Playwright Request API |
| Accessibility Assessment | axe-core |
| Performance Profiling | k6 |
| Reporting and Evidence | Allure |
| Continuous Quality Gates | GitHub Actions |

---

# Repository Structure

```text
production-qe-lab
│
├── .github
├── cypress
├── evidence
├── k6
├── playwright
├── scripts
│
├── cypress.config.ts
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# Running the Project

## Install dependencies

```bash
npm install
```

---

## Validate repository health

```bash
npm run doctor
```

---

## Execute the complete quality pipeline

```bash
npm run quality:full
```

---

## Execute Playwright Mock Mode

```bash
npm run test:mock
```

---

## Open Playwright UI

```bash
npm run test:mock:ui
```

---

## Run visual browser execution

```bash
npm run test:mock:headed
```

---

## Run slow-motion execution

```bash
npm run test:mock:debug
```

---

## Run performance assessment

```bash
npm run test:performance
```

---

# Available Commands

| Command | Description |
|---------|-------------|
| npm run doctor | TypeScript, ESLint and Prettier validation |
| npm run quality:full | Complete quality pipeline |
| npm run test:mock | Execute the Playwright suite locally |
| npm run test:mock:ui | Interactive Playwright UI |
| npm run test:mock:headed | Visual browser execution |
| npm run test:mock:debug | Slow-motion execution |
| npm run test:cypress | Execute Cypress validations |
| npm run test:performance | Execute k6 performance assessment |
| npm run reports | Generate evidence artifacts |
| npm run allure:serve | Open Allure Report |

---

# Evidence and Reporting

The project automatically generates:

- Playwright HTML Reports
- Allure Reports
- Test Artifacts
- Execution Manifest
- Evidence Files
- CI/CD Execution Results

Generated artifacts are available under:

```text
evidence/
```

---

# Release Readiness

## Status

🔴 **CONDITIONAL NO-GO**

## Confidence Level

🟡 **Moderate**

## Release Approval

❌ **BLOCKED**

### Current Release Blockers

| Area | Business Impact |
|------|----------------|
| Accessibility Compliance | Legal and compliance exposure |
| Authentication Protection | Abuse and brute-force risk |
| Checkout Reliability | Duplicate orders and transaction integrity risk |

Production deployment should remain blocked until these conditions are mitigated and independently revalidated.

---

# What This Project Demonstrates

This repository demonstrates practical experience with:

- Product onboarding in unfamiliar systems
- Risk-based Quality Engineering
- Business flow prioritisation
- Automation architecture design
- Evidence collection and reporting
- Quality gate implementation
- Release readiness assessments
- Evidence-based decision making

---

# Future Improvements

Potential next steps include:

- Security Testing
- Visual Regression Testing
- Contract Testing
- Synthetic Monitoring
- Production Observability Dashboards
- Chaos and Resilience Testing
- Canary Validation Strategies

---

# Final Recommendation

> This project demonstrates how Quality Engineering extends beyond test automation by combining product understanding, risk assessment, automation, observability and evidence-driven release decisions.

---

<p align="center">

<strong>Production Quality Engineering Lab</strong>

Quality Engineering • Automation • Reliability • Observability • Evidence-Based Decisions

</p>
