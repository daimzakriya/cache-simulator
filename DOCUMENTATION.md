# Cache Memory Simulator - Architectural & Theoretical Documentation

This document maps out the entire structure, computational logic, formulas, and component architecture of the CacheSim project. It serves as both a developer guide and an educational reference for the computer architecture theory implemented within the engine.

---

## 1. Project Overview

CacheSim is a premium, cinematic, 100% frontend React application designed to simulate and visualize CPU cache behavior. It demonstrates advanced computer architecture concepts including mapping techniques (Direct, Set-Associative, Fully Associative), replacement policies (LRU, FIFO, LFU), and performance metrics (AMAT, CPI).

---

## 2. Theoretical Foundation & Formulas

The simulator's core engine relies on standard Computer Architecture mathematics to process memory addresses and evaluate performance.

### A. Cache Geometry Formulas
When the simulator receives the Cache Size, Block Size, and Associativity, it computes the geometry of the cache to determine how memory addresses will be sliced into bits.

1.  **Total Blocks in Cache**:
    `Total Blocks = Cache Size (Bytes) / Block Size (Bytes)`
2.  **Number of Sets**:
    `Number of Sets = Total Blocks / Associativity`
3.  **Offset Bits (Block Offset)**:
    `Offset Bits = log2(Block Size)`
    *This determines which specific byte within the cache line is being accessed.*
4.  **Index Bits (Set Index)**:
    `Index Bits = log2(Number of Sets)`
    *This identifies which Set a memory address maps to. If the cache is Fully Associative, there is only 1 set, so Index Bits = 0.*
5.  **Tag Bits**:
    `Tag Bits = Total Address Bits - (Index Bits + Offset Bits)`
    *The Tag is the unique identifier stored in the cache to verify if the block currently residing in the Set is the correct one.*

### B. Address Decoding Computation
In modern JavaScript, standard bitwise operators (`>>`, `&`) operate on 32-bit signed integers. Because memory addresses can exceed 32 bits, the simulator uses Division and Modulo arithmetic to safely extract the Tag, Index, and Offset:

-   **Block Offset**: `Address % Block Size`
-   **Block Address**: `Math.floor(Address / Block Size)`
-   **Set Index**: `Block Address % Number of Sets`
-   **Tag**: `Math.floor(Block Address / Number of Sets)`

### C. Performance Metric Formulas
Once the simulation completes, overall efficiency is calculated.

1.  **Hit Rate & Miss Rate**:
    `Hit Rate = Hits / Total Accesses`
    `Miss Rate = Misses / Total Accesses` (or `1 - Hit Rate`)
2.  **AMAT (Average Memory Access Time)**:
    `AMAT = Hit Time + (Miss Rate × Miss Penalty)`
    *Measures the average number of clock cycles required to access memory. Hit Time is the cost to read the cache; Miss Penalty is the cost to fetch from main memory.*
3.  **CPI (Cycles Per Instruction)**:
    `CPI = Base CPI + (Miss Rate × Miss Penalty)`
    *Measures overall processor efficiency, assuming a baseline execution cost plus the penalty incurred when the cache misses.*

---

## 3. Simulation Execution Procedure (Working Procedure)

The simulator operates strictly in a tick-based sequence. Here is the exact step-by-step computational procedure executed for **every single memory address** in the trace:

### Step 1: Decode Address
The incoming raw memory address is mathematically split into its `Tag`, `Set Index`, and `Block Offset` (as detailed in Section 2B).

### Step 2: Locate the Set
The engine jumps directly to the cache Set identified by the `Set Index`. This Set contains $N$ Cache Lines (where $N$ is the Associativity).

### Step 3: Tag Comparison
The engine iterates through all valid Cache Lines in the Set and compares their stored Tag with the incoming Tag.
-   **If a match is found (HIT)**: 
    - The `Hits` counter increments.
    - The Replacement Policy is notified of the hit to update its metadata (e.g., updating the "Last Used" timestamp for LRU, or incrementing the "Frequency" counter for LFU).
    - The execution moves to the next address.
