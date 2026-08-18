import React, { useState } from 'react';
import API_BASE from '../utils/apiConfig';
import { locations } from '../data/kenyanLocations';
import './MemberRegister.css';

const CATEGORIES = [
  'Church Leader', 'Pastor', 'Village Elder', 'Agent', 'Youth Leader',
  'Women Leader', 'Community Member', 'Government Official', 'NGO Representative', 'Volunteer',
];

const BENEFITS = [
  'Access to community development programs and resources',
  'Networking with leaders across all 47 counties',
  'Participation in education and health initiatives',
  'Voice in collective decision-making and advocacy',
];

// Normalise phone to 07XXXXXXXX / 01XXXXXXXX display, store as +254XXXXXXXXX
function maskPhone(raw) {
  // Strip everything except digits and leading +
  let v = raw.replace(/[^\d+]/g, '');
  if (v.startsWith('+254')) v = '0' + v.slice(4);
  if (v.startsWith('254') && v.length > 9) v = '0' + v.slice(3);
  // Limit to 10 digits
  v = v.replace(/\D/g, '').slice(0, 10);
  return v;
}

function toE164(display) {
  if (!display) return '';
  const digits = display.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) return '+254' + digits.slice(1);
  return display;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <polyline points="1.5,6 4.5,9 10.5,3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
      <polyline points="9,12 11,14 15,10" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="8" strokeLinecap="round" strokeWidth="2.5" />
      <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
    </svg>
  );
}

function PrivacyModal({ onClose }) {
  return (
    <div className="reg-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
      <div className="reg-modal">
        <button className="reg-modal-close" onClick={onClose} aria-label="Close privacy policy">×</button>
        <h3 id="privacy-title">Privacy Policy & Data Protection Notice</h3>
        <p>
          Mbogo Welfare Empowerment Foundation is committed to protecting your personal data in
          accordance with the <strong>Kenya Data Protection Act, 2019</strong>.
        </p>
        <p><strong>What we collect and why:</strong></p>
        <ul>
          <li><strong>Full Name & Phone Number</strong> — to identify you as a member and communicate program updates.</li>
          <li><strong>National ID Number</strong> — required by Kenyan law for formal registration of welfare organisations and to prevent duplicate memberships.</li>
          <li><strong>Location data</strong> — to connect you with programs and leaders in your area.</li>
          <li><strong>Role / Category</strong> — to tailor resources and communications to your community role.</li>
        </ul>
        <p><strong>How we protect your data:</strong></p>
        <ul>
          <li>All data is transmitted over encrypted HTTPS connections.</li>
          <li>Your National ID is stored in hashed form and never shared with third parties.</li>
          <li>Only authorised Foundation administrators can access member records.</li>
        </ul>
        <p><strong>Your rights:</strong> You may request access to, correction of, or deletion of your data at any time by emailing <strong>mbogoempowermentfoundation@gmail.com</strong>.</p>
        <p style={{ marginBottom: 0 }}>
          By registering you consent to this processing. Membership is voluntary and you may withdraw at any time.
        </p>
      </div>
    </div>
  );
}

