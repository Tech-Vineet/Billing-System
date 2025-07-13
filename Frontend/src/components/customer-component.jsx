import { useState,useEffect } from "react"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Edit, Trash2 } from "lucide-react"

axios.defaults.withCredentials = true

export default function CustomerTable() {
  const [b2bcustomer, setb2bcustomer] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingb2bcustomer, setEditingb2bcustomer] = useState(null)
  const [formData, setFormData] = useState({ businessName: "", gstNumber: "",   contactPerson: "", contactNumber:"", email:"" , address:""})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

    useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/b2bCustomer/getall`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Fetched customer:", response.data.data)
        setb2bcustomer(response.data.data)
      } catch (error) {
        console.error("Error fetching customer:", error)
      }
    }

    fetchCustomer()
  }, [])

   const handleSubmit = async (e) => {
    e.preventDefault()

    const userPayload = {
      businessName: formData.name,
      gstNumber: formData.gstNumber,
      contactPerson : formData.contactPerson,
      email: formData.email,
      contactNumber: formData.email,
      address : formData.address
    }

    try {
      const token = localStorage.getItem("token")

      if (editingb2bcustomer) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/b2bCustomer/update/${editingb2bcustomer._id}`,
          userPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setb2bcustomer((prev) =>
          prev.map((user) =>
            user._id === editingb2bcustomer._id ? { ...user, ...userPayload } : user
          )
        )
      } else {
        // Add new user
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/b2bCustomer/create`,
          userPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const createdUser = res.data.user || res.data // Adjust depending on API
        setb2bcustomer((prev) => [...prev, createdUser])
      }
    } catch (err) {
      console.error("API Error:", err)
    }

    setFormData({ businessName: "", gstNumber: "", email: "", contactNumber: "", contactPerson:"", address:"" })
    setEditingb2bcustomer(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (customer) => {
    setEditingb2bcustomer(customer)
    setFormData({
      businessName: customer.businessName,
      gstnumber: customer.gstNumber,
      email: customer.email,
      contactNumber: customer.contactNumber,
      contactPerson:customer.contactPerson
    })
    setIsDialogOpen(true)
  }

   const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${import.meta.env.VITE_API_URL}/b2bCustomer/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setb2bcustomer((prev) => prev.filter((customer) => customer._id !== id))
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleAddNew = () => {
    setEditingb2bcustomer(null)
    setFormData({ businessName: "", gstNumber: "", email: "", contactNumber: "", contactPerson:"" })
    setIsDialogOpen(true)
  }

  return (
    <div className="p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Manage B2BCustomers</CardTitle>
              <p className="text-muted-foreground">Manage and track all your customers in one place</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingb2bcustomer ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={formData.businessName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst">GST Num</Label>
                    <Input id="gst" name="gst" value={formData.gstnumber} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Num</Label>
                    <Input id="phone" name="phone" value={formData.contactNumber} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingb2bcustomer ? "Update User" : "Add User"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Customer ID</TableHead>
                   <TableHead className="font-semibold">Name</TableHead>
                   <TableHead className="font-semibold">GST</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  {/* <TableHead className="font-semibold">Phone Num</TableHead> */}
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {b2bcustomer.map((customer) => (
                  <TableRow key={customer._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{customer._id}</TableCell>
                    <TableCell>{customer.businessName}</TableCell>
                    <TableCell>{customer.gstNumber}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    {/* <TableCell>{customer.contactNumber}</TableCell> */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(customer)} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(customer._id)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">Showing {b2bcustomer.length} users</div>
        </CardContent>
      </Card>
    </div>
  )
}