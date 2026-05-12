"""
cache.py - Core cache data structures.
Implements CacheLine, CacheSet, and the Cache abstraction
for direct-mapped, N-way set-associative, and fully-associative caches.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class CacheLine:
    """A single cache line (slot) within a cache set."""
    valid: bool = False
    tag: int = -1
    frequency: int = 0          # used by LFU
    last_used: int = 0          # used by LRU
    load_order: int = 0         # used by FIFO
    data: Optional[int] = None  # symbolic block identifier


@dataclass
class CacheSet:
    """A set containing `associativity` cache lines."""
    lines: List[CacheLine] = field(default_factory=list)

    @classmethod
    def create(cls, associativity: int) -> "CacheSet":
        return cls(lines=[CacheLine() for _ in range(associativity)])

    def find_line(self, tag: int) -> Optional[int]:
        """Return the index of a line with matching tag, or None."""
        for i, line in enumerate(self.lines):
            if line.valid and line.tag == tag:
                return i
        return None

    def has_empty_line(self) -> Optional[int]:
        """Return index of first invalid line, or None."""
        for i, line in enumerate(self.lines):
            if not line.valid:
                return i
        return None


class Cache:
    """
    Configurable cache with support for:
      - Direct-Mapped (associativity=1)
      - N-Way Set-Associative (1 < associativity < num_sets*associativity)
      - Fully-Associative (num_sets=1)

    Parameters
    ----------
    cache_size_bytes : int
    block_size_bytes : int
    associativity    : int  (ways per set)
    """

    def __init__(
        self,
        cache_size_bytes: int = 1024,
        block_size_bytes: int = 64,
        associativity: int = 1,
    ) -> None:
        if block_size_bytes <= 0 or (block_size_bytes & (block_size_bytes - 1)) != 0:
            raise ValueError("block_size_bytes must be a positive power of 2.")
        if cache_size_bytes <= 0:
            raise ValueError("cache_size_bytes must be positive.")

        self.cache_size_bytes = cache_size_bytes
        self.block_size_bytes = block_size_bytes
        self.associativity = associativity

        total_blocks = cache_size_bytes // block_size_bytes
        if total_blocks < associativity:
            raise ValueError("Cache too small for the requested associativity.")

        self.num_sets: int = total_blocks // associativity
        self.block_offset_bits: int = (block_size_bytes - 1).bit_length()
        self.index_bits: int = (self.num_sets - 1).bit_length() if self.num_sets > 1 else 0

        self.sets: List[CacheSet] = [
            CacheSet.create(associativity) for _ in range(self.num_sets)
        ]

    def decode_address(self, address: int) -> tuple[int, int, int]:
        """
        Split address into (tag, set_index, block_offset).
        """
        block_offset = address & ((1 << self.block_offset_bits) - 1)
        set_index = (address >> self.block_offset_bits) & ((1 << self.index_bits) - 1) if self.index_bits else 0
        tag = address >> (self.block_offset_bits + self.index_bits)
        return tag, set_index, block_offset

    def get_set(self, set_index: int) -> CacheSet:
        return self.sets[set_index]

    def reset(self) -> None:
        """Clear all cache lines."""
        for s in self.sets:
            for line in s.lines:
                line.valid = False
                line.tag = -1
                line.frequency = 0
                line.last_used = 0
                line.load_order = 0
                line.data = None

    @property
    def organization(self) -> str:
        if self.num_sets == 1:
            return "Fully Associative"
        if self.associativity == 1:
            return "Direct-Mapped"
        return f"{self.associativity}-Way Set Associative"

    def state_snapshot(self) -> list:
        """Return a serializable snapshot of the cache state."""
        snapshot = []
        for si, cset in enumerate(self.sets):
            for li, line in enumerate(cset.lines):
                snapshot.append({
                    "set": si,
                    "way": li,
                    "valid": line.valid,
                    "tag": line.tag if line.valid else None,
                    "frequency": line.frequency,
                    "last_used": line.last_used,
                })
        return snapshot
