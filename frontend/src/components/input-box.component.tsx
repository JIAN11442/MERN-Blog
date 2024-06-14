import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { FlatIcons } from "../icons/flaticons";

interface InputBoxProps {
  id: string;
  type: string;
  name: string;
  value?: string;
  placeholder: string;
  icon: string;
  className?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  (
    {
      id,
      type,
      name,
      value,
      placeholder,
      icon,
      className,
      disabled = false,
      onChange,
      onBlur,
    },
    ref
  ) => {
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [passwordValue, setPasswordValue] = useState<string>("");

    return (
      <div
        className={twMerge(
          `
          relative
          w-[100%]
          mb-6
        `,
          className
        )}
      >
        {/* Input */}
        <div className="w-full">
          <input
            id={id}
            ref={ref}
            type={
              type === "password" ? (passwordVisible ? "text" : type) : type
            }
            name={name}
            defaultValue={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => {
              setPasswordValue(e.target.value);
              onChange && onChange(e);
            }}
            onBlur={onBlur}
            className="input-box"
          />
        </div>

        {/* Input Icon */}
        <div>
          <FlatIcons
            name={icon}
            className={`
              input-icon
              ${disabled && "opacity-50"}
            `}
          />
        </div>

        {/* Password Visible Icon */}
        <div>
          <FlatIcons
            name={passwordVisible ? "fi fi-sr-eye-crossed" : "fi fi-sr-eye"}
            onClick={() => setPasswordVisible(!passwordVisible)}
            className={`
              ${type === "password" && passwordValue ? "flex" : "hidden"}
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
  }
);

export default InputBox;
