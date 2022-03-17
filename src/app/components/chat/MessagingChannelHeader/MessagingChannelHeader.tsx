import React, { useEffect, useRef, useState } from 'react';
import { Avatar, useChannelStateContext, useChatContext } from 'stream-chat-react';

import './MessagingChannelHeader.css';

import { TypingIndicator } from '../TypingIndicator/TypingIndicator';



import type { ChannelMemberResponse } from 'stream-chat';

import type {
  AttachmentType,
  ChannelType,
  CommandType,
  EventType,
  MessageType,
  ReactionType,
  UserType,
} from '../../chat';
import { ChannelInfoIcon, ChannelSaveIcon } from '../../../../assets';

const AvatarGroup = ({ members }: { members: ChannelMemberResponse[] }) => {
  if (members.length >= 4) {
    return (
      <div className='messaging__channel-header__avatars four'>
        <span>
          <Avatar  shape='square' size={20} />
          <Avatar shape='square' size={20} />
        </span>
        <span>
          <Avatar shape='square' size={20} />
          <Avatar  shape='square' size={20} />
        </span>
      </div>
    );
  }

  return null;
};

type Props = {
  theme: string;
  toggleMobile: () => void;
};

const MessagingChannelHeader: React.FC<Props> = (props) => {
  const { theme, toggleMobile } = props;

  const { client } = useChatContext<
    AttachmentType,
    ChannelType,
    CommandType,
    EventType,
    MessageType,
    ReactionType,
    UserType
  >();

  const { channel } = useChannelStateContext<
    AttachmentType,
    ChannelType,
    CommandType,
    EventType,
    MessageType,
    ReactionType,
    UserType
  >();

  const [channelName, setChannelName] = useState(channel.data?.name || '');



  // const members: ChannelMemberResponse[] = Object.values(channel.state.members || {}).filter(
  //   (member:any) => member.user?.id !== client?.user?.id,
  // );


  // const EditHeader = () => (
  //   <form
  //     style={{ flex: 1 }}
  //     onSubmit={(event) => {
  //       event.preventDefault();
  //       inputRef?.current?.blur();
  //     }}
  //   >
  //     <input
  //       autoFocus
  //       className='channel-header__edit-input'
  //       onBlur={updateChannel}
  //       onChange={(event) => setChannelName(event.target.value)}
  //       placeholder='Type a new name for the chat'
  //       ref={inputRef}
  //       value={channelName}
  //     />
  //   </form>
  // );

  return (
    <div className='messaging__channel-header'>
      {/* <AvatarGroup members={members} /> */}
      <div className='messaging__channel-header__right'>
        <TypingIndicator />
      </div>
    </div>
  );
};

export default React.memo(MessagingChannelHeader);
