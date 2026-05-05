import { StreamChat } from "stream-chat";
import { StreamChatGenerics } from "../components/chat";

export const apiKey = process.env.REACT_APP_STREAM_KEY;

type StreamUser = {
  id: string;
  name?: string;
  image?: string;
  role?: string;
};

export class ChatClient {
  private static client: StreamChat<StreamChatGenerics> | null = null;
  private static connectPromise: Promise<void> | null = null;

  public static getInstance(): StreamChat<StreamChatGenerics> {
    if (!ChatClient.client) {
      ChatClient.client = StreamChat.getInstance<StreamChatGenerics>(apiKey!, {
        enableWSFallback: true,
      });
    }
    return ChatClient.client;
  }

  public static connect(user: StreamUser, token: string): Promise<void> {
    if (ChatClient.connectPromise) return ChatClient.connectPromise;
    const client = ChatClient.getInstance();
    ChatClient.connectPromise = client
      .connectUser(user as any, token)
      .then(() => undefined)
      .catch((e) => {
        ChatClient.connectPromise = null;
        throw e;
      });
    return ChatClient.connectPromise;
  }

  public static async disconnect(): Promise<void> {
    if (!ChatClient.connectPromise) return;
    const client = ChatClient.getInstance();
    ChatClient.connectPromise = null;
    await client.disconnectUser();
  }
}
