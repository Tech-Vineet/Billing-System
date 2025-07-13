import { useEffect, useState } from "react";
import axios from "axios";

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/getall`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoices(res.data);
      } catch (err) {
        console.error("Failed to load invoices", err);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Invoice History</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Bill No</th>
            <th className="border px-4 py-2">Customer Name</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv._id}>
              <td className="border px-4 py-2">{inv.billNo}</td>
              <td className="border px-4 py-2">{inv.customer?.name || '-'}</td>
              <td className="border px-4 py-2">{new Date(inv.date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">₹{inv.finalAmount.toFixed(2)}</td>
              <td className="border px-4 py-2">
                <a
                  href={`http://localhost:3000${inv.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                  download
                >
                  Download PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
