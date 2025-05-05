import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await axios.get('/api/groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGroups(data);
    } catch (err) {
      console.error('❌ 無法取得群組:', err);
    }
  };

  const addGroup = async () => {
    if (!newGroupName) return alert('群組名稱不能為空');
    try {
      await axios.post(
        '/api/groups',
        { name: newGroupName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setNewGroupName('');
      fetchGroups();
    } catch (err) {
      console.error('❌ 新增群組失敗:', err);
    }
  };

  const updateGroup = async (id, name) => {
    try {
      await axios.put(
        `/api/groups/${id}`,
        { name },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setEditingGroup(null);
      fetchGroups();
    } catch (err) {
      console.error('❌ 更新群組失敗:', err);
    }
  };

  const deleteGroup = async (id) => {
    try {
      await axios.delete(`/api/groups/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchGroups();
    } catch (err) {
      console.error('❌ 刪除群組失敗:', err);
    }
  };

  return (
    <div>
      <h1>群組管理</h1>
      <div>
        <input
          type="text"
          placeholder="新增群組名稱"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
        <button onClick={addGroup}>新增群組</button>
      </div>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            {editingGroup === group.id ? (
              <input
                type="text"
                defaultValue={group.name}
                onBlur={(e) => updateGroup(group.id, e.target.value)}
              />
            ) : (
              <>
                {group.name}
                <button onClick={() => setEditingGroup(group.id)}>編輯</button>
                <button onClick={() => deleteGroup(group.id)}>刪除</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupManagement;