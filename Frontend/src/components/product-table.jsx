import { useState, useEffect } from "react"
import { Calendar, Package, AlertTriangle, CheckCircle } from "lucide-react"
import axios from "axios"

export default function Component() {
  const [hoveredMedicine, setHoveredMedicine] = useState(null)
  const [Medicalitems, setMedicalItems] = useState([])


  useEffect(() => {
    const fetchMedicalItems = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/item/getallItems`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Fetched team:", response.data.items)
        setMedicalItems(response.data.items)
      } catch (error) {
        console.error("Error fetching team:", error)
      }
    }

    fetchMedicalItems()
  }, [])

  // Sample medicine data with batches
  // const medicines = [
  //   {
  //     id: 1,
  //     name: "Paracetamol 500mg",
  //     category: "Analgesic",
  //     manufacturer: "PharmaCorp",
  //     totalStock: 450,
  //     batches: [
  //       {
  //         batchNo: "PCM001",
  //         expiryDate: "2025-08-15",
  //         quantity: 200,
  //         manufacturingDate: "2023-08-15",
  //         status: "good",
  //       },
  //       {
  //         batchNo: "PCM002",
  //         expiryDate: "2025-12-20",
  //         quantity: 150,
  //         manufacturingDate: "2023-12-20",
  //         status: "good",
  //       },
  //       {
  //         batchNo: "PCM003",
  //         expiryDate: "2024-06-10",
  //         quantity: 100,
  //         manufacturingDate: "2022-06-10",
  //         status: "expiring",
  //       },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: "Amoxicillin 250mg",
  //     category: "Antibiotic",
  //     manufacturer: "MediLife",
  //     totalStock: 320,
  //     batches: [
  //       {
  //         batchNo: "AMX101",
  //         expiryDate: "2025-03-22",
  //         quantity: 180,
  //         manufacturingDate: "2023-03-22",
  //         status: "good",
  //       },
  //       {
  //         batchNo: "AMX102",
  //         expiryDate: "2025-07-18",
  //         quantity: 140,
  //         manufacturingDate: "2023-07-18",
  //         status: "good",
  //       },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     name: "Ibuprofen 400mg",
  //     category: "Anti-inflammatory",
  //     manufacturer: "HealthPlus",
  //     totalStock: 275,
  //     batches: [
  //       {
  //         batchNo: "IBU201",
  //         expiryDate: "2024-04-30",
  //         quantity: 75,
  //         manufacturingDate: "2022-04-30",
  //         status: "expiring",
  //       },
  //       {
  //         batchNo: "IBU202",
  //         expiryDate: "2025-09-12",
  //         quantity: 200,
  //         manufacturingDate: "2023-09-12",
  //         status: "good",
  //       },
  //     ],
  //   },
  //   {
  //     id: 4,
  //     name: "Cetirizine 10mg",
  //     category: "Antihistamine",
  //     manufacturer: "AllerCare",
  //     totalStock: 180,
  //     batches: [
  //       {
  //         batchNo: "CET301",
  //         expiryDate: "2025-11-05",
  //         quantity: 120,
  //         manufacturingDate: "2023-11-05",
  //         status: "good",
  //       },
  //       {
  //         batchNo: "CET302",
  //         expiryDate: "2024-02-28",
  //         quantity: 60,
  //         manufacturingDate: "2022-02-28",
  //         status: "expired",
  //       },
  //     ],
  //   },
  //   {
  //     id: 5,
  //     name: "Omeprazole 20mg",
  //     category: "Proton Pump Inhibitor",
  //     manufacturer: "GastroMed",
  //     totalStock: 95,
  //     batches: [
  //       {
  //         batchNo: "OMP401",
  //         expiryDate: "2025-06-14",
  //         quantity: 95,
  //         manufacturingDate: "2023-06-14",
  //         status: "good",
  //       },
  //     ],
  //   },
  // ]

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-50"
      case "expiring":
        return "text-yellow-600 bg-yellow-50"
      case "expired":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-4 h-4" />
      case "expiring":
      case "expired":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Inventory</h1>
        <p className="text-gray-600">Hover over any medicine to view batch details</p>
      </div>

      <div className="space-y-4">
        {Medicalitems.map((medicine) => (
          <div
            key={medicine.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
            onMouseEnter={() => setHoveredMedicine(medicine.id)}
            onMouseLeave={() => setHoveredMedicine(null)}
          >
            {/* Medicine Header */}
            <div className="p-6 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {medicine.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Manufacturer: {medicine.manufacturer}</span>
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Total Stock: {medicine.totalStock} units
                    </span>
                    <span>
                      {medicine.batches.length} batch{medicine.batches.length > 1 ? "es" : ""}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{medicine.totalStock}</div>
                  <div className="text-sm text-gray-500">units available</div>
                </div>
              </div>
            </div>

            {/* Batch Details - Show on Hover */}
            {hoveredMedicine === medicine.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-6 animate-in slide-in-from-top-2 duration-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Batch Details
                </h4>
                <div className="grid gap-3">
                  {Medicalitems[0].batches.map((batch, index) => (
                    <div
                      key={batch.batchNumber}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-gray-900">{batch.batchNumber}</span>
                          {/* <span
                            className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(batch.status)}`}
                          >
                            {getStatusIcon(batch.status)}
                            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                          </span> */}
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{batch.stockQuantity} units</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* <div>
                          <span className="text-gray-500">Manufacturing Date:</span>
                          <div className="font-medium text-gray-900">{formatDate(batch.manufacturingDate)}</div>
                        </div> */}
                        <div>
                          <span className="text-gray-500">Expiry Date:</span>
                          <div
                            className={`font-medium ${batch.status === "expired" ? "text-red-600" : batch.status === "expiring" ? "text-yellow-600" : "text-gray-900"}`}
                          >
                            {formatDate(batch.expiryDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Total Medicines</h3>
          </div>
          <div className="text-2xl font-bold text-blue-600">{Medicalitems.length}</div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Total Stock</h3>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Medicalitems.reduce((total, medicine) => total + medicine.totalStock, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Total Batches</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {Medicalitems.reduce((total, medicine) => total + medicine.batches.length, 0)}
          </div>
        </div>
      </div>
    </div>
  )
}
