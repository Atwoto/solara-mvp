import AuthFormContainer from "@/components/auth/AuthFormContainer";
import SignUpPage from "./SignUpClientPage"; // Assuming your client component is now here

export default function SignUp() {
    return (
        <div className="bg-gray-50">
            <AuthFormContainer>
                <SignUpPage />
            </AuthFormContainer>
        </div>
    );
}