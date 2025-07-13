
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { Edit, Save, X, MapPin, Mail, Phone, Building2, FileText, Globe, Calendar } from "lucide-react"

export default function BusinessProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [businessProfile, setBusinessProfile] = useState({
    businessName: "TechSolutions Pvt Ltd",
    logo: "/placeholder.svg?height=120&width=120",
    gstNumber: "27AABCT1332L1ZZ",
    address: "123 Business Park, Sector 18\nGurgaon, Haryana - 122015\nIndia",
    contactNumber: "+91 98765 43210",
    email: "contact@techsolutions.com",
    website: "https://www.techsolutions.com",
    businessType: "Information Technology",
    establishedYear: "2018",
    description:
      "Leading IT solutions provider specializing in web development, mobile applications, and digital transformation services. We help businesses leverage technology to achieve their goals.",
    services: ["Web Development", "Mobile Apps", "Cloud Solutions", "Digital Marketing", "IT Consulting"],
  })

  const [editedProfile, setEditedProfile] = useState({ ...businessProfile })



    useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/business/getprofile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("Fetched team:", response.data)
        setBusinessProfile(response.data.profile)
      } catch (error) {
        console.error("Error fetching team:", error)
      }
    }

    fetchProfile()
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile({ ...businessProfile })
  }

  const handleSave = () => {
    setBusinessProfile({ ...editedProfile })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile({ ...businessProfile })
    setIsEditing(false)
  }

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleServicesChange = (value) => {
    const servicesArray = value
      .split(",")
      .map((service) => service.trim())
      .filter((service) => service)
    setEditedProfile((prev) => ({
      ...prev,
      services: servicesArray,
    }))
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Business Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="w-28 h-28 rounded-lg">
                <AvatarImage src={"/logo.png"} alt={businessProfile.businessName} />
                <AvatarFallback className="text-2xl rounded-lg bg-blue-100 text-blue-600">
                  {businessProfile.businessName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">{businessProfile.businessName}</CardTitle>
                <CardDescription className="text-lg">{businessProfile.businessType}</CardDescription>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Est. {businessProfile.establishedYear}
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    GST: {businessProfile.gstNumber}
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={isEditing ? handleCancel : handleEdit}
              className="bg-white text-black border-gray-300 hover:bg-gray-50"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={editedProfile.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input
                        id="businessType"
                        value={editedProfile.businessType}
                        onChange={(e) => handleInputChange("businessType", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={editedProfile.gstNumber}
                        onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                        placeholder="27AABCT1332L1ZZ"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="establishedYear">Established Year</Label>
                      <Input
                        id="establishedYear"
                        value={editedProfile.establishedYear}
                        onChange={(e) => handleInputChange("establishedYear", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      value={editedProfile.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">GST Number</h4>
                      <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border">
                        {businessProfile.gstNumber}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">Established</h4>
                      <p className="text-sm">{businessProfile.establishedYear}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">About Business</h4>
                    <p className="text-muted-foreground leading-relaxed">{businessProfile.description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={editedProfile.contactNumber}
                      onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={editedProfile.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{businessProfile.contactNumber}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{businessProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={businessProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {businessProfile.website}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Address */}
          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="address">Complete Address</Label>
                  <Textarea
                    id="address"
                    value={editedProfile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={4}
                    className="mt-1"
                    placeholder="Street Address, City, State - PIN Code, Country"
                  />
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="text-sm leading-relaxed whitespace-pre-line">{businessProfile.address}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button for Edit Mode */}
          {isEditing && (
            <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
