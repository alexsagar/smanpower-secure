import { MfaChallengeForm } from "./MfaChallengeForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "MFA Challenge | Admin Panel",
};

export default async function MfaPage() {
  const cookieStore = await cookies();
  const mfaChallengeToken = cookieStore.get("mfa_challenge_token")?.value;

  if (!mfaChallengeToken) {
    // No challenge token found, they shouldn't be here
    redirect("/admin/login");
  }

  return <MfaChallengeForm />;
}
