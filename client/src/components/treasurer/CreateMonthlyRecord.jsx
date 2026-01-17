import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, DollarSign, Check, X } from 'lucide-react';
import { createMonthlyRecord, getMonthlyRecords } from '../../utils/treasurerAPI';

const CreateMonthlyRecord = () => {
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
    deadline: '',
    amounts: {
      firstYear: '',
      secondYear: '',
      thirdYear: '',
      fourthYear: ''
    },
    includedYears: []
  });

  const [loading, setLoading] = useState(false);
  const [existingRecords, setExistingRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = ['1st', '2nd', '3rd', '4th'];

  useEffect(() => {
    fetchExistingRecords();
  }, []);

  const fetchExistingRecords = async () => {
    setRecordsLoading(true);
    try {
      const data = await getMonthlyRecords();
      setExistingRecords(data.records || []);
    } catch (error) {
      console.error('Error fetching existing records:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleYearToggle = (year) => {
    if (formData.includedYears.includes(year)) {
      setFormData({
        ...formData,
        includedYears: formData.includedYears.filter(y => y !== year)
      });
    } else {
      setFormData({
        ...formData,
        includedYears: [...formData.includedYears, year]
      });
    }
  };

  const handleAmountChange = (yearKey, value) => {
    setFormData({
      ...formData,
      amounts: {
        ...formData.amounts,
        [yearKey]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.month) {
      toast.error('Please select a month');
      return;
    }
    if (!formData.year) {
      toast.error('Please select a year');
      return;
    }
    if (!formData.deadline) {
      toast.error('Please select a deadline');
      return;
    }
    if (formData.includedYears.length === 0) {
      toast.error('Please select at least one year to include');
      return;
    }

    // Check if amounts are set for included years
    const yearMapping = {
      '1st': 'firstYear',
      '2nd': 'secondYear',
      '3rd': 'thirdYear',
      '4th': 'fourthYear'
    };

    for (const year of formData.includedYears) {
      const amountKey = yearMapping[year];
      if (!formData.amounts[amountKey] || parseFloat(formData.amounts[amountKey]) <= 0) {
        toast.error(`Please set a valid amount for ${year} year`);
        return;
      }
    }

    setLoading(true);
    try {
      await createMonthlyRecord({
        month: formData.month,
        year: parseInt(formData.year),
        deadline: formData.deadline,
        amounts: {
          firstYear: parseFloat(formData.amounts.firstYear) || 0,
          secondYear: parseFloat(formData.amounts.secondYear) || 0,
          thirdYear: parseFloat(formData.amounts.thirdYear) || 0,
          fourthYear: parseFloat(formData.amounts.fourthYear) || 0
        },
        includedYears: formData.includedYears
      });

      toast.success('Monthly record created successfully!');
      
      // Reset form
      setFormData({
        month: '',
        year: new Date().getFullYear(),
        deadline: '',
        amounts: {
          firstYear: '',
          secondYear: '',
          thirdYear: '',
          fourthYear: ''
        },
        includedYears: []
      });

      // Refresh records list
      fetchExistingRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create monthly record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-black/60 backdrop-blur-xl border border-[#A6C36F]/20 rounded-2xl p-8 shadow-[0_0_20px_rgba(166,195,111,0.08)]">
        <h2 className="text-2xl font-bold text-[#F5F3E7] mb-6">Create Monthly Group Fund Record</h2>
        <p className="text-[#E8E3C5]/70 mb-6">Set the monthly payment details for members. Members will only be able to pay according to these settings.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Month and Year Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Month
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/20 rounded-xl text-[#F5F3E7] focus:outline-none focus:border-[#A6C36F] transition"
                required
              >
                <option value="">Select Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/20 rounded-xl text-[#F5F3E7] focus:outline-none focus:border-[#A6C36F] transition"
                min={new Date().getFullYear() - 1}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Payment Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/20 rounded-xl text-[#F5F3E7] focus:outline-none focus:border-[#A6C36F] transition"
              required
            />
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-3">
              Select Years to Include
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {years.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYearToggle(year)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    formData.includedYears.includes(year)
                      ? 'bg-[#A6C36F] text-black border-2 border-[#A6C36F]'
                      : 'bg-black/40 text-[#E8E3C5] border-2 border-[#A6C36F]/20 hover:border-[#A6C36F]/50'
                  }`}
                >
                  {formData.includedYears.includes(year) && <Check className="w-4 h-4 inline mr-2" />}
                  {year} Year
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input for Each Year */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-3">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Set Amount for Each Year
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-2">1st Year Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amounts.firstYear}
                  onChange={(e) => handleAmountChange('firstYear', e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/20 rounded-xl text-[#F5F3E7] focus:outline-none focus:border-[#A6C36F] transition"
                  placeholder="0"
                  min="0"
                  disabled={!formData.includedYears.includes('1st')}
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-2">2nd Year Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amounts.secondYear}
                  onChange={(e) => handleAmountChange('secondYear', e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/20 rounded-xl text-[#F5F3E7] focus:outline-none focus:border-[#A6C36F] transition"
                  placeholder="0"
                  min="0"
                  disabled={!formData.includedYears.includes('2nd')}
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-2">3rd Year Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amounts.thirdYear}
                  onChange={(e) => handleAmountChange('thirdYear', e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/20 rounded-xl text-[#F5F3E7] focus:outline-none focus:border-[#A6C36F] transition"
                  placeholder="0"
                  min="0"
                  disabled={!formData.includedYears.includes('3rd')}
                />
              </div>

              <div>
                <label className="block text-xs text-[#E8E3C5]/60 mb-2">4th Year Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amounts.fourthYear}
                  onChange={(e) => handleAmountChange('fourthYear', e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/20 rounded-xl text-[#F5F3E7] focus:outline-none focus:border-[#A6C36F] transition"
                  placeholder="0"
                  min="0"
                  disabled={!formData.includedYears.includes('4th')}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-[#A6C36F] text-black rounded-xl font-semibold hover:bg-[#8FAE5D] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_15px_rgba(166,195,111,0.4)]"
          >
            {loading ? 'Creating...' : 'Create Monthly Record'}
          </button>
        </form>
      </div>

      {/* Existing Records */}
      <div className="bg-black/60 backdrop-blur-xl border border-[#A6C36F]/20 rounded-2xl p-8 shadow-[0_0_20px_rgba(166,195,111,0.08)]">
        <h2 className="text-2xl font-bold text-[#F5F3E7] mb-6">Existing Monthly Records</h2>
        
        {recordsLoading ? (
          <div className="text-center py-8 text-[#E8E3C5]/60">Loading records...</div>
        ) : existingRecords.length === 0 ? (
          <div className="text-center py-8 text-[#E8E3C5]/60">No records found</div>
        ) : (
          <div className="space-y-4">
            {existingRecords.map(record => (
              <div
                key={record._id}
                className="bg-black/40 border border-[#A6C36F]/20 rounded-xl p-6 hover:border-[#A6C36F]/40 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#F5F3E7]">
                      {record.month} {record.year}
                    </h3>
                    <p className="text-sm text-[#E8E3C5]/60">
                      Deadline: {new Date(record.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      record.status === 'active'
                        ? 'bg-[#A6C36F]/20 text-[#A6C36F]'
                        : 'bg-[#E8E3C5]/20 text-[#E8E3C5]'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {record.amounts.firstYear > 0 && (
                    <div className="text-sm">
                      <span className="text-[#E8E3C5]/60">1st Year:</span>{' '}
                      <span className="text-[#F5F3E7] font-medium">₹{record.amounts.firstYear}</span>
                    </div>
                  )}
                  {record.amounts.secondYear > 0 && (
                    <div className="text-sm">
                      <span className="text-[#E8E3C5]/60">2nd Year:</span>{' '}
                      <span className="text-[#F5F3E7] font-medium">₹{record.amounts.secondYear}</span>
                    </div>
                  )}
                  {record.amounts.thirdYear > 0 && (
                    <div className="text-sm">
                      <span className="text-[#E8E3C5]/60">3rd Year:</span>{' '}
                      <span className="text-[#F5F3E7] font-medium">₹{record.amounts.thirdYear}</span>
                    </div>
                  )}
                  {record.amounts.fourthYear > 0 && (
                    <div className="text-sm">
                      <span className="text-[#E8E3C5]/60">4th Year:</span>{' '}
                      <span className="text-[#F5F3E7] font-medium">₹{record.amounts.fourthYear}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-[#E8E3C5]/60">
                  Included Years: {record.includedYears.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMonthlyRecord;
