import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AutoPost
          </Link>
          <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            Back to Home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">
          Last updated: January 21, 2026
        </p>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              By accessing and using AutoPost (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              2. Description of Service
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              AutoPost provides a web-based platform that allows users to schedule and automatically publish content to Instagram. The Service includes features such as post scheduling, content calendar management, and analytics.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              3. User Accounts
            </h2>
            <div className="text-zinc-700 dark:text-zinc-300 space-y-4">
              <p>To use the Service, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account by providing accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 18 years old or have parental/guardian consent</li>
                <li>Have a valid Instagram account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p>
                You are responsible for all activities that occur under your account.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              4. User Content and Conduct
            </h2>
            <div className="text-zinc-700 dark:text-zinc-300 space-y-4">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                <li>Violate Instagram's Terms of Service or Community Guidelines</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Transmit spam, chain letters, or unsolicited mass communications</li>
                <li>Engage in any automated use of the system without our express written permission</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              5. Instagram Integration
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              Our Service integrates with Instagram through official APIs. By using AutoPost, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>You grant us permission to access your Instagram account on your behalf</li>
              <li>You must comply with Instagram's Terms of Service and Platform Policy</li>
              <li>We are not responsible for changes to Instagram's API or policies</li>
              <li>Instagram may suspend or terminate your account for violations, which may affect your use of our Service</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              6. Subscription and Payment
            </h2>
            <div className="text-zinc-700 dark:text-zinc-300 space-y-4">
              <p>
                <strong>Billing:</strong> Subscriptions are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for the applicable fees.
              </p>
              <p>
                <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellations will take effect at the end of the current billing period.
              </p>
              <p>
                <strong>Refunds:</strong> We offer refunds within 14 days of purchase if you are not satisfied with the Service. After 14 days, no refunds will be provided.
              </p>
              <p>
                <strong>Changes to Pricing:</strong> We reserve the right to modify our pricing with 30 days notice to existing subscribers.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              The Service and its original content, features, and functionality are owned by AutoPost and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of content you post through the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              8. Termination
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              To the maximum extent permitted by law, AutoPost shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              10. Disclaimer of Warranties
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              12. Governing Law
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AutoPost operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              13. Contact Information
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">
              Email: legal@autopost.com<br />
              Address: [Your Company Address]
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
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            © 2026 AutoPost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
