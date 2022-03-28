
import { StreamChat } from "stream-chat";
import { AttachmentType, ChannelType, MessageType, CommandType, EventType, ReactionType, UserType } from "../components/chat";

export const apiKey = process.env.REACT_APP_STREAM_KEY;

interface ChatClientInstance {
    chatInstance: StreamChat
    isInitialized: boolean
}


export class ChatClient {
    private static instance: ChatClientInstance;
    private constructor() { }

    public static getInstance(): ChatClientInstance {
        if (!ChatClient.instance) {
            ChatClient.instance = {
                chatInstance: StreamChat.getInstance<{
                    attachmentType: AttachmentType;
                    channelType: ChannelType;
                    commandType: CommandType;
                    eventType: EventType;
                    messageType: MessageType;
                    reactionType: ReactionType;
                    userType: UserType;
                    }>(apiKey!, { enableWSFallback: true }),
                isInitialized: false 
        }
        }
        return ChatClient.instance;
    }

    public static finishSetup = async (user: any, token: string) => {
        if (!ChatClient.instance.isInitialized){
            await ChatClient.instance.chatInstance.connectUser({
                id: user.id,
                name: user.name,
                role: 'admin',
                image: user.image,
                },
                token);
            ChatClient.instance.isInitialized = true;
        }
        return ChatClient.instance.chatInstance.channel('messaging', 'chat');
    } 
}



// export const initChat = async () => {
//     return StreamChat.getInstance<{
//         attachmentType: AttachmentType;
//         channelType: ChannelType;
//         commandType: CommandType;
//         eventType: EventType;
//         messageType: MessageType;
//         reactionType: ReactionType;
//         userType: UserType;
//     }>(apiKey!, { enableWSFallback: true });
// }

// export const finishSetup = async (client: StreamChat, user: any, token: string) => {
//     await client.connectUser({
//         id: user.id,
//         name: user.name,
//         role: 'admin',
//         image: user.image,
//         },
//         token);
//     //@ts-ignore
//     setChannel(client.channel('messaging', 'chat'));
// }