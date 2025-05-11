import { PageLayout } from "@/components/page-layout"
import React from "react"

export default function StudentGuidelinesPage() {
  return (
    <PageLayout title="Student Guidelines" description="Important guidelines for students using ABU Tiket services">
      <div className="space-y-6">
        <p className="text-gray-700">
          These guidelines are designed to ensure a safe, efficient, and pleasant transportation experience for all
          students using ABU Tiket services.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">1. Booking Guidelines</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Valid ID:</strong> Always carry your valid student ID card when using ABU Tiket services. You may
              be required to present it before boarding.
            </li>
            <li>
              <strong>Accurate Information:</strong> Provide accurate personal information when creating an account and
              booking shuttles. Inaccurate information may result in booking cancellations.
            </li>
            <li>
              <strong>Early Booking:</strong> Book your shuttle in advance, especially during peak periods, to ensure
              availability.
            </li>
            <li>
              <strong>Booking Limit:</strong> Students are limited to booking a maximum of 3 seats per trip unless
              special arrangements are made for group travel.
            </li>
            <li>
              <strong>Special Needs:</strong> If you have special needs or requirements, please indicate this during the
              booking process or contact support for assistance.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">2. Boarding Guidelines</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Arrival Time:</strong> Arrive at the boarding point at least 15 minutes before the scheduled
              departure time.
            </li>
            <li>
              <strong>QR Code Ticket:</strong> Have your QR code ticket ready for scanning before boarding. This can be
              displayed on your mobile device or printed.
            </li>
            <li>
              <strong>Baggage:</strong> Each passenger is allowed one medium-sized bag and one personal item. Additional
              or oversized baggage may be accommodated based on space availability.
            </li>
            <li>
              <strong>Seating:</strong> Seating is on a first-come, first-served basis unless specific seats are
              assigned during booking.
            </li>
            <li>
              <strong>No-Show Policy:</strong> If you fail to show up for your booked shuttle without prior
              cancellation, it will be marked as a "No-Show" and may affect future booking privileges.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">3. Conduct Guidelines</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Respectful Behavior:</strong> Treat drivers, staff, and fellow passengers with respect and
              courtesy.
            </li>
            <li>
              <strong>Noise Level:</strong> Keep noise levels reasonable. Use headphones when listening to music or
              videos.
            </li>
            <li>
              <strong>Cleanliness:</strong> Help keep the shuttles clean by disposing of trash properly and reporting
              any spills or messes.
            </li>
            <li>
              <strong>No Smoking:</strong> Smoking, including e-cigarettes, is strictly prohibited on all shuttles.
            </li>
            <li>
              <strong>No Food or Drinks:</strong> Consumption of food and drinks (except water) is not allowed on the
              shuttles.
            </li>
            <li>
              <strong>No Disruptive Behavior:</strong> Disruptive behavior, including but not limited to harassment,
              offensive language, and intoxication, will not be tolerated.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">4. Safety Guidelines</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Seatbelts:</strong> Always wear seatbelts when provided.
            </li>
            <li>
              <strong>Emergency Exits:</strong> Familiarize yourself with the location of emergency exits and
              procedures.
            </li>
            <li>
              <strong>Personal Belongings:</strong> Keep your personal belongings secure and within sight at all times.
              ABU Tiket is not responsible for lost or stolen items.
            </li>
            <li>
              <strong>Report Concerns:</strong> Report any safety concerns or suspicious activities to the driver or ABU
              Tiket staff immediately.
            </li>
            <li>
              <strong>Follow Instructions:</strong> Follow all instructions from drivers and staff, especially in
              emergency situations.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">5. Premium Service Guidelines</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Eligibility:</strong> All students are eligible to use the Premium Service, subject to
              availability and additional fees.
            </li>
            <li>
              <strong>Pickup/Dropoff:</strong> Provide accurate and detailed pickup and dropoff locations when booking
              Premium Service.
            </li>
            <li>
              <strong>Contact Information:</strong> Ensure your contact information is up-to-date, as drivers will
              contact you before pickup.
            </li>
            <li>
              <strong>Waiting Time:</strong> Drivers will wait for a maximum of 5 minutes at the pickup location. After
              this time, the booking may be marked as a "No-Show".
            </li>
            <li>
              <strong>Special Requests:</strong> Any special requests for Premium Service should be made during the
              booking process.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">6. Feedback and Complaints</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>Feedback:</strong> We encourage students to provide feedback on their experience to help us
              improve our services.
            </li>
            <li>
              <strong>Complaints:</strong> If you have a complaint, please submit it through the ABU Tiket platform or
              contact our support team.
            </li>
            <li>
              <strong>Response Time:</strong> We aim to respond to all feedback and complaints within 48 hours.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">7. Consequences of Violations</h2>
          <p className="text-gray-700">Violations of these guidelines may result in:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
            <li>Verbal or written warnings</li>
            <li>Temporary suspension of booking privileges</li>
            <li>Permanent ban from using ABU Tiket services</li>
            <li>Referral to university disciplinary authorities</li>
            <li>Legal action in severe cases</li>
          </ul>
        </section>

        <div className="p-4 bg-[#e6f2e6] rounded-md mt-8">
          <h3 className="font-medium text-[#006400] mb-2">Contact Information</h3>
          <p className="text-sm text-gray-700">
            For questions or clarifications about these guidelines, please contact:
          </p>
          <p className="text-sm text-gray-700 mt-1">
            ABU Tiket Student Support
            <br />
            Email: student.support@abutiket.edu.ng
            <br />
            Phone: +234 8012 345 678
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
