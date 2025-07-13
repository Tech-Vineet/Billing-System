import { useState, useEffect } from "react"
import axios from "axios"
import { Plus, Minus, Receipt } from "lucide-react"

export default function CreateInvoice() {
  const [customerType, setCustomerType] = useState("visitor")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [businessCustomers, setBusinessCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [invoiceProducts, setInvoiceProducts] = useState([{
    id: Date.now(),
    productId: "",
    batchId: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    subtotal: 0
  }])
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [invoiceSummary, setInvoiceSummary] = useState({
    grossAmount: 0,
    totalDiscount: 0,
    gstAmount: 0,
    finalTotal: 0
  })
  const [customerDetails, setCustomerDetails] = useState({ name: "", contact: "", gst: "", address: "", age: "", prescribedDoctor: "" })

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/b2bCustomer/getall`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBusinessCustomers(response.data.data || [])
      } catch (error) {
        console.error("Error fetching customers:", error)
      }
    }

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/item/getallItems`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProducts(response.data.items || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchCustomers()
    fetchProducts()
  }, [])

  const handleCustomerTypeChange = (type) => {
    setCustomerType(type)
    setSelectedCustomerId("")
    setCustomerDetails({ name: "", contact: "", gst: "", address: "", age: "", prescribedDoctor: "" })
  }

  const handleCustomerSelect = (id) => {
    setSelectedCustomerId(id)
    const customer = businessCustomers.find(c => c._id === id)
    if (customer) {
      setCustomerDetails({
        name: customer.name,
        contact: customer.contact || "",
        gst: customer.gstNumber || "",
        address: customer.address || "",
        age: customer.age || "",
        prescribedDoctor: customer.prescribedDoctor || ""
      })
    }
  }

  const updateProduct = (id, field, value) => {
    setInvoiceProducts(current =>
      current.map(p => {
        if (p.id !== id) return p
        const updated = { ...p, [field]: value }

        if (field === "productId") {
          updated.batchId = ""
          updated.unitPrice = 0
        }

        if (field === "batchId") {
          const product = products.find(prod => prod._id === updated.productId)
          const batch = product?.batches.find(b => b._id === value)
          updated.unitPrice = batch?.price || 0
          updated.discount = batch?.discount || 0
        }

        const qty = parseFloat(updated.quantity) || 0
        const price = parseFloat(updated.unitPrice) || 0
        const discount = parseFloat(updated.discount) || 0
        updated.subtotal = qty * price * (1 - discount / 100)

        return updated
      })
    )
  }

  const calculateSummary = () => {
    const gross = invoiceProducts.reduce((acc, p) => acc + p.subtotal, 0)
    const discount = invoiceProducts.reduce((acc, p) => acc + ((p.quantity * p.unitPrice * p.discount) / 100), 0)
    const gst = gross * 0.18
    const final = gross + gst
    setInvoiceSummary({ grossAmount: gross, totalDiscount: discount, gstAmount: gst, finalTotal: final })
  }

  useEffect(() => { calculateSummary() }, [invoiceProducts])

  const addProduct = () => {
    setInvoiceProducts([...invoiceProducts, {
      id: Date.now(), productId: "", batchId: "", quantity: 1, unitPrice: 0, discount: 0, subtotal: 0
    }])
  }

  const removeProduct = (id) => {
    if (invoiceProducts.length > 1) setInvoiceProducts(invoiceProducts.filter(p => p.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      mode: customerType === "b2b" ? "b2b" : "b2c",
      ...(customerType === "b2b"
        ? { b2bCustomerId: selectedCustomerId }
        : {
            b2cCustomer: {
              name: customerDetails.name,
              contact: customerDetails.contact,
              age: Number(customerDetails.age) || 0,
              prescribedDoctor: customerDetails.prescribedDoctor || ""
            }
          }),
      items: invoiceProducts.map(p => {
        const product = products.find(prod => prod._id === p.productId)
        const batch = product?.batches.find(b => b._id === p.batchId)
        return {
          itemId: p.productId,
          batchNumber: batch?.batchNumber || "",
          quantity: Number(p.quantity),
          quantityType: "unit"
        }
      })
    }

    try {
  const token = localStorage.getItem("token");
  const response = await axios.post("http://localhost:3000/api/transactions/create", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

  alert("Invoice created successfully!");
  console.log(response.data);

  const pdfUrl = `http://localhost:3000${response.data.pdfUrl}`;
  const pdfWindow = window.open(pdfUrl, "_blank");

  if (!pdfWindow) {
    alert("Popup blocked! Please allow popups to view the invoice.");
  }
} catch (error) {
  console.error("Error creating invoice:", error);
  alert("Failed to create invoice");
}
  }
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
         <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Invoice</h1>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
 <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Customer Type</h2>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="customerType"
                  value="visitor"
                  checked={customerType === "visitor"}
                  onChange={(e) => handleCustomerTypeChange(e.target.value)}
                  className="mr-2"
                />
                <span className="text-lg">Walk-in Customer</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="customerType"
                  value="b2b"
                  checked={customerType === "b2b"}
                  onChange={(e) => handleCustomerTypeChange(e.target.value)}
                  className="mr-2"
                />
                <span className="text-lg">B2B Customer</span>
              </label>
            </div>
          </div>

        <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Customer Details</h2>

            {customerType === "b2b" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Business Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a customer...</option>
                    {businessCustomers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.businessName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCustomerId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                      <input
                        type="text"
                        value={customerDetails.gst}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={customerDetails.address}
                        readOnly
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={customerDetails.contact}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, contact: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Products</h2>

          {invoiceProducts.map((p, i) => {
            const selectedProduct = products.find(prod => prod._id === p.productId)
            const selectedBatch = selectedProduct?.batches?.find(b => b._id === p.batchId)

            return (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded">
                <select
                  value={p.productId}
                  onChange={(e) => updateProduct(p.id, "productId", e.target.value)}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(prod => (
                    <option key={prod._id} value={prod._id}>
                      {prod.name} ({prod.unit})
                    </option>
                  ))}
                </select>

                <select
                  value={p.batchId || ""}
                  onChange={(e) => updateProduct(p.id, "batchId", e.target.value)}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Batch</option>
                  {selectedProduct?.batches?.map(batch => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchNumber} (₹{batch.price}) - Exp: {new Date(batch.expiryDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={p.quantity}
                  onChange={(e) => updateProduct(p.id, "quantity", e.target.value)}
                  className="p-2 border rounded"
                  placeholder="Quantity"
                />

                {/* <input
                  type="number"
                  min="0"
                  max="100"
                  value={p.discount}
                  onChange={(e) => updateProduct(p.id, "discount", e.target.value)}
                  className="p-2 border rounded"
                  placeholder="Discount %"
                /> */}

                <div className="flex flex-col justify-between">
                  <span className="font-medium">Subtotal: ₹{p.subtotal.toFixed(2)}</span>
                  {invoiceProducts.length > 1 && (
                    <button onClick={() => removeProduct(p.id)} className="text-red-600 text-sm">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={addProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">Invoice Summary</h2>
          <p>Gross Amount: ₹{invoiceSummary.grossAmount.toFixed(2)}</p>
          <p>Total Discount: ₹{invoiceSummary.totalDiscount.toFixed(2)}</p>
          <p>GST (18%): ₹{invoiceSummary.gstAmount.toFixed(2)}</p>
          <p className="font-bold text-lg">Final Total: ₹{invoiceSummary.finalTotal.toFixed(2)}</p>
        </div>

        <div>
          <label className="block mb-2">Payment Mode</label>
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="p-2 border">
            {["Cash", "Card", "UPI", "Credit"].map(mode => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </div>

        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Submit Invoice</button>
      </form>
    </div>
    </div>
  )
}
