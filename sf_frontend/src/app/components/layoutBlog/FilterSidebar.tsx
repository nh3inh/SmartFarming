"use client";
import React, { useState } from "react";

// Trang bộ lọc
const FilterSidebar = () => {
    const filters = [
        { title: "Type", options: ["Video", "Audio"] },
        { title: "Section", options: ["Section 1", "Section 2", "Section 3", "Section 4"] },
        { title: "Level", options: ["Easy", "Medium", "Hard"] },
        { title: "Accent", options: ["Anh - Anh", "Anh - Mỹ", "Anh - Úc", "Anh - Other"] },
        { title: "Topic", options: ["Work", "Education", "Travel", "Music", "Health", "Environment"] },
    ];
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
    const handleSelect = (filterTitle: string, option: string) => {
        setSelectedValues((prev) => ({ ...prev, [filterTitle]: option }));
        setOpenMenu(null);
    };

    return (
        <>
            {/* Desktop version */}
            <aside className="hidden md:block p-4 border rounded-lg bg-[#FFFBF5] w-[185px] font-[Arial] text-[16px]">
                <h2 className="mb-1 text-black font-bold leading-[24px]">Bộ lọc</h2>
                <div className="border-b border-[#0000004C] w-full mb-2"></div>

                {filters.map((f, index) => (
                    <div
                        key={f.title}
                        className={`mb-2 pb-2 ${index !== filters.length - 1 ? "border-b border-[#0000004C]" : ""
                            }`}
                    >
                        <h3 className="mb-1 font-bold">{f.title}</h3>
                        <ul className="space-y-1">
                            {f.options.map((opt) => (
                                <li key={opt} className="flex justify-between items-center gap-2">
                                    <label htmlFor={`${f.title}-${opt}`}>{opt}</label>
                                    <input type="checkbox" id={`${f.title}-${opt}`} className="mr-3" />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </aside>

            {/*  Mobile version */}
            <div className="block md:hidden flex flex-wrap justify-center gap-2 p-2 bg-[#FFFBF5] rounded-lg shadow-sm">
                {filters.map((f) => (
                    <div key={f.title} className="relative">
                        <button
                            onClick={() => setOpenMenu(openMenu === f.title ? null : f.title)}
                                  className="border border-gray-300 px-2 py-1 rounded-lg bg-white text-[12px] font-[Arial] shadow-sm min-w-[55px]
                        flex justify-between items-center hover:border-[#A11D33]"
                        >
                            <span>
                                {selectedValues[f.title] ? selectedValues[f.title] : f.title}
                            </span>
                        </button>

                        {openMenu === f.title && (
                            <ul className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg w-[80px] max-h-48 overflow-y-auto">
                                {f.options.map((opt) => (
                                    <li
                                        key={opt}
                                        onClick={() => handleSelect(f.title, opt)}
                                        className={`px-1 py-1 text-[12px] cursor-pointer border-b hover:bg-[#A11D33] hover:text-white transition
                      ${selectedValues[f.title] === opt
                                                ? "bg-[#A11D33] text-white"
                                                : "text-gray-800"
                                            }`}
                                    >
                                        {opt}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

        </>
    );
};

export default FilterSidebar;
