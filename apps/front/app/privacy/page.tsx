import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            AutoPost
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to Home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">
          Last updated: January 21, 2026
        </p>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              1. Introduction
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              AutoPost ("we", "our", or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our Service.
              Please read this privacy policy carefully.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
              2.1 Personal Information
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              When you register for an account, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300 mb-4">
              <li>Name and email address</li>
              <li>Account credentials (encrypted passwords)</li>
              <li>
                Payment information (processed securely through our payment
                provider)
              </li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
              2.2 Instagram Account Information
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              To provide our Service, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300 mb-4">
              <li>Instagram account credentials and access tokens</li>
              <li>Instagram profile information (username, profile picture)</li>
              <li>
                Content you upload for scheduling (images, captions, hashtags)
              </li>
              <li>Post performance data and analytics</li>
            </ul>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
              2.3 Usage Information
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We automatically collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300 mb-4">
              <li>Log data (IP address, browser type, operating system)</li>
              <li>Device information</li>
              <li>Usage patterns and interactions with the Service</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process and schedule your Instagram posts</li>
              <li>Manage your account and subscriptions</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>
                Provide analytics and insights about your Instagram performance
              </li>
              <li>
                Detect, prevent, and address technical issues and security
                threats
              </li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              4. How We Share Your Information
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We may share your information with:
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
              4.1 Service Providers
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We work with third-party companies that help us provide the
              Service, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300 mb-4">
              <li>Payment processors</li>
              <li>Cloud hosting providers</li>
              <li>Analytics services</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
              4.2 Instagram/Meta
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Your content is posted to Instagram through their official API.
              Instagram's own privacy policy applies to data they collect and
              process.
            </p>

            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 mt-6">
              4.3 Legal Requirements
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We may disclose your information if required by law or in response
              to valid requests by public authorities.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              5. Data Security
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>
                Secure payment processing through PCI-DSS compliant providers
              </li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mt-4">
              However, no method of transmission over the internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              6. Data Retention
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We retain your personal information for as long as necessary to
              provide the Service and fulfill the purposes outlined in this
              Privacy Policy. When you delete your account, we will delete or
              anonymize your personal information within 90 days, except where
              we need to retain it for legal compliance.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Data Portability:</strong> Request transfer of your data
                to another service
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing
                communications
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent for
                processing where applicable
              </li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mt-4">
              To exercise these rights, please contact us at
              privacy@autopost.com.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve our Service</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mt-4">
              You can control cookies through your browser settings, but
              disabling cookies may limit your use of certain features.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              9. International Data Transfers
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have
              different data protection laws. We ensure appropriate safeguards
              are in place for such transfers in accordance with applicable data
              protection laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              10. Children's Privacy
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Our Service is not intended for children under 18 years of age. We
              do not knowingly collect personal information from children under
              18. If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              11. Third-Party Links
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Our Service may contain links to third-party websites. We are not
              responsible for the privacy practices of these websites. We
              encourage you to read their privacy policies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              12. Changes to This Privacy Policy
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new Privacy
              Policy on this page and updating the "Last updated" date. We
              encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              13. Contact Us
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If you have any questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <div className="text-zinc-700 dark:text-zinc-300">
              <p>Email: privacy@autopost.com</p>
              <p>Address: [Your Company Address]</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              14. GDPR Compliance (EU Users)
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If you are located in the European Economic Area (EEA), you have
              additional rights under the General Data Protection Regulation
              (GDPR):
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>Right to lodge a complaint with a supervisory authority</li>
              <li>
                Right to object to processing based on legitimate interests
              </li>
              <li>Right to restriction of processing</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mt-4">
              Our legal basis for processing your data includes: contract
              performance, legitimate interests, and your consent.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              15. California Privacy Rights (CCPA)
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If you are a California resident, you have specific rights
              regarding your personal information under the California Consumer
              Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>Right to know what personal information is collected</li>
              <li>
                Right to know whether personal information is sold or disclosed
              </li>
              <li>Right to say no to the sale of personal information</li>
              <li>Right to delete personal information</li>
              <li>Right to equal service and price</li>
            </ul>
            <p className="text-zinc-700 dark:text-zinc-300 mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AutoPost
          </div>
          <div className="flex gap-8 text-sm text-zinc-600 dark:text-zinc-400">
            <Link
              href="/terms"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            © 2026 AutoPost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
