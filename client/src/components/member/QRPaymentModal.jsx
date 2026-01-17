import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, QrCode, Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';
import QRCode from 'react-qr-code';

/**
 * QRPaymentModal Component
 * Modal for QR-based group fund payment (no screenshot upload)
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Callback to close modal
 * @param {Object} paymentMonth - Month details { month, year, monthNumber, amount }
 * @param {Function} onSuccess - Callback after successful payment
 */
const QRPaymentModal = ({ isOpen, onClose, paymentMonth, activeRecords = [], onSelectRecord, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [payment, setPayment] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setQrData(null);
      setPayment(null);
      setCopied(false);
      if (!paymentMonth) {
        setLoading(false);
        return;
      }

      generateQR(paymentMonth);
    }
  }, [isOpen, paymentMonth]);

  /**
   * Generate QR code for payment
   */
  const generateQR = async (monthData) => {
    try {
      setLoading(true);
      const response = await groupFundAPI.generateQR({
        month: monthData.month,
        year: monthData.year,
        monthNumber: monthData.monthNumber,
        academicYear: `${monthData.year}-${monthData.year + 1}`
      });

      if (response.success) {
        setQrData(response.qrData);
        setPayment(response.payment);
      } else {
        toast.error(response.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy reference code to clipboard
   */
  const maskReference = (ref) => {
    if (!ref) return null;
    const prefix = ref.startsWith('AT-FUND-') ? 'AT-FUND-' : '';
    const tail = ref.replace(/^AT-FUND-/, '');
    return `${prefix}${'x'.repeat(tail.length)}`;
  };

  const maskedReference = maskReference(qrData?.reference);

  const displayInstructions = (qrData?.instructions || []).reduce((acc, instruction) => {
    if (instruction.toLowerCase().includes('do not change the payment note')) {
      acc.push('Unique reference will be matched by treasurer');
      return acc;
    }
    const sanitized = maskedReference && qrData?.reference
      ? instruction.replace(qrData.reference, maskedReference)
      : instruction;
    acc.push(sanitized);
    return acc;
  }, []);

  /**
   * Confirm payment after member has paid via UPI
   */
  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);
      const response = await groupFundAPI.confirmPayment(payment._id);

      if (response.success) {
        toast.success('Payment confirmed! Awaiting treasurer verification.');
        onSuccess && onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  if (!isOpen) return null;

  const amountDisplay = qrData?.amount ?? paymentMonth?.amount;
  const payeeDisplay = qrData?.treasurerUPI ?? paymentMonth?.treasurerUPI;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-black/85 border border-[#A6C36F]/25 rounded-2xl max-w-lg w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#A6C36F]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#A6C36F]/10 rounded-lg">
              <QrCode className="w-6 h-6 text-[#A6C36F]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5F3E7]">Pay Group Fund</h2>
              {(qrData || loading) && paymentMonth && (
                <p className="text-sm text-[#E8E3C5]/70">
                  {paymentMonth.month} {paymentMonth.year}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#E8E3C5]/70 hover:text-[#A6C36F] hover:bg-[#A6C36F]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!paymentMonth ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-[#E8E3C5]/80 mb-2">No group fund record created yet.</p>
              <p className="text-sm text-[#E8E3C5]/60">Please check back after the treasurer publishes the month.</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-[#A6C36F] animate-spin" />
              <p className="mt-4 text-[#E8E3C5]/80">Generating QR code...</p>
            </div>
          ) : qrData ? (
            <>
              {/* Month Selector */}
              {activeRecords.length > 1 && (
                <div className="p-4 bg-[#1A1C17] border border-[#A6C36F]/20 rounded-xl">
                  <p className="text-sm text-[#E8E3C5]/70 mb-2">Choose month to pay</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeRecords.map((rec) => {
                      const isActive = rec.month === paymentMonth.month && rec.year === paymentMonth.year;
                      return (
                        <button
                          key={`${rec.month}-${rec.year}`}
                          onClick={() => onSelectRecord && onSelectRecord(rec)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                            isActive
                              ? 'border-[#A6C36F] bg-[#A6C36F]/10 text-[#F5F3E7]'
                              : 'border-[#A6C36F]/20 text-[#E8E3C5]/80 hover:border-[#A6C36F]/40'
                          }`}
                        >
                          <div className="font-semibold">{rec.month} {rec.year}</div>
                          <div className="text-xs text-[#E8E3C5]/60">INR {rec.amount?.toLocaleString('en-IN') || '-'} • Due {rec.deadline ? new Date(rec.deadline).toLocaleDateString('en-IN') : '—'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="flex flex-col items-center p-6 bg-[#0E0F0B] border border-[#A6C36F]/15 rounded-xl">
                <QRCode
                  value={qrData.upiUrl}
                  size={256}
                  level="H"
                  className="w-full max-w-[256px] h-auto"
                />
                <p className="mt-4 text-sm text-[#E8E3C5]/70 text-center">Scan with any UPI app</p>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 p-4 bg-[#1A1C17] border border-[#A6C36F]/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-[#E8E3C5]/70 text-sm">Amount</span>
                  <span className="text-[#A6C36F] font-bold text-lg">INR {amountDisplay ?? '—'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[#E8E3C5]/70 text-sm">Reference Code</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-[#A6C36F] bg-[#A6C36F]/10 px-2 py-1 rounded">
                      {maskedReference || '—'}
                    </code>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#E8E3C5]/70 text-sm">Pay To</span>
                  <span className="text-[#F5F3E7] text-sm font-medium">
                    {payeeDisplay || '—'}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-[#2A2D24] border border-[#A6C36F]/15 rounded-xl">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[#A6C36F] flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-[#A6C36F]">
                      Important Instructions:
                    </p>
                    <ul className="space-y-1 text-xs text-[#E8E3C5]">
                      {displayInstructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-[#A6C36F]">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              {payment && !payment.memberConfirmedPayment && (
                <button
                  onClick={handleConfirmPayment}
                  disabled={confirming}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#A6C36F] to-[#8FAE5D] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(166,195,111,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      I have paid
                    </>
                  )}
                </button>
              )}

              {payment && payment.memberConfirmedPayment && (
                <div className="text-center p-4 bg-[#1E211A] border border-[#A6C36F]/20 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-[#A6C36F] mx-auto mb-2" />
                  <p className="text-[#A6C36F] font-semibold">
                    Payment Confirmed
                  </p>
                  <p className="text-sm text-[#E8E3C5]/70 mt-1">
                    Awaiting treasurer verification
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-[#E8E3C5]/80">Failed to generate QR code</p>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center px-6 pb-5 gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 text-[#E8E3C5] border border-[#A6C36F]/30 rounded-xl hover:bg-[#A6C36F]/10 transition-colors"
          >
            Cancel
          </button>
          <div className="flex-1 text-right text-xs text-[#E8E3C5]/60">
            {paymentMonth && (
              <span>
                Paying for {paymentMonth.month} {paymentMonth.year}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default QRPaymentModal;
