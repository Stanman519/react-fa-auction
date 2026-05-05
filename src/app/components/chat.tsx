import { useMemo, useState } from "react";
import { Chat, Channel } from "stream-chat-react";
import {
  ChannelFilters,
  ChannelOptions,
  ChannelSort,
  LiteralStringForUnion,
} from "stream-chat";
import { useSelector } from "react-redux";
import { ChatClient } from "../services/ChatUtils";
import MessagingInput from "./chat/MessagingInput/MessagingInput";
import React from "react";
import CustomMessage from "./chat/CustomMessage/CustomMessage";
import MessagingThreadHeader from "./chat/MessagingThread/MessagingThread";
import { ChannelInner } from "./chat/ChannelInner/ChannelInner";
import "stream-chat-react/dist/css/index.css";
import "./chat/Chat.css";
import { RootState } from "../redux/reducers/RootReducer";

export type AttachmentType = {};
export type ChannelType = { demo?: string };
export type CommandType = LiteralStringForUnion;
export type EventType = {};
export type MessageType = {};
export type ReactionType = {};
export type UserType = { image?: string };

export type StreamChatGenerics = {
  attachmentType: AttachmentType;
  channelType: ChannelType;
  commandType: CommandType;
  eventType: EventType;
  messageType: MessageType;
  reactionType: ReactionType;
  userType: UserType;
};

export const GiphyContext = React.createContext(
  {} as {
    giphyState: boolean;
    setGiphyState: React.Dispatch<React.SetStateAction<boolean>>;
  },
);
type ChatWindowProps = {
  channelListOptions: {
    options: ChannelOptions;
    filters: ChannelFilters;
    sort: ChannelSort;
  };
};
export const FAChatWindow = ({
  screen,
}: {
  screen: "league" | "games";
}): JSX.Element | null => {
  const currentLeagueId = useSelector(
    (s: RootState) => s.profile.currentLeagueId,
  );
  const chatConnected = useSelector((s: RootState) => s.chat.connected);
  const { currentPool } = useSelector((s: RootState) => s.overUnders);
  const [isMobileNavVisible, setMobileNav] = useState(false);
  const [giphyState, setGiphyState] = useState(false);

  const client = ChatClient.getInstance();
  const channelId =
    screen === "league" ? `${currentLeagueId ?? ""}` : `pool${currentPool?.id}`;
  const channel = useMemo(
    () => (chatConnected && channelId ? client.channel("messaging", channelId) : null),
    [client, chatConnected, channelId],
  );

  const toggleMobile = () => setMobileNav(!isMobileNavVisible);
  const giphyContextValue = { giphyState, setGiphyState };

  if (!chatConnected || !channel) return null;

  return (
    <Chat<StreamChatGenerics> client={client}>
      <Channel<StreamChatGenerics>
        Input={MessagingInput}
        maxNumberOfFiles={5}
        Message={CustomMessage}
        multipleUploads={true}
        ThreadHeader={MessagingThreadHeader}
        TypingIndicator={() => null}
        channel={channel}
      >
        <GiphyContext.Provider value={giphyContextValue}>
          <ChannelInner theme={"light"} toggleMobile={toggleMobile} />
        </GiphyContext.Provider>
      </Channel>
    </Chat>
  );
};
