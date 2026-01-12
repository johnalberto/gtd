import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Inbox from './pages/Inbox'
import { Today, NextActions, Waiting, Someday } from './pages/Views'
import { ProjectsList, ContextsList } from './pages/ManagementViews'
import ProjectDetail from './pages/ProjectDetail'
import { TaskProvider } from './context/TaskContext'
import ErrorBoundary from './components/layout/ErrorBoundary'

import { NotificationProvider } from './context/NotificationContext'

function App() {
    return (
        <ErrorBoundary>
            <TaskProvider>
                <NotificationProvider>
                    <BrowserRouter>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Navigate to="/inbox" />} />
                                <Route path="/inbox" element={<Inbox />} />
                                <Route path="/today" element={<Today />} />
                                <Route path="/next-actions" element={<NextActions />} />
                                <Route path="/waiting" element={<Waiting />} />
                                <Route path="/someday" element={<Someday />} />
                                <Route path="/project/:projectId" element={<ProjectDetail />} />
                                <Route path="/projects" element={<ProjectsList />} />
                                <Route path="/contexts" element={<ContextsList />} />
                                <Route path="*" element={<div className="p-4">Página en construcción</div>} />
                            </Routes >
                        </Layout >
                    </BrowserRouter >
                </NotificationProvider>
            </TaskProvider >
        </ErrorBoundary>
    )
}

export default App
