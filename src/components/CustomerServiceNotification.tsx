import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { CustomerServiceChat } from '@/models/CustomerService';

interface CustomerServiceNotificationProps {
  onOpenChat: () => void;
}

const CustomerServiceNotification: React.FC<CustomerServiceNotificationProps> = ({ onOpenChat }) => {
  const { userId } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  // 监听客服消息变化
  useEffect(() => {
    if (!userId) return;

    const checkUnreadMessages = () => {
      const chats = JSON.parse(localStorage.getItem('customerServiceChats') || '[]');
      const userChat = chats.find((c: CustomerServiceChat) => 
        c.userId === userId && c.status !== 'closed'
      );
      
      if (userChat) {
        setUnreadCount(userChat.unreadCount || 0);
      }
    };

    // 初始检查
    checkUnreadMessages();

    // 监听存储变化
    const handleStorageChange = () => {
      checkUnreadMessages();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 定期检查（模拟实时更新）
    const interval = setInterval(checkUnreadMessages, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userId]);

  if (unreadCount === 0) return null;

  return (
    <div className="fixed bottom-20 left-6 z-50">
      <button
        onClick={onOpenChat}
        className="relative bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-all duration-200"
        title="您有未读客服消息"
      >
        <i className="fa-solid fa-bell text-lg"></i>
        <span className="absolute -top-2 -right-2 bg-white text-red-500 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-red-500">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      </button>
    </div>
  );
};

export default CustomerServiceNotification;