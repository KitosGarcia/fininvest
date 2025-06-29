import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tier {
  tier_id: number;
  member_id: number;
  member_name: string;
  tier_name: string;
  quota_amount: number;
  start_date: string;
  end_date: string;
}

interface TierTableProps {
  tiers: Tier[];
  onEdit: (tier: Tier) => void;
  onDelete: (tier: Tier) => void;
}

const TierTable: React.FC<TierTableProps> = ({ tiers, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto border rounded-lg bg-jarvis.panel">
      <table className="min-w-full text-sm text-left text-jarvis.text">
        <thead className="bg-jarvis.bg text-xs uppercase">
          <tr>
            <th className="px-4 py-2">Sócio</th>
            <th className="px-4 py-2">Escalão</th>
            <th className="px-4 py-2">Quota</th>
            <th className="px-4 py-2">Início</th>
            <th className="px-4 py-2">Fim</th>
            <th className="px-4 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => (
            <tr key={tier.tier_id} className="border-b border-jarvis.bg hover:bg-jarvis.bg/30">
              <td className="px-4 py-2">{tier.member_name}</td>
              <td className="px-4 py-2">{tier.tier_name}</td>
              <td className="px-4 py-2">{Number(tier.quota_amount).toFixed(2)}Kz</td>
              <td className="px-4 py-2">{tier.start_date?.split('T')[0]}</td>
              <td className="px-4 py-2">{tier.end_date?.split('T')[0]}</td>
              <td className="px-4 py-2 text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(tier)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(tier)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
          {tiers.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4 text-jarvis.text/60">
                Nenhum escalão encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TierTable;
