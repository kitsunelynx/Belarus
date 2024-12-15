"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Download, Upload, Calendar, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newTask, setNewTask] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    category: 'development',
    description: ''
  });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logsRes, weeklyRes, categoryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/logs`),
          fetch(`${API_BASE_URL}/stats/weekly`),
          fetch(`${API_BASE_URL}/stats/categories`)
        ]);

        const [logsData, weeklyData, categoryData] = await Promise.all([
          logsRes.json(),
          weeklyRes.json(),
          categoryRes.json()
        ]);

        setLogs(logsData);
        setWeeklyStats(weeklyData);
        setCategoryStats(categoryData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.hours || !newTask.description) return;

    try {
      const response = await fetch(`${API_BASE_URL}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error('Failed to create log');

      const createdLog = await response.json();
      setLogs([createdLog, ...logs]);
      
      // Refresh stats
      const [weeklyRes, categoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stats/weekly`),
        fetch(`${API_BASE_URL}/stats/categories`)
      ]);

      const [weeklyData, categoryData] = await Promise.all([
        weeklyRes.json(),
        categoryRes.json()
      ]);

      setWeeklyStats(weeklyData);
      setCategoryStats(categoryData);

      setNewTask({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        category: 'development',
        description: ''
      });
    } catch (err) {
      setError('Failed to create log. Please try again.');
      console.error('Error creating log:', err);
    }
  };


  const exportData = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `work-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 bg-gray-800 rounded-lg">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">This Week</p>
                    <h2 className="text-3xl font-bold text-blue-400">
                      {weeklyStats[0]?.total_hours || 0}h
                    </h2>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Total Entries</p>
                    <h2 className="text-3xl font-bold text-purple-400">{logs.length}</h2>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Most Active Category</p>
                    <h2 className="text-xl font-bold text-teal-400 capitalize">
                      {categoryStats.reduce((prev, current) => 
                        (current.total_hours > prev.total_hours) ? current : prev, 
                        { total_hours: 0 }
                      ).category || 'None'}
                    </h2>
                  </div>
                  <AlertCircle className="w-8 h-8 text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Average Daily Hours</p>
                    <h2 className="text-3xl font-bold text-amber-400">
                      {logs.length ? (logs.reduce((sum, log) => sum + Number(log.hours), 0) / logs.length).toFixed(1) : '0'}h
                    </h2>
                  </div>
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Hours Chart */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Weekly Hours Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="week" 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '0.375rem'
                        }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total_hours" 
                        stroke="#60A5FA"
                        strokeWidth={2}
                        dot={{ fill: '#60A5FA', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStats.map((stat) => (
                    <div key={stat.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300 capitalize">{stat.category}</span>
                        <span className="text-gray-400">{stat.total_hours}h</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${(stat.total_hours / categoryStats.reduce((acc, curr) => acc + curr.total_hours, 0)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Log New Task */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Log New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-gray-300">Date</Label>
                    <Input
                      type="date"
                      id="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours" className="text-gray-300">Hours Worked</Label>
                    <Input
                      type="number"
                      id="hours"
                      min="0"
                      step="0.5"
                      value={newTask.hours}
                      onChange={(e) => setNewTask({...newTask, hours: e.target.value})}
                      placeholder="Enter hours worked"
                      className="bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-gray-100"
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  >
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="meetings">Meetings</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Input
                    type="text"
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Brief description of work done"
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!newTask.hours || !newTask.description}
                >
                  Log Task
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Logs Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-100">Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2 text-gray-400">Date</th>
                      <th className="text-left p-2 text-gray-400">Hours</th>
                      <th className="text-left p-2 text-gray-400">Category</th>
                      <th className="text-left p-2 text-gray-400">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-700">
                        <td className="p-2 text-gray-300">{log.date}</td>
                        <td className="p-2 text-gray-300">{log.hours}</td>
                        <td className="p-2 text-gray-300 capitalize">{log.category}</td>
                        <td className="p-2 text-gray-300">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;