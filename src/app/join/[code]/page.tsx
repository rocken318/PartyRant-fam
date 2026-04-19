import GuestGameClient from './GuestGameClient';

export default async function JoinCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <GuestGameClient code={code} />;
}
