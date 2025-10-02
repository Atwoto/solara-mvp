// src/app/admin/projects/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Project, projectCategories } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "@/components/admin/PageHeader";
import PageLoader from "@/components/PageLoader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "kenbillsonsolararea@gmail.com";
const allFilters = ["All", ...projectCategories];

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// --- PROJECT CARD COMPONENT ---
const ProjectCard = ({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: string, title: string) => void;
}) => {
  const imageSrc =
    project.thumbnail_url ||
    (project.type === "image"
      ? project.media_url
      : "/images/default-video-thumb.jpg");
  const statusConfig = project.is_published
    ? { text: "Published", color: "bg-green-500" }
    : { text: "Draft", color: "bg-slate-400" };

  return (
    <motion.div
      layout
      variants={itemVariants}
      exit="exit"
      className="bg-white rounded-xl shadow-sm border border-slate-200/80 flex flex-col"
    >
      <div className="relative h-48 w-full bg-slate-100 rounded-t-xl overflow-hidden">
        {/* --- THIS IS THE FIX --- */}
        <Image
          src={imageSrc}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={75}
        />
        <div
          className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 text-white ${project.type === "video" ? "bg-red-500/80" : "bg-sky-500/80"}`}
        >
          {project.type === "video" ? (
            <VideoCameraIcon className="h-4 w-4" />
          ) : (
            <PhotoIcon className="h-4 w-4" />
          )}
          <span className="capitalize">{project.type}</span>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-xs font-semibold text-solar-flare-end">
          {project.category}
        </p>
        <h3
          className="font-bold text-slate-800 mt-1 line-clamp-2"
          title={project.title}
        >
          {project.title}
        </h3>
        <div className="flex-grow"></div>
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <div className={`h-2 w-2 rounded-full ${statusConfig.color}`}></div>
            <span className={statusConfig.color.replace("bg-", "text-")}>
              {statusConfig.text}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/projects#${project.id}`}
              target="_blank"
              className="p-2 rounded-lg text-slate-500 hover:bg-sky-100 hover:text-sky-600 transition-colors"
              title="View Live Project"
            >
              <EyeIcon className="h-5 w-5" />
            </Link>
            <Link
              href={`/admin/projects/edit/${project.id}`}
              className="p-2 rounded-lg text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              title="Edit Project"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Link>
            <button
              onClick={() => onDelete(project.id, project.title)}
              className="p-2 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Delete Project"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- ADMIN PROJECTS PAGE ---
export default function AdminProjectsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      setProjects(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      session?.user?.email === ADMIN_EMAIL
    ) {
      fetchProjects();
    }
  }, [sessionStatus, session, fetchProjects]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=/admin/projects`);
    } else if (
      sessionStatus === "authenticated" &&
      session?.user?.email !== ADMIN_EMAIL
    ) {
      router.replace("/");
    }
  }, [session, sessionStatus, router]);

  const handleDelete = async (projectId: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the project: "${title}"?`
      )
    )
      return;
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error((await response.json()).message);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err: any) {
      alert(`Error deleting project: ${err.message}`);
    }
  };

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [projects, activeFilter]);

  if (sessionStatus === "loading" || (isLoading && projects.length === 0)) {
    return (
      <div className="p-6">
        <PageLoader message="Loading projects..." />
      </div>
    );
  }
  if (
    sessionStatus !== "authenticated" ||
    session?.user?.email !== ADMIN_EMAIL
  ) {
    return (
      <div className="p-6">
        <PageLoader message="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <PageHeader
        title="Manage Projects"
        description="Add, edit, or delete showcase projects from your portfolio."
      >
        <Link
          href="/admin/projects/new"
          className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Project
        </Link>
      </PageHeader>

      {error && (
        <div
          className="p-3 my-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex items-center border border-slate-200/80 bg-white rounded-lg p-2 gap-2 mb-6 shadow-sm">
        {allFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`relative w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-start ${
              activeFilter === filter
                ? "text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            {activeFilter === filter && (
              <motion.div
                layoutId="active-project-filter"
                className="absolute inset-0 bg-deep-night rounded-md"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10">{filter}</span>
          </button>
        ))}
      </div>

      {!isLoading && filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-dashed border-2 border-slate-200">
          <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-lg font-medium text-slate-900">
            No Projects Found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            No projects match the filter "{activeFilter}".
          </p>
        </div>
      ) : (
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
