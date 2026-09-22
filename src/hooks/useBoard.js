// src/hooks/useBoard.js
import { useState, useEffect, useCallback } from 'react';
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
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setProjects(data || []);
      if (data && data.length > 0 && !currentProject) {
        setCurrentProject(data[0]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user, currentProject]);

  // 2. Ambil data board untuk project aktif (kolom & task)
  const fetchBoard = useCallback(async (projectId) => {
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
  }, []);

  // Sinkronkan daftar project saat user login
  useEffect(() => {
    fetchProjects();
  }, [user]);

  // Sinkronkan data board saat currentProject berubah
  useEffect(() => {
    if (currentProject) {
      fetchBoard(currentProject.id);
    } else {
      setColumns([]);
      setTasks([]);
    }
  }, [currentProject, fetchBoard]);

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

      // Buat 3 kolom default
      const defaultCols = [
        { project_id: newProj.id, title: 'To Do', order_index: 1 },
        { project_id: newProj.id, title: 'In Progress', order_index: 2 },
        { project_id: newProj.id, title: 'Done', order_index: 3 },
      ];
      await supabase.from('columns').insert(defaultCols);

      // Update state lokal dan set project aktif
      setProjects((prev) => [...prev, newProj]);
      setCurrentProject(newProj);
      return newProj;
    } catch (err) {
      console.error('Error creating project:', err.message);
      throw err;
    }
  };

  // 4. Fitur User Lain Join Project via Kode Simpel (6 Karakter)
  const joinProject = async (projectCode) => {
    if (!user) return;
    try {
      const cleanCode = projectCode.trim().toUpperCase();

      // Panggil RPC Supabase
      const { data: targetProj, error: rpcError } = await supabase.rpc(
        'join_project_by_code',
        { p_code: cleanCode }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      // Perbarui state lokal
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === targetProj.id);
        return exists ? prev : [...prev, targetProj];
      });
      setCurrentProject(targetProj);

      return targetProj;
    } catch (err) {
      console.error('Error joining project:', err.message);
      throw err;
    }
  };

  // 5. Keluar dari Project (Member)
  const leaveProject = async (projectId) => {
    if (!user || !projectId) return;
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update state projects secara lokal seketika
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setCurrentProject((prev) => (prev?.id === projectId ? null : prev));
    } catch (err) {
      console.error('Error leaving project:', err.message);
      throw err;
    }
  };

  // 6. Hapus Project Permanen (Owner)
  const deleteProject = async (projectId) => {
    if (!user || !projectId) return;
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update state projects secara lokal seketika
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setCurrentProject((prev) => (prev?.id === projectId ? null : prev));
    } catch (err) {
      console.error('Error deleting project:', err.message);
      throw err;
    }
  };

  // 7. Pindah Task (Drag & Drop)
  const moveTask = async (taskId, targetColumnId) => {
    // Optimistic UI: langsung ubah kolom task di state lokal
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

  // 8. Tambah Task Baru
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
      throw err;
    }
  };

  // 9. Hapus Task
  const deleteTask = async (taskId) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting task:', err.message);
      setTasks(previousTasks); // Rollback jika query gagal
      throw err;
    }
  };

  return {
    projects,
    currentProject,
    setCurrentProject,
    columns,
    tasks,
    loading,
    fetchProjects,
    fetchBoard,
    createProject,
    joinProject,
    leaveProject,
    deleteProject,
    moveTask,
    addTask,
    deleteTask,
  };
};