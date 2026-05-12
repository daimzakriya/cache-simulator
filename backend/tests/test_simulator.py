"""
tests/test_simulator.py - Unit tests for the cache simulation engine.
Run with: pytest tests/
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from simulator.cache import Cache, CacheLine, CacheSet
from simulator.policies import LRUPolicy, FIFOPolicy, LFUPolicy
from simulator.simulator import CacheSimulator
from simulator.metrics import SimulationMetrics


# ── Cache address decoding ─────────────────────────────────────────────────────

def test_direct_mapped_decode():
    """1KB cache, 64B blocks → 16 sets, 6 offset bits, 4 index bits"""
    cache = Cache(cache_size_bytes=1024, block_size_bytes=64, associativity=1)
    assert cache.num_sets == 16
    assert cache.block_offset_bits == 6
    assert cache.index_bits == 4

    # Address 0x0040 = 64 decimal
    # block_offset = 64 & 0x3F = 0
    # set_index    = (64 >> 6) & 0xF = 1
    # tag          = 64 >> 10 = 0
    tag, si, offset = cache.decode_address(0x0040)
    assert offset == 0
    assert si == 1
    assert tag == 0


def test_fully_associative():
    cache = Cache(cache_size_bytes=256, block_size_bytes=64, associativity=4)
    assert cache.num_sets == 1
    assert cache.organization == "Fully Associative"


def test_set_associative_organization():
    cache = Cache(cache_size_bytes=512, block_size_bytes=64, associativity=2)
    assert cache.num_sets == 4
    assert "2-Way" in cache.organization


# ── Simulation hit/miss correctness ───────────────────────────────────────────

def test_cold_misses():
    """First access to every block must be a miss."""
    sim = CacheSimulator(cache_size_bytes=256, block_size_bytes=64, associativity=1, policy='LRU')
    addrs = [0, 64, 128, 192]
    sim.run(addrs)
    assert sim.hits == 0
    assert sim.misses == 4


def test_hit_on_repeat():
    """Accessing the same address twice: 1 miss then 1 hit."""
    sim = CacheSimulator(cache_size_bytes=1024, block_size_bytes=64, associativity=2, policy='LRU')
    sim.run([64, 64])
    assert sim.hits == 1
    assert sim.misses == 1


def test_lru_eviction():
    """
    Direct-mapped, 2 sets, 64B blocks.
    Address 0 and 128 map to set 0 (both tag 0,1).
    Load 0, load 128 (evicts 0), load 0 again → miss (0 was evicted).
    """
    sim = CacheSimulator(cache_size_bytes=128, block_size_bytes=64, associativity=1, policy='LRU')
    sim.run([0, 128, 0])
    # All 3 are misses: 0 cold, 128 conflicts, 0 evicted by 128
    assert sim.misses == 3
    assert sim.hits == 0


def test_lru_vs_fifo_thrashing():
    """On a cycling pattern longer than cache, both LRU and FIFO should miss every time."""
    addrs = [0, 64, 128, 192, 0, 64, 128, 192]  # 4 unique blocks
    sim_lru  = CacheSimulator(cache_size_bytes=128, block_size_bytes=64, associativity=1, policy='LRU')
    sim_fifo = CacheSimulator(cache_size_bytes=128, block_size_bytes=64, associativity=1, policy='FIFO')
    sim_lru.run(addrs)
    sim_fifo.run(addrs)
    # 2-set direct-mapped: conflict misses on every access
    assert sim_lru.hits == 0
    assert sim_fifo.hits == 0


# ── Metrics ────────────────────────────────────────────────────────────────────

def test_amat_formula():
    m = SimulationMetrics(
        total_accesses=100, hits=90, misses=10,
        hit_time=1.0, miss_penalty=100.0, base_cpi=1.0
    )
    assert m.hit_rate == pytest.approx(0.9)
    assert m.miss_rate == pytest.approx(0.1)
    assert m.amat == pytest.approx(1.0 + 0.1 * 100.0)
    assert m.cpi  == pytest.approx(1.0 + 0.1 * 100.0)


def test_metrics_zero_accesses():
    m = SimulationMetrics(0, 0, 0, 1.0, 100.0, 1.0)
    assert m.hit_rate == 0.0
    assert m.miss_rate == 0.0


# ── Policy comparison ──────────────────────────────────────────────────────────

def test_lfu_keeps_hot_block():
    """
    LFU should keep the frequently accessed block and evict the cold one.
    Set up: 2-way, access A many times then B once, then A again → should HIT.
    """
    sim = CacheSimulator(cache_size_bytes=256, block_size_bytes=128, associativity=2, policy='LFU')
    # All map to set 0 in 1-set fully-assoc
    hot = 0
    cold = 128
    other = 256  # forces eviction if needed

    # Load hot many times, then cold, then other (evicts cold via LFU), then hot → HIT
    sim.run([hot]*5 + [cold, other, hot])
    # The last 'hot' should be a hit because hot has freq > cold
    last = sim.events[-1]
    assert last.hit is True


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
