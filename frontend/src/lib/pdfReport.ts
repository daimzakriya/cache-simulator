import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CacheConfig, SimulationResult } from './simulator/types';

// ── Brand colours ──────────────────────────────────────────────
const MAROON   : [number,number,number] = [107,  15, 15];
const MAROON_B : [number,number,number] = [185,  28, 28];
const GOLD     : [number,number,number] = [201, 168, 76];
const BLACK    : [number,number,number] = [  8,   2,  2];
const WHITE    : [number,number,number] = [248, 248, 248];
const GREY     : [number,number,number] = [120, 100, 100];
const DARK     : [number,number,number] = [ 25,   6,  6];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;

// ── Helpers ─────────────────────────────────────────────────────
function sectionLabel(doc: jsPDF, text: string, y: number) {
  doc.setFontSize(7);
  doc.setTextColor(...MAROON_B);
  doc.setFont('helvetica', 'bold');
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...MAROON_B);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + doc.getTextWidth(text.toUpperCase()) + 3, y - 0.5, PAGE_W - MARGIN, y - 0.5);
}

function pageFooter(doc: jsPDF, page: number, total: number) {
  const y = PAGE_H - 8;
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.setFont('helvetica', 'normal');
  doc.text('CacheSim - Cache Memory Simulator  |  Classroom Use Only', MARGIN, y);
  doc.text(`Page ${page} of ${total}`, PAGE_W - MARGIN, y, { align: 'right' });
}

function metricBox(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  label: string, value: string, accent: [number,number,number]
) {
  // card bg
  doc.setFillColor(...DARK);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F');
  // top accent bar
  doc.setFillColor(...accent);
  doc.roundedRect(x, y, w, 1.2, 0.6, 0.6, 'F');
  // label
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREY);
  doc.text(label.toUpperCase(), x + w / 2, y + 8, { align: 'center' });
  // value
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(value, x + w / 2, y + 18, { align: 'center' });
}

// ── COVER PAGE ──────────────────────────────────────────────────
function buildCover(doc: jsPDF, cfg: CacheConfig, res: SimulationResult) {
  // full dark background
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // top maroon band
  doc.setFillColor(...MAROON);
  doc.rect(0, 0, PAGE_W, 52, 'F');

  // diagonal accent
  doc.setFillColor(...MAROON_B);
  doc.triangle(0, 52, PAGE_W, 52, PAGE_W, 70, 'F');

  // logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...WHITE);
  doc.text('Cache', MARGIN, 30);
  doc.setTextColor(...GOLD);
  doc.text('Sim', MARGIN + doc.getTextWidth('Cache'), 30);

  doc.setFontSize(9);
  doc.setTextColor(220, 190, 190);
  doc.setFont('helvetica', 'normal');
  doc.text('CACHE MEMORY SIMULATOR — SIMULATION REPORT', MARGIN, 40);

  // Date
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text(`Generated: ${new Date().toLocaleString()}`, MARGIN, 75);

  // Divider
  doc.setDrawColor(...MAROON_B);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 80, PAGE_W - MARGIN, 80);

  // Config summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text('Simulation Configuration', MARGIN, 90);

  const totalBlocks = Math.floor(cfg.cacheSizeBytes / cfg.blockSizeBytes);
  const numSets = Math.floor(totalBlocks / cfg.associativity);
  let org = `${cfg.associativity}-Way Set Associative`;
  if (numSets === 1) org = 'Fully Associative';
  else if (cfg.associativity === 1) org = 'Direct-Mapped';

  const cfgRows = [
    ['Cache Size',    `${cfg.cacheSizeBytes} B  (${(cfg.cacheSizeBytes/1024).toFixed(2)} KB)`],
    ['Block Size',    `${cfg.blockSizeBytes} B`],
    ['Associativity', `${cfg.associativity}-Way  (${org})`],
    ['Sets',          `${numSets}`],
    ['Policy',        cfg.policy],
    ['Hit Time',      `${cfg.hitTime} cycle${cfg.hitTime!==1?'s':''}`],
    ['Miss Penalty',  `${cfg.missPenalty} cycles`],
  ];

  autoTable(doc, {
    startY: 94,
    head: [['Parameter', 'Value']],
    body: cfgRows,
    theme: 'plain',
    styles: { fontSize: 9, textColor: [220,200,200], fillColor: [18,4,4], cellPadding: 3 },
    headStyles: { fillColor: [...MAROON_B], textColor: [...WHITE], fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [22,5,5] },
    tableLineColor: MAROON,
    tableLineWidth: 0.2,
    margin: { left: MARGIN, right: MARGIN },
  });

  // KPI boxes
  const y0 = 185;
  const bw = 34, bh = 28, gap = 3;
  const startX = MARGIN;
  const hitRatePct = (res.metrics.hitRate * 100).toFixed(1) + '%';

  metricBox(doc, startX + 0*(bw+gap), y0, bw, bh, 'Total Accesses', `${res.metrics.totalAccesses}`, MAROON_B);
  metricBox(doc, startX + 1*(bw+gap), y0, bw, bh, 'Hit Rate',       hitRatePct,                    [16,185,129]);
  metricBox(doc, startX + 2*(bw+gap), y0, bw, bh, 'AMAT',           `${res.metrics.amat.toFixed(2)} cyc`, [245,158,11]);
  metricBox(doc, startX + 3*(bw+gap), y0, bw, bh, 'Hits',           `${res.metrics.hits}`,         [16,185,129]);
  metricBox(doc, startX + 4*(bw+gap), y0, bw, bh, 'Misses',         `${res.metrics.misses}`,       [239, 68, 68]);

  // policy blurb
  const blurbs: Record<string,string> = {
    LRU:  'LRU (Least Recently Used) evicts the block that has not been accessed for the longest time. It exploits temporal locality and is generally the best performer for workloads with a well-defined working set.',
    FIFO: "FIFO (First In, First Out) evicts blocks in insertion order. It requires no access tracking per line and suits sequential streaming workloads but suffers from Belady's anomaly.",
    LFU:  'LFU (Least Frequently Used) evicts the block with the fewest total accesses. It works best when a small, highly reused hot-set exists and the rest of the accesses are relatively rare.',
  };

  doc.setFillColor(22,5,5);
  doc.roundedRect(MARGIN, 218, PAGE_W - 2*MARGIN, 28, 2, 2, 'F');
  doc.setDrawColor(...MAROON);
  doc.setLineWidth(0.25);
  doc.roundedRect(MARGIN, 218, PAGE_W - 2*MARGIN, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text(`Policy Note - ${cfg.policy}`, MARGIN + 4, 225);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200,160,160);
  const lines = doc.splitTextToSize(blurbs[cfg.policy] ?? '', PAGE_W - 2*MARGIN - 8);
  doc.text(lines, MARGIN + 4, 231);

  pageFooter(doc, 1, 4);
}

