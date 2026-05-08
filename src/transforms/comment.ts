export interface FlatComment {
  id: string;
  parentId: string | null;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface CommentTreeNode extends FlatComment {
  replies: CommentTreeNode[];
}

export function threadComments(flat: ReadonlyArray<FlatComment>): ReadonlyArray<CommentTreeNode> {
  const byId = new Map<string, CommentTreeNode>();
  const roots: CommentTreeNode[] = [];

  for (const c of flat) byId.set(c.id, { ...c, replies: [] });

  for (const c of flat) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
