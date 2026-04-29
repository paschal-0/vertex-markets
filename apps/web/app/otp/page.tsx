import { OtpClient } from "./otp-client";

type OtpPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function asSingle(input: string | string[] | undefined): string {
  return Array.isArray(input) ? input[0] ?? "" : input ?? "";
}

export default async function OtpPage({ searchParams }: OtpPageProps) {
  const params = (await searchParams) ?? {};
  const challengeId = asSingle(params.challengeId);
  const purpose = asSingle(params.purpose) === "signup" ? "signup" : "login";
  const email = asSingle(params.email);

  return <OtpClient challengeId={challengeId} purpose={purpose} email={email} />;
}
