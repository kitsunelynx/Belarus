"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Download, Upload, Calendar, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem('workLogs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });
  
  const [newTask, setNewTask] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    category: 'development',
    description: ''
  });

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workLogs', JSON.stringify(logs));
  }, [logs]);

  // Calculate weekly totals
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const calculateWeeklyData = () => {
    const weeklyTotals = {};
    logs.forEach(log => {
      const week = getWeekNumber(log.date);
      const year = new Date(log.date).getFullYear();
      const key = `${year}-W${week}`;
      weeklyTotals[key] = (weeklyTotals[key] || 0) + Number(log.hours);
    });

    return Object.entries(weeklyTotals).map(([key, hours]) => ({
      week: key,
      hours: Number(hours.toFixed(1))
    })).sort((a, b) => a.week.localeCompare(b.week)).slice(-8); // Show last 8 weeks
  };

  const getCurrentWeekTotal = () => {
    const currentWeek = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();
    return logs
      .filter(log => {
        const logWeek = getWeekNumber(log.date);
        const logYear = new Date(log.date).getFullYear();
        return logWeek === currentWeek && logYear === currentYear;
      })
      .reduce((total, log) => total + Number(log.hours), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTask.hours || !newTask.description) return;
    
    setLogs([...logs, { ...newTask, hours: Number(newTask.hours) }]);
    setNewTask({
      date: new Date().toISOString().split('T')[0],
      hours: '',
      category: 'development',
      description: ''
    });
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Current Week Total</p>
                  <h2 className="text-3xl font-bold text-blue-400">{getCurrentWeekTotal().toFixed(1)}h</h2>
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
                  <p className="text-sm text-gray-400">Average Daily Hours</p>
                  <h2 className="text-3xl font-bold text-teal-400">
                    {logs.length ? (logs.reduce((sum, log) => sum + Number(log.hours), 0) / logs.length).toFixed(1) : '0'}h
                  </h2>
                </div>
                <AlertCircle className="w-8 h-8 text-teal-400" />
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
                  <LineChart data={calculateWeeklyData()}>
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
                      dataKey="hours" 
                      stroke="#60A5FA"
                      strokeWidth={2}
                      dot={{ fill: '#60A5FA', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Log New Task */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Log New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>

        {/* Recent Logs Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-100">Recent Logs</CardTitle>
            <Button 
              onClick={exportData} 
              variant="outline" 
              className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
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
                  {logs.slice().reverse().map((log, index) => (
                    <tr key={index} className="border-b border-gray-700">
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
    </div>
  );
};

export default Dashboard;