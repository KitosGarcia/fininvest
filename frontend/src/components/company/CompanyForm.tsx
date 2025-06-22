// 📁 src/components/company/CompanyForm.tsx
import { useState } from "react";
import axios from "../../services/api";

export default function CompanyForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    nif: "",
    email: "",
    phone: "",
    address: "",
    website: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/company", formData);
      alert("Dados salvos com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar dados", err);
      alert("Erro ao salvar os dados.");
    }
  };

  const fields = [
    { name: "name", label: "Nome da Empresa" },
    { name: "nif", label: "NIF" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Telefone" },
    { name: "address", label: "Morada" },
    { name: "website", label: "Website" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block mb-1">{field.label}</label>
          <input
            type="text"
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className="w-full p-2 bg-blue-900 text-white rounded border border-blue-700"
          />
        </div>
      ))}
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </form>
  );
}
