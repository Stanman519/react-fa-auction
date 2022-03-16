// import { useTheme } from "@mui/material";
// import { useState } from "react";
// import {
//     Chat,
//     Channel,
//     ChannelHeader,
//     Thread,
//     Window,
//     MessageList,
//     MessageInput
//   } from 'stream-chat-react';
//   import { StreamChat } from 'stream-chat';

// let chatClient : StreamChat;

// export const ChatWindow = (): JSX.Element => {

//     const [channel, setChannel] = useState(undefined);
//     const setUser = async ({ apiKey, user, token }) => {
//         const { results: people } = await (
//           await fetch('https://randomuser.me/api/?inc=picture')
//         ).json();
//         const [person] = people;
//         const { picture } = person;
      
//         chatClient = new StreamChat(apiKey);
//         chatClient.setUser(
//           {
//             id: user._id,
//             name: user.name.first,
//             role: 'admin',
//             image: picture.thumbnail
//           },
//           token
//         );
//         const newChannel = chatClient.channel('messaging', 'Chat');
//         setChannel(newChannel);
//       };

//     return (
//             <div className="lot-frame" >
//                 <Chat client={chatClient} theme={'messaging light'}>
//                     <Channel channel={channel}>
//                         <Window>
//                             <ChannelHeader />
//                             <MessageList />
//                             <MessageInput />
//                         </Window>
//                         <Thread />
//                     </Channel>
//                 </Chat>
//             </div>
    
//         );
    
  
//   }
  