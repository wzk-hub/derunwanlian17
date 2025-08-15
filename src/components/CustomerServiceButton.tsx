import React, { useState, useContext } from 'react';
import CustomerService from './CustomerService';
import { AuthContext } from '@/contexts/authContext';
import { cn } from '@/lib/utils';

interface CustomerServiceButtonProps {
  className?: string;
  position?: 'fixed' | 'relative';
}

const CustomerServiceButton: React.FC<CustomerServiceButtonProps> = ({
  className = '',
  position = 'fixed'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userId, userRole, userName } = useContext(AuthContext);

  // 如果不是家长或老师角色，不显示客服按钮
  if (!userId || (userRole !== 'parent' && userRole !== 'teacher')) {
    return null;
  }

  const toggleService = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 客服入口按钮 */}
      <button
        onClick={toggleService}
        className={cn(
          "group bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2",
          position === 'fixed' ? 'fixed bottom-6 right-6 z-40' : 'relative',
          className
        )}
        style={{
          width: '60px',
          height: '60px'
        }}
        title="在线客服"
      >
        <div className="flex items-center justify-center w-full h-full">
          <i className="fa-solid fa-headset text-xl group-hover:scale-110 transition-transform duration-200"></i>
        </div>
        
        {/* 脉冲动画 */}
        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
        
        {/* 在线状态指示器 */}
        <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
      </button>

      {/* 客服聊天窗口 */}
      <CustomerService
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userRole={userRole as 'parent' | 'teacher'}
        userId={userId}
        userName={userName || undefined}
      />
    </>
  );
};

export default CustomerServiceButton;