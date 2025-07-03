// src/app/admin/testimonials/page.tsx
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Testimonial } from '@/types';
import { CheckCircleIcon, XCircleIcon, TrashIcon, StarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import PageHeader from '@/components/admin/PageHeader';
import PageLoader from '@/components/PageLoader';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Image from 'next/image';

const filters = ['All', 'Pending', 'Approved'];

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

// --- IMPRESSIVE NEW TESTIMONIAL CARD ---
const TestimonialCard = ({ testimonial, onApproveToggle, onDelete }: {
    testimonial: Testimonial;
    onApproveToggle: () => void;
    onDelete: () => void;
}) => {
    return (
        <motion.div layout variants={itemVariants} exit="exit" className="bg-white rounded-xl shadow-sm border border-slate-200/80 flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                            <Image
                                src={testimonial.image_url || '/images/default-avatar.png'}
                                alt={testimonial.client_name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">{testimonial.client_name}</p>
                            <p className="text-xs text-slate-500">{testimonial.client_title_company}</p>
                        </div>
                    </div>
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                        testimonial.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        <div className={`h-2 w-2 rounded-full ${testimonial.approved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        {testimonial.approved ? 'Approved' : 'Pending'}
                    </div>
                </div>

                <blockquote className="mt-4 text-slate-600 italic border-l-4 border-slate-200 pl-4 py-2">
                    "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        {testimonial.rating ? (
                            <>
                                <StarIcon className="h-4 w-4 text-yellow-400" />
                                <span className="font-bold">{testimonial.rating}.0</span>
                            </>
                        ) : (
                            <span>No rating</span>
                        )}
                    </div>
                    <span>Submitted: {new Date(testimonial.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="bg-slate-50/70 p-3 border-t border-slate-200/80 rounded-b-xl flex items-center justify-end gap-2">
                 <button 
                    onClick={onApproveToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        testimonial.approved ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                    title={testimonial.approved ? "Click to Unapprove" : "Click to Approve"}
                >
                    {testimonial.approved ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                    {testimonial.approved ? 'Unapprove' : 'Approve'}
                </button>
                <button 
                    onClick={onDelete} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-red-600 bg-red-100 hover:bg-red-200 transition-colors" title="Delete Testimonial">
                  <TrashIcon className="h-4 w-4"/> Delete
                </button>
            </div>
        </motion.div>
    );
};

// --- REDESIGNED ADMIN TESTIMONIALS PAGE ---
const AdminTestimonialsPage = () => {
    // All state and logic hooks remain the same
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchTestimonials = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/testimonials/all');
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch testimonials');
            }
            const data: Testimonial[] = await response.json();
            setTestimonials(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    const handleApproveToggle = async (testimonialId: string, currentApprovedStatus: boolean | null | undefined) => {
        const newStatus = !currentApprovedStatus;
        try {
            const response = await fetch(`/api/admin/testimonials/${testimonialId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: newStatus }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            setTestimonials(prev => prev.map(t => t.id === testimonialId ? { ...t, approved: newStatus } : t));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteTestimonial = async (testimonialId: string, clientName: string) => {
        if (!window.confirm(`Are you sure you want to delete the testimonial from "${clientName}"?`)) return;
        try {
            const response = await fetch(`/api/admin/testimonials/${testimonialId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error((await response.json()).message);
            setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const filteredTestimonials = useMemo(() => {
        if (activeFilter === 'All') return testimonials;
        if (activeFilter === 'Approved') return testimonials.filter(t => t.approved === true);
        if (activeFilter === 'Pending') return testimonials.filter(t => t.approved !== true);
        return [];
    }, [testimonials, activeFilter]);

    if (isLoading && testimonials.length === 0) {
        return <div className="p-6"><PageLoader message="Loading testimonials..." /></div>;
    }

    return (
        <>
            <PageHeader
                title="Manage Testimonials"
                description="Review, approve, and manage customer testimonials."
            />

            {error && <div className="p-3 my-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-sm" role="alert">{error}</div>}

            {/* Impressive new Filter Bar */}
            <div className="flex items-center border border-slate-200/80 bg-white rounded-lg p-2 gap-2 mb-6 shadow-sm">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`relative w-full px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-solar-flare-start ${
                            activeFilter === filter ? 'text-white' : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                    >
                        {activeFilter === filter && (
                            <motion.div
                                layoutId="active-testimonial-filter"
                                className="absolute inset-0 bg-deep-night rounded-md"
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            />
                        )}
                        <span className="relative z-10">{filter}</span>
                    </button>
                ))}
            </div>

            {isLoading && testimonials.length > 0 && <div className="text-center text-slate-500 py-4">Refreshing...</div>}
            
            {!isLoading && filteredTestimonials.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-dashed border-2 border-slate-200">
                    <ChatBubbleBottomCenterTextIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-slate-900">No Testimonials Found</h3>
                    <p className="mt-1 text-sm text-slate-500">No testimonials match the filter "{activeFilter}".</p>
                </div>
            ) : (
                <motion.div
                    layout
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredTestimonials.map((testimonial) => (
                            <TestimonialCard
                                key={testimonial.id}
                                testimonial={testimonial}
                                onApproveToggle={() => handleApproveToggle(testimonial.id, testimonial.approved)}
                                onDelete={() => handleDeleteTestimonial(testimonial.id, testimonial.client_name)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </>
    );
};

export default AdminTestimonialsPage;
