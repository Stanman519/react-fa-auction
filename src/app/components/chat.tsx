import { useEffect, useState } from "react";
import {
    Chat,
    Channel,
    Window,

} from 'stream-chat-react';
import { LiteralStringForUnion, StreamChat } from 'stream-chat';
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ownerMap } from "../services/Common";
import { ChatClient } from "../services/ChatUtils";
import MessagingInput from "./chat/MessagingInput/MessagingInput";
import React from "react";
import CustomMessage from "./chat/CustomMessage/CustomMessage";
import MessagingThreadHeader from "./chat/MessagingThread/MessagingThread";
import { ChannelInner } from "./chat/ChannelInner/ChannelInner";
import 'stream-chat-react/dist/css/index.css';
import './chat/Chat.css';

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

export const FAChatWindow = (): JSX.Element | null => {


    const user = useSelector((state: RootState) => state.profile.owner)
    const [channel, setChannel] = useState<any>(ChatClient.getInstance().chatInstance.activeChannels['messaging:chat']);
    const [isMobileNavVisible, setMobileNav] = useState(false);
    const [giphyState, setGiphyState] = useState(false);
    const [chatClient, setChatClient] = useState<StreamChat | null>(ChatClient.getInstance().chatInstance);
    const [chatIsInitialized, setChatIsInitialized] = useState<boolean>(ChatClient.getInstance().isInitialized);


    useEffect(() => {
        let chatClientToUpdate = ChatClient.getInstance()
        let img: string = ownerMap.find(o => o.id === user.ownerId)?.avatar ?? ''
        const chatSetup = async () => {
            if(!chatClientToUpdate.isInitialized){
                setChannel(await ChatClient.finishSetup({
                    id: user.ownername,
                    name: user.ownername,
                    role: 'admin',
                    image: img,
                }, user.streamToken))
                setChatClient(chatClientToUpdate.chatInstance)
            }
        }
        if (user.streamToken && !chatIsInitialized) {
            chatSetup()
            setChatIsInitialized(true);
        }

    }, [user.streamToken])

    const toggleMobile = () => setMobileNav(!isMobileNavVisible);
    const giphyContextValue = { giphyState, setGiphyState };

    if (!chatClient) return null;

    return (
        <div style={{flex: 1}}>
            {channel &&
                <Chat client={chatClient}>
                    <Channel
                        Input={MessagingInput}
                        maxNumberOfFiles={5}
                        Message={CustomMessage}
                        multipleUploads={true}
                        ThreadHeader={MessagingThreadHeader}
                        TypingIndicator={() => null}
                        channel={channel}>
                        <Window>
                            <GiphyContext.Provider value={giphyContextValue}>
                                <ChannelInner theme={'light'} toggleMobile={toggleMobile} />
                            </GiphyContext.Provider>
                        </Window>
                    </Channel>
                </Chat>}
        </div>

    );
}
