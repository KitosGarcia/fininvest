import BankAccountTable from "../../components/bank-accounts/BankAccountTable";

export default function BankAccountPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Gestão de Contas Bancárias</h1>
      <BankAccountTable />
    </div>
  );
}
