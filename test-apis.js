const API_URL = 'http://localhost:4000/api';
let token = '';
let workspaceId = '';
let projectId = '';
let taskId = '';

async function runTests() {
  console.log('Testing APIs...');

  try {
    // 1. Test Auth Registration & Login
    console.log('\n--- AUTH ---');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: `test${Date.now()}@test.com`, password: 'password123' })
    });
    const registerData = await registerRes.json();
    console.log('Register:', registerRes.status === 201 ? '✅ PASS' : `❌ FAIL (${registerRes.status})`);

    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registerData.email, password: 'password123' })
    });
    const loginData = await loginRes.json();
    token = loginData.accessToken;
    console.log('Login:', token ? '✅ PASS' : '❌ FAIL');

    // 2. Test Workspaces
    console.log('\n--- WORKSPACES ---');
    const createWsRes = await fetch(`${API_URL}/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Test Workspace', slug: `test-ws-${Date.now()}` })
    });
    const createWsData = await createWsRes.json();
    workspaceId = createWsData.id;
    console.log('Create Workspace:', workspaceId ? '✅ PASS' : '❌ FAIL');

    const getWsRes = await fetch(`${API_URL}/workspaces`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getWsData = await getWsRes.json();
    console.log('Get Workspaces:', getWsData.length > 0 ? '✅ PASS' : '❌ FAIL');

    // 3. Test Projects
    console.log('\n--- PROJECTS ---');
    const createProjRes = await fetch(`${API_URL}/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Test Project', description: 'A test project' })
    });
    const createProjData = await createProjRes.json();
    projectId = createProjData.id;
    console.log('Create Project:', projectId ? '✅ PASS' : '❌ FAIL');

    const getProjRes = await fetch(`${API_URL}/workspaces/${workspaceId}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getProjData = await getProjRes.json();
    console.log('Get Projects:', getProjData.length > 0 ? '✅ PASS' : '❌ FAIL');

    // 4. Test Tasks
    console.log('\n--- TASKS ---');
    const createTaskRes = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ projectId, title: 'Test Task', priority: 'HIGH', status: 'TODO' })
    });
    const createTaskData = await createTaskRes.json();
    taskId = createTaskData.id;
    console.log('Create Task:', taskId ? '✅ PASS' : '❌ FAIL');

    const getTasksRes = await fetch(`${API_URL}/tasks/project/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getTasksData = await getTasksRes.json();
    console.log('Get Tasks by Project:', getTasksData.data && getTasksData.data.length > 0 ? '✅ PASS' : '❌ FAIL');

    const getTaskTreeRes = await fetch(`${API_URL}/tasks/${taskId}/tree`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getTaskTreeData = await getTaskTreeRes.json();
    console.log('Get Task Tree (CTE query):', getTaskTreeData.length > 0 ? '✅ PASS' : '❌ FAIL');

    console.log('\nAll tests executed successfully!');
  } catch (error) {
    console.error('Test execution failed:', error.message);
  }
}

runTests();
