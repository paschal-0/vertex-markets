import { ResetPasswordClient } from "./reset-password-client";

type ResetPasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function asSingle(input: string | string[] | undefined): string {
  return Array.isArray(input) ? input[0] ?? "" : input ?? "";
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = (await searchParams) ?? {};
  const challengeId = asSingle(params.challengeId);

  return <ResetPasswordClient challengeId={challengeId} />;
}
