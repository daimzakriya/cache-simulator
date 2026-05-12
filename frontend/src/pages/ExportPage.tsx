import { useState } from 'react';
import { Download, FileText, Share2 } from 'lucide-react';
import { useSimStore } from '../store/useSimStore';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExportPage() {
  const { config, result } = useSimStore();

  const handleExportCSV = () => {
    if (!result) return;
    
    const rows = [
      ['Tick', 'Address', 'Tag', 'Set', 'Offset', 'Hit', 'EvictedTag'],
      ...result.trace.map(r => [
        r.tick, r.address, r.tag, r.setIndex, r.blockOffset, r.hit ? 'HIT' : 'MISS', r.evictedTag ?? 'NONE'
      ])
    ];

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cache_trace_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237); // Primary Violet
    doc.text("CacheSim: Simulation Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // Configuration
    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text("Configuration", 14, 40);
    
    autoTable(doc, {
      startY: 45,
      head: [['Parameter', 'Value']],
      body: [
        ['Cache Size', `${config.cacheSizeBytes} Bytes`],
        ['Block Size', `${config.blockSizeBytes} Bytes`],
        ['Associativity', `${config.associativity} Way`],
        ['Policy', config.policy],
      ],
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237] }
    });

    // Metrics
    const finalY = (doc as any).lastAutoTable.finalY || 45;
    doc.setFontSize(14);
    doc.text("Performance Metrics", 14, finalY + 10);
    
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Metric', 'Result']],
      body: [
        ['Total Accesses', result.metrics.totalAccesses.toString()],
        ['Hits', result.metrics.hits.toString()],
        ['Misses', result.metrics.misses.toString()],
        ['Hit Rate', `${(result.metrics.hitRate * 100).toFixed(2)}%`],
        ['AMAT', `${result.metrics.amat.toFixed(2)} Cycles`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [6, 182, 212] }
    });

    doc.save('cachesim_report.pdf');
  };

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const params = new URLSearchParams();
    params.set('cacheSize', config.cacheSizeBytes.toString());
    params.set('blockSize', config.blockSizeBytes.toString());
    params.set('assoc', config.associativity.toString());
    params.set('policy', config.policy);
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="py-10 px-8 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Export & Share</h1>
        <p className="text-textSecondary">Download your simulation results for analysis.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <FileText size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Raw Trace (CSV)</h2>
          <p className="text-sm text-textSecondary mb-8 max-w-[250px]">
            Download the complete cycle-by-cycle access log including tags, offsets, and eviction history.
          </p>
          <GlowButton variant="secondary" onClick={handleExportCSV} disabled={!result} className="w-full">
            <Download size={16} /> Download CSV
          </GlowButton>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
            <FileText size={28} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Executive Report (PDF)</h2>
          <p className="text-sm text-textSecondary mb-8 max-w-[250px]">
            Generate a beautifully formatted PDF document summarizing configuration and key performance indicators.
          </p>
          <GlowButton onClick={handleExportPDF} disabled={!result} className="w-full">
            <Download size={16} /> Generate PDF
          </GlowButton>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col items-center text-center md:col-span-2">
          <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6">
            <Share2 size={28} className="text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Share Configuration</h2>
          <p className="text-sm text-textSecondary mb-8 max-w-md">
            Generate a shareable link that encodes your cache configuration and synthetic trace parameters.
          </p>
          <GlowButton variant="secondary" onClick={handleCopyLink} className="min-w-[200px]">
            <Share2 size={16} /> {copied ? 'Copied!' : 'Copy URL Link'}
          </GlowButton>
        </GlassCard>
      </div>
    </div>
  );
}
