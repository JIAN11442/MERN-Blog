import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { FlatIcons } from '../icons/flaticons';

interface InputBoxProps {
  id: string;
  type: string;
  name: string;
  value?: string;
  placeholder: string;
  icon: string;
  className?: string;
}

const InputBox: React.FC<InputBoxProps> = ({
  id,
  type,
  name,
  value,
  placeholder,
  icon,
  className,
}) => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [passwordValue, setPasswordValue] = useState<string>('');

  return (
    <div
      className={twMerge(
        `
        relative
        w-[100%]
        mb-4
      `,
        className
      )}
    >
      {/* Input */}
      <div className="w-full">
        <input
          id={id}
          type={type === 'password' ? (passwordVisible ? 'text' : type) : type}
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          onChange={(e) => setPasswordValue(e.target.value)}
          className="input-box"
        />
      </div>

      {/* Input Icon */}
      <div>
        <FlatIcons name={icon} className="input-icon" />
      </div>

      {/* Password Visible Icon */}
      <div>
        <FlatIcons
          name={passwordVisible ? 'fi fi-sr-eye-crossed' : 'fi fi-sr-eye'}
          onClick={() => setPasswordVisible(!passwordVisible)}
          className={`
            ${type === 'password' && passwordValue ? 'flex' : 'hidden'}
            input-icon
            text-lg
            left-auto
            right-4
            cursor-pointer
            opacity-50
            hover:opacity-100
            transition
          `}
        />
      </div>
    </div>
  );
};

export default InputBox;
