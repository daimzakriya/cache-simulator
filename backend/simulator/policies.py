"""
policies.py - Cache replacement policy implementations.
Supports LRU, FIFO, and LFU strategies.
Each policy operates on a CacheSet and returns the index of the line to evict.
"""
from __future__ import annotations
from typing import Protocol
from .cache import CacheSet


class ReplacementPolicy(Protocol):
    """Interface that all replacement policies must satisfy."""
    name: str

    def choose_victim(self, cset: CacheSet) -> int:
        """Return the index of the cache line to evict."""
        ...

    def on_access(self, cset: CacheSet, way: int, tick: int) -> None:
        """Called on every cache hit or fill to update metadata."""
        ...

    def on_fill(self, cset: CacheSet, way: int, tick: int) -> None:
        """Called specifically on a cache fill (miss that loads data)."""
        ...


class LRUPolicy:
    """Least-Recently-Used: evict the line with the smallest last_used tick."""
    name = "LRU"

    def choose_victim(self, cset: CacheSet) -> int:
        return min(range(len(cset.lines)), key=lambda i: cset.lines[i].last_used)

    def on_access(self, cset: CacheSet, way: int, tick: int) -> None:
        cset.lines[way].last_used = tick

    def on_fill(self, cset: CacheSet, way: int, tick: int) -> None:
        cset.lines[way].last_used = tick


class FIFOPolicy:
    """First-In-First-Out: evict the line with the smallest load_order."""
    name = "FIFO"

    def choose_victim(self, cset: CacheSet) -> int:
        return min(range(len(cset.lines)), key=lambda i: cset.lines[i].load_order)

    def on_access(self, cset: CacheSet, way: int, tick: int) -> None:
        # FIFO does not update metadata on access — order is fixed at load time.
        pass

    def on_fill(self, cset: CacheSet, way: int, tick: int) -> None:
        cset.lines[way].load_order = tick


class LFUPolicy:
    """Least-Frequently-Used: evict the line with the lowest access frequency.
    Ties are broken by least-recently-used (smallest last_used).
    """
    name = "LFU"

    def choose_victim(self, cset: CacheSet) -> int:
        return min(
            range(len(cset.lines)),
            key=lambda i: (cset.lines[i].frequency, cset.lines[i].last_used),
        )

    def on_access(self, cset: CacheSet, way: int, tick: int) -> None:
        cset.lines[way].frequency += 1
        cset.lines[way].last_used = tick

    def on_fill(self, cset: CacheSet, way: int, tick: int) -> None:
        cset.lines[way].frequency = 1
        cset.lines[way].last_used = tick


POLICIES = {
    "LRU": LRUPolicy(),
    "FIFO": FIFOPolicy(),
    "LFU": LFUPolicy(),
}


def get_policy(name: str) -> LRUPolicy | FIFOPolicy | LFUPolicy:
    """Return a policy instance by name (case-insensitive)."""
    key = name.upper()
    if key not in POLICIES:
        raise ValueError(f"Unknown policy '{name}'. Choose from: {list(POLICIES.keys())}")
    return POLICIES[key]
