"use client"

import type React from "react"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "",
      })
    }, 1500)
  }

  return (
    <PageLayout title="Contact Us" description="Get in touch with the ABU Tiket team for support and inquiries">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-[#006400] mb-4">Get in Touch</h2>
          <p className="text-gray-700 mb-6">
            Have questions or need assistance? Our support team is here to help. Fill out the form and we'll get back to
            you as soon as possible.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <Phone className="h-5 w-5 mr-3 text-[#006400] mt-0.5" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-gray-600">+234 8012 345 678</p>
                <p className="text-gray-600">+234 9087 654 321</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 text-[#006400] mt-0.5" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600">support@abutiket.edu.ng</p>
                <p className="text-gray-600">info@abutiket.edu.ng</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 text-[#006400] mt-0.5" />
              <div>
                <h3 className="font-medium">Office</h3>
                <p className="text-gray-600">Transport Unit, Main Campus</p>
                <p className="text-gray-600">Ahmadu Bello University, Zaria</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-3 text-[#006400] mt-0.5" />
              <div>
                <h3 className="font-medium">Office Hours</h3>
                <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#e6f2e6] rounded-md">
            <h3 className="font-medium text-[#006400] mb-2">Emergency Contact</h3>
            <p className="text-sm text-gray-700">
              For urgent matters outside office hours, please call our 24/7 emergency line:
            </p>
            <p className="text-[#006400] font-medium mt-1">+234 800 ABU HELP (800 228 4357)</p>
          </div>
        </div>

        <div>
          {submitted ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                <h3 className="font-medium text-green-800 mb-2">Message Sent!</h3>
                <p>Thank you for contacting us. We have received your message and will get back to you shortly.</p>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Booking Inquiry</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter the subject of your message"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your message"
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#006400] hover:bg-[#005000]" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
