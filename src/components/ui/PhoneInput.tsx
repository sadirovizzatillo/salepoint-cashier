import { cn } from '../../lib/utils';

interface PhoneInputProps {
  value: string;                  // raw: '+998973364647' or ''
  onChange: (raw: string) => void; // always emits '+998XXXXXXXXX'
  placeholder?: string;
  className?: string;
  required?: boolean;
}

/** Extract only the 9 digits that follow +998 */
function toDigits(raw: string): string {
  const stripped = raw.startsWith('+998') ? raw.slice(4) : raw;
  return stripped.replace(/\D/g, '').slice(0, 9);
}

/** Format 9 digits as XX-XXX-XX-XX */
function format(digits: string): string {
  if (!digits) return '';
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += '-' + digits.slice(2, 5);
  if (digits.length > 5) out += '-' + digits.slice(5, 7);
  if (digits.length > 7) out += '-' + digits.slice(7, 9);
  return out;
}

export const PhoneInput = ({
  value,
  onChange,
  placeholder = 'XX-XXX-XX-XX',
  className,
  required,
}: PhoneInputProps) => {
  const digits = toDigits(value);
  const displayed = format(digits);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
    onChange(raw ? `+998${raw}` : '');
  };

  return (
    <div className={cn('flex items-center border border-gray-200 rounded-xl bg-gray-50 focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition-all', className)}>
      <span className="pl-3 pr-1.5 text-sm font-bold text-gray-400 select-none shrink-0">+998</span>
      <div className="w-px h-4 bg-gray-200 shrink-0" />
      <input
        type="tel"
        required={required}
        value={displayed}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 h-10 px-2.5 bg-transparent text-sm font-medium outline-none placeholder:text-gray-300"
      />
    </div>
  );
};
