const API_BASE_URL = 'http://localhost:3000/api';

export async function signup(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Signup failed');
  }
  
  return response.json();
}

export async function signin(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Signin failed');
  }
  
  const data = await response.json();
  // Store token
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function getPublicMagazines() {
  const response = await fetch(`${API_BASE_URL}/landing/magazines`);
  if (!response.ok) {
    throw new Error('Failed to fetch magazines');
  }
  return response.json();
}
