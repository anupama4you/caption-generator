import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-3">When you use Captions4You, we collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Account information:</strong> Your name, email address, and password (hashed) when you register.</li>
              <li><strong>OAuth data:</strong> If you sign in with Google or Facebook, we receive your name and email from those providers.</li>
              <li><strong>Content you provide:</strong> Descriptions of your content used to generate captions.</li>
              <li><strong>Usage data:</strong> Caption generation history, platform preferences, and usage counts.</li>
              <li><strong>Payment information:</strong> Processed securely by Stripe. We do not store your card details.</li>
              <li><strong>Technical data:</strong> IP address, browser type, and device information for security and rate limiting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>To provide and improve the caption generation service.</li>
              <li>To manage your account, subscription, and usage limits.</li>
              <li>To send transactional emails (account verification, password resets, subscription updates).</li>
              <li>To prevent fraud, abuse, and enforce our Terms of Service.</li>
              <li>To anonymously analyse usage trends to improve the product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Stripe:</strong> For payment processing. Subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Stripe's Privacy Policy</a>.</li>
              <li><strong>Google / Facebook:</strong> When you choose to sign in via OAuth.</li>
              <li><strong>OpenAI / AI providers:</strong> Your content descriptions are sent to generate captions. We do not share identifying information.</li>
              <li><strong>Hosting providers:</strong> Vercel (frontend) and Render (backend) for infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">We use minimal cookies and local storage to keep you logged in (JWT tokens) and remember your preferences. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">We retain your account data for as long as your account is active. You can request deletion of your account and all associated data at any time by emailing us. Caption history is stored indefinitely for your use, unless you delete it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Depending on your location, you may have rights to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Data portability (receive a copy of your data).</li>
            </ul>
            <p className="text-gray-600 mt-3">To exercise these rights, contact us at <a href="mailto:privacy@captions4you.com" className="text-indigo-600 hover:underline">privacy@captions4you.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Security</h2>
            <p className="text-gray-600 leading-relaxed">We use industry-standard security measures including HTTPS, hashed passwords (bcrypt), and JWT-based authentication. However, no internet transmission is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">Captions4You is not directed at children under 13. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">We may update this Privacy Policy. We will notify you of significant changes via email or a notice on the site.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contact</h2>
            <p className="text-gray-600 leading-relaxed">For any privacy-related questions, contact us at <a href="mailto:privacy@captions4you.com" className="text-indigo-600 hover:underline">privacy@captions4you.com</a>.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
