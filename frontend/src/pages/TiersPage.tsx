import React, { useEffect, useState } from 'react';
import TierFormModal from '../components/member-tiers/TierFormModal';
import TierTable from '../components/member-tiers/TierTable';
import axios from 'axios';
import { Button } from '..//components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TiersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tiers, setTiers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      // Se o utilizador não estiver autenticado, redireciona
      navigate('/login');
      return;
    }
    fetchTiers();
  }, [user]);

  const fetchTiers = async () => {
    try {
      const res = await axios.get('/api/tiers');
      setTiers(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/login');
      } else {
        toast.error('Erro ao carregar escalões.');
      }
    }
  };

  const handleDelete = async (tier: any) => {
    if (!confirm('Deseja realmente desativar este escalão?')) return;
    try {
      await axios.delete(`/api/tiers/${tier.tier_id}`);
      toast.success('Escalão removido.');
      fetchTiers();
    } catch (err) {
      toast.error('Erro ao remover escalão.');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-jarvis.text">Escalões de Quota</h2>
        <Button onClick={() => { setEditData(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Novo Escalão
        </Button>
      </div>

      <TierTable
        tiers={tiers}
        onEdit={(tier) => { setEditData(tier); setShowModal(true); }}
        onDelete={handleDelete}
      />

      <TierFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={fetchTiers}
        editData={editData}
      />
    </div>
  );
};

export default TiersPage;
