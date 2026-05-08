export interface ProjectInfo {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  role: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceId: string | null;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VersionInfo {
  id: string;
  message: string | null;
  sourceApplication: string | null;
  referencedObject: string;
  createdAt: string;
  authorUser: { id: string; name: string } | null;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string | null;
  bio: string | null;
  company: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface PageInfo<T> {
  totalCount: number;
  cursor: string | null;
  items: ReadonlyArray<T>;
}
