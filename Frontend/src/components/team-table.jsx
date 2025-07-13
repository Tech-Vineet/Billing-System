"use client"

import { useState, useEffect } from "react"
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

export default function TeamTable() {
  const [Team, setTeam] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "" })

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Fetched team:", response.data)
        setTeam(response.data.users)
      } catch (error) {
        console.error("Error fetching team:", error)
      }
    }

    fetchTeam()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const userPayload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    }

    try {
      const token = localStorage.getItem("token")

      if (editingTeam) {
        // Edit existing user
        await axios.put(
          `${import.meta.env.VITE_API_URL}/users/update/${editingTeam._id}`,
          userPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setTeam((prev) =>
          prev.map((user) =>
            user._id === editingTeam._id ? { ...user, ...userPayload } : user
          )
        )
      } else {
        // Add new user
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/users/add`,
          userPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const createdUser = res.data.user || res.data // Adjust depending on API
        setTeam((prev) => [...prev, createdUser])
      }
    } catch (err) {
      console.error("API Error:", err)
    }

    setFormData({ name: "", email: "", password: "", role: "" })
    setEditingTeam(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (user) => {
    setEditingTeam(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Leave password blank on edit
      role: user.role,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTeam((prev) => prev.filter((user) => user._id !== id))
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleAddNew = () => {
    setEditingTeam(null)
    setFormData({ name: "", email: "", password: "", role: "" })
    setIsDialogOpen(true)
  }

  return (
    <div className="p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Manage Team</CardTitle>
              <p className="text-muted-foreground">Manage and track all your Team in one place</p>
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
                  <DialogTitle>{editingTeam ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required={!editingTeam} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" name="role" value={formData.role} onChange={handleInputChange} required />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingTeam ? "Update User" : "Add User"}</Button>
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
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Team.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user._id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user)} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user._id)}
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
          <div className="mt-4 text-sm text-muted-foreground">Showing {Team.length} users</div>
        </CardContent>
      </Card>
    </div>
  )
}

