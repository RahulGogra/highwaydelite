import React from "react";
import type { Experience } from "../types";
import { useNavigate } from "react-router-dom";

interface Props {
    experience: Experience;
}

const ExperienceCard: React.FC<Props> = ({ experience }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <img
                src={experience.imageUrl}
                alt={experience.name}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h2 className="font-semibold text-lg">{experience.name}</h2>
                {experience.location && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md mt-1 inline-block">
                        {experience.location}
                    </span>
                )}
                <p className="text-gray-500 text-sm mt-2">
                    {experience.description}
                </p>
                <div className="mt-3 flex justify-between items-center">
                    <p className="text-gray-800 font-semibold">From ₹{experience?.price}</p>
                    <button
                        className="bg-yellow-400 px-4 py-1 rounded-md hover:bg-yellow-500"
                        onClick={() =>
                            navigate(`/experience/${experience._id}`)
                        }
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExperienceCard;
