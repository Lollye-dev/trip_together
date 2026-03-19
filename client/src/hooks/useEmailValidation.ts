import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEmailValidation() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue) {
      setEmailError("L'email est obligatoire");
      return false;
    }
    if (!EMAIL_REGEX.test(emailValue)) {
      setEmailError("Veuillez entrer une adresse email valide");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (newEmail) {
      validateEmail(newEmail);
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      validateEmail(email);
    }
  };

  const reset = () => {
    setEmail("");
    setEmailError("");
  };

  return {
    email,
    setEmail,
    emailError,
    validateEmail,
    handleEmailChange,
    handleEmailBlur,
    reset,
    isValid: email && !emailError,
  };
}