function MemberRegister({ onBack, onLogin }) {
  const [form, setForm] = useState({
    full_names: '', national_id: '', phone_display: '',
    gender: '', county: '', constituency: '', ward: '', category: '',
  });
  const [errors, setErrors]     = useState({});
  const [showIdTip, setShowIdTip] = useState(false);
  const [consent, setConsent]   = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  // Cascading location data
  const counties       = Object.keys(locations);
  const constituencies = form.county ? Object.keys(locations[form.county] || {}) : [];
  const wards          = form.county && form.constituency
    ? (locations[form.county]?.[form.constituency] || [])
    : [];

  const set = (k) => (e) => {
    const value = e.target.value;
    const next = { ...form, [k]: value };
    if (k === 'county')        { next.constituency = ''; next.ward = ''; }
    else if (k === 'constituency') { next.ward = ''; }
    setForm(next);
    if (errors[k]) setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  const setPhone = (e) => {
    const masked = maskPhone(e.target.value);
    setForm((prev) => ({ ...prev, phone_display: masked }));
    if (errors.phone_number) setErrors((prev) => { const n = { ...prev }; delete n.phone_number; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.full_names.trim())   e.full_names   = 'Full name is required.';
    if (!form.national_id.trim())  e.national_id  = 'National ID is required.';
    else if (!/^\d{7,8}$/.test(form.national_id.trim())) e.national_id = 'Enter a valid 7–8 digit ID number.';
    const phone = form.phone_display.replace(/\D/g, '');
    if (!phone)                    e.phone_number = 'Phone number is required.';
    else if (!/^(07|01)\d{8}$/.test(form.phone_display)) e.phone_number = 'Enter a valid Kenyan number (07XX or 01XX, 10 digits).';
    if (!form.gender)              e.gender       = 'Please select your gender.';
    if (!form.county)              e.county       = 'Please select your county.';
    if (!form.constituency)        e.constituency = 'Please select your constituency.';
    if (!form.ward)                e.ward         = 'Please select your ward.';
    if (!form.category)            e.category     = 'Please select your role.';
    if (!consent)                  e.consent      = 'You must agree to the Privacy Policy to register.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    const payload = {
      full_names:        form.full_names.trim(),
      national_id:       form.national_id.trim(),
      phone_number:      toE164(form.phone_display),
      gender:            form.gender,
      county:            form.county,
      constituency:      form.constituency,
      ward:              form.ward,
      physical_location: form.ward,
      category:          form.category,
    };

    fetch(`${API_BASE}/member-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((d) => {
        setLoading(false);
        if (d.success) setDone(true);
        else setApiError(d.error || 'Registration failed. Please try again.');
      })
      .catch(() => { setLoading(false); setApiError('No connection. Please check your internet and try again.'); });
  };

  // ── Success screen ──────────────────────────────────────────────
  if (done) return (
    <div className="reg-success">
      <div className="reg-success-card">
        <div className="reg-success-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="4,12 9,17 20,6" />
          </svg>
        </div>
        <h2>Application Received!</h2>
        <p>
          Thank you for joining the Mbogo Welfare Empowerment Foundation.<br />
          Your application is under review — an administrator will approve your membership shortly.
        </p>
        <button className="reg-submit" onClick={onBack} style={{ maxWidth: 280, margin: '0 auto' }}>
          Back to Home
        </button>
      </div>
    </div>
  );

  // ── Main form ───────────────────────────────────────────────────
  return (
    <div className="reg-page">
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      {/* Back bar */}
      <div className="reg-back-bar">
        <button type="button" onClick={onBack} className="reg-back-btn" aria-label="Back to home">
          ← Back to Home
        </button>
      </div>

      <div className="reg-body">

        {/* ── Left column ── */}
        <aside className="reg-left" aria-label="About Mbogo Foundation">
          <div className="reg-logo-wrap">
            <img src="/mbogo-background.jpeg" alt="Mbogo Foundation logo" className="reg-logo-img" />
            <div>
              <div className="reg-org-name">Mbogo Foundation</div>
              <div className="reg-org-tagline">Murang'a County, Kenya</div>
            </div>
          </div>

          <h1 className="reg-headline">
            Empowering Communities<br />
            Through <span>Unity</span>
          </h1>

          <p className="reg-mission">
            The Mbogo Welfare Empowerment Foundation unites community leaders, youth, and
            volunteers across Kenya to drive sustainable development, education, and social
            empowerment. Join us and be part of lasting change.
          </p>

          <div className="reg-stats" role="list" aria-label="Foundation impact statistics">
            <div className="reg-stat" role="listitem">
              <div className="reg-stat-num">47</div>
              <div className="reg-stat-label">Counties Reached</div>
            </div>
            <div className="reg-stat" role="listitem">
              <div className="reg-stat-num">500+</div>
              <div className="reg-stat-label">Active Members</div>
            </div>
            <div className="reg-stat" role="listitem">
              <div className="reg-stat-num">10+</div>
              <div className="reg-stat-label">Programs Running</div>
            </div>
            <div className="reg-stat" role="listitem">
              <div className="reg-stat-num">2019</div>
              <div className="reg-stat-label">Est. Year</div>
            </div>
          </div>

          <ul className="reg-benefits" aria-label="Member benefits">
            {BENEFITS.map((b) => (
              <li key={b}>
                <span className="reg-check"><CheckIcon /></span>
                {b}
              </li>
            ))}
          </ul>

          <div className="reg-privacy-badge" role="note">
            <ShieldIcon />
            <p>
              Your data is encrypted and processed in compliance with the{' '}
              <strong>Kenya Data Protection Act, 2019</strong>. We never sell or share your
              personal information.
            </p>
          </div>
        </aside>

        {/* ── Right column: form card ── */}
        <main>
          <div className="reg-card">
            <h2 className="reg-card-title">Create your account</h2>
            <p className="reg-card-sub">All fields marked <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span> are required.</p>

            <form className="reg-form" onSubmit={handleSubmit} noValidate aria-label="Member registration form">

              {/* Full Name */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="full_names">
                  Full Name <span className="reg-required" aria-hidden="true">*</span>
                </label>
                <input
                  id="full_names"
                  className={`reg-input${errors.full_names ? ' error' : ''}`}
                  value={form.full_names}
                  onChange={set('full_names')}
                  placeholder="e.g. Jane Wanjiku Mwangi"
                  autoComplete="name"
                  aria-required="true"
                  aria-describedby={errors.full_names ? 'err-full_names' : undefined}
                />
                {errors.full_names && (
                  <span id="err-full_names" className="reg-field-error" role="alert">
                    <InfoIcon /> {errors.full_names}
                  </span>
                )}
              </div>

              {/* National ID */}
              <div className="reg-field">
                <div className="reg-label-row">
                  <label className="reg-label" htmlFor="national_id" style={{ margin: 0 }}>
                    National ID Number <span className="reg-required" aria-hidden="true">*</span>
                  </label>
                  <button
                    type="button"
                    className="reg-tooltip-btn"
                    onClick={() => setShowIdTip((v) => !v)}
                    aria-expanded={showIdTip}
                    aria-controls="id-tooltip"
                    aria-label="Why do we collect your National ID?"
                  >
                    <InfoIcon />
                  </button>
                </div>
                {showIdTip && (
                  <div id="id-tooltip" className="reg-tooltip-box" role="note">
                    🔒 Your National ID is required by Kenyan law for formal welfare organisation
                    registration and to prevent duplicate memberships. It is stored securely and
                    never shared with third parties.
                  </div>
                )}
                <input
                  id="national_id"
                  className={`reg-input${errors.national_id ? ' error' : ''}`}
                  value={form.national_id}
                  onChange={set('national_id')}
                  placeholder="e.g. 12345678"
                  inputMode="numeric"
                  maxLength={8}
                  aria-required="true"
                  aria-describedby={errors.national_id ? 'err-national_id' : 'id-tooltip'}
                />
                {errors.national_id && (
                  <span id="err-national_id" className="reg-field-error" role="alert">
                    <InfoIcon /> {errors.national_id}
                  </span>
                )}
              </div>

              {/* Phone + Gender row */}
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label" htmlFor="phone_number">
                    Phone Number <span className="reg-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="phone_number"
                    className={`reg-input${errors.phone_number ? ' error' : ''}`}
                    value={form.phone_display}
                    onChange={setPhone}
                    placeholder="07XXXXXXXX"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-required="true"
                    aria-describedby={errors.phone_number ? 'err-phone' : 'hint-phone'}
                  />
                  {errors.phone_number
                    ? <span id="err-phone" className="reg-field-error" role="alert"><InfoIcon /> {errors.phone_number}</span>
                    : <span id="hint-phone" className="reg-helper">Safaricom / Airtel / Telkom</span>
                  }
                </div>

                <div className="reg-field">
                  <label className="reg-label" htmlFor="gender">
                    Gender <span className="reg-required" aria-hidden="true">*</span>
                  </label>
                  <div className="reg-select-wrap">
                    <select
                      id="gender"
                      className={`reg-select${errors.gender ? ' error' : ''}`}
                      value={form.gender}
                      onChange={set('gender')}
                      aria-required="true"
                      aria-describedby={errors.gender ? 'err-gender' : undefined}
                    >
                      <option value="">Select…</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Prefer not to say</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <span id="err-gender" className="reg-field-error" role="alert">
                      <InfoIcon /> {errors.gender}
                    </span>
                  )}
                </div>
              </div>

              {/* County */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="county">
                  County <span className="reg-required" aria-hidden="true">*</span>
                </label>
                <div className="reg-select-wrap">
                  <select
                    id="county"
                    className={`reg-select${errors.county ? ' error' : ''}`}
                    value={form.county}
                    onChange={set('county')}
                    aria-required="true"
                    aria-describedby={errors.county ? 'err-county' : undefined}
                  >
                    <option value="">Select County…</option>
                    {counties.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {errors.county && (
                  <span id="err-county" className="reg-field-error" role="alert">
                    <InfoIcon /> {errors.county}
                  </span>
                )}
              </div>

              {/* Constituency */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="constituency">
                  Constituency <span className="reg-required" aria-hidden="true">*</span>
                </label>
                <div className="reg-select-wrap">
                  <select
                    id="constituency"
                    className={`reg-select${errors.constituency ? ' error' : ''}`}
                    value={form.constituency}
                    onChange={set('constituency')}
                    disabled={!form.county || constituencies.length === 0}
                    aria-required="true"
                    aria-describedby={errors.constituency ? 'err-constituency' : 'hint-constituency'}
                  >
                    <option value="">
                      {!form.county ? 'Select a county first' : constituencies.length === 0 ? 'Type your constituency below' : 'Select Constituency…'}
                    </option>
                    {constituencies.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Fallback text input when county has no mapped constituencies */}
                {form.county && constituencies.length === 0 && (
                  <input
                    className={`reg-input${errors.constituency ? ' error' : ''}`}
                    style={{ marginTop: 8 }}
                    value={form.constituency}
                    onChange={set('constituency')}
                    placeholder="Type your constituency"
                    aria-label="Constituency (text input)"
                    aria-describedby={errors.constituency ? 'err-constituency' : undefined}
                  />
                )}
                {errors.constituency
                  ? <span id="err-constituency" className="reg-field-error" role="alert"><InfoIcon /> {errors.constituency}</span>
                  : !form.county && <span id="hint-constituency" className="reg-helper">Select a county first</span>
                }
              </div>

              {/* Ward */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="ward">
                  Ward <span className="reg-required" aria-hidden="true">*</span>
                </label>
                <div className="reg-select-wrap">
                  <select
                    id="ward"
                    className={`reg-select${errors.ward ? ' error' : ''}`}
                    value={form.ward}
                    onChange={set('ward')}
                    disabled={!form.constituency || wards.length === 0}
                    aria-required="true"
                    aria-describedby={errors.ward ? 'err-ward' : 'hint-ward'}
                  >
                    <option value="">
                      {!form.constituency ? 'Select a constituency first' : wards.length === 0 ? 'Type your ward below' : 'Select Ward…'}
                    </option>
                    {wards.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                {/* Fallback text input when constituency has no mapped wards */}
                {form.constituency && wards.length === 0 && (
                  <input
                    className={`reg-input${errors.ward ? ' error' : ''}`}
                    style={{ marginTop: 8 }}
                    value={form.ward}
                    onChange={set('ward')}
                    placeholder="Type your ward"
                    aria-label="Ward (text input)"
                    aria-describedby={errors.ward ? 'err-ward' : undefined}
                  />
                )}
                {errors.ward
                  ? <span id="err-ward" className="reg-field-error" role="alert"><InfoIcon /> {errors.ward}</span>
                  : !form.constituency && <span id="hint-ward" className="reg-helper">Select a constituency first</span>
                }
              </div>

              {/* Role */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="category">
                  Your Role <span className="reg-required" aria-hidden="true">*</span>
                </label>
                <div className="reg-select-wrap">
                  <select
                    id="category"
                    className={`reg-select${errors.category ? ' error' : ''}`}
                    value={form.category}
                    onChange={set('category')}
                    aria-required="true"
                    aria-describedby={errors.category ? 'err-category' : undefined}
                  >
                    <option value="">Select your role…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {errors.category && (
                  <span id="err-category" className="reg-field-error" role="alert">
                    <InfoIcon /> {errors.category}
                  </span>
                )}
              </div>

              {/* Consent */}
              <div className={`reg-consent${errors.consent ? ' error' : ''}`}>
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (errors.consent) setErrors((prev) => { const n = { ...prev }; delete n.consent; return n; });
                  }}
                  aria-required="true"
                  aria-describedby={errors.consent ? 'err-consent' : undefined}
                />
                <label htmlFor="consent" className="reg-consent-text">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    className="reg-switch-btn"
                    onClick={() => setShowPrivacy(true)}
                  >
                    Privacy Policy
                  </button>
                  . I consent to Mbogo Foundation processing my personal data in accordance with
                  the Kenya Data Protection Act, 2019.
                </label>
              </div>
              {errors.consent && (
                <span id="err-consent" className="reg-field-error" role="alert" style={{ marginTop: -12, marginBottom: 16 }}>
                  <InfoIcon /> {errors.consent}
                </span>
              )}

              {/* API error */}
              {apiError && (
                <div className="reg-error-banner" role="alert">
                  <InfoIcon /> {apiError}
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="reg-submit" disabled={loading} aria-busy={loading}>
                {loading ? (
                  <><span className="reg-spinner" aria-hidden="true" /> Submitting…</>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="reg-divider" />
              <p className="reg-switch">
                Already have an account?
                <button type="button" className="reg-switch-btn" onClick={onLogin}>
                  Sign in here
                </button>
              </p>

            </form>
          </div>
        </main>

      </div>
    </div>
  );
}

export default MemberRegister;
