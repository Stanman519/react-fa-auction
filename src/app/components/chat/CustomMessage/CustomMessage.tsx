import { MessageUIComponentProps, MessageSimple } from 'stream-chat-react';
import type { StreamChatGenerics } from '../../chat';

import './CustomMessage.css';

const CustomMessage = (props: MessageUIComponentProps<StreamChatGenerics>) => {
  return (
    <>
      <MessageSimple actionsEnabled={false} />
    </>
  );
};

export default CustomMessage;
