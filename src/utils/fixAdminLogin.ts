/**
 * 快速修复管理员登录问题
 * 这个工具用于解决管理员账号无法登录的问题
 */

export function quickFixAdminLogin() {
  console.log('=== 快速修复管理员登录问题 ===');
  
  try {
    // 1. 清除所有现有数据
    console.log('1. 清除现有数据...');
    localStorage.clear();
    
    // 2. 创建新的管理员账号
    console.log('2. 创建管理员账号...');
    const adminUser = {
      id: 'admin-1',
      phone: '15931319952',
      password: 'ljqwzk0103888',
      role: 'admin',
      name: '系统管理员',
      createdAt: new Date()
    };
    
    // 3. 保存到localStorage
    const users = [adminUser];
    localStorage.setItem('users', JSON.stringify(users));
    
    // 4. 创建一些测试数据
    console.log('3. 创建测试数据...');
    
    // 创建一些测试用户
    const testUsers = [
      {
        id: 'parent-1',
        phone: '13800138001',
        password: '123456',
        role: 'parent',
        name: '测试家长',
        childGrade: '3',
        createdAt: new Date()
      },
      {
        id: 'teacher-1',
        phone: '13800138002',
        password: '123456',
        role: 'teacher',
        name: '测试老师',
        subject: '数学',
        createdAt: new Date()
      }
    ];
    
    users.push(...testUsers);
    localStorage.setItem('users', JSON.stringify(users));
    
    // 5. 验证修复结果
    console.log('4. 验证修复结果...');
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const adminExists = savedUsers.some((u: any) => u.role === 'admin' && u.phone === '15931319952');
    
    if (adminExists) {
      console.log('✅ 管理员账号修复成功！');
      console.log('📱 登录信息:');
      console.log('   手机号: 15931319952');
      console.log('   密码: ljqwzk0103888');
      console.log('   角色: admin');
      
      return {
        success: true,
        message: '管理员账号修复成功',
        adminAccount: adminUser,
        totalUsers: savedUsers.length
      };
    } else {
      console.log('❌ 管理员账号修复失败');
      return {
        success: false,
        message: '管理员账号修复失败',
        error: '未找到管理员账号'
      };
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出错:', error);
    return {
      success: false,
      message: '修复失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

export function testAdminLogin() {
  console.log('=== 测试管理员登录 ===');
  
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('当前用户列表:', users);
    
    // 查找管理员账号
    const adminUser = users.find((u: any) => u.role === 'admin' && u.phone === '15931319952');
    
    if (adminUser) {
      console.log('✅ 找到管理员账号:', adminUser);
      
      // 测试登录逻辑
      const testPhone = '15931319952';
      const testPassword = 'ljqwzk0103888';
      
      let user = null;
      
      // 精确匹配手机号和密码
      user = users.find((u: any) => u.phone === testPhone && u.password === testPassword);
      
      if (user) {
        console.log('✅ 登录测试成功:', user);
        return {
          success: true,
          user,
          message: '登录测试成功'
        };
      } else {
        console.log('❌ 登录测试失败: 密码不匹配');
        return {
          success: false,
          message: '密码不匹配',
          adminUser,
          testCredentials: { phone: testPhone, password: testPassword }
        };
      }
      
    } else {
      console.log('❌ 未找到管理员账号');
      return {
        success: false,
        message: '未找到管理员账号',
        users
      };
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
    return {
      success: false,
      message: '测试失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

export function resetToDefaultState() {
  console.log('=== 重置到默认状态 ===');
  
  try {
    // 清除所有数据
    localStorage.clear();
    
    // 创建默认的管理员账号
    const adminUser = {
      id: 'admin-1',
      phone: '15931319952',
      password: 'ljqwzk0103888',
      role: 'admin',
      name: '系统管理员',
      createdAt: new Date()
    };
    
    // 保存管理员账号
    const users = [adminUser];
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('✅ 系统已重置到默认状态');
    console.log('📱 管理员账号信息:');
    console.log('   手机号: 15931319952');
    console.log('   密码: ljqwzk0103888');
    console.log('   角色: admin');
    
    return {
      success: true,
      message: '系统已重置到默认状态',
      adminAccount: adminUser
    };
    
  } catch (error) {
    console.error('❌ 重置过程中出错:', error);
    return {
      success: false,
      message: '重置失败',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 在页面加载时自动执行修复（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保页面完全加载
  setTimeout(() => {
    console.log('🔧 开发环境：自动检查管理员账号状态...');
    const testResult = testAdminLogin();
    
    if (!testResult.success) {
      console.log('⚠️ 检测到管理员账号问题，建议执行修复...');
      console.log('💡 可以使用 quickFixAdminLogin() 或 resetToDefaultState() 来修复');
    } else {
      console.log('✅ 管理员账号状态正常');
    }
  }, 1000);
}