// ── PAGE 2: ADDRESS DECOMPOSITION + PERFORMANCE ANALYSIS ────────
function buildAnalysis(doc: jsPDF, cfg: CacheConfig, res: SimulationResult) {
  doc.addPage();

  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // header strip
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PAGE_W, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text('Performance Analysis', MARGIN, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text('CacheSim Report', PAGE_W - MARGIN, 13, { align: 'right' });

  let y = 30;

  // ── Address Decomposition ──
  sectionLabel(doc, 'Address Decomposition', y);
  y += 6;

  const offsetBits = Math.log2(cfg.blockSizeBytes);
  const totalBlocks = Math.floor(cfg.cacheSizeBytes / cfg.blockSizeBytes);
  const numSets = Math.floor(totalBlocks / cfg.associativity);
  const indexBits = numSets > 1 ? Math.log2(numSets) : 0;
  const tagBits = 32 - indexBits - offsetBits;

  autoTable(doc, {
    startY: y,
    head: [['Field', 'Bits', 'Formula', 'Value']],
    body: [
      ['Tag',    `${tagBits.toFixed(0)}`,    `32 - index_bits - offset_bits`, `${tagBits.toFixed(0)} bits`],
      ['Index',  `${indexBits.toFixed(0)}`,  `log2(num_sets)`,                numSets>1 ? `log2(${numSets}) = ${indexBits.toFixed(0)}` : '0  (fully associative)'],
      ['Offset', `${offsetBits.toFixed(0)}`, `log2(block_size)`,              `log2(${cfg.blockSizeBytes}) = ${offsetBits.toFixed(0)}`],
    ],
    theme: 'grid',
    styles: { fontSize: 8, textColor: [220,200,200], fillColor: [18,4,4], cellPadding: 2.5 },
    headStyles: { fillColor: [...MAROON_B], textColor: [...WHITE], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [22,5,5] },
    tableLineColor: MAROON,
    tableLineWidth: 0.2,
    margin: { left: MARGIN, right: MARGIN },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Key Metrics ──
  sectionLabel(doc, 'Key Performance Metrics', y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'Formula / Notes']],
    body: [
      ['Total Accesses', `${res.metrics.totalAccesses}`, 'All reads issued to the cache'],
      ['Cache Hits',     `${res.metrics.hits}`,          `Blocks found valid in cache`],
      ['Cache Misses',   `${res.metrics.misses}`,        `Blocks not found - fetched from memory`],
      ['Hit Rate',       `${(res.metrics.hitRate*100).toFixed(2)}%`, `hits / total_accesses`],
      ['Miss Rate',      `${(res.metrics.missRate*100).toFixed(2)}%`,`1 - hit_rate`],
      ['AMAT',           `${res.metrics.amat.toFixed(3)} cycles`,    `hit_time + miss_rate * miss_penalty`],
      ['CPI (approx.)',  `${res.metrics.cpi.toFixed(3)}`,            `base_cpi + miss_rate * miss_penalty`],
      ['Hit Time',       `${cfg.hitTime} cycles`,         'Configured parameter'],
      ['Miss Penalty',   `${cfg.missPenalty} cycles`,     'Configured parameter'],
    ],
    theme: 'grid',
    styles: { fontSize: 8, textColor: [220,200,200], fillColor: [18,4,4], cellPadding: 2.5 },
    headStyles: { fillColor: [...MAROON_B], textColor: [...WHITE], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [22,5,5] },
    tableLineColor: MAROON,
    tableLineWidth: 0.2,
    margin: { left: MARGIN, right: MARGIN },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Analysis Text ──
  sectionLabel(doc, 'Simulation Insights', y);
  y += 7;

  const hitPct = res.metrics.hitRate * 100;
  let analysis = '';
  if (hitPct >= 80) {
    analysis = `Excellent cache performance: the ${cfg.policy} policy achieved a ${hitPct.toFixed(1)}% hit rate with the given trace. This indicates strong locality of reference in the workload. The computed AMAT of ${res.metrics.amat.toFixed(2)} cycles is close to the hit time (${cfg.hitTime} cycles), meaning most accesses resolve in cache without incurring the full miss penalty (${cfg.missPenalty} cycles).`;
  } else if (hitPct >= 50) {
    analysis = `Moderate cache performance: the ${cfg.policy} policy achieved a ${hitPct.toFixed(1)}% hit rate. The AMAT of ${res.metrics.amat.toFixed(2)} cycles reflects a significant number of misses (${res.metrics.misses}) incurring the full ${cfg.missPenalty}-cycle miss penalty. Consider increasing associativity or cache size to capture more of the working set.`;
  } else {
    analysis = `Poor cache performance: only ${hitPct.toFixed(1)}% of accesses were hits. The AMAT of ${res.metrics.amat.toFixed(2)} cycles is substantially above the hit time of ${cfg.hitTime} cycles due to ${res.metrics.misses} misses. This may indicate thrashing, excessive associativity mismatch, or a working set larger than the configured ${cfg.cacheSizeBytes}B cache.`;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200,170,170);
  const textLines = doc.splitTextToSize(analysis, PAGE_W - 2*MARGIN);
  doc.text(textLines, MARGIN, y);

  pageFooter(doc, 2, 4);
}

// ── PAGE 3: ACCESS TRACE ─────────────────────────────────────────
function buildTrace(doc: jsPDF, res: SimulationResult) {
  doc.addPage();

  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  doc.setFillColor(...DARK);
  doc.rect(0, 0, PAGE_W, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text('Full Access Trace Log', MARGIN, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text('CacheSim Report', PAGE_W - MARGIN, 13, { align: 'right' });

  const MAX_ROWS = 500;
  const rows = res.trace.slice(0, MAX_ROWS).map(t => [
    `${t.tick}`,
    `0x${t.address.toString(16).toUpperCase().padStart(4,'0')}`,
    `0x${t.tag.toString(16).toUpperCase()}`,
    `${t.setIndex}`,
    `${t.blockOffset}`,
    `${t.way}`,
    t.hit ? 'HIT' : 'MISS',
    t.evictedTag !== null ? `0x${t.evictedTag.toString(16).toUpperCase()}` : '-',
  ]);

  autoTable(doc, {
    startY: 26,
    head: [['Tick','Address','Tag','Set','Offset','Way','Result','Evicted']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 6.5, textColor: [200,180,180], fillColor: [18,4,4], cellPadding: 1.8, font: 'courier' },
    headStyles: { fillColor: [...MAROON_B], textColor: [...WHITE], fontStyle: 'bold', fontSize: 7, font: 'helvetica' },
    alternateRowStyles: { fillColor: [22,5,5] },
    tableLineColor: MAROON,
    tableLineWidth: 0.15,
    margin: { left: MARGIN, right: MARGIN },
    didParseCell: (data) => {
      if (data.column.index === 6) {
        if (data.cell.raw === 'HIT')  data.cell.styles.textColor = [16,185,129];
        if (data.cell.raw === 'MISS') data.cell.styles.textColor = [239,68,68];
      }
    },
    didDrawPage: (data) => {
      const pg = data.pageNumber + 2; // pages 1 & 2 already done
      pageFooter(doc, pg, 4);
    },
  });

  if (res.trace.length > MAX_ROWS) {
    const y = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(`Note: Trace truncated to first ${MAX_ROWS} of ${res.trace.length} entries. Download CSV for full trace.`, MARGIN, y);
  }
}

// ── PAGE LAST: GLOSSARY ──────────────────────────────────────────
function buildGlossary(doc: jsPDF) {
  doc.addPage();

  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  doc.setFillColor(...DARK);
  doc.rect(0, 0, PAGE_W, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text('Glossary of Terms', MARGIN, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.text('CacheSim Report', PAGE_W - MARGIN, 13, { align: 'right' });

  const terms = [
    ['AMAT', 'Average Memory Access Time. Calculated as: Hit Time + (Miss Rate * Miss Penalty). Measures effective memory latency experienced by the CPU.'],
    ['Associativity', 'The number of cache lines (ways) per set. 1-way = direct-mapped; all lines in one set = fully associative.'],
    ['Block / Cache Line', 'The unit of data transfer between main memory and cache. Block Size determines how many bytes are fetched on each miss.'],
    ['Block Offset', 'Low-order bits of the address that select a specific byte within the cache block.'],
    ['CPI', 'Cycles Per Instruction. Estimated as Base CPI + Miss Rate * Miss Penalty.'],
    ['Direct-Mapped', 'A cache where each memory block maps to exactly one cache line (1-way associative).'],
    ['FIFO', 'First In, First Out replacement policy. The oldest-inserted block is evicted when a new block must be loaded.'],
    ['Fully Associative', 'A cache with a single set containing all lines. Any block can reside in any line.'],
    ['Hit', 'A memory access where the requested block is already present in the cache.'],
    ['Hit Rate', 'The fraction of total accesses that result in a hit: Hits / Total Accesses.'],
    ['Hit Time', 'The number of cycles required to complete a cache hit (e.g., 1-4 cycles for L1).'],
    ['Index Bits', 'Bits extracted from the address used to select the cache set: log2(number of sets).'],
    ['LFU', 'Least Frequently Used replacement policy. Evicts the block with the lowest access count.'],
    ['LRU', 'Least Recently Used replacement policy. Evicts the block that was accessed furthest in the past.'],
    ['Miss', 'A memory access where the requested block is not in cache; the block must be fetched from main memory.'],
    ['Miss Penalty', 'Extra cycles incurred on a miss to fetch the block from main memory (typically 50-200 cycles).'],
    ['Miss Rate', '1 - Hit Rate. The fraction of accesses that miss the cache.'],
    ['Set', 'A group of cache lines that a given memory block can be stored in. Number of sets = Total Blocks / Associativity.'],
    ['Tag', 'High-order bits of the address stored in the cache line to identify which memory block occupies it.'],
    ['Tag Bits', '32 - Index Bits - Offset Bits. Used to verify that a cache line contains the requested block.'],
    ['Way', 'One slot within a set. A k-way set-associative cache has k ways per set.'],
    ['Working Set', 'The set of memory blocks actively used by a program during a phase of execution.'],
  ];

  autoTable(doc, {
    startY: 26,
    head: [['Term', 'Definition']],
    body: terms,
    theme: 'grid',
    columnStyles: { 0: { cellWidth: 38, fontStyle: 'bold', textColor: [...GOLD] }, 1: { cellWidth: 'auto' } },
    styles: { fontSize: 7.5, textColor: [210,185,185], fillColor: [18,4,4], cellPadding: 2.5 },
    headStyles: { fillColor: [...MAROON_B], textColor: [...WHITE], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [22,5,5] },
    tableLineColor: MAROON,
    tableLineWidth: 0.2,
    margin: { left: MARGIN, right: MARGIN },
  });

  pageFooter(doc, 4, 4);
}

// ── PUBLIC ENTRY POINT ────────────────────────────────────────────
export function generatePDFReport(cfg: CacheConfig, res: SimulationResult) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  buildCover(doc, cfg, res);
  buildAnalysis(doc, cfg, res);
  buildTrace(doc, res);
  buildGlossary(doc);

  doc.save(`cachesim_report_${cfg.policy}_${Date.now()}.pdf`);
}
