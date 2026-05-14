import { useState, useRef, useEffect } from 'react';
import { IoSend, IoAttach, IoClose, IoImage } from 'react-icons/io5';
import { sendMessage } from '../../services/messageService';
import { uploadChatMedia } from '../../services/storageService';
import { compressImage, createThumbnail, isImageFile, validateFile, readFileAsDataURL, getFileIcon } from '../../utils/fileUtils';
import { useToast } from '../../contexts/ToastContext';

export default function MessageInput({ chatId, currentUser }) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]); // { file, preview, type }
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        continue;
      }

      const isImage = isImageFile(file);
      let preview = null;
      if (isImage) {
        preview = await readFileAsDataURL(file);
      }

      setAttachments((prev) => [...prev, {
        file,
        preview,
        type: isImage ? 'image' : 'file',
        name: file.name,
        size: file.size,
      }]);
    }

    // Reset file input
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const hasText = text.trim().length > 0;
    const hasAttachments = attachments.length > 0;

    if (!hasText && !hasAttachments) return;

    setSending(true);
    setUploadProgress(0);

    try {
      // Send attachments first
      for (const attachment of attachments) {
        let fileUrl = null;
        let thumbnailUrl = null;

        if (attachment.type === 'image') {
          // Compress and upload image
          const compressed = await compressImage(attachment.file);
          const thumbnail = await createThumbnail(attachment.file);

          fileUrl = await uploadChatMedia(chatId, compressed, null, (p) => setUploadProgress(p));
          thumbnailUrl = await uploadChatMedia(chatId, thumbnail, null);
        } else {
          fileUrl = await uploadChatMedia(chatId, attachment.file, null, (p) => setUploadProgress(p));
        }

        await sendMessage(chatId, {
          text: null,
          senderId: currentUser.id,
          senderName: currentUser.name,
          type: attachment.type,
          fileUrl,
          fileName: attachment.name,
          fileSize: attachment.size,
          fileType: attachment.file.type,
          thumbnailUrl,
        });
      }

      // Send text message
      if (hasText) {
        await sendMessage(chatId, {
          text: text.trim(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          type: 'text',
        });
      }

      setText('');
      setAttachments([]);
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      setUploadProgress(0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="attachment-preview">
          {attachments.map((att, index) => (
            <div key={index} className="attachment-preview-item">
              {att.type === 'image' && att.preview ? (
                <img src={att.preview} alt={att.name} />
              ) : (
                <div className="file-icon">{getFileIcon(att.file.type)}</div>
              )}
              <button className="attachment-remove" onClick={() => removeAttachment(index)}>
                <IoClose />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {sending && uploadProgress > 0 && uploadProgress < 100 && (
        <div style={{
          height: 3,
          background: 'var(--border-secondary)',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: `${uploadProgress}%`,
            background: 'var(--accent-primary)',
            transition: 'width 200ms ease',
            borderRadius: 2,
          }} />
        </div>
      )}

      <div className="message-input-container">
        <div className="message-input-wrapper">
          <div className="message-input-attachments">
            <button
              className="btn-icon"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <IoAttach size={20} />
            </button>
            <button
              className="btn-icon"
              onClick={() => {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current?.click();
                setTimeout(() => { fileInputRef.current.accept = '*/*'; }, 100);
              }}
              title="Send image"
            >
              <IoImage size={18} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            className="message-text-input"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={sending}
          />

          <button
            className="message-send-btn"
            onClick={handleSend}
            disabled={sending || (!text.trim() && attachments.length === 0)}
            title="Send message"
          >
            <IoSend />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </>
  );
}
