import { Wallet, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * PaymentSummaryCard Component
 * Displays total amount paid by the member with animated counter
 * * @param {number} totalPaid - Total amount paid by member
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
  
  // --- Start Year Logic Modification ---
  // In a real application, the joining year should be passed via props (e.g., props.user.joiningYear)
  // or calculated accurately based on the user's academic year.
  
  // Placeholder: Calculate based on current year minus a fixed value (e.g., 2 years) 
  // to reflect a "member since" date earlier than 2025.
  const getJoiningYear = () => {
    const currentYear = new Date().getFullYear();
    // Assuming current academic context where a 3rd-year member joined 2 years ago (2025 - 2 = 2023)
    return currentYear - 2; 
  };
  
  const joiningYear = getJoiningYear();
  // --- End Year Logic Modification ---

  return (
    // Card Container: Accent Olive BG, Deep Black Text
    <div className="bg-[#A6C36F] rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.4)] p-6 text-[#0B0B09] 
                 hover:shadow-[0_0_35px_rgba(166,195,111,0.6)] transition-all duration-300 transform hover:-translate-y-1">
      
      {/* Header and Icon */}
      <div className="flex items-center justify-between mb-2">
        {/* Label */}
        <p className="text-sm font-semibold text-[#0B0B09]/70 uppercase tracking-wider">
          Total Club Payment
        </p>
        
        {/* Icon Circle: Solid, slightly darker olive for depth */}
        <div className="w-10 h-10 bg-[#8FAE5D] rounded-full flex items-center justify-center shadow-inner shadow-[#0B0B09]/10">
          <Wallet className="w-5 h-5 text-[#0B0B09]" />
        </div>
      </div>

      {/* Amount Display */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          {/* Amount: Explicitly set to Deep Black, larger font */}
          <span className="text-5xl font-extrabold tracking-tight text-[#0B0B09]">
            ₹ {displayAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Decorative Footer/Trend Indicator */}
      <div className="mt-4 pt-4 border-t border-[#0B0B09]/15 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            {/* Trend Indicator: text-[#0B0B09]/90 */}
            <TrendingUp className="w-5 h-5 text-[#0B0B09]" />
            <p className="text-sm font-medium text-[#0B0B09]/90">
                Member Contributions
            </p>
        </div>
        
        {/* Placeholder/Sub-label: MODIFIED TO REFLECT EARLIER YEAR */}
        <p className="text-xs font-mono text-[#0B0B09]/60">
          Since {joiningYear}
        </p>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;