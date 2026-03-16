import { APP_NAME, CONTACT_EMAIL } from "@/constants/mapping"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">
          Last updated: February 21, 2026
        </p>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              By accessing and using
              {" "}
              {APP_NAME}
              {" "}
              (the "Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to these Terms of Service, please do not use the
              Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              2. Description of Service
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              {APP_NAME}
              {" "}
              is a web-based guessing game where players are shown
              a screenshot or scene from a video game and must identify which
              game it is from. The Service includes features such as daily
              challenges, multiplayer lobbies, score tracking, and leaderboards.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              3. User Accounts
            </h2>
            <div className="text-zinc-700 dark:text-zinc-300 space-y-4">
              <p>To use the Service, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Create an account by providing accurate and complete
                  information
                </li>
                <li>Maintain the security of your account credentials</li>
                <li>
                  Be at least 13 years old or have parental/guardian consent
                </li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
              </ul>
              <p>
                You are responsible for all activities that occur under your
                account.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              4. User Conduct
            </h2>
            <div className="text-zinc-700 dark:text-zinc-300 space-y-4">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Cheat, exploit bugs, or use unauthorized tools to gain an
                  unfair advantage in the game
                </li>
                <li>
                  Harass, abuse, or intimidate other players
                </li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>
                  Use bots or automated scripts to play the game or manipulate
                  leaderboards
                </li>
                <li>
                  Attempt to gain unauthorized access to the Service or related
                  systems
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              5. Game Content and Intellectual Property
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              {APP_NAME}
              {" "}
              displays video game screenshots and assets for the purpose of
              identification as part of a quiz-style game. By using the Service,
              you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>
                All game titles, screenshots, and related assets are the
                property of their respective owners
              </li>
              <li>
                {APP_NAME}
                {" "}
                does not claim ownership over any third-party game
                content displayed within the Service
              </li>
              <li>
                Content is used solely for entertainment and educational
                identification purposes
              </li>
              <li>
                We will respond promptly to valid intellectual property
                takedown requests from rights holders
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              6. Scores and Leaderboards
            </h2>
            <div className="text-zinc-700 dark:text-zinc-300 space-y-4">
              <p>
                <strong>Fair Play:</strong>
                {" "}
                Scores are computed server-side to ensure fairness. Any attempt
                to manipulate scores through unauthorized means will result in
                account suspension.
              </p>
              <p>
                <strong>Leaderboard Resets:</strong>
                {" "}
                We reserve the right to reset leaderboards at any time,
                including at the start of new seasons or competitive periods.
              </p>
              <p>
                <strong>Account Suspension:</strong>
                {" "}
                Accounts found cheating or abusing the game will be permanently
                banned without prior notice.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              The Service and its original content, features, and functionality
              are owned by
              {" "}
              {APP_NAME}
              {" "}
              and are protected by international
              copyright, trademark, and other intellectual property laws. You
              retain ownership of content you post through the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              8. Termination
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We reserve the right to suspend or terminate your account and
              access to the Service at our sole discretion, without notice, for
              conduct that we believe violates these Terms of Service or is
              harmful to other users, us, or third parties, or for any other
              reason.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              To the maximum extent permitted by law,
              {" "}
              {APP_NAME}
              {" "}
              shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses resulting from your use of
              the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              10. Disclaimer of Warranties
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              The Service is provided "as is" and "as available" without
              warranties of any kind, either express or implied. We do not
              guarantee that the Service will be uninterrupted, secure, or
              error-free.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              We reserve the right to modify these Terms of Service at any time.
              We will notify users of any material changes via email or through
              the Service. Your continued use of the Service after such
              modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              12. Governing Law
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which
              {" "}
              {APP_NAME}
              {" "}
              operates, without
              regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              13. Contact Information
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">
              Email:
              {" "}
              {CONTACT_EMAIL}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
