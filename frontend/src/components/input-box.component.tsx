import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { FlatIcons } from "../icons/flaticons";
import useAuthorProfileStore from "../states/author-profile.state";
import { AuthorProfileStructureType } from "../commons/types.common";

interface InputBoxProps {
  id: string;
  type: string;
  name: string;
  value?: string;
  placeholder: string;
  content?: string | null;
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
      content,
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

    const { authorProfileInfo } = useAuthorProfileStore();
    const { social_links } =
      (authorProfileInfo as AuthorProfileStructureType) ?? {};
    const links = Object.keys(social_links);

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
              ${links.includes(name) ? "text-grey-dark/50" : ""}
              ${disabled && "opacity-50"}
              ${
                content?.length &&
                (name === "youtube"
                  ? "text-youtube"
                  : name === "facebook"
                  ? "text-facebook"
                  : name === "instagram"
                  ? "text-instagram"
                  : name === "twitter"
                  ? "text-twitter"
                  : name === "github"
                  ? "text-github"
                  : name === "website"
                  ? "text-website"
                  : "text-grey-dark")
              }
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
