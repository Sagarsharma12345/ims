import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/fetchApi';
import Card from '../components/Card';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!product) return null;

  return (
    <div>
      <Link to="/products" className="text-sm text-indigo-600">Back</Link>
      <h2 className="mb-4 mt-2 text-xl font-semibold">{product.name}</h2>
      <Card>
        <div className="space-y-2 px-4 py-3 text-sm">
          <p><span className="text-gray-500">SKU:</span> {product.sku}</p>
          <p><span className="text-gray-500">Price:</span> {formatINR(product.price)}</p>
          <p className="flex items-center gap-2">
            <span className="text-gray-500">Stock:</span> <StatusBadge stock={product.quantity_in_stock} />
          </p>
        </div>
      </Card>
    </div>
  );
}
