import { HostGameClient } from './HostGameClient';

export default async function HostGamePage({
  params,
}: {
  params: Promise<{ eventId: string; gameId: string }>;
}) {
  const { eventId, gameId } = await params;
  return <HostGameClient eventId={eventId} gameId={gameId} />;
}
