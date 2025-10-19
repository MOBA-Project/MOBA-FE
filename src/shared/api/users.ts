import { apiJson } from './fetcher';

export type PublicUser = { id: string; nickname?: string; nick?: string; _id?: string };

export async function getUserPublic(id: string): Promise<PublicUser | null> {
  try {
    const d = await apiJson(`/users/${encodeURIComponent(id)}`);
    return d as PublicUser;
  } catch {
    return null;
  }
}

