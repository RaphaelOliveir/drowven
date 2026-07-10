import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, User } from 'lucide-react';
import { fetchUsers, fetchConversations, fetchMessages, sendMessage, setActiveConversation, createOrGetConversation, Conversation } from '../../store/chat-slice';
import { AppDispatch, RootState } from '../../store';
import { Spinner } from '../../components/spinner/spinner';
import './home.css';

export function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const [msgInput, setMsgInput] = useState('');
  
  const { 
    users, 
    conversations, 
    activeConversation, 
    messages, 
    loadingUsers, 
    loadingConversations, 
    loadingMessages 
  } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleConversationClick = (conv: Conversation) => {
    dispatch(setActiveConversation(conv));
    dispatch(fetchMessages(conv.id));
  };

  const handleStartChat = async (userId: string) => {
    const resultAction = await dispatch(createOrGetConversation(userId));
    if (createOrGetConversation.fulfilled.match(resultAction)) {
      dispatch(fetchMessages(resultAction.payload.id));
    }
  };

  const handleSend = () => {
    if (msgInput.trim() && activeConversation) {
      dispatch(sendMessage({ conversationId: activeConversation.id, content: msgInput }));
      setMsgInput('');
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-left">
          <h1>Drowven</h1>
          <img src="/assets/images/wave.png" alt="Logo" className="header-logo" />
        </div>
        <div className="header-right">
          <input type="text" placeholder="Search..." className="search-input" />
          <div className="icon">
            <Bell data-testid="lucide-bell" size={20} />
          </div>
          <div className="icon">
            <User data-testid="lucide-user" size={20} />
          </div>
        </div>
      </header>
      <div className="home-body">
        <aside className="sidebar-left">
          <h2>Conversations</h2>
          {loadingConversations ? (
            <Spinner />
          ) : (
            <ul className="conversation-list">
              {conversations.map(c => (
                <li key={c.id}>
                  <button onClick={() => handleConversationClick(c)}>
                    {c.receiver_name || 'Unknown User'}
                  </button>
                </li>
              ))}
              {conversations.length === 0 && <p>No conversations yet.</p>}
            </ul>
          )}
        </aside>
        <main className="main-content">
          {activeConversation ? (
            <div data-testid="chat-window" className="chat-window">
              <h2>Chat with {activeConversation.receiver_name || 'User'}</h2>
              <div className="chat-messages">
                {loadingMessages ? (
                  <Spinner />
                ) : (
                  messages.map(m => (
                    <div key={m.id} className="message">
                      <p>{m.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="chat-input-area">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
              </div>
            </div>
          ) : (
            <div className="empty-state">Select a conversation to start chatting</div>
          )}
        </main>
        <aside className="sidebar-right">
          <h2>Suggested Users</h2>
          {loadingUsers ? (
            <Spinner />
          ) : (
            <ul className="suggested-list">
              {users.map(u => (
                <li key={u.id}>
                  <p>{u.name}</p>
                  <button onClick={() => handleStartChat(u.id)} className="start-chat-btn">Message</button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
