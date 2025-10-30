import { Wallet, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * PaymentSummaryCard Component
 * Displays total amount paid by the member with animated counter
 * 
 * @param {number} totalPaid - Total amount paid by member
 */
const PaymentSummaryCard = ({ totalPaid = 0 }) => {
  const [displayAmount, setDisplayAmount] = useState(0);

  // Animated counter effect
  useEffect(() => {
    if (totalPaid === 0) {
      setDisplayAmount(0);
      return;
    }

    const duration = 1000; // Animation duration in ms
    const steps = 50; // Number of animation steps
    const increment = totalPaid / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayAmount(totalPaid);
        clearInterval(timer);
      } else {
        setDisplayAmount(Math.floor(increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalPaid]);

  return (
    <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Icon and Label Container */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <TrendingUp className="w-5 h-5 text-green-100" />
        </div>
      </div>

      {/* Amount Display */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-green-50 uppercase tracking-wide">
          Total Amount Paid
        </p>
        <div className="flex items-baseline space-x-1">
          <span className="text-5xl font-bold tracking-tight">
            ₹ {displayAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs text-green-50">
          Keep up the great work! 🎉
        </p>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;
