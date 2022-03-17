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
import { apiKey } from "../services/ChatUtils";
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

    
    const user = useSelector((state: RootState) => state.profile)
    const [channel, setChannel] = useState();
    const [isMobileNavVisible, setMobileNav] = useState(false);
    const [giphyState, setGiphyState] = useState(false);
    const [chatClient, setChatClient] = useState<StreamChat | null>(null);
    // const connectStream = async () => {
    //     console.log('this is running... user:', user)
    //     const img = ownerMap.find(o => o.id === user.ownerId)?.avatar
    //     try{
    //         chatClient.connectUser(
    //             {
    //             id: user.ownername,
    //             name: user.ownername,
    //             role: 'admin',
    //             image: img,
    //             },
    //             user.token
    //         );
    //             //@ts-ignore
    //         setChannel(chatClient.channel('messaging', 'chat'));
    //     }
    //     catch(e: any) {
    //         console.log('our error' , e)
    //     }
    // }

    useEffect(() => {   
        //if (user?.token) connectStream();
        let img : string = ownerMap.find(o => o.id === user.ownerId)?.avatar ?? ''

        const initChat = async () => {
            const client = StreamChat.getInstance<{
                attachmentType: AttachmentType;
                channelType: ChannelType;
                commandType: CommandType;
                eventType: EventType;
                messageType: MessageType;
                reactionType: ReactionType;
                userType: UserType;
            }>(apiKey!, { enableWSFallback: true });

            await client.connectUser({
                id: user.ownername,
                name: user.ownername,
                role: 'admin',
                image: img,
                },
                user.token);

            setChatClient(client);
            //@ts-ignore
            setChannel(client.channel('messaging', 'chat'));
        }
        if (user.token) {
            console.log('if in init',user.token)
            initChat();
        }
        // return () => {
        //     console.log('tear down', user.token)
        //     chatClient?.disconnectUser();
        //   };
    }, [user.token])
    
    const toggleMobile = () => setMobileNav(!isMobileNavVisible);
    const giphyContextValue = { giphyState, setGiphyState };

    if (!chatClient) return null;

    return (
            <div>
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
                        {/* <Window >
                            <MessageList />
                            <MessageInput  />
                        </Window> */}
                        {/* <Thread Input={MessagingInput} /> */}
                        </Window>
                    </Channel>
                </Chat>}
            </div>
    
        );
  }
  