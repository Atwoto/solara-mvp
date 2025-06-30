import AuthFormContainer from "@/components/auth/AuthFormContainer";
import LoginForm from "@/components/LoginForm";
import { Suspense } from 'react';

// Wrap the client component in Suspense for searchParams to work correctly
function LoginPageContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

export default function LoginPage() {
    return (
        <div className="bg-gray-50">
            <AuthFormContainer>
                <LoginPageContent />
            </AuthFormContainer>
        </div>
    );
}