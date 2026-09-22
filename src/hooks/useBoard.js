import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../context/AuthContext';

export const useBoard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Ambil semua project milik user atau hasil join
  const fetchProjects = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setProjects(data);
        if (data.length > 0 && !currentProject) {
          setCurrentProject(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching projects:', err.message);
    }
  };

  // 2. Ambil data board untuk project aktif
  const fetchBoard = async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [colsRes, tasksRes] = await Promise.all([
        supabase
          .from('columns')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true }),
        supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true }),
      ]);

      if (colsRes.error) throw colsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setColumns(colsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      console.error('Error fetching board:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  useEffect(() => {
    if (currentProject) {
      fetchBoard(currentProject.id);
    } else {
      setColumns([]);
      setTasks([]);
    }
  }, [currentProject]);

  // 3. Tambah Project Baru + Daftarkan User sebagai Owner
  const createProject = async (title) => {
    if (!user) return;
    try {
      const { data: newProj, error: projError } = await supabase
        .from('projects')
        .insert([{ title, user_id: user.id }])
        .select()
        .single();

      if (projError) throw projError;

      // Daftarkan pembuat ke tabel project_members
      await supabase.from('project_members').insert([
        { project_id: newProj.id, user_id: user.id, role: 'owner' },
      ]);

      // Buat kolom bawaan
      const defaultCols = [
        { project_id: newProj.id, title: 'To Do', order_index: 1 },
        { project_id: newProj.id, title: 'In Progress', order_index: 2 },
        { project_id: newProj.id, title: 'Done', order_index: 3 },
      ];
      await supabase.from('columns').insert(defaultCols);

      await fetchProjects();
      setCurrentProject(newProj);
    } catch (err) {
      console.error('Error creating project:', err.message);
    }
  };

  // 4. Fitur User Lain Join Project via Project ID
  const joinProject = async (projectCode) => {
    if (!user) return;
    try {
      const cleanCode = projectCode.trim().toUpperCase();

      // Cari project berdasarkan kodenya
      const { data: targetProj, error: findErr } = await supabase
        .from('projects')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (findErr || !targetProj) {
        throw new Error('Kode project tidak valid atau tidak ditemukan.');
      }

      // Masukkan ke daftar anggota project_members menggunakan targetProj.id
      const { error: memberError } = await supabase
        .from('project_members')
        .insert([{ project_id: targetProj.id, user_id: user.id, role: 'member' }]);

      if (memberError) {
        if (memberError.code === '23505') {
          throw new Error('Anda sudah bergabung di project ini.');
        }
        throw new Error(memberError.message);
      }

      await fetchProjects();
      setCurrentProject(targetProj);
    } catch (err) {
      throw err;
    }
  };

  // 5. Pindah Task (Drag & Drop)
  const moveTask = async (taskId, targetColumnId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, column_id: targetColumnId } : t))
    );

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ column_id: targetColumnId })
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      console.error('Error moving task:', err.message);
      if (currentProject) fetchBoard(currentProject.id);
    }
  };

  // 6. Tambah Task Baru
  const addTask = async (columnId, title, priority = 'Medium') => {
    if (!currentProject) return;
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            project_id: currentProject.id,
            column_id: columnId,
            title,
            priority,
            order_index: tasks.filter((t) => t.column_id === columnId).length,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error('Error adding task:', err.message);
    }
  };

  // 7. Hapus Task
  const deleteTask = async (taskId) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting task:', err.message);
      setTasks(previousTasks);
    }
  };

  return {
    projects,
    currentProject,
    setCurrentProject,
    columns,
    tasks,
    loading,
    createProject,
    joinProject,
    moveTask,
    addTask,
    deleteTask,
  };
};