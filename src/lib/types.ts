import {
  files,
  folders,
  prices,
  products,
  subscriptions,
  users,
  workspaces,
} from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type File = InferSelectModel<typeof files>;
export type Folder = InferSelectModel<typeof folders>;
export type Workspace = InferSelectModel<typeof workspaces>;
export type User = InferSelectModel<typeof users>;
export type Price = InferSelectModel<typeof prices> & { products?: Product };
export type Product = InferSelectModel<typeof products>;
export type Subscription = InferSelectModel<typeof subscriptions> & {
  prices?: Price;
};

export type FolderType = Folder & { files: File[] | [] };
export type WorkspaceTypes = Workspace & {
  folders: FolderType[] | [];
};

export type appFoldersType = InferSelectModel<typeof folders> & {
  files: InferSelectModel<typeof files>[] | [];
};
export type appWorkspacesType = InferSelectModel<typeof workspaces> & {
  folders: appFoldersType[] | [];
};

export type ProductWithPrice = Product & { prices?: Price[] };

import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & { io: SocketIOServer };
  };
};
