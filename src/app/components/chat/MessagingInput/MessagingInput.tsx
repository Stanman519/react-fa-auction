import React, { useCallback, useContext } from 'react';
import { ImageDropzone } from 'react-file-utils';
import {
  ChatAutoComplete,
  EmojiPicker,
  MessageInputProps,
  UploadsPreview,
  useChannelStateContext,
  useMessageInputContext,
} from 'stream-chat-react';
import { EmojiIcon } from '../../../../assets/EmojiIcon';
import { LightningBoltSmall } from '../../../../assets/LightningBoltSmall';
import { SendIcon } from '../../../../assets/SendIcon';
import { GiphyContext, AttachmentType, MessageType, ChannelType, CommandType, EventType, ReactionType, UserType } from '../../chat';

import './MessagingInput.css';


const GiphyIcon = () => (
  <div className='giphy-icon__wrapper'>
    <LightningBoltSmall />
    <p className='giphy-icon__text'>GIPHY</p>
  </div>
);

const MessagingInput: React.FC<MessageInputProps> = () => {
  const { giphyState, setGiphyState } = useContext(GiphyContext);

  const { acceptedFiles, maxNumberOfFiles, multipleUploads } = useChannelStateContext<
    AttachmentType,
    ChannelType,
    CommandType,
    EventType,
    MessageType,
    ReactionType,
    UserType
  >();

  const messageInput = useMessageInputContext<
    AttachmentType,
    ChannelType,
    CommandType,
    EventType,
    MessageType,
    ReactionType,
    UserType
  >();

  const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      const { value } = event.target;

      const deletePressed =
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.inputType === 'deleteContentBackward'
          ? true
          : false;

      if (messageInput.text.length === 1 && deletePressed) {
        setGiphyState(false);
      }

      if (!giphyState && messageInput.text.startsWith('/giphy') && !messageInput.numberOfUploads) {
        event.target.value = value.replace('/giphy', '');
        setGiphyState(true);
      }

      messageInput.handleChange(event);
    },
    [giphyState, messageInput.numberOfUploads, messageInput.text], // eslint-disable-line
  );

  return (
    <div className='str-chat__messaging-input'>
      <div
        className='messaging-input__button emoji-button'
        role='button'
        aria-roledescription='button'
        onClick={messageInput.openEmojiPicker}
        ref={messageInput.emojiPickerRef}
      >
        <EmojiIcon />
      </div>
        <div className='messaging-input__input-wrapper'>
          {giphyState && !messageInput.numberOfUploads && <GiphyIcon />}
          <UploadsPreview />
          <ChatAutoComplete onChange={onChange} rows={1} placeholder='Send a message' />
        </div>
      <div
        className='messaging-input__button'
        role='button'
        aria-roledescription='button'
        onClick={messageInput.handleSubmit}
      >
        <SendIcon />
      </div>
      <EmojiPicker />
    </div>
  );
};

export default MessagingInput;
