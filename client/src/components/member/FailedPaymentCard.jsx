import { Calendar, DollarSign, Clock, FileText } from 'lucide-react';

/**
 * FailedPaymentCard Component (Bright Olive Elegance Themed)
 * Displays individual failed payment with option to resubmit payment proof
 */
const FailedPaymentCard = ({ payment, onPayClick, onViewHistory }) => {
  const hasResubmission =
    payment.failedPaymentSubmission &&
    payment.failedPaymentSubmission.resubmittedPhoto;

  return (
    <div className="border border-[#3A3E36] rounded-2xl p-5 bg-[#1F221C] hover:bg-[#2A2D25] transition-all duration-300 shadow-md hover:shadow-lg">
      {/* Month */}
      <div className="flex items-center text-[#E8E3C5] mb-3">
        <Calendar className="w-5 h-5 mr-2 text-[#A6C36F]" />
        <span className="font-semibold text-lg">{payment.month}</span>
      </div>

      {/* Amount */}
      <div className="flex items-center mb-3">
        <DollarSign className="w-6 h-6 text-[#A6C36F]" />
        <span className="text-3xl font-bold text-[#F5F3E7] ml-1">
          ₹{payment.amount}
        </span>
      </div>

      {/* Deadline */}
      <div className="flex items-center text-sm text-[#C9C6A8] mb-4">
        <Clock className="w-4 h-4 mr-2 text-[#A6C36F]" />
        <span>Deadline: {new Date(payment.deadline).toLocaleDateString('en-IN')}</span>
        <span className="ml-2 text-[#C36F6F] font-medium">(Passed)</span>
      </div>

      {/* Resubmission Status */}
      {hasResubmission && (
        <div className="mb-4 p-3 bg-[#2B2F26] border border-[#3A3E36] rounded-lg">
          <div className="flex items-center text-[#E8E3C5]">
            <Clock className="w-4 h-4 mr-2 text-[#A6C36F]" />
            <span className="font-medium">
              Payment resubmitted on{' '}
              {new Date(
                payment.failedPaymentSubmission.resubmittedDate
              ).toLocaleDateString('en-IN')}
            </span>
          </div>
          <p className="text-sm text-[#C9C6A8] mt-1">Awaiting treasurer verification</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {/* Pay Now */}
        <button
          onClick={() => onPayClick(payment)}
          disabled={hasResubmission}
          className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center transition-all ${
            hasResubmission
              ? 'bg-[#2A2D25] text-[#8B8B7B] cursor-not-allowed'
              : 'bg-[#A6C36F] text-[#0B0B09] hover:bg-[#B9D47F] hover:shadow-md'
          }`}
        >
          {hasResubmission ? (
            <>
              <Clock className="w-5 h-5 mr-2" />
              Pending Verification
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5 mr-2" />
              Pay Now
            </>
          )}
        </button>

        {/* View History */}
        <button
          onClick={() => onViewHistory(payment)}
          className="w-full py-2.5 border border-[#3A3E36] text-[#E8E3C5] rounded-xl font-medium hover:bg-[#2A2D25] transition-all flex items-center justify-center"
        >
          <FileText className="w-5 h-5 mr-2 text-[#A6C36F]" />
          View History
        </button>
      </div>
    </div>
  );
};

export default FailedPaymentCard;
