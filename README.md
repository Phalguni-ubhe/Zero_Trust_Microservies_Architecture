# Zero-Trust Node.js Microservices — Benchmarking Suite

> Research implementation and benchmarking code for the paper:  
> **"Evaluating Latency Overhead and Identity Consistency Mechanisms in
> Zero-Trust Node.js Microservice Environments"**  

---

## What This Repository Contains

This repository contains the complete source code for the experimental
setup described in the paper. It includes two independently runnable
versions of the same microservice system — a baseline (implicit trust)
and a Zero Trust implementation — along with all Autocannon benchmark
scripts used to produce the data in Tables 1 and 2.

---

## System Overview

The architecture consists of three Node.js services:

- **API Gateway** — entry point for all external requests. In the Zero
  Trust version, this is where RS256 token signing happens.
- **Product Service** — handles GET /product/:id (read-heavy endpoint)
- **Cart Service** — handles POST /checkout (write-heavy endpoint)

and a directory containing the results of AutoCannon tool.

Two trust models are implemented side by side:

| Model | Description |
|---|---|
| Baseline (Implicit Trust) | Gateway forwards requests with raw HTTP headers. No internal token generation. |
| Zero Trust | Gateway issues a short-lived RS256-signed JWT per request. Downstream services verify signature before processing. |

---

## Requirements

- Node.js v20 (LTS)
- npm v9+
- Autocannon (`npm install -g autocannon`)

No external database or cloud infrastructure required.
All services run on localhost via loopback interface.

---
## Setup

```bash
# Clone the repository
git clone https://github.com/Sarthak05U/Zero-Trust-Architecture-Project.git
cd Node.js-security-in-Microservices-Architecture-Zero-trust-principle-

# Install dependencies for all services
npm install
```

RSA key pair for RS256 signing is included in `/keys`.
These are test-only keys generated for benchmarking purposes.

---

## Running the Services

**Baseline (Implicit Trust):**
```bash
npm run start:baseline
```

**Zero Trust:**
```bash
npm run start:zerotrust
```

Both versions expose the same two endpoints with different ports 3000 for baseline and 4000 for secured:
- `GET  /product/:id`
- `POST /checkout`

---

## Running the Benchmarks

Benchmark scripts are in `/benchmarks`. Each script runs Autocannon
at the concurrency levels used in the paper (50, 80, 120, 150, 200,
250, 300, 350, 400, 450, 500 connections, 30 seconds each).

```bash
# Run full benchmark suite — baseline
node benchmarks/run_baseline.js

# Run full benchmark suite — zero trust
node benchmarks/run_zerotrust.js
```

Output is printed to console in JSON format.
Raw results from our test runs are saved in `/results` for reference.

---

## Reproducing the Paper Results

To reproduce the Φ constant and per-request cryptographic cost (5.93 ms):

1. Run both benchmark suites on your hardware
2. For each POST concurrency level (C = 150 to 400), compute:
   `(L_s − L_b) / C = t_sign + t_verify`
3. Average the six values — this gives your hardware-specific
   cryptographic cost per request
4. Substitute into Formula B to derive your own Φ:
   `Φ = 1 / (f_clk × √R_factor)`

The value Φ = 0.069 reported in the paper is specific to an
Intel Core i5-8350U at 3.6 GHz with 16 GB RAM.
Recalibrating on your hardware before using Formula A for
capacity planning is strongly recommended.

