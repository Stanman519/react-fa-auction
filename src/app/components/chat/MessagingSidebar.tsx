import { MouseEventHandler } from 'react';
import { ChannelListProps, ChannelList } from 'stream-chat-react';

import MessagingChannelPreview from './MessagingChannelPreview';

type MessagingSidebarProps = {
  channelListOptions: {
    filters: ChannelListProps['filters']
    sort: ChannelListProps['sort']
    options: ChannelListProps['options']
  }
  onClick: MouseEventHandler;
  onCreateChannel: () => void;
  onPreviewSelect: MouseEventHandler
}

const MessagingSidebar = ({channelListOptions, onClick, onPreviewSelect}: MessagingSidebarProps) => {

  return (
    <div className={`str-chat messaging__sidebar light`} id='mobile-channel-list' onClick={onClick}>
      {/* <MessagingChannelListHeader
        onCreateChannel={onCreateChannel}
      /> */}
      <ChannelList
        {...channelListOptions}
        Preview={(props) => <MessagingChannelPreview {...props} onClick={onPreviewSelect} />}
      />
    </div>
  )
}

export default MessagingSidebar;