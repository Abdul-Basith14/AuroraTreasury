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
    // Card Container: Dark Glassmorphism with Olive Glow
    <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-[#A6C36F]/20 p-6 text-[#F5F3E7] 
                 shadow-[0_0_15px_rgba(166,195,111,0.1)] hover:shadow-[0_0_25px_rgba(166,195,111,0.2)] 
                 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
      
      {/* Decorative Background Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6C36F]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
      {/* Header and Icon */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        {/* Label */}
        <p className="text-sm font-semibold text-[#E8E3C5]/70 uppercase tracking-wider">
          Total Club Payment
        </p>
        
        {/* Icon Circle: Olive outline, dark bg */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#A6C36F]/30 bg-[#A6C36F]/10 group-hover:bg-[#A6C36F]/20 transition-colors">
          <Wallet className="w-5 h-5 text-[#A6C36F]" />
        </div>
      </div>

      {/* Amount Display */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-baseline justify-between">
          {/* Amount: Olive Green, larger font */}
          <span className="text-5xl font-extrabold tracking-tight text-[#A6C36F] drop-shadow-sm">
            ₹ {displayAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Decorative Footer/Trend Indicator */}
      <div className="mt-6 pt-4 border-t border-[#A6C36F]/10 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
            {/* Trend Indicator */}
            <TrendingUp className="w-4 h-4 text-[#A6C36F]" />
            <p className="text-sm font-medium text-[#E8E3C5]/80">
                Member Contributions
            </p>
        </div>
        
        {/* Placeholder/Sub-label */}
        <p className="text-xs font-mono text-[#E8E3C5]/50">
          Since {joiningYear}
        </p>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;