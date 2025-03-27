import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { CheckCircle, XCircle, ArrowRight } from 'react-feather';

const SubscriptionPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Basic features for casual hunters',
    features: [
      { name: 'Basic Mapping Tools', included: true },
      { name: 'Weather Forecasts', included: true },
      { name: 'Limited Hunt Areas (3)', included: true },
      { name: 'Basic Trail Camera Support', included: true },
      { name: 'Basic Weather Reports', included: true },
      { name: 'Public Land Data', included: true },
      { name: 'Basic Solunar Calendar', included: true },
      { name: 'Ads Supported', included: true },
      { name: 'Property Boundaries', included: false },
      { name: '3D Mapping', included: false },
      { name: 'Offline Maps', included: false },
      { name: 'Advanced Weather', included: false },
      { name: 'Share with Friends', included: false },
    ],
    buttonText: 'Current Plan',
    buttonStyle: 'bg-gray-300 text-gray-700',
    isDefault: true,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: 'per year',
    description: 'Advanced features for serious hunters',
    features: [
      { name: 'Advanced Mapping Tools', included: true },
      { name: 'Detailed Weather Forecasts', included: true },
      { name: 'Unlimited Hunt Areas', included: true },
      { name: 'Full Trail Camera Support', included: true },
      { name: 'Detailed Weather Reports', included: true },
      { name: 'Public Land Data with Rules', included: true },
      { name: 'Advanced Solunar Calendar', included: true },
      { name: 'Ad-Free Experience', included: true },
      { name: 'Property Boundaries', included: true },
      { name: '3D Mapping', included: true },
      { name: 'Offline Maps', included: true },
      { name: 'Advanced Weather', included: true },
      { name: 'Share with Friends (3)', included: true },
    ],
    buttonText: 'Upgrade to Pro',
    buttonStyle: 'bg-orange-500 hover:bg-orange-600 text-white',
    mostPopular: true,
  },
  {
    name: 'Elite',
    price: '$59.99',
    period: 'per year',
    description: 'Premium features for outfitters and professionals',
    features: [
      { name: 'Pro Mapping Tools', included: true },
      { name: 'Advanced Weather Forecasts', included: true },
      { name: 'Unlimited Hunt Areas', included: true },
      { name: 'Full Trail Camera Support', included: true },
      { name: 'Advanced Weather Reports', included: true },
      { name: 'Complete Public Land Database', included: true },
      { name: 'Advanced Solunar Calendar', included: true },
      { name: 'Ad-Free Experience', included: true },
      { name: 'Property Boundaries with Ownership', included: true },
      { name: 'Advanced 3D Mapping', included: true },
      { name: 'Offline Maps', included: true },
      { name: 'Advanced Weather Radar', included: true },
      { name: 'Share with Team (10 users)', included: true },
      { name: 'Outfitter Management Tools', included: true },
      { name: 'Property Reporting', included: true },
    ],
    buttonText: 'Upgrade to Elite',
    buttonStyle: 'bg-green-600 hover:bg-green-700 text-white',
  },
];

const SubscriptionPage: React.FC = () => {
  const { user, updateUser } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string>(user?.subscription || 'free');

  const handleSubscribe = (plan: string) => {
    // In a real app, this would launch the payment flow
    // For demo purposes, we'll just update the user's subscription
    if (user) {
      updateUser({
        ...user,
        subscription: plan as any,
      });
      setSelectedPlan(plan);
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Wildpursuit Subscription Plans</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your hunting needs. Upgrade anytime to unlock more
            features and take your hunting to the next level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SubscriptionPlans.map((plan) => (
            <div
              key={plan.name.toLowerCase()}
              className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                selectedPlan === plan.name.toLowerCase()
                  ? 'border-green-500'
                  : 'border-transparent'
              } ${plan.mostPopular ? 'transform md:-translate-y-4 md:scale-105' : ''}`}
            >
              {plan.mostPopular && (
                <div className="bg-orange-500 text-white text-center py-1 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h2>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2 mb-6">{plan.description}</p>

                <button
                  onClick={() => handleSubscribe(plan.name.toLowerCase())}
                  disabled={
                    plan.isDefault || selectedPlan === plan.name.toLowerCase()
                  }
                  className={`w-full py-3 rounded-md font-semibold flex items-center justify-center ${
                    selectedPlan === plan.name.toLowerCase()
                      ? 'bg-green-600 text-white'
                      : plan.buttonStyle
                  }`}
                >
                  {selectedPlan === plan.name.toLowerCase()
                    ? 'Current Plan'
                    : plan.buttonText}
                  <ArrowRight size={16} className="ml-2" />
                </button>

                <div className="mt-6 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      {feature.included ? (
                        <CheckCircle size={16} className="text-green-500 mr-2" />
                      ) : (
                        <XCircle size={16} className="text-gray-300 mr-2" />
                      )}
                      <span
                        className={`${
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">How do I change my plan?</h3>
              <p className="text-gray-600">
                You can upgrade or downgrade your plan at any time from your account settings. If you
                upgrade, you'll be charged the prorated difference. If you downgrade, you'll receive
                a prorated credit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access to
                your paid features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and Apple Pay (for iOS users).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Do you offer discounts for hunting clubs?</h3>
              <p className="text-gray-600">
                Yes, we offer special pricing for hunting clubs and outfitters. Please contact our
                sales team for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