-   **If no match is found (MISS)**:
    - The `Misses` counter increments.
    - The execution proceeds to Step 4.

### Step 4: Block Insertion & Eviction (On Miss)
The engine must now bring the missing block into the cache.
-   **Check for Empty Space**: The engine looks for an invalid (empty) Cache Line in the Set.
    - If an empty line exists, the block is inserted there.
-   **Apply Replacement Policy (Eviction)**: If the Set is completely full, a victim must be chosen based on the active policy:
    -   **LRU (Least Recently Used)**: Scans the Set for the line with the lowest `lastUsed` tick.
    -   **FIFO (First In, First Out)**: Scans the Set for the line with the lowest `insertOrder` tick.
    -   **LFU (Least Frequently Used)**: Scans the Set for the line with the lowest `frequency` count. If there is a tie, it breaks the tie by choosing the Least Recently Used block among the tied lines.
-   The chosen victim block is evicted (overwritten).
-   The new block's `Tag` is saved, `Valid` bit is set to `true`, and its metadata (frequency, insertion tick, last used tick) is reset by the Replacement Policy.

### Step 5: State Snapshot
A lightweight copy of the cache's current layout is saved. This allows the React UI to visually "play back" the simulation frame-by-frame later.

---

## 4. Directory Structure

```
src/
├── components/          # Reusable UI elements
│   ├── ui/              # Primitive components (Buttons, Sliders, Cards, Pills)
│   └── Sidebar.tsx      # Main application navigation
├── lib/                 # Core logic and utilities
│   ├── simulator/       # The TypeScript Simulation Engine
│   │   ├── cache.ts           # Cache, Set, and Line structures; bitwise decoding
│   │   ├── policies.ts        # LRU, FIFO, LFU eviction algorithms
│   │   ├── simulator.ts       # Main execution loop and metric calculations
│   │   ├── traceGenerator.ts  # Deterministic synthetic trace generator
│   │   └── types.ts           # Strict TypeScript interfaces
│   └── utils.ts         # Utility functions (e.g., tailwind class merging)
├── pages/               # Top-level route components
│   ├── LandingPage.tsx        # Hero and marketing view
│   ├── ConfigurationPage.tsx  # Cache parameter sliders
│   ├── TraceInputPage.tsx     # Manual, Upload, and Generator input
│   ├── SimulationDashboard.tsx# Live cache grid and timeline chart
│   ├── ComparisonPage.tsx     # Side-by-side policy benchmarking
│   ├── ExportPage.tsx         # CSV and PDF generation
│   └── AboutPage.tsx          # Educational theory
├── store/               # Global state management
│   └── useSimStore.tsx  # React Context for config, traces, and results
├── App.tsx              # React Router configuration
├── main.tsx             # React DOM mount point
└── index.css            # Global CSS (Tailwind directives, custom keyframes)
```

---

## 5. UI & Design System

The application was built with a "Cinematic" design philosophy inspired by modern SaaS tools (Vercel, Linear).

- **Colors**: Uses a custom palette built around `#08090A` (Background), `#7C3AED` (Primary Violet), and `#06B6D4` (Secondary Cyan).
- **Glassmorphism**: Achieved using `bg-white/[0.02]`, `border-white/[0.06]`, and `backdrop-blur-xl` combined with an SVG noise filter.
- **MetricCard**: Uses a custom `useCountUp` hook with an `easeOutExpo` mathematical curve to smoothly animate numbers from 0 to their final value using native `requestAnimationFrame`.
- **SliderInput**: A highly customized HTML range slider utilizing dynamic linear-gradient masking to create glowing, illuminated tracks.

---

## 6. PDF Generation Strategy (`ExportPage.tsx`)

To avoid server-side rendering or heavy HTML-to-Canvas dependencies, the app generates PDFs entirely natively using `jsPDF`.
1. It initializes a blank A4 document.
2. It uses `doc.text()` to write headers and timestamps.
3. It uses `jspdf-autotable` to algorithmically draw the Configuration and Metrics tables directly into the PDF coordinate system, resulting in crisp, selectable text rather than a blurry image snapshot.
