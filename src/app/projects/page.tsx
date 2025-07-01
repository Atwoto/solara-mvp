'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/PageHeader";
import NextImage from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PhotoIcon, VideoCameraIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Project } from '@/types';

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: 'easeIn' } },
};

// --- HELPER FUNCTIONS (Unchanged) ---
const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return '';
    let videoId = '';
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    const embedMatch = url.match(/\/embed\/([^?]+)/);
    if (watchMatch && watchMatch[1]) videoId = watchMatch[1];
    else if (shortMatch && shortMatch[1]) videoId = shortMatch[1];
    else if (embedMatch && embedMatch[1]) videoId = embedMatch[1];
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0` : url;
};

// --- REDESIGNED PROJECTS PAGE ---
const ProjectsPage = () => {
    // All state and logic hooks remain the same
    const [filter, setFilter] = useState('All');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/projects');
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

    const filters = ['All', 'Residential', 'Commercial', 'Industrial', 'Water Pump Installation'];
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
                    {/* Impressive new Filter Bar */}
                    <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3 mb-12">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`relative px-4 sm:px-6 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-start ${
                                    filter === f ? 'text-deep-night' : 'text-gray-600 hover:text-deep-night'
                                }`}
                            >
                                {filter === f && (
                                    <motion.div
                                        layoutId="active-filter-highlight"
                                        className="absolute inset-0 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    />
                                )}
                                <span className="relative z-10">{f}</span>
                            </button>
                        ))}
                    </div>

                    {isLoading && <div className="text-center text-gray-500">Loading projects...</div>}
                    {error && <div className="text-center text-red-500">Error: {error}</div>}

                    {!isLoading && !error && (
                        <motion.div layout variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           <AnimatePresence>
                            {filteredProjects.map(project => {
                                const displayImageSrc = project.thumbnail_url || (project.type === 'image' ? project.media_url : '/images/default-video-thumb.jpg');
                                return (
                                    <motion.div
                                        layout
                                        key={project.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out"
                                        onClick={() => handleSelectProject(project)}
                                    >
                                        <motion.div layoutId={project.id} className="relative w-full h-72">
                                            <NextImage src={displayImageSrc} alt={project.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="w-full h-full object-cover" />
                                        </motion.div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute inset-0 flex flex-col justify-end p-5 text-white z-20">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider">{project.category}</p>
                                                    <h3 className="text-lg font-bold mt-1 text-shadow-md">{project.title}</h3>
                                                </div>
                                                <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">{project.type === 'video' ? <VideoCameraIcon className="h-5 w-5" /> : <PhotoIcon className="h-5 w-5" />}</div>
                                            </div>
                                            <div className="h-12 opacity-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-300 mt-2">
                                                <p className="font-semibold text-solar-flare-start text-sm">View Project &rarr;</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                           </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Impressive new Lightbox */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={handleCloseLightbox}
                    >
                        {/* Lightbox Navigation */}
                        <button onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('prev'); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Previous project"><ChevronLeftIcon className="h-6 w-6 text-white" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleLightboxNavigation('next'); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Next project"><ChevronRightIcon className="h-6 w-6 text-white" /></button>
                        <button onClick={handleCloseLightbox} className="absolute top-4 right-4 z-20 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors lg:hidden" aria-label="Close lightbox"><XMarkIcon className="h-6 w-6 text-white" /></button>

                        <motion.div
                            layoutId={selectedProject.id}
                            className="relative w-full max-w-6xl aspect-video bg-deep-night rounded-lg shadow-2xl flex items-center justify-center overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Media Display */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedProject.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full"
                                >
                                    {selectedProject.type === 'video' ? (
                                        <iframe src={getYouTubeEmbedUrl(selectedProject.media_url)} title={selectedProject.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                                    ) : (
                                        <NextImage src={selectedProject.media_url} alt={selectedProject.title} fill className="w-full h-full object-contain" sizes="100vw" />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Floating Description Panel */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent pointer-events-none">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                                    <p className="text-sm font-semibold text-solar-flare-start uppercase tracking-wider">{selectedProject.category}</p>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1 mb-2 text-shadow-md">{selectedProject.title}</h2>
                                    <p className="text-gray-300 leading-relaxed line-clamp-2 sm:line-clamp-3 text-shadow-sm">{selectedProject.description}</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProjectsPage;
