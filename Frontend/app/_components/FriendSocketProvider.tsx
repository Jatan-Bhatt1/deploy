import React, { createContext, useEffect, useState } from "react";
import { initSocket, getSocket } from "../utils/socket";

interface IFriendSocketContext {
  newRequest?: any;
  acceptedFriend?: any;
}

export const FriendSocketContext = createContext<IFriendSocketContext>({});

export const FriendSocketProvider = ({ children }: any) => {
  const [newRequest, setNewRequest] = useState(null);
  const [acceptedFriend, setAcceptedFriend] = useState(null);

  useEffect(() => {
    const setup = async () => {
      const socket = await initSocket();
      if (!socket) return;

      socket.on("friendRequestReceived", ({ senderId }) => {
        console.log("📩 Friend request received from:", senderId);
        setNewRequest(senderId);
      });

      socket.on("friendRequestAccepted", ({ receiverId }) => {
        console.log("✅ Friend request accepted by:", receiverId);
        setAcceptedFriend(receiverId);
      });
    };

    setup();
  }, []);

  return (
    <FriendSocketContext.Provider value={{ newRequest, acceptedFriend }}>
      {children}
    </FriendSocketContext.Provider>
  );
};
