import InputBox from '../components/inputbox.component';

interface UserAuthFormProps {
  type: string;
}

const UserAuthForm: React.FC<UserAuthFormProps> = ({ type }) => {
  return (
    <section
      className="
        flex
        h-cover
        items-center
        justify-center
      "
    >
      <form className="w-[80%] max-w-[400px]">
        {/* Title */}
        <h1
          className="
            text-4xl
            font-gelasio
            font-semibold
            capitalize
            text-center
            mb-24
          "
        >
          {type === 'sign-in' ? 'Welcome back' : 'Join us today'}
        </h1>

        {/* Username InputBox */}
        <InputBox
          id="username"
          type="text"
          name="username"
          placeholder="Username"
          icon="fi fi-rr-user"
          className={`${type !== 'sign-in' ? 'flex' : 'hidden'}`}
        />

        {/* Email InputBox */}
        <InputBox
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          icon="fi fi-rr-at"
        />

        {/* Password InputBox */}
        <InputBox
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          icon="fi fi-rr-key"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="
            btn-dark
            center
            mt-14
          "
        >
          {type.replace('-', ' ')}
        </button>
      </form>
    </section>
  );
};

export default UserAuthForm;
