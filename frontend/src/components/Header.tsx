import React from "react";
// No need for 'lucide-react' Search icon as we're using text "Search"

interface HeaderProps {
    onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
    const [term, setTerm] = React.useState("");

    const handleSearch = () => {
        onSearch(term.trim());
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <header className="flex justify-between items-center py-4 px-8 bg-white shadow-sm sticky top-0 z-10">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
                <img 
                    src="/logo.png" // Assuming '/logo.png' is the correct path for "hd highway delite" logo
                    alt="hd highway delite logo" 
                    className="h-10 w-auto" // Adjusted height, auto width
                />
            </div>
            
            {/* Search Bar Section - Moved to the right and styled */}
            <form 
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="flex items-center"
            >
                <input
                    type="text"
                    placeholder="Experience name" // Placeholder changed to match the image
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="px-4 py-2 border border-gray-300 rounded-l-md outline-none w-80 shadow-inner text-gray-700" // Styled to match the input in the image
                    aria-label="Search experiences"
                />
                <button
                    type="submit"
                    className="bg-yellow-400 text-gray-800 px-6 py-2 rounded-r-md font-medium hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200" // Styled to match the button in the image
                    aria-label="Search"
                >
                    Search
                </button>
            </form>
        </header>
    );
};

export default Header;