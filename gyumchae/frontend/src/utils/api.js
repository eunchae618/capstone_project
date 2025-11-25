// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 토큰 관리
export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const setToken = (token) => {
  localStorage.setItem('access_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
};

// 기본 fetch 함수
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '오류가 발생했습니다.' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 인증 API
export const authAPI = {
  register: async (username, password) => {
    return fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: '로그인에 실패했습니다.' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.access_token) {
      setToken(data.access_token);
    }
    return data;
  },

  getMe: async () => {
    return fetchAPI('/api/auth/me');
  },

  logout: () => {
    removeToken();
  },
};

// 커뮤니티 API
export const communityAPI = {
  getPosts: async (category = null, skip = 0, limit = 20) => {
    const params = new URLSearchParams({ skip, limit });
    if (category && category !== 'ALL') {
      params.append('category', category);
    }
    return fetchAPI(`/api/community/posts?${params}`);
  },

  getPost: async (postId) => {
    return fetchAPI(`/api/community/posts/${postId}`);
  },

  createPost: async (title, content, category = 'ALL') => {
    return fetchAPI('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content, category }),
    });
  },

  getComments: async (postId) => {
    return fetchAPI(`/api/community/posts/${postId}/comments`);
  },

  createComment: async (postId, content) => {
    return fetchAPI(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  toggleLike: async (postId) => {
    return fetchAPI(`/api/community/posts/${postId}/like`, {
      method: 'POST',
    });
  },
};

// 지도 검색 API
export const mapAPI = {
  search: async (query, display = 10, start = 1) => {
    const params = new URLSearchParams({ query, display: display.toString(), start: start.toString() });
    return fetchAPI(`/api/map/search?${params}`);
  },
};

