import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';

export default function RefundPolicy() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {/* Highlight box */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 mb-1">7-Day Money-Back Guarantee</p>
            <p className="text-green-700 text-sm">If you're not satisfied with your Premium subscription within the first 7 days, we'll give you a full refund — no questions asked.</p>
          </div>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Eligibility for Refunds</h2>
            <p className="text-gray-600 leading-relaxed mb-3">You are eligible for a full refund if:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>You request a refund within <strong>7 days</strong> of your initial purchase.</li>
              <li>This is your first Premium subscription (not applicable to renewals).</li>
              <li>Your account has not violated our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Non-Refundable Situations</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Refund requests made after 7 days from the purchase date.</li>
              <li>Monthly renewal charges (you can cancel before renewal to avoid future charges).</li>
              <li>Accounts terminated for Terms of Service violations.</li>
              <li>Partial month refunds — we refund the full current period only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">How to Request a Refund</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-600">
              <li>Email us at <a href="mailto:support@captions4you.com" className="text-indigo-600 hover:underline">support@captions4you.com</a> with the subject line "Refund Request".</li>
              <li>Include the email address associated with your account.</li>
              <li>Briefly describe the reason for your refund request (optional but helpful).</li>
              <li>We will process your refund within <strong>5–10 business days</strong> back to your original payment method.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Cancellation</h2>
            <p className="text-gray-600 leading-relaxed">You can cancel your Premium subscription at any time from your Profile page. Cancelling stops future charges but does not automatically trigger a refund. Your Premium access continues until the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
            <p className="text-gray-600 leading-relaxed">For refund requests or billing questions, contact us at <a href="mailto:support@captions4you.com" className="text-indigo-600 hover:underline">support@captions4you.com</a>. We aim to respond within 24 hours on business days.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
