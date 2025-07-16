import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Đổi nếu server chat chạy cổng khác

function getCurrentUserName() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.full_name || user?.username || 'Ẩn danh';
  } catch {
    return 'Ẩn danh';
  }
}

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(getCurrentUserName());
  const [open, setOpen] = useState(false);
  const socketRef = useRef();
  const bottomRef = useRef();

  useEffect(() => {
    setUser(getCurrentUserName());
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('chat history', (msgs) => {
      setMessages(msgs);
    });
    socketRef.current.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socketRef.current.emit('chat message', { user, text: input });
    setInput('');
  };

  return (
    <>
      {/* Nút Messenger nổi */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 10000,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 16px #764ba244',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        aria-label={open ? 'Đóng chat' : 'Mở chat'}
      >
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="white" />
          <path d="M8 22.5V9.5C8 8.67157 8.67157 8 9.5 8H22.5C23.3284 8 24 8.67157 24 9.5V18.5C24 19.3284 23.3284 20 22.5 20H12L8 24V22.5Z" stroke="#764ba2" strokeWidth="2"/>
        </svg>
      </button>
      {/* Khung chat */}
      {open && (
        <div style={{ position: 'fixed', bottom: 90, right: 24, width: 350, zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #0002', padding: 16, minHeight: 400, maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#2c3e50' }}>💬 Chat nhóm
              <button onClick={() => setOpen(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: 22, color: '#764ba2', cursor: 'pointer' }} title="Đóng chat">×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8, background: '#f8f9fa', borderRadius: 6, padding: 8 }}>
              {messages.map((msg, idx) => {
                const isMe = msg.user === user;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: 10
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      background: isMe ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e9ecef',
                      color: isMe ? 'white' : '#222',
                      borderRadius: 16,
                      padding: '8px 14px',
                      boxShadow: isMe ? '0 2px 8px #764ba233' : '0 1px 4px #aaa2',
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      wordBreak: 'break-word',
                      position: 'relative'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2, color: isMe ? '#ffe082' : '#2980b9' }}>
                        {msg.user}
                        <span style={{ color: '#bbb', fontWeight: 400, fontSize: 11, marginLeft: 8 }}>{msg.time}</span>
                      </div>
                      <div style={{ fontSize: 15 }}>{msg.text}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
                required
              />
              <button className="btn btn-success" type="submit">Gửi</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox; 