"""
metrics.py - Compute performance metrics from simulation results.
"""
from __future__ import annotations
from dataclasses import dataclass


@dataclass
class SimulationMetrics:
    total_accesses: int
    hits: int
    misses: int
    hit_time: float        # cycles
    miss_penalty: float    # cycles
    base_cpi: float

    @property
    def hit_rate(self) -> float:
        return self.hits / self.total_accesses if self.total_accesses else 0.0

    @property
    def miss_rate(self) -> float:
        return self.misses / self.total_accesses if self.total_accesses else 0.0

    @property
    def amat(self) -> float:
        """AMAT = Hit_Time + Miss_Rate × Miss_Penalty"""
        return self.hit_time + self.miss_rate * self.miss_penalty

    @property
    def cpi(self) -> float:
        """CPI = Base_CPI + Miss_Rate × Miss_Penalty"""
        return self.base_cpi + self.miss_rate * self.miss_penalty

    def to_dict(self) -> dict:
        return {
            "total_accesses": self.total_accesses,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(self.hit_rate, 6),
            "miss_rate": round(self.miss_rate, 6),
            "amat": round(self.amat, 4),
            "cpi": round(self.cpi, 4),
            "hit_time": self.hit_time,
            "miss_penalty": self.miss_penalty,
            "base_cpi": self.base_cpi,
        }
