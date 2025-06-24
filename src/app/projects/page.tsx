// src/app/projects/page.tsx
'use client';

import { useState } from 'react';
import PageHeader from "@/components/PageHeader";
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoIcon, VideoCameraIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// --- MOCK DATA (Replace with your actual data fetching from Supabase) ---
// IMPORTANT: For videos, use the 'embed' URL.
const mockProjects = [
  { id: 'proj1', title: 'Luxury Residential Solar Installation', category: 'Residential', type: 'image', mediaUrl: '/images/projects/residential-1.jpg', description: 'A comprehensive 5kW hybrid solar system providing full energy independence for a modern family home in Karen, Nairobi.' },
  { id: 'proj2', title: 'Commercial Warehouse Energy Solution', category: 'Commercial', type: 'image', mediaUrl: '/images/projects/commercial-1.jpg', description: 'A 50kW grid-tied solar solution for a major warehouse, drastically reducing operational electricity costs.' },
  { id: 'proj3', title: 'Project Timelapse: Farm Water Pump', category: 'Commercial', type: 'video', mediaUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U', thumbnailUrl: '/images/projects/video-1-thumb.jpg', description: 'Watch the installation process of a solar-powered water pump system for agricultural use.' },
  { id: 'proj4', title: 'Off-Grid Home Power System', category: 'Residential', type: 'image', mediaUrl: '/images/projects/residential-2.jpg', description: 'Complete off-grid power setup for a remote home, featuring high-capacity batteries and efficient solar panels.' },
  { id: 'proj5', title: 'Rooftop Solar for Urban Business', category: 'Commercial', type: 'image', mediaUrl: '/images/projects/commercial-2.jpg', description: 'Maximizing roof space with a high-efficiency solar array for a bustling urban business centre.' },
  { id: 'proj6', title: 'Guest House Energy Independence', category: 'Residential', type: 'video', mediaUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U', thumbnailUrl: '/images/projects/video-2-thumb.jpg', description: 'A showcase of our solar installation at a popular guest house, ensuring uninterrupted power for guests.' },
];
// Note: You would fetch this data from Supabase in a real scenario.

// --- Types ---
type Project = typeof mockProjects[0];
const filters = ['All', 'Residential', 'Commercial'];

// --- Animation Variants ---
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } } as const;
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } } as const;

const ProjectsPage = () => {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = filter === 'All' ? mockProjects : mockProjects.filter(p => p.category === filter);

  const handleSelectProject = (project: Project) => setSelectedProject(project);
  const handleCloseLightbox = () => setSelectedProject(null);

  const handleLightboxNavigation = (direction: 'next' | 'prev') => {
    if (!selectedProject) return;
    const currentIndex = filteredProjects.findIndex(p => p.id === selectedProject.id);
    const nextIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredProjects.length 
      : (currentIndex - 1 + filteredProjects.length) % filteredProjects.length;
    setSelectedProject(filteredProjects[nextIndex]);
  };

  return (
    <>
      <PageHeader
        title="Our Proven Projects"
        subtitle="Explore a showcase of our commitment to quality, innovation, and customer satisfaction in action."
        backgroundImageUrl="/images/projects-hero-bg.jpg"
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Projects', href: '/projects' }]}
      />
      <main className="bg-gray-50 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          {/* --- Filter Buttons --- */}
          <div className="flex justify-center items-center gap-2 sm:gap-4 mb-12">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 sm:px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                  filter === f
                    ? 'bg-deep-night text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-200/50 hover:text-deep-night'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* --- Animated Project Grid --- */}
          <motion.div
            key={filter} // Re-trigger animation when filter changes
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map(project => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                layout
                className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                onClick={() => handleSelectProject(project)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10"></div>
                <NextImage
                  src={project.type === 'video' ? project.thumbnailUrl || project.mediaUrl : project.mediaUrl}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 p-5 z-20 text-white">
                  <div className={`absolute top-5 right-5 p-2 rounded-full bg-white/20 backdrop-blur-sm`}>
                    {project.type === 'video' ? <VideoCameraIcon className="h-5 w-5" /> : <PhotoIcon className="h-5 w-5" />}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider">{project.category}</p>
                  <h3 className="text-lg font-bold mt-1 text-shadow-md">{project.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* --- Full-Featured Lightbox --- */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center"
            onClick={handleCloseLightbox}
          >
            {/* Navigation Buttons */}
            <button onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('prev'); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><ChevronLeftIcon className="h-6 w-6 text-white" /></button>
            <button onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('next'); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><ChevronRightIcon className="h-6 w-6 text-white" /></button>
            
            {/* Lightbox Content */}
            <motion.div
              layoutId={selectedProject.id}
              className="relative w-full max-w-4xl max-h-[90vh] bg-deep-night rounded-lg shadow-2xl flex flex-col lg:flex-row overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseLightbox} className="absolute top-3 right-3 z-10 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"><XMarkIcon className="h-5 w-5 text-white" /></button>
              
              {/* Media Display */}
              <div className="w-full lg:w-2/3 h-64 lg:h-auto bg-black flex items-center justify-center">
                {selectedProject.type === 'video' ? (
                  <iframe
                    src={selectedProject.mediaUrl}
                    title={selectedProject.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <NextImage src={selectedProject.mediaUrl} alt={selectedProject.title} width={1200} height={800} className="w-full h-full object-contain" />
                )}
              </div>
              
              {/* Project Details Sidebar */}
              <div className="w-full lg:w-1/3 p-6 flex flex-col bg-slate-800/50 overflow-y-auto">
                <p className="text-sm font-semibold text-solar-flare-start uppercase tracking-wider">{selectedProject.category}</p>
                <h2 className="text-2xl font-bold text-white mt-2 mb-4">{selectedProject.title}</h2>
                <p className="text-gray-300 leading-relaxed">{selectedProject.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectsPage;