"""
simulator.py - The main CacheSimulator engine.
Processes a list of memory addresses, records every access event,
and produces per-step trace data plus aggregate metrics.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional
from .cache import Cache, CacheLine
from .policies import get_policy
from .metrics import SimulationMetrics


@dataclass
class AccessEvent:
    """Represents the outcome of a single memory access."""
    tick: int
    address: int
    tag: int
    set_index: int
    block_offset: int
    hit: bool
    evicted_tag: Optional[int]
    way: int
    cache_snapshot: list = field(default_factory=list)


class CacheSimulator:
    """
    Drives a Cache through a sequence of addresses, applying a replacement policy.

    Parameters
    ----------
    cache_size_bytes : int
    block_size_bytes : int
    associativity    : int
    policy           : str  ("LRU" | "FIFO" | "LFU")
    hit_time         : float  (cycles)
    miss_penalty     : float  (cycles)
    base_cpi         : float
    """

    def __init__(
        self,
        cache_size_bytes: int = 1024,
        block_size_bytes: int = 64,
        associativity: int = 1,
        policy: str = "LRU",
        hit_time: float = 1.0,
        miss_penalty: float = 100.0,
        base_cpi: float = 1.0,
    ) -> None:
        self.cache = Cache(cache_size_bytes, block_size_bytes, associativity)
        self.policy = get_policy(policy)
        self.hit_time = hit_time
        self.miss_penalty = miss_penalty
        self.base_cpi = base_cpi
        self.hits = 0
        self.misses = 0
        self.tick = 0
        self.events: List[AccessEvent] = []

    def access(self, address: int) -> AccessEvent:
        """Process one memory access and return the access event."""
        tag, set_index, block_offset = self.cache.decode_address(address)
        cset = self.cache.get_set(set_index)
        self.tick += 1

        hit_way = cset.find_line(tag)
        evicted_tag: Optional[int] = None

        if hit_way is not None:
            # ---- HIT ----
            self.hits += 1
            self.policy.on_access(cset, hit_way, self.tick)
            event = AccessEvent(
                tick=self.tick,
                address=address,
                tag=tag,
                set_index=set_index,
                block_offset=block_offset,
                hit=True,
                evicted_tag=None,
                way=hit_way,
                cache_snapshot=self.cache.state_snapshot(),
            )
        else:
            # ---- MISS ----
            self.misses += 1
            empty_way = cset.has_empty_line()

            if empty_way is not None:
                target_way = empty_way
            else:
                target_way = self.policy.choose_victim(cset)
                evicted_tag = cset.lines[target_way].tag

            # Load new block
            line = cset.lines[target_way]
            line.valid = True
            line.tag = tag
            line.data = address  # symbolic
            line.frequency = 0
            line.last_used = 0
            line.load_order = 0
            self.policy.on_fill(cset, target_way, self.tick)

            event = AccessEvent(
                tick=self.tick,
                address=address,
                tag=tag,
                set_index=set_index,
                block_offset=block_offset,
                hit=False,
                evicted_tag=evicted_tag,
                way=target_way,
                cache_snapshot=self.cache.state_snapshot(),
            )

        self.events.append(event)
        return event

    def run(self, addresses: List[int]) -> None:
        """Process a full list of addresses."""
        for addr in addresses:
            self.access(addr)

    def get_metrics(self) -> SimulationMetrics:
        return SimulationMetrics(
            total_accesses=self.hits + self.misses,
            hits=self.hits,
            misses=self.misses,
            hit_time=self.hit_time,
            miss_penalty=self.miss_penalty,
            base_cpi=self.base_cpi,
        )

    def get_trace(self) -> List[dict]:
        """Return the event log as a serializable list."""
        return [
            {
                "tick": e.tick,
                "address": f"0x{e.address:08X}",
                "address_dec": e.address,
                "tag": e.tag,
                "set_index": e.set_index,
                "block_offset": e.block_offset,
                "result": "HIT" if e.hit else "MISS",
                "evicted_tag": e.evicted_tag,
                "way": e.way,
            }
            for e in self.events
        ]

    def get_step_snapshots(self) -> List[dict]:
        """Return per-step cache snapshots for animated playback."""
        return [
            {
                "tick": e.tick,
                "result": "HIT" if e.hit else "MISS",
                "address": f"0x{e.address:08X}",
                "set_index": e.set_index,
                "way": e.way,
                "evicted_tag": e.evicted_tag,
                "snapshot": e.cache_snapshot,
            }
            for e in self.events
        ]
