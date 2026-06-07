'use client';
import { useState, useRef, useEffect } from 'react';

export const countries = [
  { code: 'AF', name: 'Afghanistan', dial: '+93', flag: '🇦🇫' },
  { code: 'ZA', name: 'Afrique du Sud', dial: '+27', flag: '🇿🇦' },
  { code: 'AL', name: 'Albanie', dial: '+355', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algérie', dial: '+213', flag: '🇩🇿' },
  { code: 'DE', name: 'Allemagne', dial: '+49', flag: '🇩🇪' },
  { code: 'AD', name: 'Andorre', dial: '+376', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', dial: '+244', flag: '🇦🇴' },
  { code: 'AG', name: 'Antigua-et-Barbuda', dial: '+1268', flag: '🇦🇬' },
  { code: 'SA', name: 'Arabie saoudite', dial: '+966', flag: '🇸🇦' },
  { code: 'AR', name: 'Argentine', dial: '+54', flag: '🇦🇷' },
  { code: 'AM', name: 'Arménie', dial: '+374', flag: '🇦🇲' },
  { code: 'AU', name: 'Australie', dial: '+61', flag: '🇦🇺' },
  { code: 'AT', name: 'Autriche', dial: '+43', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaïdjan', dial: '+994', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', dial: '+1242', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahreïn', dial: '+973', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbade', dial: '+1246', flag: '🇧🇧' },
  { code: 'BE', name: 'Belgique', dial: '+32', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', dial: '+501', flag: '🇧🇿' },
  { code: 'BJ', name: 'Bénin', dial: '+229', flag: '🇧🇯' },
  { code: 'BT', name: 'Bhoutan', dial: '+975', flag: '🇧🇹' },
  { code: 'BY', name: 'Biélorussie', dial: '+375', flag: '🇧🇾' },
  { code: 'BO', name: 'Bolivie', dial: '+591', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnie-Herzégovine', dial: '+387', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', dial: '+267', flag: '🇧🇼' },
  { code: 'BR', name: 'Brésil', dial: '+55', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', dial: '+673', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgarie', dial: '+359', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', dial: '+226', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', dial: '+257', flag: '🇧🇮' },
  { code: 'KH', name: 'Cambodge', dial: '+855', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroun', dial: '+237', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'CV', name: 'Cap-Vert', dial: '+238', flag: '🇨🇻' },
  { code: 'CF', name: 'Centrafrique', dial: '+236', flag: '🇨🇫' },
  { code: 'CL', name: 'Chili', dial: '+56', flag: '🇨🇱' },
  { code: 'CN', name: 'Chine', dial: '+86', flag: '🇨🇳' },
  { code: 'CY', name: 'Chypre', dial: '+357', flag: '🇨🇾' },
  { code: 'CO', name: 'Colombie', dial: '+57', flag: '🇨🇴' },
  { code: 'KM', name: 'Comores', dial: '+269', flag: '🇰🇲' },
  { code: 'CG', name: 'Congo', dial: '+242', flag: '🇨🇬' },
  { code: 'CD', name: 'Congo (RDC)', dial: '+243', flag: '🇨🇩' },
  { code: 'KP', name: 'Corée du Nord', dial: '+850', flag: '🇰🇵' },
  { code: 'KR', name: 'Corée du Sud', dial: '+82', flag: '🇰🇷' },
  { code: 'CR', name: 'Costa Rica', dial: '+506', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatie', dial: '+385', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', dial: '+53', flag: '🇨🇺' },
  { code: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '🇨🇮' },
  { code: 'DK', name: 'Danemark', dial: '+45', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', dial: '+253', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominique', dial: '+1767', flag: '🇩🇲' },
  { code: 'EG', name: 'Égypte', dial: '+20', flag: '🇪🇬' },
  { code: 'AE', name: 'Émirats arabes unis', dial: '+971', flag: '🇦🇪' },
  { code: 'EC', name: 'Équateur', dial: '+593', flag: '🇪🇨' },
  { code: 'ER', name: 'Érythrée', dial: '+291', flag: '🇪🇷' },
  { code: 'ES', name: 'Espagne', dial: '+34', flag: '🇪🇸' },
  { code: 'EE', name: 'Estonie', dial: '+372', flag: '🇪🇪' },
  { code: 'SZ', name: 'Eswatini', dial: '+268', flag: '🇸🇿' },
  { code: 'US', name: 'États-Unis', dial: '+1', flag: '🇺🇸' },
  { code: 'ET', name: 'Éthiopie', dial: '+251', flag: '🇪🇹' },
  { code: 'FJ', name: 'Fidji', dial: '+679', flag: '🇫🇯' },
  { code: 'FI', name: 'Finlande', dial: '+358', flag: '🇫🇮' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', dial: '+241', flag: '🇬🇦' },
  { code: 'GM', name: 'Gambie', dial: '+220', flag: '🇬🇲' },
  { code: 'GE', name: 'Géorgie', dial: '+995', flag: '🇬🇪' },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭' },
  { code: 'GR', name: 'Grèce', dial: '+30', flag: '🇬🇷' },
  { code: 'GD', name: 'Grenade', dial: '+1473', flag: '🇬🇩' },
  { code: 'GP', name: 'Guadeloupe', dial: '+590', flag: '🇬🇵' },
  { code: 'GT', name: 'Guatemala', dial: '+502', flag: '🇬🇹' },
  { code: 'GN', name: 'Guinée', dial: '+224', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinée-Bissau', dial: '+245', flag: '🇬🇼' },
  { code: 'GQ', name: 'Guinée équatoriale', dial: '+240', flag: '🇬🇶' },
  { code: 'GY', name: 'Guyana', dial: '+592', flag: '🇬🇾' },
  { code: 'GF', name: 'Guyane française', dial: '+594', flag: '🇬🇫' },
  { code: 'HT', name: 'Haïti', dial: '+509', flag: '🇭🇹' },
  { code: 'HN', name: 'Honduras', dial: '+504', flag: '🇭🇳' },
  { code: 'HU', name: 'Hongrie', dial: '+36', flag: '🇭🇺' },
  { code: 'IN', name: 'Inde', dial: '+91', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonésie', dial: '+62', flag: '🇮🇩' },
  { code: 'IQ', name: 'Irak', dial: '+964', flag: '🇮🇶' },
  { code: 'IR', name: 'Iran', dial: '+98', flag: '🇮🇷' },
  { code: 'IE', name: 'Irlande', dial: '+353', flag: '🇮🇪' },
  { code: 'IS', name: 'Islande', dial: '+354', flag: '🇮🇸' },
  { code: 'IL', name: 'Israël', dial: '+972', flag: '🇮🇱' },
  { code: 'IT', name: 'Italie', dial: '+39', flag: '🇮🇹' },
  { code: 'JM', name: 'Jamaïque', dial: '+1876', flag: '🇯🇲' },
  { code: 'JP', name: 'Japon', dial: '+81', flag: '🇯🇵' },
  { code: 'JO', name: 'Jordanie', dial: '+962', flag: '🇯🇴' },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7', flag: '🇰🇿' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'KG', name: 'Kirghizistan', dial: '+996', flag: '🇰🇬' },
  { code: 'KI', name: 'Kiribati', dial: '+686', flag: '🇰🇮' },
  { code: 'KW', name: 'Koweït', dial: '+965', flag: '🇰🇼' },
  { code: 'LA', name: 'Laos', dial: '+856', flag: '🇱🇦' },
  { code: 'LS', name: 'Lesotho', dial: '+266', flag: '🇱🇸' },
  { code: 'LV', name: 'Lettonie', dial: '+371', flag: '🇱🇻' },
  { code: 'LB', name: 'Liban', dial: '+961', flag: '🇱🇧' },
  { code: 'LR', name: 'Liberia', dial: '+231', flag: '🇱🇷' },
  { code: 'LY', name: 'Libye', dial: '+218', flag: '🇱🇾' },
  { code: 'LI', name: 'Liechtenstein', dial: '+423', flag: '🇱🇮' },
  { code: 'LT', name: 'Lituanie', dial: '+370', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', dial: '+352', flag: '🇱🇺' },
  { code: 'MK', name: 'Macédoine du Nord', dial: '+389', flag: '🇲🇰' },
  { code: 'MG', name: 'Madagascar', dial: '+261', flag: '🇲🇬' },
  { code: 'MY', name: 'Malaisie', dial: '+60', flag: '🇲🇾' },
  { code: 'MW', name: 'Malawi', dial: '+265', flag: '🇲🇼' },
  { code: 'MV', name: 'Maldives', dial: '+960', flag: '🇲🇻' },
  { code: 'ML', name: 'Mali', dial: '+223', flag: '🇲🇱' },
  { code: 'MT', name: 'Malte', dial: '+356', flag: '🇲🇹' },
  { code: 'MA', name: 'Maroc', dial: '+212', flag: '🇲🇦' },
  { code: 'MQ', name: 'Martinique', dial: '+596', flag: '🇲🇶' },
  { code: 'MU', name: 'Maurice', dial: '+230', flag: '🇲🇺' },
  { code: 'MR', name: 'Mauritanie', dial: '+222', flag: '🇲🇷' },
  { code: 'MX', name: 'Mexique', dial: '+52', flag: '🇲🇽' },
  { code: 'MD', name: 'Moldavie', dial: '+373', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', dial: '+377', flag: '🇲🇨' },
  { code: 'MN', name: 'Mongolie', dial: '+976', flag: '🇲🇳' },
  { code: 'ME', name: 'Monténégro', dial: '+382', flag: '🇲🇪' },
  { code: 'MZ', name: 'Mozambique', dial: '+258', flag: '🇲🇿' },
  { code: 'MM', name: 'Myanmar', dial: '+95', flag: '🇲🇲' },
  { code: 'NA', name: 'Namibie', dial: '+264', flag: '🇳🇦' },
  { code: 'NR', name: 'Nauru', dial: '+674', flag: '🇳🇷' },
  { code: 'NP', name: 'Népal', dial: '+977', flag: '🇳🇵' },
  { code: 'NI', name: 'Nicaragua', dial: '+505', flag: '🇳🇮' },
  { code: 'NE', name: 'Niger', dial: '+227', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'NO', name: 'Norvège', dial: '+47', flag: '🇳🇴' },
  { code: 'NZ', name: 'Nouvelle-Zélande', dial: '+64', flag: '🇳🇿' },
  { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲' },
  { code: 'UG', name: 'Ouganda', dial: '+256', flag: '🇺🇬' },
  { code: 'UZ', name: 'Ouzbékistan', dial: '+998', flag: '🇺🇿' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { code: 'PW', name: 'Palaos', dial: '+680', flag: '🇵🇼' },
  { code: 'PA', name: 'Panama', dial: '+507', flag: '🇵🇦' },
  { code: 'PG', name: 'Papouasie-Nouvelle-Guinée', dial: '+675', flag: '🇵🇬' },
  { code: 'PY', name: 'Paraguay', dial: '+595', flag: '🇵🇾' },
  { code: 'NL', name: 'Pays-Bas', dial: '+31', flag: '🇳🇱' },
  { code: 'PE', name: 'Pérou', dial: '+51', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { code: 'PL', name: 'Pologne', dial: '+48', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
  { code: 'RE', name: 'Réunion', dial: '+262', flag: '🇷🇪' },
  { code: 'RO', name: 'Roumanie', dial: '+40', flag: '🇷🇴' },
  { code: 'GB', name: 'Royaume-Uni', dial: '+44', flag: '🇬🇧' },
  { code: 'RU', name: 'Russie', dial: '+7', flag: '🇷🇺' },
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼' },
  { code: 'KN', name: 'Saint-Kitts-et-Nevis', dial: '+1869', flag: '🇰🇳' },
  { code: 'SM', name: 'Saint-Marin', dial: '+378', flag: '🇸🇲' },
  { code: 'VC', name: 'Saint-Vincent-et-les-Grenadines', dial: '+1784', flag: '🇻🇨' },
  { code: 'LC', name: 'Sainte-Lucie', dial: '+1758', flag: '🇱🇨' },
  { code: 'SB', name: 'Salomon', dial: '+677', flag: '🇸🇧' },
  { code: 'WS', name: 'Samoa', dial: '+685', flag: '🇼🇸' },
  { code: 'ST', name: 'Sao Tomé-et-Principe', dial: '+239', flag: '🇸🇹' },
  { code: 'SN', name: 'Sénégal', dial: '+221', flag: '🇸🇳' },
  { code: 'RS', name: 'Serbie', dial: '+381', flag: '🇷🇸' },
  { code: 'SC', name: 'Seychelles', dial: '+248', flag: '🇸🇨' },
  { code: 'SL', name: 'Sierra Leone', dial: '+232', flag: '🇸🇱' },
  { code: 'SG', name: 'Singapour', dial: '+65', flag: '🇸🇬' },
  { code: 'SK', name: 'Slovaquie', dial: '+421', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovénie', dial: '+386', flag: '🇸🇮' },
  { code: 'SO', name: 'Somalie', dial: '+252', flag: '🇸🇴' },
  { code: 'SD', name: 'Soudan', dial: '+249', flag: '🇸🇩' },
  { code: 'SS', name: 'Soudan du Sud', dial: '+211', flag: '🇸🇸' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
  { code: 'SE', name: 'Suède', dial: '+46', flag: '🇸🇪' },
  { code: 'CH', name: 'Suisse', dial: '+41', flag: '🇨🇭' },
  { code: 'SR', name: 'Suriname', dial: '+597', flag: '🇸🇷' },
  { code: 'SY', name: 'Syrie', dial: '+963', flag: '🇸🇾' },
  { code: 'TJ', name: 'Tadjikistan', dial: '+992', flag: '🇹🇯' },
  { code: 'TZ', name: 'Tanzanie', dial: '+255', flag: '🇹🇿' },
  { code: 'TD', name: 'Tchad', dial: '+235', flag: '🇹🇩' },
  { code: 'CZ', name: 'Tchéquie', dial: '+420', flag: '🇨🇿' },
  { code: 'TH', name: 'Thaïlande', dial: '+66', flag: '🇹🇭' },
  { code: 'TL', name: 'Timor oriental', dial: '+670', flag: '🇹🇱' },
  { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬' },
  { code: 'TO', name: 'Tonga', dial: '+676', flag: '🇹🇴' },
  { code: 'TT', name: 'Trinité-et-Tobago', dial: '+1868', flag: '🇹🇹' },
  { code: 'TN', name: 'Tunisie', dial: '+216', flag: '🇹🇳' },
  { code: 'TM', name: 'Turkménistan', dial: '+993', flag: '🇹🇲' },
  { code: 'TR', name: 'Turquie', dial: '+90', flag: '🇹🇷' },
  { code: 'TV', name: 'Tuvalu', dial: '+688', flag: '🇹🇻' },
  { code: 'UA', name: 'Ukraine', dial: '+380', flag: '🇺🇦' },
  { code: 'UY', name: 'Uruguay', dial: '+598', flag: '🇺🇾' },
  { code: 'VU', name: 'Vanuatu', dial: '+678', flag: '🇻🇺' },
  { code: 'VE', name: 'Venezuela', dial: '+58', flag: '🇻🇪' },
  { code: 'VN', name: 'Viêt Nam', dial: '+84', flag: '🇻🇳' },
  { code: 'YE', name: 'Yémen', dial: '+967', flag: '🇾🇪' },
  { code: 'ZM', name: 'Zambie', dial: '+260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', dial: '+263', flag: '🇿🇼' },
];

export default function PhoneInput({
  value = '',
  onChange,
  countryCode = 'GF',
  onCountryChange,
  required = false,
  className = '',
}) {
  const parsePhone = (fullNumber) => {
    if (!fullNumber) return { dial: '', local: '' };
    const matched = countries.find(c => fullNumber.startsWith(c.dial));
    if (matched) return { dial: matched.dial, local: fullNumber.slice(matched.dial.length) };
    return { dial: '', local: fullNumber };
  };

  const defaultCountry = countries.find(c => c.code === countryCode) || countries[0];
  const { dial: initialDial, local: initialLocal } = parsePhone(value);
  const initialCountry = initialDial ? countries.find(c => c.dial === initialDial) || defaultCountry : defaultCountry;

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [localNumber, setLocalNumber] = useState(initialLocal);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const { dial, local } = parsePhone(value);
    if (dial) {
      const country = countries.find(c => c.dial === dial);
      if (country && country.code !== selectedCountry.code) setSelectedCountry(country);
    }
    setLocalNumber(local);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  );

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setOpen(false);
    setSearch('');
    if (onCountryChange) onCountryChange(country);
    const fullNumber = `${country.dial}${localNumber}`;
    if (onChange) onChange(fullNumber);
  };

  const handleLocalNumberChange = (e) => {
    const newLocal = e.target.value.replace(/\s/g, '');
    setLocalNumber(newLocal);
    const fullNumber = `${selectedCountry.dial}${newLocal}`;
    if (onChange) onChange(fullNumber);
  };

  const borderColor = open || focused ? 'var(--primary)' : 'var(--border)';
  const dialWidth = `${selectedCountry.dial.length * 12 + 8}px`;

  return (
    <div ref={wrapperRef} className={className} style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '44px',
          border: `1px solid ${borderColor}`,
          borderRadius: '8px',
          backgroundColor: 'var(--bg-input)',
          overflow: 'visible',
          transition: 'border-color 0.15s',
        }}
      >
        {/* Bouton de sélection du pays */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0 10px',
            height: '100%',
            borderRight: '1px solid var(--border)',
            background: 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            borderRadius: '8px 0 0 8px',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>{selectedCountry.flag}</span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              transition: 'transform 0.15s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▾
          </span>
        </button>

        {/* Champ de saisie avec indicatif en préfixe */}
        <div style={{ position: 'relative', flex: 1, height: '100%' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              pointerEvents: 'none',
              fontWeight: 500,
            }}
          >
            {selectedCountry.dial}
          </span>
          <input
            type="tel"
            value={localNumber}
            onChange={handleLocalNumberChange}
            placeholder="612345678"
            required={required}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%',
              height: '100%',
              padding: `0 12px 0 ${dialWidth}`,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      {/* Menu déroulant avec recherche */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher un pays ou un indicatif..."
              style={{
                width: '100%',
                padding: '7px 10px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text)',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Aucun résultat
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => selectCountry(c)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 14px',
                      backgroundColor: isSelected ? 'rgba(var(--primary-rgb, 59,130,246),0.08)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected
                        ? 'rgba(var(--primary-rgb, 59,130,246),0.08)'
                        : 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
                    <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)', textAlign: 'left' }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>{c.dial}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}