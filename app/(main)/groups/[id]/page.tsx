import { GroupDetailClient } from '@/components/GroupDetailClient';

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupDetailClient id={id} />;
}