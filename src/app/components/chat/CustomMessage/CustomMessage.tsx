import { MessageUIComponentProps, MessageSimple } from 'stream-chat-react';

import './CustomMessage.css';

const CustomMessage = (props: MessageUIComponentProps) => {
  return (
    <>
      <MessageSimple actionsEnabled={false} />
    </>
  );
};

export default CustomMessage;
