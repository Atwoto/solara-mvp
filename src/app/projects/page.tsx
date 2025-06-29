'use client'; // This will remain a client component for the filters and lightbox

import { useState, useEffect } from 'react';
import PageHeader from "@/components/PageHeader";
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PhotoIcon, VideoCameraIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Project } from '@/types'; // We will add the 'Project' type to types.ts next

// --- UPDATE 1: New, expanded filters ---
const filters = ['All', 'Residential', 'Commercial', 'Industrial', 'Water Pump Installation'];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } } as const;
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } } as const;

const ProjectsPage = () => {
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // --- UPDATE 2: State for fetching real data ---
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/projects'); // We will create this API endpoint
        if (!response.ok) throw new Error('Failed to fetch projects.');
        const data: Project[] = await response.json();
        setAllProjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = filter === 'All' ? allProjects : allProjects.filter(p => p.category === filter);

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
          <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-4 mb-12">
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
          
          {isLoading && <div className="text-center text-gray-500">Loading projects...</div>}
          {error && <div className="text-center text-red-500">Error: {error}</div>}
          
          {!isLoading && !error && (
            <motion.div
              key={filter}
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
                    src={project.type === 'video' ? project.thumbnail_url || '/images/default-video-thumb.jpg' : project.media_url}
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
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center"
            onClick={handleCloseLightbox}
          >
            <button onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('prev'); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 rounded-full hover:bg-white/30"><ChevronLeftIcon className="h-6 w-6 text-white" /></button>
            <button onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('next'); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 rounded-full hover:bg-white/30"><ChevronRightIcon className="h-6 w-6 text-white" /></button>
            
            <motion.div
              layoutId={selectedProject.id}
              className="relative w-full max-w-4xl max-h-[90vh] bg-deep-night rounded-lg shadow-2xl flex flex-col lg:flex-row overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseLightbox} className="absolute top-3 right-3 z-10 p-2 bg-black/30 rounded-full hover:bg-black/50"><XMarkIcon className="h-5 w-5 text-white" /></button>
              
              <div className="w-full lg:w-2/3 h-64 lg:h-auto bg-black flex items-center justify-center">
                {selectedProject.type === 'video' ? (
                  <iframe src={selectedProject.media_url} title={selectedProject.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                ) : (
                  <NextImage src={selectedProject.media_url} alt={selectedProject.title} width={1200} height={800} className="w-full h-full object-contain" />
                )}
              </div>
              
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