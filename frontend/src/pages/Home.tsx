import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import ExperienceCard from "../components/ExperienceCard";
import type { Experience } from "../types";

const Home: React.FC = () => {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [filtered, setFiltered] = useState<Experience[]>([]);

    useEffect(() => {
        axiosClient.get("/experiences").then((res) => {
            const items = Array.isArray(res.data) ? res.data : res.data.data;
            console.log(items);
            setExperiences(items);
            setFiltered(items);
        });
    }, []);

    const handleSearch = (term: string) => {
        if (!term) setFiltered(experiences);
        else
            setFiltered(
                experiences.filter((e) =>
                    e.name.toLowerCase().includes(term.toLowerCase())
                )
            );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header onSearch={handleSearch} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {filtered?.map((exp) => (
                    <ExperienceCard key={exp._id} experience={exp} />
                ))}
            </div>
        </div>
    );
};

export default Home;
