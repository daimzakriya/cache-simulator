# Cache Memory Simulator & Policy Analyzer

A full-stack, interactive computer architecture project demonstrating CPU cache behavior, multi-policy replacement algorithms (LRU, FIFO, LFU), and memory performance metrics (AMAT, CPI).

## 🚀 Features

- **Cache Organizations**: Direct-Mapped, N-Way Set Associative, Fully Associative.
- **Replacement Policies**: LRU, FIFO, LFU comparison.
- **Metrics**: Hit/Miss rate, AMAT, Base CPI, Total Cycles.
- **Synthetic Trace Generator**: Spatial, Temporal, Sequential, Random, Thrashing.
- **Exports**: Download trace CSVs and fully generated PDF reports.

## 🛠️ Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Python, FastAPI, Pandas, ReportLab
- **Testing**: Pytest

## 📦 Setup and Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
The FastAPI backend will start at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```
The React frontend will start at `http://localhost:5173`.

## 🧪 Running Tests
```bash
cd backend
pytest tests/
```
