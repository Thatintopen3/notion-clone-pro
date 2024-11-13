"use server";
import { and, eq, ilike, notExists } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  collaborators,
  files,
  folders,
  users,
  workspaces,
} from "@/db/schema";
import { validate } from "uuid";
import { createServerComponentClient } from "./server";
import type {
  File,
  Folder,
  Subscription,
  User,
  Workspace,
} from "@/lib/types";

// ─── Workspaces ──────────────────────────────────────────────────────────────

export async function getUserSubscriptionStatus(userId: string) {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    });
    if (data) return { data: data as Subscription, error: null };
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function getFiles(folderId: string) {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "Error" };
  try {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(eq(files.folderId, folderId))) as File[] | [];
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function getPrivateWorkspaces(userId: string) {
  if (!userId || !validate(userId)) return { data: [], error: "Error" };
  const privateWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(workspaces)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspaceOwner, userId)
      )
    )) as Workspace[];
  return { data: privateWorkspaces, error: null };
}

export async function getCollaboratingWorkspaces(userId: string) {
  if (!userId || !validate(userId)) return { data: [], error: "Error" };
  const collaboratedWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.userId))
    .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
    .where(eq(users.id, userId))) as Workspace[];
  return { data: collaboratedWorkspaces, error: null };
}

export async function getSharedWorkspaces(userId: string) {
  if (!userId || !validate(userId)) return { data: [], error: "Error" };
  const sharedWorkspaces = (await db
    .selectDistinct({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(workspaces)
    .orderBy(workspaces.createdAt)
    .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .where(eq(workspaces.workspaceOwner, userId))) as Workspace[];
  return { data: sharedWorkspaces, error: null };
}

export async function getFolders(workspaceId: string) {
  const isValid = validate(workspaceId);
  if (!isValid) return { data: null, error: "Error" };
  try {
    const results: Folder[] | [] = await db
      .select()
      .from(folders)
      .orderBy(folders.createdAt)
      .where(eq(folders.workspaceId, workspaceId));
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function getWorkspaceDetails(workspaceId: string) {
  const isValid = validate(workspaceId);
  if (!isValid) return { data: [], error: "Error" };
  try {
    const response = (await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1)) as Workspace[];
    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: `Error: ${error}` };
  }
}

export async function getFileDetails(fileId: string) {
  const isValid = validate(fileId);
  if (!isValid) return { data: [], error: "Error" };
  try {
    const response = (await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1)) as File[];
    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: `Error: ${error}` };
  }
}

export async function getFolderDetails(folderId: string) {
  const isValid = validate(folderId);
  if (!isValid) return { data: [], error: "Error" };
  try {
    const response = (await db
      .select()
      .from(folders)
      .where(eq(folders.id, folderId))
      .limit(1)) as Folder[];
    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: `Error: ${error}` };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  if (!workspaceId || !validate(workspaceId)) return;
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
}

export async function getUsersFromSearch(email: string) {
  if (!email) return [];
  const accounts = db
    .select()
    .from(users)
    .where(ilike(users.email, `${email}%`));
  return accounts;
}

export async function createWorkspace(workspace: Workspace) {
  try {
    const response = await db.insert(workspaces).values(workspace);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function createFolder(folder: Folder) {
  try {
    const results = await db.insert(folders).values(folder);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function createFile(file: File) {
  try {
    await db.insert(files).values(file);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function updateFolder(folder: Partial<Folder>, folderId: string) {
  try {
    await db.update(folders).set(folder).where(eq(folders.id, folderId));
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function updateFile(file: Partial<File>, fileId: string) {
  try {
    await db.update(files).set(file).where(eq(files.id, fileId));
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function updateWorkspace(
  workspace: Partial<Workspace>,
  workspaceId: string
) {
  if (!workspaceId || !validate(workspaceId)) return;
  try {
    await db
      .update(workspaces)
      .set(workspace)
      .where(eq(workspaces.id, workspaceId));
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: `Error: ${error}` };
  }
}

export async function addCollaborators(
  collaboratorsList: User[],
  workspaceId: string
) {
  const response = collaboratorsList.map(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });
    if (!userExists)
      await db.insert(collaborators).values({ workspaceId, userId: user.id });
  });
}

export async function removeCollaborators(
  collaboratorsList: User[],
  workspaceId: string
) {
  collaboratorsList.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });
    if (userExists)
      await db
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.userId, user.id),
            eq(collaborators.workspaceId, workspaceId)
          )
        );
  });
}

export async function getActiveProductsWithPrice() {
  try {
    const res = await db.query.products.findMany({
      where: (pro, { eq }) => eq(pro.active, true),
      with: {
        prices: { where: (pri, { eq }) => eq(pri.active, true) },
      },
    });
    if (res.length) return { data: res, error: null };
    return { data: [], error: null };
  } catch (error) {
    return { data: [], error: `Error: ${error}` };
  }
}

export async function getCollaborators(workspaceId: string) {
  const response = await db
    .select()
    .from(collaborators)
    .where(eq(collaborators.workspaceId, workspaceId));
  if (!response.length) return [];
  const userInfo: Promise<User | undefined>[] = response.map(async (user) => {
    const exists = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, user.userId),
    });
    return exists as User;
  });
  const resolvedUsers = await Promise.all(userInfo);
  return resolvedUsers.filter(Boolean) as User[];
}

export async function getUserDetails(userId: string) {
  const response = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });
  return { data: response as User, error: null };
}

export async function deleteFile(fileId: string) {
  if (!fileId || !validate(fileId)) return;
  await db.delete(files).where(eq(files.id, fileId));
}

export async function deleteFolder(folderId: string) {
  if (!folderId || !validate(folderId)) return;
  await db.delete(folders).where(eq(folders.id, folderId));
}

export async function restoreFileFromTrash(fileId: string) {
  await db.update(files).set({ inTrash: null }).where(eq(files.id, fileId));
}

export async function restoreFolderFromTrash(folderId: string) {
  await db.update(folders).set({ inTrash: null }).where(eq(folders.id, folderId));
}
