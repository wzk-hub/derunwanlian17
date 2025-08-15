/**
 * 管理员账号调试工具
 * 用于检查和调试管理员账号相关问题
 */

export function debugAdminAccount() {
  console.log('=== 管理员账号调试信息 ===');
  
  // 检查用户数据
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  console.log('所有用户:', users);
  
  // 查找管理员账号
  const adminUsers = users.filter((u: any) => u.role === 'admin');
  console.log('管理员账号:', adminUsers);
  
  // 查找特定手机号的账号
  const phone15931319952 = users.filter((u: any) => u.phone === '15931319952');
  console.log('手机号15931319952的账号:', phone15931319952);
  
  // 检查当前用户
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  console.log('当前登录用户:', currentUser);
  
  // 检查认证状态
  const authState = {
    isAuthenticated: !!currentUser,
    userRole: currentUser?.role || null,
    userId: currentUser?.id || null,
    userName: currentUser?.name || null
  };
  console.log('认证状态:', authState);
  
  // 检查localStorage中的所有数据
  console.log('localStorage中的所有数据:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value);
      } catch (error) {
        console.log(`${key}: [无法读取]`);
      }
    }
  }
  
  return {
    users,
    adminUsers,
    phone15931319952,
    currentUser,
    authState
  };
}

export function forceCreateAdminAccount() {
  console.log('=== 强制创建管理员账号 ===');
  
  try {
    // 获取现有用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 删除所有现有管理员账号
    const nonAdminUsers = users.filter((u: any) => u.role !== 'admin');
    
    // 删除所有使用15931319952的账号
    const cleanUsers = nonAdminUsers.filter((u: any) => u.phone !== '15931319952');
    
    // 创建新的管理员账号
    const newAdminUser = {
      id: 'admin-1',
      phone: '15931319952',
      password: 'ljqwzk0103888',
      role: 'admin',
      name: '系统管理员',
      createdAt: new Date()
    };
    
    // 添加到用户列表
    cleanUsers.push(newAdminUser);
    
    // 保存到localStorage
    localStorage.setItem('users', JSON.stringify(cleanUsers));
    
    console.log('管理员账号创建成功:', newAdminUser);
    console.log('更新后的用户列表:', cleanUsers);
    
    return {
      success: true,
      adminUser: newAdminUser,
      users: cleanUsers
    };
    
  } catch (error) {
    console.error('创建管理员账号失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

export function clearAllData() {
  console.log('=== 清除所有数据 ===');
  
  try {
    // 清除所有localStorage数据
    localStorage.clear();
    
    console.log('所有数据已清除');
    
    // 重新创建管理员账号
    const result = forceCreateAdminAccount();
    
    return {
      success: true,
      message: '所有数据已清除，管理员账号已重新创建',
      adminAccount: result
    };
    
  } catch (error) {
    console.error('清除数据失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

export function testLogin(phone: string, password: string) {
  console.log('=== 测试登录 ===');
  console.log('测试账号:', { phone, password });
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 尝试登录
    let user = null;
    
    // 精确匹配手机号和密码
    user = users.find((u: any) => u.phone === phone && u.password === password);
    
    // 如果没找到，尝试匹配ID和密码
    if (!user) {
      user = users.find((u: any) => u.id === phone && u.password === password);
    }
    
    // 管理员特殊匹配
    if (!user && phone === '15931319952') {
      user = users.find((u: any) => u.phone === '15931319952' && u.role === 'admin' && u.password === password);
    }
    
    if (user) {
      console.log('登录测试成功:', user);
      return {
        success: true,
        user,
        message: '登录测试成功'
      };
    } else {
      console.log('登录测试失败: 未找到匹配的用户');
      return {
        success: false,
        message: '未找到匹配的用户',
        availableUsers: users.filter((u: any) => u.phone === phone || u.id === phone)
      };
    }
    
  } catch (error) {
    console.error('登录测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}