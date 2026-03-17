import type { MipsOverview } from '@/lib/services/mips';
import { ProGate } from '@/components/ProGate';

interface MipsScoreCardProps {
  mips: MipsOverview | null;
  isPro: boolean;
}

export function MipsScoreCard({ mips, isPro }: MipsScoreCardProps): React.ReactNode {
  if (!mips) return null;

  const categories = [
    { label: 'Quality', value: mips.qualityScore },
    { label: 'Promoting Interoperability', value: mips.piScore },
    { label: 'Improvement Activities', value: mips.iaScore },
    { label: 'Cost', value: mips.costScore },
  ];

  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
        MIPS Performance ({mips.programYear})
      </h2>

      <div className="mb-4">
        <p className="font-mono text-3xl font-bold">
          {mips.finalScore !== null ? mips.finalScore.toFixed(1) : '—'}
          <span className="text-base font-normal text-muted-foreground"> / 100</span>
        </p>
        <p className="text-xs text-muted-foreground">Final MIPS Score</p>
      </div>

      <ProGate isPro={isPro} label="Upgrade to Pro for full MIPS breakdown">
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Category</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.label}>
                  <td className="px-3 py-2">{cat.label}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {cat.value !== null ? cat.value.toFixed(1) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ProGate>
    </div>
  );
}
