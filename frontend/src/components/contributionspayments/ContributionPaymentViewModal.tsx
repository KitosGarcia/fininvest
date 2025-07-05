import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { getByContribution, ContributionPayment } from '../../services/contributionPaymentService';
import { DocumentArrowDownIcon, EyeIcon } from '@heroicons/react/24/outline';
import { generateReceipt } from '../../services/generateReceiptService'; // já criado anteriormente
import clsx from 'clsx';
import dayjs from 'dayjs';

const fmtKz = (n) =>
  Number(n)
    .toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/\./g, " ");   // troca ponto (milhar) por espaço

interface Props {
  open: boolean;
  onClose: () => void;
  contributionId: number;
  contributionAmount: number; // valor total devido
}

export default function ContributionPaymentViewModal({
  open,
  onClose,
  contributionId,
  contributionAmount
}: Props) {
  const [payments, setPayments] = useState<ContributionPayment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getByContribution(contributionId);
        setPayments(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, contributionId]);

const totalPaid   = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
const outstanding = Number(contributionAmount) - totalPaid;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-jarvis.panel/100 p-6 shadow-2xl backdrop-blur">
              <Dialog.Title className="text-lg font-semibold text-jarvis.accent mb-4">
                Pagamentos da Contribuição #{contributionId}
              </Dialog.Title>

              {loading ? (
                <p className="text-center text-jarvis.text">Carregando...</p>
              ) : payments.length === 0 ? (
                <p className="text-center text-jarvis.text/70">
                  Nenhum pagamento registrado para esta contribuição.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-jarvis.text/90">
                    <thead>
                      <tr className="text-left uppercase tracking-wider text-xs text-jarvis.text/60">
                        <th className="px-3 py-2">Data</th>
                        <th className="px-3 py-2">Método</th>
                        <th className="px-3 py-2">Valor</th>
                        <th className="px-3 py-2">Recibo</th>
                        <th className="px-3 py-2">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.payment_id} className="border-b border-jarvis.text/10">
                          <td className="px-3 py-2">
                            {dayjs(p.payment_date).format('DD/MM/YYYY')}
                          </td>
                          <td className="px-3 py-2">{p.method}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {fmtKz(p.amount)} Kz
                          </td>
                          <td className="px-3 py-2">
                            {p.receipt_url ? (
                              <a
                                href={p.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 hover:underline"
                              >
                                <EyeIcon className="h-4 w-4" />
                                ver
                              </a>
                            ) : (
                              <button
                                onClick={() => generateReceipt(p.payment_id)}
                                className="inline-flex items-center gap-1 hover:underline"
                              >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                gerar
                              </button>
                            )}
                          </td>
                          <td className="px-3 py-2">{p.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold">
                        <td colSpan={2} className="px-3 py-2 text-right">
                          Total pago:
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {fmtKz(totalPaid)} Kz
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                      <tr
                        className={clsx(
                          'font-semibold',
                          outstanding > 0 ? 'text-yellow-400' : 'text-green-400'
                        )}
                      >
                        <td colSpan={2} className="px-3 py-2 text-right">
                          Saldo em aberto:
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {fmtKz(outstanding)} Kz
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="mt-6 text-right">
                <button
                  onClick={onClose}
                  className="rounded bg-jarvis.accent/80 px-4 py-2 text-jarvis.bg hover:bg-jarvis.accent"
                >
                  Fechar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
