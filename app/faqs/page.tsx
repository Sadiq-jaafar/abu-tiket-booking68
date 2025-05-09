"use client"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter FAQs based on search term
  const filteredFaqs = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.faqs.length > 0)

  return (
    <PageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about ABU Tiket services"
    >
      <div className="space-y-6">
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search FAQs..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm && filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No FAQs found matching "{searchTerm}"</p>
            <p className="text-sm text-gray-400 mt-2">Try a different search term or browse by category</p>
          </div>
        ) : (
          <Tabs defaultValue="booking">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="booking">Booking</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="service">Services</TabsTrigger>
            </TabsList>

            {faqCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <h2 className="text-xl font-semibold text-[#006400] mb-4">{category.title}</h2>

                <Accordion type="single" collapsible className="w-full">
                  {(searchTerm ? filteredFaqs.find((c) => c.id === category.id)?.faqs : category.faqs).map(
                    (faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <div className="text-gray-700 space-y-2" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                        </AccordionContent>
                      </AccordionItem>
                    ),
                  )}
                </Accordion>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </PageLayout>
  )
}

const faqCategories = [
  {
    id: "booking",
    title: "Booking & Cancellation",
    faqs: [
      {
        question: "How do I book a shuttle?",
        answer:
          "To book a shuttle, go to the homepage and enter your departure and arrival locations, date, time, and number of passengers. Click on 'Search Shuttles' to see available options. Select your preferred shuttle and follow the booking process to complete your reservation.",
      },
      {
        question: "Can I modify my booking after it's confirmed?",
        answer:
          "Yes, you can modify your booking up to 2 hours before the scheduled departure time. Go to 'My Bookings' in your account, select the booking you want to modify, and click on 'Modify Booking'. Please note that changes are subject to availability.",
      },
      {
        question: "What is the cancellation policy?",
        answer:
          "You can cancel your booking for a full refund up to 2 hours before the scheduled departure time. Cancellations made within 2 hours of departure are not eligible for a refund. To cancel a booking, go to 'My Bookings' in your account and click on 'Cancel Booking'.",
      },
      {
        question: "How far in advance can I book a shuttle?",
        answer:
          "You can book a shuttle up to 30 days in advance. We recommend booking early, especially during peak periods, to ensure availability.",
      },
      {
        question: "Can I book for someone else?",
        answer:
          "Yes, you can book for other passengers. During the booking process, you'll be asked to provide passenger details. Make sure to enter the correct information for all passengers.",
      },
    ],
  },
  {
    id: "account",
    title: "Account Management",
    faqs: [
      {
        question: "How do I create an account?",
        answer:
          "To create an account, click on 'Register' in the top right corner of the homepage. Fill in your personal details, create a password, and submit the form. You'll receive a verification email to activate your account.",
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer:
          "If you forgot your password, click on 'Sign In', then 'Forgot password?'. Enter your email address, and we'll send you a link to reset your password. Follow the instructions in the email to create a new password.",
      },
      {
        question: "How do I update my profile information?",
        answer:
          "To update your profile information, sign in to your account and go to 'Profile'. Click on 'Edit Profile' to update your personal details. Don't forget to save your changes.",
      },
      {
        question: "Can I have multiple accounts?",
        answer:
          "We recommend having only one account per person. Multiple accounts for the same person may lead to confusion and potential issues with bookings and payments.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment & Refunds",
    faqs: [
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept various payment methods including credit/debit cards, bank transfers, and e-wallets. All payments are processed securely through our payment gateway.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, all payment information is encrypted and processed securely. We do not store your credit card details on our servers.",
      },
      {
        question: "How do refunds work?",
        answer:
          "If you cancel a booking that is eligible for a refund, the amount will be credited back to your original payment method within 3-5 business days. For bank transfers, it may take up to 7 business days.",
      },
      {
        question: "Can I get a receipt for my booking?",
        answer:
          "Yes, a receipt is automatically sent to your email after a successful booking. You can also download a receipt from 'My Bookings' in your account.",
      },
    ],
  },
  {
    id: "service",
    title: "Shuttle Services",
    faqs: [
      {
        question: "What is the Premium Service?",
        answer:
          "Premium Service offers door-to-door transportation with dedicated drivers and luxury vehicles. It includes benefits such as 24/7 availability, priority boarding, and enhanced amenities. You can upgrade to Premium Service during the booking process.",
      },
      {
        question: "How early should I arrive for my shuttle?",
        answer:
          "We recommend arriving at least 15 minutes before your scheduled departure time. This allows sufficient time for check-in and boarding.",
      },
      {
        question: "What if I miss my shuttle?",
        answer:
          "If you miss your shuttle, your booking will be marked as 'No Show' and is not eligible for a refund. However, you can book another shuttle subject to availability.",
      },
      {
        question: "Are there any baggage restrictions?",
        answer:
          "Each passenger is allowed one medium-sized bag and one personal item. Additional or oversized baggage may be accommodated based on space availability. Please inform us in advance if you have special baggage requirements.",
      },
      {
        question: "How do I use my QR code ticket?",
        answer:
          "Your QR code ticket will be available in 'My Bookings' after your booking is confirmed. Show the QR code to the driver or attendant for scanning before boarding. You can either display it on your phone or print it out.",
      },
    ],
  },
]
