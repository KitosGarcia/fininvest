import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '../../lib/utils';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface ContributionItem {
  mes: string;
  valor: number;
  status: string;
  amount_paid?: number;
}

interface YearlyStatus {
  ano: number;
  quotas: ContributionItem[];
  taxas: ContributionItem[];
  statusAno: 'apto' | 'inapto';
  totalQuotaPaid: number;
  totalQuotaDue: number;
  totalTaxaPaid: number;
  totalTaxaDue: number;
  participacaoAno: number;
}

interface MemberStatusData {
  totalQuotasPagas: number;
  totalQuotasFundo: number;
  participacao: number;
  apto: boolean;
  anos: YearlyStatus[];
  nome?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: number;
}

const MemberContributionStatusModal: React.FC<Props> = ({ isOpen, onClose, memberId }) => {
  const [data, setData] = useState<MemberStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (isOpen && memberId) {
      setLoading(true);
      setTimeoutReached(false);

      const timeout = setTimeout(() => {
        setTimeoutReached(true);
        setLoading(false);
        toast.error('Tempo de carregamento excedido.');
      }, 30000);

      api.get(`/contributions/status/${memberId}`)
        .then((res) => {
          clearTimeout(timeout);

          const enrichedAnos = res.data.anos.map((ano: YearlyStatus) => {
            const totalQuotaPaid = ano.quotas.reduce((acc, q) => acc + (q.amount_paid || 0), 0);
            const totalQuotaDue = ano.quotas.reduce((acc, q) => acc + (q.valor || 0), 0);
            const totalTaxaPaid = ano.taxas.reduce((acc, t) => acc + (t.amount_paid || 0), 0);
            const totalTaxaDue = ano.taxas.reduce((acc, t) => acc + (t.valor || 0), 0);
            const participacaoAno = res.data.totalQuotasFundo ? totalQuotaPaid / res.data.totalQuotasFundo : 0;
            return {
              ...ano,
              totalQuotaPaid,
              totalQuotaDue,
              totalTaxaPaid,
              totalTaxaDue,
              participacaoAno,
            };
          });

          setData({ ...res.data, anos: enrichedAnos });
        })
        .catch(() => {
          clearTimeout(timeout);
          toast.error('Erro ao buscar estado de contribuições');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, memberId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-6xl bg-jarvis.bg text-jarvis.text max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Estado das Contribuições do Sócio</DialogTitle>
          <DialogDescription>
            Visualização detalhada das quotas e taxas ao longo dos anos.
          </DialogDescription>
          {data?.nome && <p className="text-sm mt-1">Nome: {data.nome}</p>}
        </DialogHeader>

        {loading ? (
          <div className="text-center py-10">A carregar...</div>
        ) : !data ? (
          <div className="text-center py-10 text-red-400">
            {timeoutReached ? 'Tempo esgotado.' : 'Dados não disponíveis.'}
          </div>
        ) : (
          <div className="mt-2 space-y-4">
            <div className="bg-jarvis.panel rounded p-4 text-sm space-y-1">
              <div className="flex items-center gap-2">
                <strong>Participação no Fundo:</strong>
                {(data.participacao * 100).toFixed(2)}%
              </div>
              <div className="flex items-center gap-2">
                <strong>Total de Quotas Pagas:</strong>
                {formatCurrency(data.totalQuotasPagas)}
              </div>
              <div className="flex items-center gap-2">
                <strong>Status Geral:</strong>
                {data.apto ? (
                  <Badge className="bg-green-700">Apto</Badge>
                ) : (
                  <Badge className="bg-red-700">Inapto</Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue={data.anos[0]?.ano.toString()} className="mt-4">
              <TabsList className="flex flex-wrap gap-2">
                {data.anos.map((ano) => (
                  <TabsTrigger key={ano.ano} value={ano.ano.toString()}>{ano.ano}</TabsTrigger>
                ))}
                <TabsTrigger value="geral">Geral</TabsTrigger>
              </TabsList>

              {data.anos.map((ano) => (
                <TabsContent key={ano.ano} value={ano.ano.toString()} className="pt-4">
                  <div className="text-sm mb-2 space-y-1">
                    <div><strong>Ano:</strong> {ano.ano}</div>
                    <div><strong>Participação no Fundo ({ano.ano}):</strong> {(ano.participacaoAno * 100).toFixed(2)}%</div>
                    <div><strong>Total de Quotas Pagas:</strong> {formatCurrency(ano.totalQuotaPaid)}</div>
                    <div><strong>Total de Taxas Pagas:</strong> {formatCurrency(ano.totalTaxaPaid)}</div>
                    <div><strong>Por Pagar Quotas:</strong> {formatCurrency(ano.totalQuotaDue - ano.totalQuotaPaid)}</div>
                    <div><strong>Por Pagar Taxas:</strong> {formatCurrency(ano.totalTaxaDue - ano.totalTaxaPaid)}</div>
                    <div className="flex items-center gap-2">
                      <strong>Status do Ano:</strong>
                      {ano.statusAno === 'apto' ? <Badge className="bg-green-700">Apto</Badge> : <Badge className="bg-red-700">Inapto</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Quotas */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Quotas</h3>
                      <table className="w-full text-left text-sm border">
                        <thead>
                          <tr className="bg-jarvis.panel">
                            <th className="px-2 py-1">Mês</th>
                            <th className="px-2 py-1">Valor</th>
                            <th className="px-2 py-1">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ano.quotas.map((q, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-2 py-1">{q.mes}</td>
                              <td className="px-2 py-1">{formatCurrency(q.valor)}</td>
                              <td className="px-2 py-1">
                                {q.status === 'pago' ? <Badge className="bg-green-600">Pago</Badge> : <Badge className="bg-yellow-600">{q.status}</Badge>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Taxas */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Taxas</h3>
                      <table className="w-full text-left text-sm border">
                        <thead>
                          <tr className="bg-jarvis.panel">
                            <th className="px-2 py-1">Mês</th>
                            <th className="px-2 py-1">Valor</th>
                            <th className="px-2 py-1">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ano.taxas.map((t, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-2 py-1">{t.mes}</td>
                              <td className="px-2 py-1">{formatCurrency(t.valor)}</td>
                              <td className="px-2 py-1">
                                {t.status === 'pago' ? <Badge className="bg-green-600">Pago</Badge> : <Badge className="bg-yellow-600">{t.status}</Badge>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              ))}

              <TabsContent value="geral" className="pt-4">
                <div className="text-sm space-y-2">
                  <div><strong>Total de Quotas Pagas:</strong> {formatCurrency(data.totalQuotasPagas)}</div>
                  <div><strong>Por Pagar Quotas:</strong> {formatCurrency(
                    data.anos.reduce((sum, a) => sum + (a.totalQuotaDue - a.totalQuotaPaid), 0)
                  )}</div>
                  <div><strong>Por Pagar Taxas:</strong> {formatCurrency(
                    data.anos.reduce((sum, a) => sum + (a.totalTaxaDue - a.totalTaxaPaid), 0)
                  )}</div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemberContributionStatusModal;
