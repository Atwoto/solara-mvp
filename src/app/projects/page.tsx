// src/app/projects/page.tsx
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";
import { Project } from "@/types";
import Image from "next/image";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// --- HELPER FUNCTIONS ---
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
  let videoId = "";
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  const embedMatch = url.match(/\/embed\/([^?]+)/);
  if (watchMatch && watchMatch[1]) videoId = watchMatch[1];
  else if (shortMatch && shortMatch[1]) videoId = shortMatch[1];
  else if (embedMatch && embedMatch[1]) videoId = embedMatch[1];
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`
    : url;
};

// --- PROJECTS PAGE ---
const ProjectsPage = () => {
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("Failed to fetch projects.");
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

  const filters = [
    "All",
    "Residential",
    "Commercial",
    "Industrial",
    "Water Pump Installation",
  ];
  const filteredProjects =
    filter === "All"
      ? allProjects
      : allProjects.filter((p) => p.category === filter);

  const handleSelectProject = (project: Project) => setSelectedProject(project);
  const handleCloseLightbox = () => setSelectedProject(null);
  const handleLightboxNavigation = (direction: "next" | "prev") => {
    if (!selectedProject) return;
    const currentIndex = filteredProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % filteredProjects.length
        : (currentIndex - 1 + filteredProjects.length) %
          filteredProjects.length;
    setSelectedProject(filteredProjects[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProject) return;
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowLeft") handleLightboxNavigation("prev");
      if (e.key === "ArrowRight") handleLightboxNavigation("next");
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, filteredProjects]);

  return (
    <>
      <PageHeader
        title="Our Proven Projects"
        subtitle="Explore a showcase of our commitment to quality, innovation, and customer satisfaction in action."
        backgroundImageUrl="/images/projects-hero-bg.jpg"
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Projects", href: "/projects" },
        ]}
      />
      <main className="bg-gray-50 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3 mb-12">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative px-4 sm:px-6 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-start ${
                  filter === f
                    ? "text-deep-night"
                    : "text-gray-600 hover:text-deep-night"
                }`}
              >
                {filter === f && (
                  <motion.div
                    layoutId="active-filter-highlight"
                    className="absolute inset-0 bg-gradient-to-r from-solar-flare-start to-solar-flare-end rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solar-flare-start mx-auto mb-4"></div>
              <p className="text-gray-500">Loading projects...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
                Error: {error}
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <motion.div
              layout
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {filteredProjects.map((project) => {
                  const displayImageSrc =
                    project.thumbnail_url ||
                    (project.type === "image"
                      ? project.media_url
                      : "/images/default-video-thumb.jpg");
                  return (
                    <motion.div
                      layout
                      key={project.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
                      onClick={() => handleSelectProject(project)}
                    >
                      <div className="relative w-full h-72">
                        <Image
                          src={displayImageSrc}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          quality={80}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 flex flex-col justify-end p-5 text-white z-20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider">
                              {project.category}
                            </p>
                            <h3 className="text-lg font-bold mt-1 text-shadow-md">
                              {project.title}
                            </h3>
                          </div>
                          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                            {project.type === "video" ? (
                              <VideoCameraIcon className="h-5 w-5" />
                            ) : (
                              <PhotoIcon className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <div className="h-12 opacity-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-300 mt-2">
                          <p className="font-semibold text-solar-flare-start text-sm">
                            View Project &rarr;
                          </p>
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

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={handleCloseLightbox}
          >
            {filteredProjects.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxNavigation("prev");
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                  aria-label="Previous project"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxNavigation("next");
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                  aria-label="Next project"
                >
                  <ChevronRightIcon className="h-6 w-6 text-white" />
                </button>
              </>
            )}

            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 z-20 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label="Close lightbox"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-6xl max-h-[95vh] bg-deep-night/95 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative md:w-2/3 flex-shrink-0 bg-black flex items-center justify-center">
                {selectedProject.type === "video" ? (
                  <div className="w-full aspect-video">
                    <iframe
                      key={`video-${selectedProject.id}`}
                      src={getYouTubeEmbedUrl(selectedProject.media_url)}
                      title={selectedProject.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <Image
                    key={`image-${selectedProject.id}`}
                    src={selectedProject.media_url}
                    alt={selectedProject.title}
                    width={800}
                    height={600}
                    className="max-w-full max-h-[60vh] md:max-h-[95vh] object-contain"
                    quality={90}
                  />
                )}
              </div>

              <div className="w-full md:w-1/3 p-5 sm:p-6 bg-gray-900/90 backdrop-blur-sm text-white border-t md:border-t-0 md:border-l border-gray-700/50 flex flex-col overflow-y-auto">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-solar-flare-start uppercase tracking-wider">
                    {selectedProject.category}
                  </p>
                  <h2 className="text-xl lg:text-2xl font-bold mt-1 mb-3 text-shadow-md">
                    {selectedProject.title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    {selectedProject.description}
                  </p>

                  {selectedProject.highlights &&
                    selectedProject.highlights.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-700/50">
                        <h3 className="text-lg font-semibold mb-3">
                          Project Highlights
                        </h3>
                        <ul className="space-y-3">
                          {selectedProject.highlights.map(
                            (highlight, index) => (
                              <li key={index} className="flex items-start">
                                <CheckBadgeIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  {typeof highlight === "object" &&
                                  highlight.title ? (
                                    <>
                                      <span className="font-semibold text-gray-100">
                                        {highlight.title}:
                                      </span>
                                      <span className="text-gray-300 ml-1.5">
                                        {highlight.detail}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-gray-300">
                                      {String(highlight)}
                                    </span>
                                  )}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
                {filteredProjects.length > 1 && (
                  <div className="text-sm text-gray-400 shrink-0 mt-4 pt-4 border-t border-gray-700/50 text-center">
                    {filteredProjects.findIndex(
                      (p) => p.id === selectedProject.id
                    ) + 1}{" "}
                    of {filteredProjects.length}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectsPage;
