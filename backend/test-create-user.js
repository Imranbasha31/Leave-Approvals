async function testCreateUser() {
  try {
    // First, get auth token by logging in as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college.edu',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✓ Admin logged in');

    // Now create a test user
    const testUser = {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@college.edu`,
      password: 'TestPassword123',
      role: 'student',
      department: 'Bsc Computer Science',
      studentId: 'TEST2024001'
    };

    console.log('\nCreating test user:', testUser);

    const createResponse = await fetch('http://localhost:5000/api/auth/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testUser)
    });

    const createData = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✓ User created successfully:', createData);
    } else {
      console.error('✗ Failed to create user:', createData);
      return;
    }

    // Verify user was saved by fetching all users
    setTimeout(async () => {
      const usersResponse = await fetch('http://localhost:5000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const allUsers = await usersResponse.json();
      console.log(`\n✓ Total users in database: ${allUsers.length}`);
      
      const newUserFound = allUsers.find(u => u.email === testUser.email);
      if (newUserFound) {
        console.log('✓ New user found in database:', newUserFound);
      } else {
        console.error('✗ New user NOT found in database!');
      }
    }, 500);
  } catch (error) {
    console.error('Test error:', error);
  }
}

testCreateUser();
