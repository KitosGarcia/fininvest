interface Props { data: any }

export default function CompanyView({ data }: Props) {
  if (!data) return <p className="text-gray-400">Nenhum dado disponível.</p>;

  const fields = [
    ["Nome", data.name],
    ["NIF", data.nif],
    ["Email", data.email],
    ["Telefone", data.phone],
    ["Morada", data.address],
    ["Website", data.website]
  ];

  return (
    <div className="bg-blue-900/50 p-6 rounded-lg shadow max-w-xl space-y-3">
      {fields.map(([label, value]) => (
        <div key={label} className="flex justify-between border-b border-blue-800 py-1">
          <span className="font-medium text-blue-200">{label}</span>
          <span>{value || <span className="text-gray-500">—</span>}</span>
        </div>
      ))}
    </div>
  );
}
