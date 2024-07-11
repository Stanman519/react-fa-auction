import { useEffect, useState } from "react";
import {
    Chat,
    Channel,
    Window,

} from 'stream-chat-react';
import { ChannelFilters, ChannelOptions, ChannelSort, LiteralStringForUnion, StreamChat } from 'stream-chat';
import { useSelector } from "react-redux";
import { ChatClient } from "../services/ChatUtils";
import MessagingInput from "./chat/MessagingInput/MessagingInput";
import React from "react";
import CustomMessage from "./chat/CustomMessage/CustomMessage";
import MessagingThreadHeader from "./chat/MessagingThread/MessagingThread";
import { ChannelInner } from "./chat/ChannelInner/ChannelInner";
import 'stream-chat-react/dist/css/index.css';
import './chat/Chat.css';
import { useAuth0 } from "@auth0/auth0-react";
import MessagingSidebar from "./chat/MessagingSidebar";
import { RootState } from "../redux/reducers/RootReducer";

export type AttachmentType = {};
export type ChannelType = { demo?: string };
export type CommandType = LiteralStringForUnion;
export type EventType = {};
export type MessageType = {};
export type ReactionType = {};
export type UserType = { image?: string };

export const GiphyContext = React.createContext(
    {} as { giphyState: boolean; setGiphyState: React.Dispatch<React.SetStateAction<boolean>> },
);
type ChatWindowProps = {
    channelListOptions: {
        options: ChannelOptions;
        filters: ChannelFilters;
        sort: ChannelSort;
    };
}
export const FAChatWindow = ({leagueId}: {leagueId?: string }): JSX.Element | null => {
    const { owner, currentLeague } = useSelector((state: RootState) => state.profile)
    const {profile} = useSelector((state: RootState) => state)
    const { user } = useAuth0();
    const [channel, setChannel] = useState<any>(ChatClient.getInstance().chatInstance.activeChannels[`messaging${currentLeague?.league.leagueId}`]);
    const [isMobileNavVisible, setMobileNav] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [giphyState, setGiphyState] = useState(false);
    const [chatClient, setChatClient] = useState<StreamChat | null>(ChatClient.getInstance().chatInstance);
    const [chatIsInitialized, setChatIsInitialized] = useState<boolean>(ChatClient.getInstance().isInitialized);

    useEffect(() => {
        let chatClientToUpdate = ChatClient.getInstance()
        const chatSetup = async () => {
            if(!chatClientToUpdate.isInitialized || !chatClientToUpdate.chatInstance.activeChannels[`messaging${currentLeague?.league.leagueId}`]){
                let channel = await ChatClient.finishSetup({
                    user_id: `${owner.ownerId}`,
                    id: `${owner.ownerId}`,
                    name: owner.displayName,
                    role: 'admin',
                    image: user?.picture,
                    
                }, owner.streamToken, leagueId ?? '')
                setChannel(channel)
                setChatClient(chatClientToUpdate.chatInstance)

            }
        }
        if (leagueId && owner.streamToken && (!chatIsInitialized) || !chatClientToUpdate.chatInstance.activeChannels[`messaging${currentLeague?.league.leagueId}`]){
            chatSetup()
            setChatIsInitialized(true);
        }

    }, [])

    const toggleMobile = () => setMobileNav(!isMobileNavVisible);
    const giphyContextValue = { giphyState, setGiphyState };

    if (!chatClient) return null;

    return (
        // <div style={{flex: 1}}>
        <>
            {channel &&
                <Chat client={chatClient}>
                    {/* <MessagingSidebar
                        channelListOptions={{filters: undefined, sort: undefined, options: undefined}}
                        onClick={toggleMobile}
                        onCreateChannel={() => setIsCreating(!isCreating)}
                        onPreviewSelect={() => setIsCreating(false)}

                    /> */}
                    <Channel
                        Input={MessagingInput}
                        maxNumberOfFiles={5}
                        Message={CustomMessage}
                        multipleUploads={true}
                        ThreadHeader={MessagingThreadHeader}
                        TypingIndicator={() => null}
                        channel={channel}>
                        {/* <Window> */}
                            <GiphyContext.Provider value={giphyContextValue}>
                                <ChannelInner theme={'light'} toggleMobile={toggleMobile} />
                            </GiphyContext.Provider>
                        {/* </Window> */}
                    </Channel>
                </Chat>}
                </>
        //{/* </div> */}

    );
}
