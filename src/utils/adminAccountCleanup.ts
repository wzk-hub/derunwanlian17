/**
 * 管理员账号清理工具
 * 用于清理系统中其他使用15931319952的账号数据，确保该号码专门用作管理员账号
 */

export interface CleanupResult {
  removedUsers: number;
  removedTasks: number;
  removedChatGroups: number;
  removedMessages: number;
  removedNotifications: number;
  success: boolean;
  message: string;
}

/**
 * 清理系统中其他使用指定手机号的账号数据
 * @param phone 要清理的手机号
 * @returns 清理结果
 */
export function cleanupDuplicateAccounts(phone: string = '15931319952'): CleanupResult {
  try {
    let removedUsers = 0;
    let removedTasks = 0;
    let removedChatGroups = 0;
    let removedMessages = 0;
    let removedNotifications = 0;

    // 1. 清理用户数据
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const originalUserCount = users.length;
    
    // 保留管理员账号，删除其他使用该手机号的账号
    const filteredUsers = users.filter((u: any) => {
      if (u.phone === phone) {
        // 如果不是管理员账号，则删除
        if (u.role !== 'admin') {
          removedUsers++;
          return false;
        }
      }
      return true;
    });

    // 确保管理员账号存在
    const hasAdmin = filteredUsers.some((u: any) => u.role === 'admin' && u.phone === phone);
    if (!hasAdmin) {
      filteredUsers.push({
        id: 'admin-1',
        phone: phone,
        password: 'ljqwzk0103888',
        role: 'admin',
        name: '系统管理员',
        createdAt: new Date()
      });
    }

    // 更新用户数据
    localStorage.setItem('users', JSON.stringify(filteredUsers));

    // 2. 清理任务数据
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const originalTaskCount = tasks.length;
    
    const cleanedTasks = tasks.filter((t: any) => {
      let shouldRemove = false;
      
      if (t.publisherId === phone && t.publisherRole !== 'admin') {
        shouldRemove = true;
      }
      if (t.teacherId === phone && t.teacherRole !== 'admin') {
        shouldRemove = true;
      }
      if (t.approvedById === phone && t.approvedByRole !== 'admin') {
        shouldRemove = true;
      }
      if (t.paymentConfirmedById === phone && t.paymentConfirmedByRole !== 'admin') {
        shouldRemove = true;
      }
      if (t.cancelledById === phone && t.cancelledByRole !== 'admin') {
        shouldRemove = true;
      }
      
      if (shouldRemove) {
        removedTasks++;
        return false;
      }
      return true;
    });

    localStorage.setItem('tasks', JSON.stringify(cleanedTasks));

    // 3. 清理聊天群组数据
    const chatGroups = JSON.parse(localStorage.getItem('chatGroups') || '{}');
    const originalGroupCount = Object.keys(chatGroups).length;
    
    Object.keys(chatGroups).forEach(groupId => {
      const group = chatGroups[groupId];
      const originalMemberCount = group.members.length;
      
      // 过滤掉非管理员的相关成员
      group.members = group.members.filter((m: any) => {
        if (m.id === phone && m.role !== 'admin') {
          return false;
        }
        return true;
      });
      
      // 如果群组成员少于2人，删除整个群组
      if (group.members.length < 2) {
        delete chatGroups[groupId];
        removedChatGroups++;
      } else if (group.members.length < originalMemberCount) {
        // 更新群组数据
        chatGroups[groupId] = group;
      }
    });

    localStorage.setItem('chatGroups', JSON.stringify(chatGroups));

    // 4. 清理消息数据
    const messages = JSON.parse(localStorage.getItem('messages') || '{}');
    const originalMessageCount = Object.keys(messages).length;
    
    Object.keys(messages).forEach(groupId => {
      const groupMessages = messages[groupId];
      const originalMessageCount = groupMessages.length;
      
      // 过滤掉非管理员发送的消息
      messages[groupId] = groupMessages.filter((m: any) => {
        if (m.senderId === phone && m.senderRole !== 'admin') {
          return false;
        }
        return true;
      });
      
      // 如果群组没有消息了，删除整个群组
      if (messages[groupId].length === 0) {
        delete messages[groupId];
        removedMessages++;
      } else if (messages[groupId].length < originalMessageCount) {
        // 更新消息数据
        messages[groupId] = messages[groupId];
      }
    });

    localStorage.setItem('messages', JSON.stringify(messages));

    // 5. 清理通知数据
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const originalNotificationCount = notifications.length;
    
    const cleanedNotifications = notifications.filter((n: any) => {
      if ((n.userId === phone && n.userRole !== 'admin') ||
          (n.senderId === phone && n.senderRole !== 'admin')) {
        return false;
      }
      return true;
    });

    removedNotifications = originalNotificationCount - cleanedNotifications.length;
    localStorage.setItem('notifications', JSON.stringify(cleanedNotifications));

    // 6. 清理其他可能的数据
    cleanupOtherRelatedData(phone);

    return {
      removedUsers,
      removedTasks,
      removedChatGroups,
      removedMessages,
      removedNotifications,
      success: true,
      message: `清理完成：删除了 ${removedUsers} 个用户、${removedTasks} 个任务、${removedChatGroups} 个聊天群组、${removedMessages} 个消息、${removedNotifications} 个通知`
    };

  } catch (error) {
    console.error('清理账号数据时出错:', error);
    return {
      removedUsers: 0,
      removedTasks: 0,
      removedChatGroups: 0,
      removedMessages: 0,
      removedNotifications: 0,
      success: false,
      message: `清理失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 清理其他相关数据
 * @param phone 要清理的手机号
 */
function cleanupOtherRelatedData(phone: string): void {
  try {
    // 清理支付记录
    const paymentRecords = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
    const cleanedPaymentRecords = paymentRecords.filter((p: any) => 
      p.userId !== phone || p.userRole === 'admin'
    );
    localStorage.setItem('paymentRecords', JSON.stringify(cleanedPaymentRecords));

    // 清理结算记录
    const settlements = JSON.parse(localStorage.getItem('settlements') || '[]');
    const cleanedSettlements = settlements.filter((s: any) => 
      s.teacherId !== phone || s.teacherRole === 'admin'
    );
    localStorage.setItem('settlements', JSON.stringify(cleanedSettlements));

    // 清理用户会话
    const sessions = JSON.parse(localStorage.getItem('userSessions') || '{}');
    if (sessions[phone] && sessions[phone].role !== 'admin') {
      delete sessions[phone];
      localStorage.setItem('userSessions', JSON.stringify(sessions));
    }

    // 清理用户偏好设置
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    if (userPreferences[phone] && userPreferences[phone].role !== 'admin') {
      delete userPreferences[phone];
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    }

  } catch (error) {
    console.error('清理其他相关数据时出错:', error);
  }
}

/**
 * 验证管理员账号状态
 * @returns 验证结果
 */
export function validateAdminAccount(): {
  isValid: boolean;
  adminUser: any | null;
  duplicateAccounts: any[];
  message: string;
} {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 查找管理员账号
    const adminUser = users.find((u: any) => u.role === 'admin' && u.phone === '15931319952');
    
    // 查找重复账号
    const duplicateAccounts = users.filter((u: any) => 
      u.phone === '15931319952' && u.role !== 'admin'
    );

    if (!adminUser) {
      return {
        isValid: false,
        adminUser: null,
        duplicateAccounts,
        message: '管理员账号不存在'
      };
    }

    if (duplicateAccounts.length > 0) {
      return {
        isValid: false,
        adminUser,
        duplicateAccounts,
        message: `发现 ${duplicateAccounts.length} 个重复账号需要清理`
      };
    }

    return {
      isValid: true,
      adminUser,
      duplicateAccounts: [],
      message: '管理员账号状态正常'
    };

  } catch (error) {
    return {
      isValid: false,
      adminUser: null,
      duplicateAccounts: [],
      message: `验证失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 强制重置管理员账号
 * @returns 重置结果
 */
export function forceResetAdminAccount(): CleanupResult {
  try {
    // 先清理所有相关数据
    const cleanupResult = cleanupDuplicateAccounts('15931319952');
    
    // 强制创建新的管理员账号
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 删除所有现有管理员账号
    const nonAdminUsers = users.filter((u: any) => u.role !== 'admin');
    
    // 创建新的管理员账号
    const newAdminUser = {
      id: 'admin-1',
      phone: '15931319952',
      password: 'ljqwzk0103888',
      role: 'admin',
      name: '系统管理员',
      createdAt: new Date()
    };
    
    nonAdminUsers.push(newAdminUser);
    localStorage.setItem('users', JSON.stringify(nonAdminUsers));
    
    return {
      ...cleanupResult,
      message: cleanupResult.message + '，管理员账号已重置'
    };
    
  } catch (error) {
    return {
      removedUsers: 0,
      removedTasks: 0,
      removedChatGroups: 0,
      removedMessages: 0,
      removedNotifications: 0,
      success: false,
      message: `重置管理员账号失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}