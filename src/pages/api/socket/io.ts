import { NextApiResponseServerIo } from "@/lib/types";
import { NextApiRequest } from "next";
import { Server as HttpServer } from "http";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "net";

export const config = { api: { bodyParser: false } };

export default async function ioHandler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: HttpServer = res.socket.server as any;
    const io = new ServerIO(httpServer, { path, addTrailingSlash: false });

    io.on("connection", (socket) => {
      socket.on("create-room", (fileId) => { socket.join(fileId); });
      socket.on("send-changes", (deltas, fileId) => {
        socket.to(fileId).emit("receive-changes", deltas, fileId);
      });
      socket.on("send-cursor-move", (range, roomId, cursorId) => {
        socket.to(roomId).emit("receive-cursor-move", range, cursorId);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
