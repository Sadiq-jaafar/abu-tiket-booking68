import { PageLayout } from "@/components/page-layout"

export default function PrivacyPolicyPage() {
  return (
    <PageLayout title="Privacy Policy" description="Learn how we collect, use, and protect your personal information">
      <div className="space-y-6">
        <p className="text-gray-700">Last updated: April 20, 2025</p>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">1. Introduction</h2>
          <p className="text-gray-700">
            ABU Tiket ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p className="text-gray-700 mt-2">
            Please read this Privacy Policy carefully. By accessing or using our platform, you acknowledge that you have
            read, understood, and agree to be bound by all the terms of this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">2. Information We Collect</h2>
          <p className="text-gray-700">
            We collect several types of information from and about users of our platform, including:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Personal information: name, email address, phone number, ID information, and payment details.</li>
            <li>Account information: login credentials and profile information.</li>
            <li>Transaction information: booking details, payment history, and service usage.</li>
            <li>Technical information: IP address, browser type, device information, and cookies.</li>
            <li>Usage information: how you interact with our platform, features you use, and time spent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">3. How We Use Your Information</h2>
          <p className="text-gray-700">We use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Providing and maintaining our services</li>
            <li>Processing and completing transactions</li>
            <li>Verifying your identity and eligibility for services</li>
            <li>Communicating with you about bookings, updates, and support</li>
            <li>Improving our platform and user experience</li>
            <li>Analyzing usage patterns and trends</li>
            <li>Preventing fraud and enhancing security</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">4. Information Sharing and Disclosure</h2>
          <p className="text-gray-700">We may share your information with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Service providers who perform services on our behalf</li>
            <li>University administration for verification and security purposes</li>
            <li>Payment processors to complete transactions</li>
            <li>Legal authorities when required by law or to protect our rights</li>
          </ul>
          <p className="text-gray-700 mt-2">We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">5. Data Security</h2>
          <p className="text-gray-700">
            We implement appropriate technical and organizational measures to protect your personal information from
            unauthorized access, disclosure, alteration, and destruction.
          </p>
          <p className="text-gray-700 mt-2">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive
            to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute
            security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">6. Your Rights</h2>
          <p className="text-gray-700">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate or incomplete information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction of processing of your personal information</li>
            <li>Data portability (receiving your data in a structured, commonly used format)</li>
            <li>Objection to processing of your personal information</li>
          </ul>
          <p className="text-gray-700 mt-2">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">7. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700">
            We use cookies and similar tracking technologies to track activity on our platform and hold certain
            information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
          </p>
          <p className="text-gray-700 mt-2">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if
            you do not accept cookies, you may not be able to use some portions of our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">8. Children's Privacy</h2>
          <p className="text-gray-700">
            Our platform is not intended for children under the age of 18. We do not knowingly collect personal
            information from children under 18. If you are a parent or guardian and you are aware that your child has
            provided us with personal information, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">9. Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p className="text-gray-700 mt-2">
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy
            are effective when they are posted on this page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#006400] mb-3">10. Contact Us</h2>
          <p className="text-gray-700">If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="text-gray-700 mt-2">
            ABU Tiket
            <br />
            Transport Unit, Main Campus
            <br />
            Ahmadu Bello University, Zaria
            <br />
            Email: privacy@abutiket.edu.ng
            <br />
            Phone: +234 8012 345 678
          </p>
        </section>
      </div>
    </PageLayout>
  )
}
