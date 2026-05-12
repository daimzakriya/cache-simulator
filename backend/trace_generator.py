"""
trace_generator.py - Generates synthetic memory access traces.
Patterns: sequential, random, temporal_locality, spatial_locality, thrashing.
"""
from __future__ import annotations
import random
from typing import List


def generate_trace(pattern: str, count: int = 100, address_space: int = 0xFFFF) -> List[int]:
    """
    Generate a list of memory addresses for the given pattern.

    Parameters
    ----------
    pattern      : str  One of sequential | random | temporal | spatial | thrashing
    count        : int  Number of accesses to generate
    address_space: int  Maximum address value
    """
    pattern = pattern.lower()
    rng = random.Random(42)  # fixed seed for reproducibility

    if pattern == "sequential":
        return [(i * 64) % address_space for i in range(count)]

    elif pattern == "random":
        return [rng.randint(0, address_space) & ~0x3F for _ in range(count)]

    elif pattern in ("temporal", "temporal_locality"):
        # 80% of accesses hit a small working set of ~5 addresses
        hot_set = [rng.randint(0, address_space // 4) & ~0x3F for _ in range(5)]
        addresses = []
        for _ in range(count):
            if rng.random() < 0.8:
                addresses.append(rng.choice(hot_set))
            else:
                addresses.append(rng.randint(0, address_space) & ~0x3F)
        return addresses

    elif pattern in ("spatial", "spatial_locality"):
        # Walk through memory in strides of 1 block, occasionally jump
        base = rng.randint(0, address_space // 2) & ~0x3F
        addresses = []
        for _ in range(count):
            addresses.append(base % address_space)
            if rng.random() < 0.1:
                base = rng.randint(0, address_space // 2) & ~0x3F
            else:
                base += 64
        return addresses

    elif pattern == "thrashing":
        # Access a working set just slightly larger than the cache
        # so every access evicts something it will need shortly after
        working_set_size = 16  # should exceed typical cache capacity in blocks
        hot_set = [(i * 64) % address_space for i in range(working_set_size)]
        return [hot_set[i % working_set_size] for i in range(count)]

    else:
        raise ValueError(
            f"Unknown pattern '{pattern}'. "
            "Choose: sequential | random | temporal | spatial | thrashing"
        )
