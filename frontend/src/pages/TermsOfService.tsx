import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">By accessing or using Captions4You ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">Captions4You provides an AI-powered caption generation tool for social media platforms including Instagram, TikTok, YouTube, Facebook, LinkedIn, Snapchat, and X (Twitter). The Service is offered on a freemium basis with a paid Premium subscription.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must notify us immediately of any unauthorised use of your account.</li>
              <li>One account per person. You may not share accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Generate content that is illegal, defamatory, harassing, hateful, or sexually explicit.</li>
              <li>Infringe on intellectual property rights of others.</li>
              <li>Attempt to reverse-engineer, scrape, or exploit the Service.</li>
              <li>Use automated tools to generate captions in bulk beyond subscription limits.</li>
              <li>Resell or sublicense the Service without permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Subscription and Billing</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Free tier:</strong> 5 caption generations per month at no cost.</li>
              <li><strong>Premium tier:</strong> 100 caption generations per month, billed monthly via Stripe.</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
              <li>You can cancel your subscription at any time from your Profile page.</li>
              <li>Prices are listed in AUD and may vary by region.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">You retain ownership of the content descriptions you provide. The AI-generated captions are provided for your use — you may use them for your social media content. Captions4You retains all rights to the Service, its software, and branding.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed">The Service is provided "as is" without warranties of any kind. We do not guarantee that generated captions will achieve specific engagement or reach targets on social media platforms. Social media algorithm performance depends on many factors outside our control.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">To the maximum extent permitted by law, Captions4You shall not be liable for any indirect, incidental, or consequential damages arising from use of the Service. Our total liability is limited to the amount you paid in the last 12 months.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed">We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time. Upon termination, your data will be removed in accordance with our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">We may update these Terms periodically. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">These Terms are governed by the laws of Australia. Any disputes shall be resolved in Australian courts.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">12. Contact</h2>
            <p className="text-gray-600 leading-relaxed">For questions about these Terms, contact us at <a href="mailto:legal@captions4you.com" className="text-indigo-600 hover:underline">legal@captions4you.com</a>.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
