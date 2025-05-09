import { PageLayout } from "@/components/page-layout"

export default function TermsOfServicePage() {
  return (
    <PageLayout
      title="Terms of Service"
      description="Please read these terms carefully before using ABU Tiket services"
    >
      <div className="space-y-6">
        <p className="text-gray-700">Last updated: April 20, 2025</p>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing or using the ABU Tiket platform, you agree to be bound by these Terms of Service. If you do not
            agree to all the terms and conditions, you may not access or use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">2. Service Description</h2>
          <p className="text-gray-700">
            ABU Tiket provides a platform for booking campus transportation services within Ahmadu Bello University. Our
            services include shuttle booking, ticket management, and related transportation services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">3. User Accounts</h2>
          <p className="text-gray-700">
            To use certain features of our platform, you must register for an account. You agree to provide accurate,
            current, and complete information during the registration process and to update such information to keep it
            accurate, current, and complete.
          </p>
          <p className="text-gray-700 mt-2">
            You are responsible for safeguarding your password and for all activities that occur under your account. You
            agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">4. Booking and Cancellation</h2>
          <p className="text-gray-700">
            All bookings are subject to availability. A booking is not confirmed until you receive a confirmation email
            or notification from ABU Tiket.
          </p>
          <p className="text-gray-700 mt-2">
            Cancellation policy: You may cancel a booking up to 2 hours before the scheduled departure time for a full
            refund. Cancellations made within 2 hours of departure are not eligible for a refund.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">5. Payment Terms</h2>
          <p className="text-gray-700">
            All prices are in Nigerian Naira (₦) and include applicable taxes. Payment is required at the time of
            booking. We accept various payment methods as indicated on the payment page.
          </p>
          <p className="text-gray-700 mt-2">
            Refunds will be processed to the original payment method within 3-5 business days, depending on your payment
            provider's policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">6. User Conduct</h2>
          <p className="text-gray-700">
            You agree not to use the ABU Tiket platform for any unlawful purpose or in any way that could damage,
            disable, overburden, or impair our services.
          </p>
          <p className="text-gray-700 mt-2">
            Prohibited activities include but are not limited to: fraud, harassment, impersonation, and any form of
            abuse towards staff or other users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">7. Limitation of Liability</h2>
          <p className="text-gray-700">
            ABU Tiket shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            resulting from your use of or inability to use our services.
          </p>
          <p className="text-gray-700 mt-2">
            We are not responsible for delays or service disruptions due to circumstances beyond our control, including
            but not limited to weather conditions, traffic, or technical issues.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">8. Modifications to Terms</h2>
          <p className="text-gray-700">
            We reserve the right to modify these Terms of Service at any time. We will provide notice of significant
            changes by posting the updated terms on our platform and updating the "Last updated" date.
          </p>
          <p className="text-gray-700 mt-2">
            Your continued use of ABU Tiket after such modifications constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">9. Governing Law</h2>
          <p className="text-gray-700">
            These Terms of Service shall be governed by and construed in accordance with the laws of Nigeria, without
            regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">10. Contact Information</h2>
          <p className="text-gray-700">If you have any questions about these Terms of Service, please contact us at:</p>
          <p className="text-gray-700 mt-2">
            ABU Tiket
            <br />
            Transport Unit, Main Campus
            <br />
            Ahmadu Bello University, Zaria
            <br />
            Email: legal@abutiket.edu.ng
            <br />
            Phone: +234 8012 345 678
          </p>
        </section>
      </div>
    </PageLayout>
  )
}
