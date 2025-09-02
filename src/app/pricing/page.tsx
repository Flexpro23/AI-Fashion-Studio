'use client';

import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  const handleCallSupport = () => {
    window.location.href = 'tel:+962790685302';
  };

  const pricingPlans = [
    {
      name: 'Starter',
      generations: 10,
      price: '7.50',
      description: 'Perfect for trying out the service',
      features: [
        '10 AI fashion generations',
        'High-quality results',
        'Download your images',
        'Basic support'
      ],
      popular: false
    },
    {
      name: 'Popular',
      generations: 50,
      price: '30.00',
      description: 'Great for regular users',
      features: [
        '50 AI fashion generations',
        'High-quality results',
        'Download your images',
        'Priority support',
        'Save to gallery'
      ],
      popular: true
    },
    {
      name: 'Professional',
      generations: 100,
      price: '50.00',
      description: 'Best value for power users',
      features: [
        '100 AI fashion generations',
        'Highest quality results',
        'Download your images',
        'VIP support',
        'Save to gallery',
        'Advanced features'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">Choose Your Plan</h1>
          <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Select the perfect plan for your AI fashion generation needs. All plans include high-quality results and full download access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative card-step ${
                plan.popular 
                  ? 'ring-2 ring-[var(--primary)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent' 
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{plan.name}</h3>
                <p className="text-[var(--muted-foreground)] mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gradient">{plan.price}</span>
                  <span className="text-[var(--muted-foreground)] ml-1">JOD</span>
                </div>
                
                <div className="text-[var(--primary)] font-medium">
                  {plan.generations} Generations
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[var(--foreground)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleCallSupport}
                className={`w-full py-3 px-6 rounded-2xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] text-white hover:shadow-lg'
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--primary)]/10'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call to Purchase
              </button>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="text-center mb-12">
          <div className="card-step max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Ready to Get Started?</h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              Call our support team to purchase your preferred plan and start creating amazing AI fashion images today!
            </p>
            
            <button
              onClick={handleCallSupport}
              className="btn-step bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center justify-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call +962 79 068 5302
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="card-step max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">How do generations work?</h3>
              <p className="text-[var(--muted-foreground)]">
                Each generation creates one AI fashion image. You upload a model photo and garment, and our AI creates a realistic image of the person wearing that clothing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">What happens if I run out of generations?</h3>
              <p className="text-[var(--muted-foreground)]">
                You can purchase additional generations by calling our support team. Your account will be instantly updated with the new generation credits.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Can I download my generated images?</h3>
              <p className="text-[var(--muted-foreground)]">
                Yes! All generated images can be downloaded in high quality. They&apos;re also saved to your gallery for easy access later.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">How long does each generation take?</h3>
              <p className="text-[var(--muted-foreground)]">
                Each AI fashion generation typically takes 15-30 seconds to complete, depending on image complexity and server load.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/')}
            className="btn-secondary flex items-center justify-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
