import { Calendar, DollarSign, Clock, FileText } from 'lucide-react';

/**
 * FailedPaymentCard Component
 * Displays individual failed payment with option to resubmit payment proof
 * 
 * @param {Object} payment - Payment record with failed status
 * @param {Function} onPayClick - Handler for pay button click
 * @param {Function} onViewHistory - Handler for view history button click
 */
const FailedPaymentCard = ({ payment, onPayClick, onViewHistory }) => {
  // Check if payment has a pending resubmission
  const hasResubmission =
    payment.failedPaymentSubmission &&
    payment.failedPaymentSubmission.resubmittedPhoto;

  return (
    <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50 hover:shadow-md transition-all duration-200">
      {/* Month */}
      <div className="flex items-center text-gray-700 mb-2">
        <Calendar className="w-5 h-5 mr-2 text-red-600" />
        <span className="font-semibold text-lg">{payment.month}</span>
      </div>

      {/* Amount */}
      <div className="flex items-center mb-2">
        <DollarSign className="w-6 h-6 text-red-600" />
        <span className="text-3xl font-bold text-gray-900">₹{payment.amount}</span>
      </div>

      {/* Deadline */}
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <Clock className="w-4 h-4 mr-1 text-red-500" />
        <span>
          Deadline: {new Date(payment.deadline).toLocaleDateString('en-IN')}
        </span>
        <span className="ml-2 text-red-600 font-medium">(Passed)</span>
      </div>

      {/* Resubmission Status Badge */}
      {hasResubmission && (
        <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
          <div className="flex items-center text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            <span className="font-medium">
              Payment resubmitted on{' '}
              {new Date(
                payment.failedPaymentSubmission.resubmittedDate
              ).toLocaleDateString('en-IN')}
            </span>
          </div>
          <p className="text-yellow-700 mt-1">Awaiting treasurer verification</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {/* Pay Now Button */}
        <button
          onClick={() => onPayClick(payment)}
          className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center ${
            hasResubmission
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
          }`}
          disabled={hasResubmission}
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

        {/* View History Button */}
        <button
          onClick={() => onViewHistory(payment)}
          className="w-full py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center justify-center"
        >
          <FileText className="w-5 h-5 mr-2" />
          View History
        </button>
      </div>
    </div>
  );
};

export default FailedPaymentCard;
