import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface Tier {
  tier_id: number;
  member_name: string;
  quota_amount: number;
  start_date: string;
  end_date: string;
}

interface TierTableProps {
  tiers: Tier[];
  onEdit: (tier: Tier) => void;
  onDelete: (tierId: number) => void;
  filters: {
    member_name: string;
    quota_amount: string;
    start_date: string;
    end_date: string;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFilters: () => void;
}

const TierTable: React.FC<TierTableProps> = ({
  tiers,
  onEdit,
  onDelete,
  filters,
  onFilterChange,
  onClearFilters
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Input
          name="member_name"
          placeholder="Filtrar por sócio"
          value={filters.member_name}
          onChange={onFilterChange}
        />
        <Input
          name="quota_amount"
          placeholder="Filtrar por valor"
          value={filters.quota_amount}
          onChange={onFilterChange}
        />
        <Input
          name="start_date"
          type="date"
          value={filters.start_date}
          onChange={onFilterChange}
        />
        <Input
          name="end_date"
          type="date"
          value={filters.end_date}
          onChange={onFilterChange}
        />
      </div>
      <div className="flex justify-end mb-2">
        <Button variant="ghost" onClick={onClearFilters}>Limpar filtros</Button>
      </div>
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-jarvis.panel">
            <th className="p-2">Sócio</th>
            <th className="p-2">Valor Quota</th>
            <th className="p-2">Início</th>
            <th className="p-2">Fim</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => (
            <tr key={tier.tier_id} className="border-b border-jarvis.panel hover:bg-jarvis.bg/30">
              <td className="p-2">{tier.member_name}</td>
              <td className="p-2">{Number(tier.quota_amount).toFixed(2)}</td>
              <td className="p-2">{tier.start_date}</td>
              <td className="p-2">{tier.end_date}</td>
              <td className="p-2 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit(tier)}>
                  <Pencil size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(tier.tier_id)}>
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TierTable;
