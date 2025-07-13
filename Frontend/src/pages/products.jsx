import { useEffect, useState } from "react";

// Sample/mock product data
const mockProducts = [
  {
    _id: "p1",
    name: "Paracetamol 500mg",
    baseUnit: "tablet",
    unitsPerPack: 10,
    pricePerUnit: 2.5,
    pricePerPack: 25,
    gstPercent: 5,
    batches: [
      {
        _id: "b1",
        batchNumber: "P500A",
        expiryDate: "2025-12-31",
        stock: 150,
      },
      {
        _id: "b2",
        batchNumber: "P500B",
        expiryDate: "2024-08-01",
        stock: 10,
      }
    ]
  },
  {
    _id: "p2",
    name: "Cough Syrup 100ml",
    baseUnit: "ml",
    unitsPerPack: 100,
    pricePerUnit: 0.75,
    pricePerPack: 75,
    gstPercent: 12,
    batches: [
      {
        _id: "b3",
        batchNumber: "CS101",
        expiryDate: "2024-07-10",
        stock: 400,
      }
    ]
  }
];

function isNearExpiry(dateStr) {
  const expiry = new Date(dateStr);
  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);
  return expiry <= oneMonthFromNow;
}

export default function AdminInventoryTable() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Simulate API call
    setProducts(mockProducts);
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Inventory Dashboard</h2>
      <table className="w-full border-collapse shadow-md rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Medicine</th>
            <th className="border px-4 py-2">Batch</th>
            <th className="border px-4 py-2">Expiry</th>
            <th className="border px-4 py-2">Stock</th>
            <th className="border px-4 py-2">Price</th>
            <th className="border px-4 py-2">GST</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) =>
            product.batches.map((batch, i) => (
              <tr key={batch._id} className="border">
                {i === 0 && (
                  <td
                    className="border px-4 py-2 font-medium"
                    rowSpan={product.batches.length}
                  >
                    {product.name}
                  </td>
                )}
                <td className="border px-4 py-2 text-center">{batch.batchNumber}</td>
                <td
                  className={`border px-4 py-2 text-center ${
                    isNearExpiry(batch.expiryDate)
                      ? "text-red-600 font-semibold"
                      : "text-gray-800"
                  }`}
                >
                  {batch.expiryDate}
                </td>
                <td className="border px-4 py-2 text-center">
                  {batch.stock} {product.baseUnit}
                  {batch.stock < 20 && (
                    <span className="ml-2 text-xs text-yellow-600 font-semibold">
                      Low
                    </span>
                  )}
                </td>
                <td className="border px-4 py-2 text-center">
                  ₹{product.pricePerUnit} / ₹{product.pricePerPack}
                </td>
                <td className="border px-4 py-2 text-center">
                  {product.gstPercent}%
                </td>
                <td className="border px-4 py-2 text-center space-x-2">
                  <button className="text-blue-600 hover:underline">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
