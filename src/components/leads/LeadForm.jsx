import { useState } from 'react';
import { User, Building, Mail, Phone, AlertCircle } from 'lucide-react';

// Constant arrays for options
const STATUS_OPTIONS = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

/**
 * LeadForm Component
 * Renders a clean, accessible form for creating or updating a lead.
 * 
 * @param {Object} props
 * @param {Object} [props.initialData] - Optional lead data for edit mode.
 * @param {Function} props.onSubmit - Callback function triggered on successful form submission.
 * @param {Function} props.onCancel - Callback function triggered when cancel is clicked.
 */
export default function LeadForm({ initialData, onSubmit, onCancel }) {
  const isEditMode = !!initialData;

  // Local form state initialized directly from initialData or defaults
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    email: initialData?.email || '',
    phone: initialData?.phone === 'N/A' ? '' : (initialData?.phone || ''),
    status: initialData?.status || 'New',
    source: initialData?.source || 'Website',
  });

  // Local validation error states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});


  // General field handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error if user starts typing in that field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Mark field as touched when user clicks away
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  // Individual field validation helper
  const validateField = (fieldName, value) => {
    let errorMsg = '';
    const trimmedVal = value ? value.trim() : '';

    if (fieldName === 'name' && !trimmedVal) {
      errorMsg = 'Full Name is required';
    } else if (fieldName === 'company' && !trimmedVal) {
      errorMsg = 'Company Name is required';
    } else if (fieldName === 'email') {
      if (!trimmedVal) {
        errorMsg = 'Email Address is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedVal)) {
          errorMsg = 'Please enter a valid email address';
        }
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[fieldName] = errorMsg;
      } else {
        delete next[fieldName];
      }
      return next;
    });

    return !errorMsg;
  };

  // Handle submit validation
  const handleSubmit = (e) => {
    e.preventDefault();

    // Trigger validation on all fields
    const isNameValid = validateField('name', formData.name);
    const isCompanyValid = validateField('company', formData.company);
    const isEmailValid = validateField('email', formData.email);

    // Set all fields to touched so errors show up visually
    setTouched({
      name: true,
      company: true,
      email: true,
    });

    if (isNameValid && isCompanyValid && isEmailValid) {
      // Clean and sanitize the submission data
      const cleanedData = {
        ...formData,
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || 'N/A',
      };

      onSubmit(cleanedData);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col h-full justify-between"
      noValidate
    >
      <div className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label 
            htmlFor="lead-name" 
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex justify-between"
          >
            <span>Full Name <span className="text-rose-500">*</span></span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <User size={16} />
            </span>
            <input
              type="text"
              id="lead-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. John Connor"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border ${
                touched.name && errors.name 
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200' 
                  : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
              } rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all duration-200`}
              aria-invalid={touched.name && errors.name ? 'true' : 'false'}
              aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
              required
            />
          </div>
          {touched.name && errors.name && (
            <p id="name-error" className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <label 
            htmlFor="lead-company" 
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Company Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Building size={16} />
            </span>
            <input
              type="text"
              id="lead-company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Cyberdyne Systems"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border ${
                touched.company && errors.company 
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200' 
                  : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
              } rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all duration-200`}
              aria-invalid={touched.company && errors.company ? 'true' : 'false'}
              aria-describedby={touched.company && errors.company ? 'company-error' : undefined}
              required
            />
          </div>
          {touched.company && errors.company && (
            <p id="company-error" className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{errors.company}</span>
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label 
            htmlFor="lead-email" 
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Mail size={16} />
            </span>
            <input
              type="email"
              id="lead-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. john@cyberdyne.io"
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border ${
                touched.email && errors.email 
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200' 
                  : 'border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
              } rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all duration-200`}
              aria-invalid={touched.email && errors.email ? 'true' : 'false'}
              aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
              required
            />
          </div>
          {touched.email && errors.email && (
            <p id="email-error" className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label 
            htmlFor="lead-phone" 
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Phone size={16} />
            </span>
            <input
              type="tel"
              id="lead-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 555-0199"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Status Dropdown */}
          <div className="space-y-1.5">
            <label 
              htmlFor="lead-status" 
              className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              Status
            </label>
            <div className="relative">
              <select
                id="lead-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all duration-200 appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="dark:bg-slate-900">{opt}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Source Dropdown */}
          <div className="space-y-1.5">
            <label 
              htmlFor="lead-source" 
              className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              Source
            </label>
            <div className="relative">
              <select
                id="lead-source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all duration-200 appearance-none cursor-pointer"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="dark:bg-slate-900">{opt}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex gap-3 border-t border-slate-100 dark:border-slate-850 pt-5 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold rounded-xl text-sm transition-all duration-150 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 active:scale-97 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-200/50 dark:shadow-none active:scale-97 transition-all duration-150 cursor-pointer"
        >
          {isEditMode ? 'Save Changes' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
