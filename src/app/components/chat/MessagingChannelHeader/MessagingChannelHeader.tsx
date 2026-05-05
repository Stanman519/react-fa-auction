import React, { useEffect, useRef, useState } from 'react';
import { Avatar, useChannelStateContext, useChatContext } from 'stream-chat-react';

import './MessagingChannelHeader.css';

import { TypingIndicator } from '../TypingIndicator/TypingIndicator';



import type { ChannelMemberResponse } from 'stream-chat';

import type { StreamChatGenerics } from '../../chat';
import { ChannelInfoIcon, ChannelSaveIcon, HamburgerIcon } from '../../../../assets';

export const AvatarGroup = ({ members }: { members: ChannelMemberResponse[] }) => {
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
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { client } = useChatContext<StreamChatGenerics>();

  const { channel } = useChannelStateContext<StreamChatGenerics>();
  const [channelName, setChannelName] = useState(channel.data?.name || '');
  const [title, setTitle] = useState('');
  const updateChannel = async () => {
    if (channelName && channelName !== channel.data?.name) {
      await channel.update(
        { name: channelName },
        { text: `Channel name changed to ${channelName}` },
      );
    }

    setIsEditing(false);
  };

  const members: any[] = Object.values(channel.state.members || {} as ChannelMemberResponse).filter(
    (member:any) =>  member.user?.id !== client?.user?.id
  );

  const EditHeader = () => (
    <form
      style={{ flex: 1 }}
      onSubmit={(event) => {
        event.preventDefault();
        inputRef?.current?.blur();
      }}
    >
      <input
        autoFocus
        className='channel-header__edit-input'
        onBlur={updateChannel}
        onChange={(event) => setChannelName(event.target.value)}
        placeholder='Type a new name for the chat'
        ref={inputRef}
        value={channelName}
      />
    </form>
  );

  return (
    <div className='messaging__channel-header'>
            <div id='mobile-nav-icon' className={`${theme}`} onClick={() => toggleMobile()}>
        <HamburgerIcon />
      </div>
      <AvatarGroup members={members} />
            {!isEditing ? (
        <div className='channel-header__name'>{channelName || title}</div>
      ) : (
        <EditHeader />
      )}
      <div className='messaging__channel-header__right'>
        <TypingIndicator />
        {channelName !== 'Social Demo' &&
          (!isEditing ? <ChannelInfoIcon {...{ isEditing, setIsEditing }} /> : <ChannelSaveIcon />)}
      </div>
    </div>
  );
};

export default React.memo(MessagingChannelHeader);
