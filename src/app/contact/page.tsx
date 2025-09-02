'use client';

import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();

  const handleCallSupport = () => {
    window.location.href = 'tel:+962790685302';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📞</div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Contact Support</h1>
          <p className="text-[var(--muted-foreground)]">
            You&apos;ve used all your free generations. Contact us to get more!
          </p>
        </div>

        {/* Contact Card */}
        <div className="card-step text-center">
          <div className="space-y-6">
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <h2 className="text-lg font-semibold text-red-400 mb-2">No Generations Remaining</h2>
              <p className="text-[var(--muted-foreground)]">
                You&apos;ve finished all your trial generations. Please contact our support team to purchase more generations and continue creating amazing AI fashion images.
              </p>
            </div>

            {/* Call Button */}
            <button
              onClick={handleCallSupport}
              className="btn-step w-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Support Now
            </button>

            <div className="text-center">
              <p className="text-[var(--muted-foreground)] text-sm">
                Support Phone: <span className="text-[var(--primary)] font-mono">+962 79 068 5302</span>
              </p>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Pricing Plans</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  <span className="text-[var(--foreground)]">10 Generations</span>
                  <span className="text-[var(--primary)] font-bold">7.50 JOD</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  <span className="text-[var(--foreground)]">50 Generations</span>
                  <span className="text-[var(--primary)] font-bold">30.00 JOD</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/20">
                  <div>
                    <span className="text-[var(--foreground)] font-medium">100 Generations</span>
                    <div className="text-xs text-green-400">✨ Best Value</div>
                  </div>
                  <span className="text-[var(--primary)] font-bold">50.00 JOD</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.push('/')}
                className="btn-secondary flex-1 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
              
              <button
                onClick={() => router.push('/pricing')}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
