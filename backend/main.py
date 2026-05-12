"""
main.py - FastAPI application entry point.
Provides REST endpoints for cache simulation, comparison, trace generation, and export.
"""
from __future__ import annotations
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

from simulator.simulator import CacheSimulator
from simulator.metrics import SimulationMetrics
from trace_generator import generate_trace
from exporter import export_csv, export_pdf

app = FastAPI(
    title="Cache Memory Simulator API",
    description="Backend for the Cache Memory Simulator & Policy Analyzer",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Models ────────────────────────────────────────────────

class SimulateRequest(BaseModel):
    addresses: List[int] = Field(..., description="List of memory addresses (decimal)")
    cache_size_bytes: int = Field(1024, ge=64)
    block_size_bytes: int = Field(64, ge=4)
    associativity: int = Field(1, ge=1)
    policy: str = Field("LRU", pattern="^(LRU|FIFO|LFU)$")
    hit_time: float = Field(1.0, ge=0)
    miss_penalty: float = Field(100.0, ge=0)
    base_cpi: float = Field(1.0, ge=0)


class CompareRequest(BaseModel):
    addresses: List[int]
    cache_size_bytes: int = Field(1024, ge=64)
    block_size_bytes: int = Field(64, ge=4)
    associativity: int = Field(1, ge=1)
    hit_time: float = Field(1.0, ge=0)
    miss_penalty: float = Field(100.0, ge=0)
    base_cpi: float = Field(1.0, ge=0)


class GenerateTraceRequest(BaseModel):
    pattern: str = Field("sequential", description="sequential|random|temporal|spatial|thrashing")
    count: int = Field(100, ge=1, le=10000)
    address_space: int = Field(0xFFFF, ge=256)


class ExportRequest(BaseModel):
    config: dict
    metrics: dict
    trace: List[dict]
    comparison: Optional[List[dict]] = None


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Cache Memory Simulator API v1.0"}


@app.post("/simulate")
def simulate(req: SimulateRequest):
    """Run a full cache simulation and return metrics + trace."""
    if not req.addresses:
        raise HTTPException(status_code=400, detail="Address list must not be empty.")
    try:
        sim = CacheSimulator(
            cache_size_bytes=req.cache_size_bytes,
            block_size_bytes=req.block_size_bytes,
            associativity=req.associativity,
            policy=req.policy,
            hit_time=req.hit_time,
            miss_penalty=req.miss_penalty,
            base_cpi=req.base_cpi,
        )
        sim.run(req.addresses)
        metrics = sim.get_metrics().to_dict()
        trace = sim.get_trace()
        steps = sim.get_step_snapshots()
        return {
            "metrics": metrics,
            "trace": trace,
            "steps": steps,
            "organization": sim.cache.organization,
            "num_sets": sim.cache.num_sets,
            "associativity": sim.cache.associativity,
            "block_offset_bits": sim.cache.block_offset_bits,
            "index_bits": sim.cache.index_bits,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/compare")
def compare(req: CompareRequest):
    """Run the same trace under LRU, FIFO, and LFU and compare metrics."""
    if not req.addresses:
        raise HTTPException(status_code=400, detail="Address list must not be empty.")
    results = []
    for policy in ["LRU", "FIFO", "LFU"]:
        try:
            sim = CacheSimulator(
                cache_size_bytes=req.cache_size_bytes,
                block_size_bytes=req.block_size_bytes,
                associativity=req.associativity,
                policy=policy,
                hit_time=req.hit_time,
                miss_penalty=req.miss_penalty,
                base_cpi=req.base_cpi,
            )
            sim.run(req.addresses)
            m = sim.get_metrics().to_dict()
            m["policy"] = policy
            results.append(m)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    return {"comparison": results}


@app.post("/generate-trace")
def generate(req: GenerateTraceRequest):
    """Generate a synthetic memory trace."""
    try:
        addresses = generate_trace(req.pattern, req.count, req.address_space)
        return {
            "pattern": req.pattern,
            "count": len(addresses),
            "addresses": addresses,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/export/csv")
def export_csv_endpoint(req: ExportRequest):
    """Export simulation trace as a CSV file."""
    csv_bytes = export_csv(req.trace)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=simulation_trace.csv"},
    )


@app.post("/export/pdf")
def export_pdf_endpoint(req: ExportRequest):
    """Generate and return a PDF simulation report."""
    pdf_bytes = export_pdf(req.config, req.metrics, req.trace, req.comparison)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=simulation_report.pdf"},
    )
