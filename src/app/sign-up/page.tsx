import { useState } from "react";
import { useRouter } from "next/router";

const SignUpPage = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div>
      <h1>Sign-up</h1>

    </div>
  );
};

export default SignUpPage;
