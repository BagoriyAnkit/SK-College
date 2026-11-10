import React, { useEffect, useState } from "react";
import { ViewAllMemories } from "../../Service/frontend/Memories";
import { Image_url, API_url } from "../../config/config";
import { Image, X, ZoomIn, Camera } from "lucide-react";

// Genuine college campus photographic memories for fallback
const FALLBACK_MEMORIES = [
    { _id: "fallback-mem-1", image: "1785490146141-memories-1.jpg", title: "Technical Workshop & Student Expo" },
    { _id: "fallback-mem-2", image: "1785490176444-memories-2.jpg", title: "Campus Hackathon & Coding Marathon" },
    { _id: "fallback-mem-3", image: "1785490186492-memories-3.jpg", title: "Executive Seminar & Financial Summit" },
    { _id: "fallback-mem-4", image: "1785490208938-memories-4.jpg", title: "Biotech & Sciences Symposium" },
    { _id: "fallback-mem-5", image: "1785481116741-BLOG1.jpg", title: "Annual Academic Convocation" },
    { _id: "fallback-mem-6", image: "1785481156216-Blog-img-2.jpg", title: "Innovation Lab & Research Exhibition" },
];

const DEFAULT_CAPTIONS = [
    "Academic Convocation & Degree Ceremony",
    "Campus Technical Symposium & Hackathon",
    "Executive Leadership & Industry Conclave",
    "Sciences & Industrial Biotechnology Lab",
    "Campus Student Life & Cultural Festival",
    "Automotive Design & Prototype Exhibition"
];

export default function MemoriesSection() {
    const [memories, setMemories] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);

    const resolveMemoryUrl = (img) => {
        if (!img) return `${Image_url}/1785490146141-memories-1.jpg`;
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        if (img.startsWith("/")) return `${API_url}${img}`;
        return `${Image_url}/${img}`;
    };

    const fetchMemories = async () => {
        try {
            const res = await ViewAllMemories();
            let list = [];
            if (Array.isArray(res?.data?.data)) {
                list = res.data.data;
            } else if (Array.isArray(res?.data)) {
                list = res.data;
            }
            if (list.length > 0) {
                setMemories(list);
            } else {
                setMemories(FALLBACK_MEMORIES);
            }
        } catch (error) {
            console.error("Error fetching campus memories:", error);
            setMemories(FALLBACK_MEMORIES);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemories();
    }, []);

    if (loading) {
        return null;
    }

    if (memories.length === 0) {
        return null;
    }

    return (
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                        Life at SK College
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Campus Memories &amp; Event Gallery
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">
                        Photographic highlights from academic convocations, technical workshops, cultural meets, and campus celebrations.
                    </p>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {memories.map((item, idx) => {
                        const displayTitle = item.title || DEFAULT_CAPTIONS[idx % DEFAULT_CAPTIONS.length] || "Life at SK College";
                        return (
                            <div
                                key={item._id || idx}
                                onClick={() => setSelectedImage(item.image)}
                                className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white aspect-4/3 cursor-pointer shadow-xs hover:shadow-md transition"
                            >
                                <img
                                    src={resolveMemoryUrl(item.image)}
                                    alt={displayTitle}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = `${Image_url}/1785490146141-memories-1.jpg`;
                                    }}
                                />
                                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform scale-90 group-hover:scale-100 shadow-md">
                                        <ZoomIn className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-3 text-white text-xs font-semibold truncate opacity-0 group-hover:opacity-100 transition">
                                    {displayTitle}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-xs"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-800 transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={resolveMemoryUrl(selectedImage)}
                            alt="Campus Memory"
                            className="max-h-[85vh] w-auto object-contain mx-auto"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `${Image_url}/1785490146141-memories-1.jpg`;
                            }}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
