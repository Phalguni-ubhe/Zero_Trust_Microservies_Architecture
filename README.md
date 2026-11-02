# 🛡️ Zero-Trust Architecture in Microservices (ZTA)

[![Architecture](https://img.shields.io/badge/Security-Zero%20Trust%20(NIST%20SP%20800--207)-critical.svg)](#)
[![Microservices](https://img.shields.io/badge/Pattern-Microservices-green.svg)](#)

A practical, empirical implementation and security evaluation comparing a conventional perimeter-based microservices architecture against a hardened **Zero-Trust Architecture (ZTA)** adhering to the core tenets of **NIST SP 800-207**: *Never Trust, Always Verify*.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Architectural Comparison](#-architectural-comparison)
  - [1. Baseline Architecture (`baseline-app`)](#1-baseline-architecture-baseline-app)
  - [2. Zero-Trust Architecture (`secure-app`)](#2-zero-trust-architecture-secure-app)
- [Key Security Principles Implemented](#-key-security-principles-implemented)
- [Project Structure](#-project-structure)
- [Experimental Results & Benchmarking](#-experimental-results--benchmarking)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Running the Baseline App](#running-the-baseline-app)
  - [Running the Secure (Zero-Trust) App](#running-the-secure-zero-trust-app)
- [Security Evaluation & Threat Vectors](#-security-evaluation--threat-vectors)

---

## 🌟 Overview

Modern microservice ecosystems frequently rely on traditional perimeter security (e.g., API gateways or VPC borders). Once an attacker breaches the perimeter or compromises an internal service, they can move laterally without resistance due to implicit trust across internal services.

This project implements two distinct environments to demonstrate the risks and remedies:
1. **`baseline-app`**: A standard microservice deployment with perimeter validation and implicit internal trust.
2. **`secure-app`**: A zero-trust microservice implementation featuring continuous mutual verification, strict micro-segmentation, dynamic authorization, and continuous contextual inspection.

---

## 🏗 Architectural Comparison

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BASELINE ARCHITECTURE                           │
│                                                                        │
│   Client ──▶ [ Perimeter Gateway ] ──( Implicit Internal Trust )──▶   │
│                   │                                                    │
│                   ├──▶ [ Service A ] ──▶ [ Service B ] ──▶ [ DB ]      │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                       ZERO-TRUST ARCHITECTURE                          │
│                                                                        │
│   Client ──▶ [ Identity Provider / PDP ]                               │
│                   │ (Short-lived signed tokens)                        │
│                   ▼                                                    │
│   Client ──▶ [ Service A (PEP) ] ──( mTLS + Token Introspection )──▶   │
│                   │                                                    │
│                   ▼                                                    │
│              [ Service B (PEP) ] ──( Least-Privilege Policy )──────▶   │
│                   │                                                    │
│                   ▼                                                    │
│              [ Secure DB ]                                             │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Baseline Architecture (`baseline-app`)
* **Perimeter Defense:** Authentication occurs exclusively at the outer ingress layer.
* **Implicit Trust Zone:** Downstream inter-service calls (Service-to-Service) communicate over unencrypted or unauthenticated internal HTTP channels.
* **Vulnerabilities:** Susceptible to lateral movement, service impersonation, unauthorized egress, and internal packet sniffing.

### 2. Zero-Trust Architecture (`secure-app`)
* **Explicit Identity Verification:** Every interaction—internal or external—is authenticated and authorized explicitly.
* **Mutual TLS (mTLS):** Cryptographic identity verification and transit encryption between all workloads.
* **Policy Enforcement Points (PEP):** Each service inspects caller permissions, scopes, and cryptographic signatures before execution.
* **Least-Privilege RBAC/ABAC:** Fine-grained resource access policies restricting internal microservices strictly to needed operations.

---

## 🔐 Key Security Principles Implemented

* **NIST SP 800-207 Compliance:** Alignment with Policy Engine (PE), Policy Administrator (PA), and Policy Enforcement Point (PEP) concepts.
* **Cryptographic Token Verification:** JWT / cryptographic assertion validation per request boundary with short TTLs.
* **Micro-Segmentation:** Explicit firewall and network rules preventing unauthorized inter-service lateral transit.
* **Encrypted Secrets Management:** Segregated credential and certificate storage (`secrets.js`) using localized secret isolation.

---

## 📂 Project Structure

```
Zero-Trust-Architecture-Project-main/
│
├── baseline-app/                      # Traditional perimeter-secured microservices
│   ├── services/                      # Downstream services with implicit trust
│   ├── gateway/                       # Single outer border authentication
│   └── package.json
│
├── secure-app/                        # Zero-Trust hardened microservices
│   ├── services/                      # Hardened services with embedded PEPs
│   ├── secrets.js                     # Secure key and certificate management
│   ├── results/                       # Empirical benchmarks & stress tests
│   │   └── zerotrust/
│   │       └── post1/
│   │           ├── zt_post_50.json    # Metrics under 50 req/s concurrency
│   │           ├── zt_post_80.json    # Metrics under 80 req/s concurrency
│   │           └── zt_post_500.json   # High-throughput load test results
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 📊 Experimental Results & Benchmarking

The `secure-app/results/zerotrust/` directory contains structured empirical performance audits analyzing the computational latency overhead introduced by Zero-Trust checks (mTLS handshakes, token decryption, signature verifications, and policy evaluations):

| Metric | Baseline App | Zero-Trust (50 req/s) | Zero-Trust (80 req/s) | Zero-Trust (500 req/s) |
|---|---|---|---|---|
| **Avg Latency** | Baseline (low) | Minimal overhead | Stable | Bound to CPU cryptographic limit |
| **Authentication Enforcement** | Outer Ingress Only | Continuous (Per hop) | Continuous (Per hop) | Continuous (Per hop) |
| **Lateral Movement Resistance** | ❌ High Risk | ✅ Isolated / Blocked | ✅ Isolated / Blocked | ✅ Isolated / Blocked |
| **Data Encryption In-Transit** | ⚠️ Plaintext internal | 🔒 End-to-end mTLS | 🔒 End-to-end mTLS | 🔒 End-to-end mTLS |

*Detailed execution logs and benchmark JSON payloads can be inspected under `/secure-app/results/zerotrust/post1/`.*

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (`>= 18.x`) & **npm**
* **OpenSSL** (for generating local test x509 certs if running custom mTLS)
* **Postman / curl** or automated load generators (e.g., Autocannon, k6)

### Running the Baseline App

```bash
cd baseline-app
npm install
npm start
```
*The baseline microservice network initializes on standard local service ports without internal token requirements.*

### Running the Secure (Zero-Trust) App

```bash
cd secure-app
npm install

# Verify/configure keys or secrets in secrets.js
npm start
```
*The zero-trust app initializes with policy enforcement points active on each microservice endpoint.*

---

## 🧪 Security Evaluation & Threat Vectors

| Threat Vector | Perimeter-Only Defense (`baseline-app`) | Zero-Trust Architecture (`secure-app`) |
|---|---|---|
| **Compromised Internal Service** | Attacker executes lateral arbitrary requests to all internal endpoints. | Attacker cannot forge identity tokens or pass mTLS; requests are denied. |
| **Man-in-the-Middle (Internal network)** | Internal traffic is observable via plaintext HTTP. | All inter-service traffic encrypted using mTLS. |
| **Stale Authorization Tokens** | Long-lived session tokens valid across entire cluster. | Short-lived, resource-scoped tokens validated per invocation. |
| **Privilege Escalation** | All services run with broad internal read/write rights. | Strict least-privilege scoping enforced at the service level. |

---
