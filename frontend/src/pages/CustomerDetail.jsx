import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCustomer } from '../api/fetchApi';
import Card from '../components/Card';
import Loading from '../components/Loading';
import { useToast } from '../context/ToastContext';

export default function CustomerDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomer(id)
      .then(setCustomer)
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!customer) return null;

  return (
    <div>
      <Link to="/customers" className="text-sm text-indigo-600">Back</Link>
      <h2 className="mb-4 mt-2 text-xl font-semibold">{customer.full_name}</h2>
      <Card>
        <div className="space-y-2 px-4 py-3 text-sm">
          <p><span className="text-gray-500">Email:</span> {customer.email}</p>
          <p><span className="text-gray-500">Phone:</span> {customer.phone}</p>
        </div>
      </Card>
    </div>
  );
}
